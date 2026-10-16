/* The static marks, copied from the sibling ad (yt-thumbnail-superbot.aecdec41/ad.aecdec41.js): superbot's cat "glitch" mark and the OpenAI knot. */
window.SB_MARKS = (() => {
  const CAT_HEAD = 'M29 32H71A15 15 0 0 1 86 47V71A15 15 0 0 1 71 86H29A15 15 0 0 1 14 71V47A15 15 0 0 1 29 32ZZM35 47a8 11 0 1 0 0 22a8 11 0 1 0 0-22ZM65 47a8 11 0 1 0 0 22a8 11 0 1 0 0-22Z';
  const CAT_EARS = 'M14 46V28Q14 20 21 21Q28 24 36 32ZM86 46V28Q86 20 79 21Q72 24 64 32Z';
  const catLayer = (fill, d) => `<g fill="${fill}" stroke="none" transform="translate(${d} ${d})"><path fill-rule="evenodd" d="${CAT_HEAD}"/><path d="${CAT_EARS}"/></g>`;
  const CAT_MARK = `<svg viewBox="12.8 19.3 74.4 67.9" aria-hidden="true">${catLayer('#00e5c3', -1.2)}${catLayer('#c026d3', 1.2)}${catLayer('#ffffff', 0)}</svg>`;
  const PETAL = 'M1107.3 299.1c-197.999 0-373.9 127.3-435.2 315.3L650 743.5v427.9c0 21.4 11 40.4 29.4 51.4l344.5 198.515V833.3h.1v-27.9L1372.7 604c33.715-19.52 70.44-32.857 108.47-39.828L1447.6 450.3C1361 353.5 1237.1 298.5 1107.3 299.1zm0 117.5-.6.6c79.699 0 156.3 27.5 217.6 78.4-2.5 1.2-7.4 4.3-11 6.1L952.8 709.3c-18.4 10.4-29.4 30-29.4 51.4V1248l-155.1-89.4V755.8c-.1-187.099 151.601-338.9 339-339.2z';
  const KNOT = `<svg viewBox="0 0 2406 2406" aria-hidden="true"><g fill="currentColor" stroke="none">${[0, 60, 120, 180, 240, 300].map((a) => `<path d="${PETAL}" transform="rotate(${a} 1203 1203)"/>`).join('')}</g></svg>`;
  return { CAT_MARK, KNOT };
})();
