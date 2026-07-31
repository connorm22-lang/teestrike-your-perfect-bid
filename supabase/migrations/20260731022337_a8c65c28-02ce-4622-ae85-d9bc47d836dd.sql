-- 1. Fix mutable search_path on all functions
alter function public.handle_new_user() set search_path = public;
alter function public.set_updated_at() set search_path = public;
alter function public.place_bid(uuid, uuid, numeric) set search_path = public;
alter function public.close_auction(uuid) set search_path = public;
alter function public.close_due_auctions() set search_path = public;
alter function public.offer_next_loser(uuid, uuid, integer) set search_path = public;
alter function public.redeem_available_credit(uuid, numeric, uuid) set search_path = public;
alter function public.claim_second_chance(uuid, uuid) set search_path = public;
alter function public.decline_second_chance(uuid, uuid) set search_path = public;

-- 2. Caller identity is derived from the session, never from client input
create or replace function public.place_bid(p_auction_id uuid, p_bidder_id uuid, p_amount numeric)
returns json language plpgsql security definer set search_path = public as $function$
declare
  v_auction           public.auctions%rowtype;
  v_min_bid           numeric;
  v_new_bid_id        uuid;
  v_anti_snipe        interval := interval '5 minutes';
  v_anti_snipe_window interval := interval '5 minutes';
begin
  if auth.uid() is null then
    return json_build_object('success', false, 'error_code', 'NOT_AUTHENTICATED');
  end if;
  p_bidder_id := auth.uid();

  select * into v_auction from public.auctions where id = p_auction_id for update;
  if not found then
    return json_build_object('success', false, 'error_code', 'AUCTION_NOT_FOUND');
  end if;
  if v_auction.status not in ('live', 'closing') then
    return json_build_object('success', false, 'error_code', 'AUCTION_NOT_LIVE');
  end if;
  if now() > v_auction.ends_at then
    return json_build_object('success', false, 'error_code', 'AUCTION_ENDED');
  end if;
  if v_auction.winner_id = p_bidder_id then
    return json_build_object('success', false, 'error_code', 'ALREADY_LEADING');
  end if;
  if v_auction.current_bid is null then
    v_min_bid := v_auction.floor_price;
  else
    v_min_bid := v_auction.current_bid + v_auction.bid_increment;
  end if;
  if p_amount < v_min_bid then
    return json_build_object('success', false, 'error_code', 'BID_TOO_LOW', 'min_bid', v_min_bid);
  end if;
  update public.bids set status = 'outbid' where auction_id = p_auction_id and status = 'active';
  insert into public.bids (auction_id, bidder_id, amount, status)
  values (p_auction_id, p_bidder_id, p_amount, 'active') returning id into v_new_bid_id;
  update public.auctions
  set current_bid = p_amount, winner_id = p_bidder_id, bid_count = bid_count + 1,
    ends_at = case when (v_auction.ends_at - now()) < v_anti_snipe_window then now() + v_anti_snipe else v_auction.ends_at end,
    status = case when (v_auction.ends_at - now()) < v_anti_snipe_window then 'closing'::auction_status else v_auction.status end,
    updated_at = now()
  where id = p_auction_id;
  return json_build_object('success', true, 'bid_id', v_new_bid_id, 'amount', p_amount, 'auction_id', p_auction_id);
end;
$function$;

create or replace function public.claim_second_chance(p_offer_id uuid, p_user_id uuid)
returns json language plpgsql security definer set search_path = public as $function$
declare
  v_offer   public.second_chance_offers%rowtype;
  v_off     public.auctions%rowtype;
  v_premium numeric(10,2); v_total numeric(10,2); v_applied numeric(10,2) := 0; v_tx uuid;
begin
  if auth.uid() is null then
    return json_build_object('success', false, 'error_code', 'NOT_AUTHENTICATED');
  end if;
  p_user_id := auth.uid();

  select * into v_offer from public.second_chance_offers where id = p_offer_id for update;
  if not found then return json_build_object('success', false, 'error_code', 'OFFER_NOT_FOUND'); end if;
  if v_offer.loser_id <> p_user_id then return json_build_object('success', false, 'error_code', 'NOT_YOUR_OFFER'); end if;
  if v_offer.status <> 'pending' then return json_build_object('success', false, 'error_code', 'OFFER_NOT_PENDING'); end if;
  if now() > v_offer.expires_at then
    update public.second_chance_offers set status = 'expired' where id = p_offer_id;
    perform public.offer_next_loser(v_offer.source_auction_id, v_offer.offered_auction_id, v_offer.cascade_rank + 1);
    return json_build_object('success', false, 'error_code', 'OFFER_EXPIRED');
  end if;

  select * into v_off from public.auctions where id = v_offer.offered_auction_id for update;
  if v_off.status <> 'live' or v_off.bid_count > 0 or v_off.ends_at <= now() then
    update public.second_chance_offers set status = 'expired' where id = p_offer_id;
    return json_build_object('success', false, 'error_code', 'CLAIM_UNAVAILABLE');
  end if;

  v_premium := round(v_offer.price * v_off.buyer_premium_pct, 2);
  v_total   := v_offer.price + v_premium;

  insert into public.transactions
    (auction_id, winner_id, course_id, winning_bid, buyer_premium, total_charged, status)
  values (v_off.id, p_user_id, v_off.course_id, v_offer.price, v_premium, v_total, 'pending')
  returning id into v_tx;

  v_applied := public.redeem_available_credit(p_user_id, v_premium, v_tx);
  if v_applied > 0 then
    update public.transactions set credit_applied = v_applied, total_charged = v_total - v_applied where id = v_tx;
  end if;

  update public.auctions
    set status = 'closed', winner_id = p_user_id, current_bid = v_offer.price,
        final_price = v_offer.price, bid_count = bid_count + 1, updated_at = now()
    where id = v_off.id;

  update public.second_chance_offers set status = 'claimed', claimed_transaction_id = v_tx where id = p_offer_id;

  return json_build_object('success', true, 'transaction_id', v_tx, 'auction_id', v_off.id,
    'price', v_offer.price, 'buyer_premium', v_premium, 'credit_applied', v_applied,
    'total_charged', v_total - v_applied);
end;
$function$;

create or replace function public.decline_second_chance(p_offer_id uuid, p_user_id uuid)
returns json language plpgsql security definer set search_path = public as $function$
declare v_offer public.second_chance_offers%rowtype;
begin
  if auth.uid() is null then
    return json_build_object('success', false, 'error_code', 'NOT_AUTHENTICATED');
  end if;
  p_user_id := auth.uid();

  select * into v_offer from public.second_chance_offers where id = p_offer_id for update;
  if not found then return json_build_object('success', false, 'error_code', 'OFFER_NOT_FOUND'); end if;
  if v_offer.loser_id <> p_user_id then return json_build_object('success', false, 'error_code', 'NOT_YOUR_OFFER'); end if;
  if v_offer.status <> 'pending' then return json_build_object('success', false, 'error_code', 'OFFER_NOT_PENDING'); end if;

  update public.second_chance_offers set status = 'declined' where id = p_offer_id;
  perform public.offer_next_loser(v_offer.source_auction_id, v_offer.offered_auction_id, v_offer.cascade_rank + 1);
  return json_build_object('success', true);
end;
$function$;

-- 3. Lock down execution of internal SECURITY DEFINER routines
revoke all on function public.close_auction(uuid) from public, anon, authenticated;
revoke all on function public.close_due_auctions() from public, anon, authenticated;
revoke all on function public.offer_next_loser(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.redeem_available_credit(uuid, numeric, uuid) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.close_auction(uuid) to service_role;
grant execute on function public.close_due_auctions() to service_role;
grant execute on function public.offer_next_loser(uuid, uuid, integer) to service_role;
grant execute on function public.redeem_available_credit(uuid, numeric, uuid) to service_role;

revoke all on function public.place_bid(uuid, uuid, numeric) from public, anon;
revoke all on function public.claim_second_chance(uuid, uuid) from public, anon;
revoke all on function public.decline_second_chance(uuid, uuid) from public, anon;
grant execute on function public.place_bid(uuid, uuid, numeric) to authenticated, service_role;
grant execute on function public.claim_second_chance(uuid, uuid) to authenticated, service_role;
grant execute on function public.decline_second_chance(uuid, uuid) to authenticated, service_role;

-- 4. Column-level exposure: hide contact/Stripe details on courses
revoke select on public.courses from anon, authenticated;
grant select (id, admin_id, name, slug, location, market, rack_rate_default, active, created_at, updated_at)
  on public.courses to anon, authenticated;
grant all on public.courses to service_role;

-- Course owners read their own full course row through a scoped routine
create or replace function public.get_my_courses()
returns table (
  id uuid, name text, slug text, location text,
  rack_rate_default numeric, contact_email text,
  stripe_account_id text, stripe_onboarded boolean
)
language sql stable security definer set search_path = public as $function$
  select c.id, c.name, c.slug, c.location, c.rack_rate_default,
         c.contact_email, c.stripe_account_id, c.stripe_onboarded
  from public.courses c
  where c.admin_id = auth.uid()
  order by c.name
$function$;
revoke all on function public.get_my_courses() from public, anon;
grant execute on function public.get_my_courses() to authenticated, service_role;

-- 5. Column-level exposure: hide winner / final price from logged-out visitors
revoke select on public.auctions from anon;
grant select (id, slot_id, course_id, tee_date, tee_time, players, rack_rate, floor_price,
              bid_increment, current_bid, bid_count, opens_at, ends_at, status,
              buyer_premium_pct, created_at, updated_at)
  on public.auctions to anon;
grant select, insert, update on public.auctions to authenticated;
grant all on public.auctions to service_role;