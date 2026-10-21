// The film's cue sheet, derived from the voice (js/vo.93d8bde0.js) so every action lands on its word: the ⋯ click on
// "here", "Configure this Experience" on "edit", the pencil on "tab", the upload button circled on "upload stuff", the
// lowest thumbnail on "right here", Done on "Done". Silent stretches (scenes 1 to 3, 6 and 7) are timed here.
import { typeTimes } from './lib.93d8bde0.js';
import { S5_TAIL, S6_LEN, S7_LEN, S8_LEAD } from './plan.93d8bde0.js';

export const NAME = 'ROB-IT Thumbnails';
export const URL_TYPED = 'roblox.com';
export const URL_GAME = 'roblox.com/games/96168869671905/ROB-IT';

const norm = (w) => w.toLowerCase().replace(/[^a-z0-9-]/g, '');

export function buildTiming(VO) {
  const line = (id) => {
    const L = VO.lines.find((l) => l.id === id);
    if (!L) throw new Error(`no line ${id} in the voice timings`);
    return L;
  };
  const word = (id, w, nth = 1) => {
    let k = 0;
    for (const x of line(id).words) if (norm(x.w) === norm(w) && ++k === nth) return x;
    throw new Error(`no word "${w}" (#${nth}) in ${id}`);
  };
  const T = { line, word, total: VO.total };

  // scene 1: he says the line, then clicks New Superbot
  const L1 = line('L1');
  T.newMove = [L1.start + 1.1, L1.end + 0.05];
  T.newClick = L1.end + 0.3;
  // scene 2: the create panel, the name typed live, Start recording
  T.panelIn = T.newClick + 0.06;
  T.nameMove = [T.newClick + 0.3, T.newClick + 0.85];
  T.nameClick = T.newClick + 0.92;
  T.nameTimes = typeTimes(NAME, T.nameClick + 0.28, 10.5, 7);
  T.typeEnd = T.nameTimes[T.nameTimes.length - 1];
  T.recMove = [T.typeEnd + 0.3, T.typeEnd + 0.95];
  T.recClick = T.typeEnd + 1.2;
  // scene 3: the app gives way to his browser, the recording overlay comes up, he types roblox.com
  T.panelOut = [T.recClick + 0.1, T.recClick + 0.32];
  T.toChrome = [T.recClick + 0.2, T.recClick + 0.75];
  T.vigIn = T.recClick + 0.55;
  T.pillIn = T.recClick + 0.7;
  T.rec0 = T.pillIn + 0.1; // the recording's timer starts
  T.omniMove = [T.recClick + 0.78, T.recClick + 1.35];
  T.omniClick = T.recClick + 1.42;
  T.urlTimes = typeTimes(URL_TYPED, T.omniClick + 0.3, 12, 3);
  T.urlEnd = T.urlTimes[T.urlTimes.length - 1];
  T.enter = T.urlEnd + 0.38;
  T.gameIn = T.enter + 0.5;

  // scene 4, phrase by phrase
  T.menuMove = [Math.max(T.gameIn + 0.15, word('P2', 'want').t0), word('P2', 'here').t0 - 0.02];
  T.menuClick = word('P2', 'here').t0 + 0.06;
  T.cfgMove = [T.menuClick + 0.32, word('P2', 'edit,').t0 + 0.05];
  T.cfgClick = word('P2', 'edit,').t0 + 0.2;
  T.detailsIn = T.cfgClick + 0.55;
  T.pencilMove = [Math.max(T.detailsIn + 0.1, word('P3', 'go').t0), word('P3', 'thumbnail').t1];
  T.pencilClick = word('P3', 'tab,').t0 + 0.08;
  T.thumbsIn = T.pencilClick + 0.5;
  T.editMove = [T.thumbsIn + 0.12, Math.max(T.thumbsIn + 0.6, word('P4', 'here,').t0)];
  T.editClick = T.editMove[1] + 0.08;
  T.editIn = T.editClick + 0.18;
  T.uploadMove = [T.editClick + 0.3, Math.max(T.editClick + 0.8, word('P4', 'upload').t0 - 0.05)];
  T.uploadOrbit = [T.uploadMove[1], line('P4').end + 0.55];
  T.scroll = [word('P5', 'generate').t0, word('P5', 'thumbnails').t1 + 0.3];
  T.rowMove = [Math.max(T.scroll[1] + 0.05, word('P5', 'replace').t0), word('P5', 'right').t0];
  T.rowTap = word('P5', 'here,').t0 + 0.05;
  T.imprMove = [word('P6', 'wait').t0, word('P6', 'statistically').t0];
  T.imprSweep = [word('P6', 'significant').t0, word('P6', 'data,').t1];
  T.ptrMove = [word('P6', 'learning').t0, word('P6', 'click').t0];
  T.ptrOrbit = [word('P6', 'click').t0, line('P6').end + 0.35];
  T.thumbMove = [Math.max(T.ptrOrbit[1] + 0.05, word('P7', 'use').t0), word('P7', 'art').t1];
  T.thumbSweep = [word('P7', 'methods').t0, word('P7', 'design.').t1];
  // scene 5: Done, the overlay fades, the recording flies into the app
  T.doneMove = [Math.max(T.thumbSweep[1] + 0.1, word('L8', 'then').t0), word('L8', 'done.').t0 - 0.03];
  T.doneClick = word('L8', 'done.').t0 + 0.1;
  T.recOut = [T.doneClick + 0.12, T.doneClick + 0.6];
  T.fly = [T.doneClick + 0.3, T.doneClick + 1.45];
  T.appBack = [T.doneClick + 0.35, T.doneClick + 0.95];
  T.rowAdd = T.doneClick + 0.75;

  // scene 6: Superbot learns it, then proves it can do it alone
  T.s6 = line('L8').end + S5_TAIL;
  T.thinkIn = T.s6;
  T.steps = [0, 1, 2, 3, 4, 5].map((i) => T.s6 + 0.55 + i * 0.55);
  T.thinkDone = T.s6 + 4.0;
  T.verifyIn = T.s6 + 4.15;
  T.vsteps = [0, 1, 2, 3].map((i) => T.s6 + 4.6 + i * 0.8);
  T.verified = T.vsteps[3] + 0.45;
  // scene 7: it works the job, round after round
  T.s7 = T.s6 + S6_LEN;
  T.s8 = T.s7 + S7_LEN;
  T.endIn = T.s8;
  T.l9 = line('L9');
  if (T.l9.start < T.s8 + S8_LEAD - 0.01) throw new Error('the end card line starts before the end card');
  if (T.gameIn > line('P2').start - 0.15) console.warn(`scene 3 runs into P2: game page at ${T.gameIn.toFixed(2)}, P2 at ${line('P2').start}`);
  return T;
}
