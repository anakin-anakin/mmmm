export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const clientKey = req.headers["x-api-key"];
  if (clientKey !== process.env.CLIENT_SECRET) return res.status(401).json({ error: "Unauthorized" });
  const { action, data } = req.body;
  if (!action || !data) return res.status(400).json({ error: "Missing action or data" });
  const prompt = `You are a Roblox Lua expert. Game data: ${JSON.stringify(data)}. Task: ${action}. Return ONLY Lua code, no markdown, no backticks.`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const d = await r.json();
    if (d.error) return res.status(500).json({ error: d.error.message });
    const text = (d.candidates?.[0]?.content?.parts?.[0]?.text || "").replace(/```lua\n?/g,"").replace(/```\n?/g,"").trim();
    return res.status(200).json({ response: text });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
