export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, data } = req.body;
  if (!action || !data) return res.status(400).json({ error: "Missing action or data" });

  let prompt = "";

  if (action === "inventory_spawner") {
    prompt = `You are a Roblox Lua expert specializing in Grow a Garden.
Generate a working visual inventory spawner script for Grow a Garden on Roblox.
Game data: ${JSON.stringify(data)}

Use this exact Wind UI loader at the top:
local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()

Create a Wind UI window titled "GAG Spawner" with 3 tabs: "Pets", "Seeds", "Gear"

PETS TAB - Add buttons for these pets. Each pet when clicked spawns a visual model above the player's head with a bobbing animation using TweenService. The model should look like the real pet using basic parts with the correct BrickColor and shape:
- Cat (orange, small sphere body)
- Dog (brown, blocky body)
- Rabbit (white, tall ears)
- Dragon (red, wings)
- Unicorn (white, horn)
- Bee (yellow/black stripes)
- Fox (orange, fluffy tail)
- Panda (black/white)
- Chicken (white/red comb)
- Butterfly (colorful wings)

SEEDS TAB - Add buttons for these seeds. Each when clicked adds a StringValue named after the seed inside LocalPlayer:
- Carrot Seed, Strawberry Seed, Blueberry Seed, Watermelon Seed, Grape Seed
- Pumpkin Seed, Sunflower Seed, Rose Seed, Cactus Seed, Bamboo Seed

GEAR TAB - Add buttons for:
- Speed Boost (sets WalkSpeed to 50)
- Super Jump (sets JumpPower to 150)
- Fly (enables fly using BodyVelocity)
- Noclip (disables collisions)
- Reset Character

Pet visual model should:
1. Be created with Instance.new parts welded together
2. Float 5 studs above LocalPlayer character HumanoidRootPart
3. Have smooth bobbing up/down animation via TweenService loop
4. Have a BillboardGui with the pet name above it
5. Be destroyed and replaced if you click the same pet again (toggle)

Return ONLY Lua code, no markdown, no backticks, no explanation.`;

  } else if (action === "spawn_pet") {
    prompt = `You are a Roblox Lua expert for Grow a Garden. Generate a working pet visual spawner.
Game data: ${JSON.stringify(data)}
Use Wind UI: local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()
Pets float above player with bobbing animation using TweenService. Toggle on/off per pet.
Return ONLY Lua code, no markdown, no backticks, no explanation.`;

  } else {
    prompt = `You are a Roblox Lua expert for Grow a Garden.
Game data: ${JSON.stringify(data)}
Task: ${action}
Use Wind UI: local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()
Return ONLY Lua code, no markdown, no backticks, no explanation.`;
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.gemini}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4000, temperature: 0.2 }
        })
      }
    );
    const d = await r.json();
    if (d.error) return res.status(500).json({ error: d.error.message });
    const text = (d.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .replace(/```lua\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    if (!text) return res.status(500).json({ error: "Gemini returned empty response" });
    return res.status(200).json({ response: text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
