// The pain words, picked from a complaint sweep of Hacker News comments
// (hn.algolia.com search, 2026-09-14) and the top year of r/AI_Agents,
// r/ChatGPTCoding, r/ClaudeAI, r/cursor and r/vibecoding.
//
// Already shipped as art: refusing (red), slow (blue).
// The three below are the next most repeated complaints in that sweep:
//   forgetting  agents re-learn the codebase every session; "horde of
//               short-term-memory-only agents without institutional
//               knowledge"; whole tools exist just to fix cold start
//   lying       "tell you the code is correct and it is 100 percent fixed
//               but I know it is not true"; r/AI_Agents: "ChatGPT lied to
//               me so I built an AI Scientist"
//   looping     the slot-machine complaint: agents spin, redo work already
//               done and bill for it; r/AI_Agents: "Spent 4,000 USD on AI
//               coding. Everything worked in dev. Nothing worked in
//               production", "Stop burning money sending JSON to your agents"
window.PAIN_ADS = [
  { "id": "agents-forgetting-poster", "word": "forgetting", "color": "#ff9f0a" },
  { "id": "agents-lying-poster", "word": "lying", "color": "#ff2d92" },
  { "id": "agents-looping-poster", "word": "looping", "color": "#00e5a0" }
];
