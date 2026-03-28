import "https://deno.land/std@0.168.0/dotenv/load.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { course, auction, bidAmount } = await req.json();

    if (!course || !auction || !bidAmount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const premium = Math.round((bidAmount / course.rack - 1) * 100);
    const timeLeft = auction.endsIn < 3600
      ? `${Math.floor(auction.endsIn / 60)} minutes`
      : `${Math.round(auction.endsIn / 3600)} hours`;

    const prompt = `You are the AI Caddie for TeeStrike, a premium golf tee time auction platform. Give concise, sharp bidding advice (2-3 sentences max) in the voice of a seasoned caddie who knows the market.

Course: ${course.name} (${course.loc})
Description: ${course.desc}
Rack rate: $${course.rack}/player
Current bid: $${auction.bid}/player (${auction.bids} total bids)
User's bid: $${bidAmount}/player (+${premium}% over rack)
Time remaining: ${timeLeft}
Players: ${auction.players}

Give tactical advice on whether this bid is smart. Reference the specific course, premium percentage, competition level, and timing.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const advice = data.content?.[0]?.text || 'No advice available.';

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
