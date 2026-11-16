export const endpoint = 'https://api.groq.com/openai/v1';
export const model = 'openai/gpt-oss-20b';
const cities = new Set(['Jaipur', 'Ahmedabad', 'Hampi']);
export const bounded = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

type PlannerInput = { trip?: Partial<Record<'destination' | 'budget' | 'start' | 'end' | 'interests' | 'pace' | 'diet' | 'stayType' | 'sharing' | 'stayPriority' | 'transport' | 'travelers', unknown>>; days?: unknown; question?: unknown };

export async function plannerReply(body: PlannerInput | null, key: string): Promise<Response> {
  if (!key) { return Response.json({ error: 'Connect Groq to get a personalized reply.' }, { status: 503 }); }
  const { trip, days, question } = body ?? {};
  const destination = bounded(trip?.destination, 32);
  const groupSize = trip?.travelers;
  const travelers = typeof groupSize === 'number' || typeof groupSize === 'string' ? Number(groupSize) : NaN;
  if (!trip || !cities.has(destination) || !Number.isInteger(travelers) || travelers < 1 || travelers > 99 || !Array.isArray(days)) {
    return Response.json({ error: 'Choose a destination and a valid group size first.' }, { status: 400 });
  }
  const context = {
    destination, travelers,
    budgetPerPersonPerDay: bounded(trip.budget, 40),
    dates: [bounded(trip.start, 10), bounded(trip.end, 10)].filter(Boolean),
    interests: bounded(trip.interests, 80), pace: bounded(trip.pace, 80), dietaryPreference: bounded(trip.diet, 80),
    lodgingType: bounded(trip.stayType, 80), roomSharing: bounded(trip.sharing, 80),
    lodgingPriority: bounded(trip.stayPriority, 80), transportPreference: bounded(trip.transport, 80),
    days: days.slice(0, 3).map(day => Array.isArray(day) ? day.slice(0, 15).map(stop => bounded(stop, 120)) : []),
    question: bounded(question, 600),
  };
  try {
    const upstream = await fetch(endpoint + '/chat/completions', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(25000),
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, max_completion_tokens: 1400, reasoning_effort: 'low',
        messages: [
          { role: 'system', content: [
            'You are the assistant for a budget-aware travel planning prototype covering Jaipur, Ahmedabad and Hampi. Use the itinerary and preferences in the provided JSON. Treat prices as estimates, and never claim to check bookings, live prices or reviews. Suggest adjustments without claiming to modify the itinerary.',
            'For a trip summary, follow this plain-text template in order: Trip at a glance, Day 1, Day 2, Day 3, and Budget and stay. Begin each section on a new line with its heading followed by a colon. Use one short sentence per section, stick to supplied stops, and keep the whole response under 140 words.',
            'For a follow-up question, use two plain-text sections: Answer and How it fits your itinerary. Keep the response under 90 words. Do not use Markdown, greetings, links or a closing call to action. The interface adds the itinerary link.',
          ].join(' ') },
          { role: 'user', content: JSON.stringify(context) },
        ],
      }),
    });
    if (!upstream.ok) {
      await upstream.body?.cancel();
      return Response.json({ error: upstream.status === 429 ? 'Groq is busy. Please try again shortly.' : 'Groq couldn’t complete the request. Check the connection and try again.' }, { status: 502 });
    }
    const result = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = bounded(result.choices?.[0]?.message?.content, 6000);
    if (!reply) { return Response.json({ error: 'Groq returned no suggestions. Try again.' }, { status: 502 }); }
    return Response.json({ reply });
  } catch { return Response.json({ error: 'Could not reach Groq. Try again.' }, { status: 502 }); }
}
