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

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': apiKey,
      },
      body: JSON.stringify({
        model: 'google/gemini-3.6-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      const status = response.status === 429 || response.status === 402 ? response.status : 502;
      return new Response(JSON.stringify({ error: status === 429 ? 'Rate limit exceeded, try again shortly.' : status === 402 ? 'AI credits exhausted.' : 'AI service error' }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content || 'No advice available.';


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
