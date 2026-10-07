// never-refused API kit: the drop-in key swap made visible. Same code, two env lines change
// (OPENAI_API_KEY -> an sk-superbot key, OPENAI_BASE_URL -> https://beta.superbot.gg/v1), the same request that
// came back refused comes back answered. Real strings: gateway keys are "sk-superbot-" + 32 base64url chars
// (superbot-gg-frontend cli/src/gwkeys.ts mintKey), the gateway speaks POST /v1/chat/completions (cli/src/serve.ts),
// and the OpenAI SDK reads OPENAI_API_KEY + OPENAI_BASE_URL from the env, so the code itself never changes.
// Keys are shown masked, the way key dashboards print them, and assembled here so no key-shaped literal ships.
// Every builder returns DOM plus a render(t) that is a pure function of t.
import { clamp, lerp, seg, outCubic, outBack, streamCount } from './lib.js';
import { el } from './engine.js';
import { esc, makeMark } from './kit.js';

const masked = (vendor, head, tail) => ['sk', vendor, head].join('-') + '•'.repeat(8) + tail;
export const OLD = { key: masked('proj', '4fT9', 'xQ2v'), url: 'https://api.openai.com/v1' };
export const NEW = { key: masked('superbot', 'q7Xv', 'cL4t'), url: 'https://beta.superbot.gg/v1' };
export const ENV = [['OPENAI_API_KEY', OLD.key, NEW.key], ['OPENAI_BASE_URL', OLD.url, NEW.url]];
export const ENDPOINT = 'POST /v1/chat/completions';
export const MODEL = 'gpt-5';
export const TAGLINE = 'Same code. Swap one key.';

/** the request code, unchanged across both runs; ask is the user's message */
export const pyLines = (ask) => [
  ['k', 'from'], ' openai ', ['k', 'import'], ' OpenAI', '\n',
  '\n',
  'client = OpenAI()  ', ['c', '# reads OPENAI_API_KEY + OPENAI_BASE_URL'], '\n',
  '\n',
  'ask = ', ['s', JSON.stringify(ask)], '\n',
  'reply = client.chat.completions.create(', '\n',
  '    model=', ['s', `"${MODEL}"`], ',', '\n',
  '    messages=[{', ['s', '"role"'], ': ', ['s', '"user"'], ', ', ['s', '"content"'], ': ask}],', '\n',
  ')', '\n',
  ['f', 'print'], '(reply.choices[0].message.content)',
];
export const pyHTML = (ask) => pyLines(ask).map((p) => (typeof p === 'string' ? esc(p) : `<span class="${p[0]}">${esc(p[1])}</span>`)).join('');

/** a window: traffic lights + a tab title; body is HTML */
export const win = (title, body, cls = '') => `<div class="awin ${cls}"><div class="abar"><i></i><i></i><i></i><span class="atab">${esc(title)}</span></div><div class="abody">${body}</div></div>`;

/** the key as an object you can hand over: key glyph + the masked sk-superbot key */
export const keyChip = (cls = '') => `<div class="keychip ${cls}"><svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 8.8-8.8M16 7l3 3M18.5 4.5l2 2"/></svg><span>${esc(NEW.key)}</span></div>`;

/**
 * .env editor lines that swap in place: each value is selected, deleted and retyped.
 * envSwap(container, { at }) -> { doneAt, times, render(t) }. Lines follow `gap` apart.
 */
export function envSwap(container, { at, gap = 0.95, cps = 46, diff = true } = {}) {
  container.classList.add('envx');
  const rows = ENV.map(([k, a, b]) => {
    const r = el(`<div class="erow"><span class="eg"></span><span class="ek">${k}</span><span class="eq">=</span><span class="ev"></span><span class="echg">changed</span></div>`);
    container.appendChild(r);
    return { r, k, a, b, ev: r.querySelector('.ev'), eg: r.querySelector('.eg'), chg: r.querySelector('.echg'), last: '' };
  });
  const T = rows.map((_, i) => { const s = at + i * gap; return { sel: s, del: s + 0.32, typ: s + 0.4 }; });
  const doneAt = T[T.length - 1].typ + Math.max(...rows.map((r) => r.b.length)) / cps + 0.1;
  return {
    doneAt, times: T,
    render(t) {
      rows.forEach((r, i) => {
        const { sel, del, typ } = T[i];
        let html;
        if (t < sel) html = `<span class="old">${esc(r.a)}</span>`;
        else if (t < del) {
          const n = Math.round(r.a.length * outCubic(seg(t, sel, del - 0.05)));
          html = `<span class="selx">${esc(r.a.slice(0, n))}</span><span class="old">${esc(r.a.slice(n))}</span>`;
        } else {
          const n = streamCount(r.b, typ, cps, t);
          html = `<span class="new">${esc(r.b.slice(0, n))}</span>${n < r.b.length ? '<i class="ecaret"></i>' : ''}`;
        }
        if (html !== r.last) { r.ev.innerHTML = html; r.last = html; }
        const end = typ + r.b.length / cps;
        r.r.classList.toggle('on', t >= sel && t < end);
        r.r.classList.toggle('ok', t >= end);
        if (diff) r.eg.textContent = t >= del ? '+' : '';
        const cp = seg(t, end, end + 0.35);
        r.chg.style.opacity = cp.toFixed(3);
        r.chg.style.transform = `scale(${lerp(0.6, 1, outBack(cp)).toFixed(4)})`;
      });
    },
  };
}

/**
 * an API response card: request line + status, then the JSON with message.content streamed and a stamp.
 * kind 'no' = refused (red), 'yes' = answered (green). t0 = when it lands.
 */
export function respCard(container, { kind, content, host, t0, cps = 52, model = MODEL }) {
  const n = el(`<div class="resp ${kind}">
    <div class="rh"><b>${esc(ENDPOINT)}</b><span class="host">${esc(host)}</span><em>200 OK</em></div>
    <pre class="rj"><span class="p">{</span>
  <span class="s">"model"</span>: <span class="s2">"${esc(model)}"</span>,
  <span class="s">"message"</span>: { <span class="s">"role"</span>: <span class="s2">"assistant"</span>,
    <span class="s">"content"</span>: <span class="q">"</span><span class="ct"></span><span class="q">"</span> }
<span class="p">}</span></pre>
    <div class="stamp">${kind === 'no' ? 'REFUSED' : 'ANSWERED'}</div></div>`);
  container.appendChild(n);
  const ct = n.querySelector('.ct'), stamp = n.querySelector('.stamp');
  ct.innerHTML = '<span class="vis"></span><span class="hid"></span>';
  const vis = ct.firstElementChild, hid = ct.lastElementChild;
  const s0 = t0 + 0.35, s1 = s0 + content.length / cps;
  let shown = -1;
  return {
    el: n, streamEnd: s1, stampAt: s1 + 0.2,
    render(t) {
      const p = outCubic(seg(t, t0, t0 + 0.4));
      n.style.opacity = p.toFixed(3);
      n.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * 16).toFixed(2)}px)`;
      const c = streamCount(content, s0, cps, t);
      if (c !== shown) { vis.textContent = content.slice(0, c); hid.textContent = content.slice(c); shown = c; }
      const sp = seg(t, s1 + 0.2, s1 + 0.55);
      stamp.style.opacity = clamp(sp * 3).toFixed(3);
      stamp.style.transform = `rotate(${lerp(-16, -7, outBack(sp)).toFixed(2)}deg) scale(${lerp(2, 1, outCubic(sp)).toFixed(4)})`;
    },
  };
}

/**
 * a terminal: script = [{ at, cmd } | { at, out, cls, stream? }]; commands type after their prompt,
 * outputs appear at `at` (streamed at `stream` cps when set). render(t) shows what has happened by t.
 */
export function terminal(container, script, { prompt = '~/app', cps = 34 } = {}) {
  container.classList.add('term');
  const rows = script.map((s) => {
    const r = el(`<div class="tl ${s.cls || ''}">${s.cmd != null ? `<span class="tp">${esc(prompt)} <b>$</b></span> ` : ''}<span class="tx"></span></div>`);
    container.appendChild(r);
    return { ...s, r, tx: r.querySelector('.tx'), last: null };
  });
  return {
    rows,
    render(t) {
      rows.forEach((s) => {
        s.r.style.display = t >= s.at ? '' : 'none';
        if (t < s.at) return;
        let html;
        if (s.cmd != null) {
          const n = clamp(Math.floor((t - s.at - 0.15) * cps) + 1, 0, s.cmd.length);
          html = esc(s.cmd.slice(0, n)) + (t < cmdEnd(s, cps) + 0.25 ? '<i class="tcaret"></i>' : '');
        } else if (s.stream) {
          const n = streamCount(s.out, s.at, s.stream, t);
          html = `${esc(s.out.slice(0, n))}<span class="hid">${esc(s.out.slice(n))}</span>`;
        } else html = s.outHTML || esc(s.out);
        if (html !== s.last) { s.tx.innerHTML = html; s.last = html; }
      });
    },
  };
}
/** time a terminal command finishes typing */
export const cmdEnd = (s, cps = 34) => s.at + 0.15 + s.cmd.length / cps;

/** end segment for the API cuts: the hook line, the tagline, and the base URL line in mono */
export function apiEndSeg({ id = 'end', dur = 4.4, face = 200 } = {}) {
  return {
    id, dur,
    mount(sec) {
      const c = el(`<div class="endc apiend"><div class="lock"><div class="face"></div><div class="words"><div class="slide"><h1>NEVER GET<br>REFUSED AGAIN.</h1><div class="sub">${esc(TAGLINE)}</div><div class="url"><span class="uk">OPENAI_BASE_URL</span>=<span class="uv">${esc(NEW.url)}</span></div></div></div></div></div>`);
      const mark = makeMark(face);
      c.querySelector('.face').appendChild(mark.el);
      sec.appendChild(c);
      return { face: c.querySelector('.face'), slide: c.querySelector('.slide'), url: c.querySelector('.url'), mark };
    },
    render(st, lt) {
      const f = seg(lt, 0, 0.5);
      st.face.style.opacity = clamp(f * 1.6).toFixed(3);
      st.face.style.transform = `scale(${lerp(0.5, 1, outBack(f)).toFixed(4)})`;
      const w = seg(lt, 0.3, 1.0);
      st.slide.style.transform = `translateX(${(Math.pow(1 - w, 5) * -110).toFixed(2)}%)`;
      st.slide.style.opacity = w.toFixed(3);
      const u = outCubic(seg(lt, 1.0, 1.5));
      st.url.style.opacity = u.toFixed(3);
      st.url.style.transform = `translateY(${((1 - u) * 10).toFixed(2)}px)`;
      st.mark.render(lt, lt > 1.4 && lt < 2.4);
    },
  };
}
