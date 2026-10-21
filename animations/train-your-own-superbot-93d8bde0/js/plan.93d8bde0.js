// The film's spoken plan: every line in the script's exact words (captions show these), where each line sits, and the
// lengths of the silent stretches between them. Read by the director (js/film.93d8bde0.js) and by the voice tool
// (tools/vo-build.93d8bde0.mjs), which places the takes on this plan and writes js/vo.93d8bde0.js.
// `after` places a line that long after the end of the line before it (`at` pins it to a time instead).
export const LINES = [
  { id: 'L1', at: 0.5, take: 'A', text: 'This is how you create your own Superbot.' },
  // the scene 4 monologue is one take (B), cut into its phrases at the word timestamps so each lands on its action
  { id: 'P2', at: 11.4, take: 'B', text: 'I want you, Superbot, to go here to my edit,' },
  { id: 'P3', after: 0.75, take: 'B', text: 'and then go to my thumbnail tab,' },
  { id: 'P4', after: 0.7, take: 'B', text: 'and then here, where you can upload stuff.' },
  { id: 'P5', after: 1.05, take: 'B', text: 'I want you to generate new thumbnails and replace the lowest performing one, right here,' },
  { id: 'P6', after: 0.45, take: 'B', text: 'and continually improve. Wait until there is a statistically significant amount of data, then keep learning and optimizing for click rate.' },
  { id: 'P7', after: 0.5, take: 'B', text: 'Use state of the art methods for thumbnail design.' },
  { id: 'L8', after: 0.6, take: 'C', text: 'Ok, and then I just click Done.' },
  // scene 5's tail, scene 6 and scene 7 are silent; the end card's line starts its lead into scene 8
  { id: 'L9', after: 1.6 + 8.0 + 14.5 + 0.45, take: 'D', text: 'Create your own Superbot for any repeatable task. Superbot, the agent for automation.' },
];
export const S5_TAIL = 1.6, S6_LEN = 8.0, S7_LEN = 14.5, S8_LEAD = 0.45, OUTRO = 1.1;
// what each take says (the TTS input: "Ok" is spoken "Okay"); the captions keep the script's words
export const TAKES = {
  A: 'This is how you create your own Superbot.',
  B: LINES.filter((l) => l.take === 'B').map((l) => l.text).join(' '),
  C: 'Okay, and then I just click done.',
  D: 'Create your own Superbot for any repeatable task. Superbot, the agent for automation.',
};
