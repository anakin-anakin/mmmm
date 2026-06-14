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

  let prompt = "";
  if (action === "inventory_spawner") {
    prompt = `You are a Roblox Lua expert. Generate a working inventory spawner script using the Wind UI library.
Game data: ${JSON.stringify(data)}

Use this exact Wind UI loader at the top:
local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()

Then create a Wind UI window with:
1. Title: "Inventory Spawner"
2. A tab called "Items"
3. Buttons for at least 10 common Roblox items: Sword, Bomb, Rocket Launcher, Speed Coil, Gravity Coil, Btools, Fly, Noclip, Inf Jump, Kill Aura
4. Each button when clicked creates the tool in game.Players.LocalPlayer.Backpack using Instance.new
5. Clean and functional

Return ONLY Lua code, no markdown, no backticks, no explanation.`;
  } else if (action === "spawn_pet") {
    prompt = `You are a Roblox Lua expert. Generate a working pet visual spawner script using Wind UI.
Game data: ${JSON.stringify(data)}
Use Wind UI: local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()
Create a window to select and spawn pets that float above the player with bobbing animation.
Return ONLY Lua code, no markdown, no backticks, no explanation.`;
  } else {
    prompt = `You are a Roblox Lua expert. Game data: ${JSON.stringify(data)}
Task: ${action}
Use Wind UI: local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()
Return ONLY Lua code, no markdown, no backticks, no explanation.`;
  }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2000 } })
    });
    const d = await r.json();
    if (d.error) return res.status(500).json({ error: d.error.message });
    const text = (d.candidates?.[0]?.content?.parts?.[0]?.text || "").replace(/```lua\n?/g,"").replace(/```\n?/g,"").trim();
    return res.status(200).json({ response: text });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
