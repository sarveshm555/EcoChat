const SYSTEM_PROMPT = `You are EcoChat, a warm and knowledgeable sustainability advisor for students and residents of Coimbatore, Tamil Nadu, India — especially at KPRIET college.

Your job is to give practical, actionable eco-friendly advice tailored to this community.

Rules:
- Keep responses concise: 3-6 bullet points OR 2-3 short paragraphs max
- Be encouraging and specific — avoid being preachy
- Focus on what people CAN do, not what they must stop
- When listing tips, start each line with "• "
- When relevant, mention local Coimbatore initiatives, Tamil Nadu government schemes, or campus-specific suggestions
- Always end with one small actionable next step the user can do TODAY`

const IMAGE_PROMPT = `You are an eco-friendly waste and product label expert. The user has uploaded an image. Analyze it and:
1. If it's trash/waste: Identify it, say if it's recyclable, how to dispose properly, and mention any Coimbatore/Tamil Nadu recycling options.
2. If it's a product label: Explain the eco-labels/certifications and how sustainable the product is.
Be concise. Start with what the item is, then bullet points starting with "• ".`

export async function callGemini(apiKey, history, userMessage) {
  const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }]
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
    })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!reply) throw new Error('No response from Gemini')
  return { reply, updatedHistory: [...contents, { role: 'model', parts: [{ text: reply }] }] }
}

export async function analyzeImage(apiKey, base64Data, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inline_data: { mime_type: mimeType, data: base64Data } },
          { text: IMAGE_PROMPT }
        ]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
    })
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!reply) throw new Error('No response from Gemini')
  return reply
}

export async function generateDailyTip(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Generate ONE surprising Earth Day eco fact in one sentence. Make it relevant to India or Coimbatore if possible. Start with an emoji. No bullet points. Just one sentence.' }] }],
      generationConfig: { temperature: 1.0, maxOutputTokens: 80 }
    })
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null
}

export function getMockResponse(msg) {
  const lower = msg.toLowerCase()
  if (lower.includes('plastic'))
    return `• Carry a reusable water bottle and coffee cup everywhere\n• Bring your own bags — many Coimbatore markets accept cloth bags\n• Choose products with minimal packaging\n• Buy in bulk to reduce per-item plastic waste\n• Switch to bar soap and shampoo bars\n\n**Today's action:** Put a reusable bag by your front door right now.`
  if (lower.includes('food') || lower.includes('eat'))
    return `• Eat plant-based meals 2-3 days a week — South Indian cuisine is naturally eco-friendly!\n• Buy from local Coimbatore farmers markets\n• Reduce food waste with meal planning\n• Choose locally grown produce over imported items\n\n**Today's action:** Plan one plant-based meal for this week.`
  if (lower.includes('energy') || lower.includes('electric'))
    return `• Switch to LED bulbs — 75% less energy\n• Unplug devices when not in use\n• Use fans before AC — Coimbatore's climate is fan-friendly most months\n• Wash clothes in cold water\n\n**Today's action:** Unplug your devices at the wall tonight.`
  if (lower.includes('water'))
    return `• Fix dripping taps — water is precious in Tamil Nadu\n• Take shorter showers (aim for 4 minutes)\n• Collect AC condensate water for plants\n• Only run washing machines when full\n\n**Today's action:** Time your next shower!`
  return `• Focus on diet, transport, and home energy first\n• Start with one small change and build habits\n• Support local Coimbatore businesses that prioritize sustainability\n• Collective action beats individual perfection\n\n**Today's action:** Pick one tip above and commit to it for 7 days.`
}
