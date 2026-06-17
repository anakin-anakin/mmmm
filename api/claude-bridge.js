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
    prompt = `You are a Roblox Lua expert specializing in Grow a Garden 2 on Roblox.
Generate a working visual inventory spawner script for Grow a Garden 2.
Game data: ${JSON.stringify(data)}

Use this exact Wind UI loader at the top:
local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()

Create a Wind UI window titled "GAG2 Spawner" with 3 tabs: "Pets", "Seeds", "Gear"

PETS TAB - Add buttons for these Grow a Garden 2 pets. Each pet when clicked spawns a visual model that floats above the player's head with a smooth bobbing animation using TweenService. The model should look like the real pet using Instance.new parts with correct BrickColor and shape:
- Bunny (white, fluffy round body, long ears)
- Cat (orange tabby, pointy ears, tail)
- Dog (golden, floppy ears, wagging tail)
- Dragon (red/purple, wings, spiky back)
- Bee (yellow/black stripes, wings, stinger)
- Butterfly (colorful large wings, thin body)
- Fox (orange, white chest, bushy tail)
- Panda (black/white, round body, eye patches)
- Unicorn (white, rainbow mane, golden horn)
- Chick (yellow, small wings, tiny beak)
- Frog (green, big eyes, webbed feet)
- Axolotl (pink, feathery gills, cute face)

SEEDS TAB - Add buttons for these Grow a Garden 2 seeds. Each when clicked creates a Tool in LocalPlayer.Backpack with the seed name and a matching colored handle:
- Carrot (orange)
- Strawberry (red)
- Blueberry (blue)
- Watermelon (green)
- Grape (purple)
- Pumpkin (orange)
- Sunflower (yellow)
- Rose (pink)
- Cactus (dark green)
- Bamboo (light green)
- Corn (yellow)
- Tomato (red)
- Mushroom (brown)
- Daffodil (yellow)
- Mango (orange-yellow)

GEAR TAB - Add toggle buttons for:
- Speed Boost (WalkSpeed 50, default 16)
- Super Jump (JumpPower 150, default 50)
- Fly (BodyVelocity fly hack)
- Noclip (disable character collisions)
- Infinite Coins (fire RemoteEvent every second if found)
- Auto Harvest (loop clicking harvest remotes)
- Reset Character

Pet visual model requirements:
1. Built from Instance.new("Part") and Instance.new("SpecialMesh") welded together
2. Parent the pet model to workspace, anchored = false, CanCollide = false
3. Use a BodyPosition to keep it floating 5 studs above HumanoidRootPart
4. Use TweenService to bob up and down smoothly in a loop
5. Add a BillboardGui above it showing the pet name in a cute font
6. Store active pets in a table so clicking again destroys and removes it (toggle)
7. Pet follows player by updating BodyPosition every heartbeat

Return ONLY Lua code, no markdown, no backticks, no explanation.`;

  } else if (action === "spawn_pet") {
    prompt = `You are a Roblox Lua expert for Grow a Garden 2. Generate a working pet visual spawner.
Game data: ${JSON.stringify(data)}
Use Wind UI: local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()
Pets float above player with bobbing animation using TweenService. Toggle on/off per pet.
Return ONLY Lua code, no markdown, no backticks, no explanation.`;

  } else {
    prompt = `You are a Roblox Lua expert for Grow a Garden 2.
Game data: ${JSON.stringify(data)}
Task: ${action}
Use Wind UI: local WindUI = loadstring(game:HttpGet("https://raw.githubusercontent.com/Footagesus/WindUI/main/source.lua"))()
Return ONLY Lua code, no markdown, no backticks, no explanation.`;
  }

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.gemini}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 6000, temperature: 0.2 }
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
