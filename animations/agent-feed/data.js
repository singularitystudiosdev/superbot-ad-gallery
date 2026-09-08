// Scripted sweep the feed plays back. The agent is the sender; every entry is
// something IT did. Entries appear top-down in the order listed.

const IDES = ['cursor', 'vscode', 'claude-code', 'windsurf'];

const SCRIPT_PART1 = [
  {
    type: 'event',
    time: '09:41',
    text: 'Scheduled sweep started · 4 IDEs connected',
  },
  {
    type: 'scan',
    label: 'Scanning Cursor',
    result: '214 sessions indexed · 18.4K tokens on disk',
    ms: 2600,
  },
  {
    type: 'thinking',
    lines: [
      'cross-referencing tool registries across all four IDEs…',
      'cursor has browser_navigate AND open_url — same job, two schemas. merge into `browser_open`.',
      'vscode duplicates http_get; claude-code overlaps grep/search_code. windsurf is clean.',
      '~2.1K tokens per session recovered. superset schema — safe rename.',
    ],
  },
  {
    type: 'card',
    icon: 'merge',
    title: 'Merged 3 Tools',
    save: 'Saved 2.1K context tokens',
    note: 'Duplicates collapsed into one canonical tool per job. Old names kept as aliases so nothing breaks.',
    details: {
      cols: ['IDE', 'Change', 'Saved'],
      rows: [
        ['Cursor', 'browser_navigate + open_url → browser_open', '840 tok'],
        ['VS Code', 'http_get → net_fetch (built-in fetch)', '660 tok'],
        ['Claude Code', 'grep + search_code → code_search', '600 tok'],
        ['Windsurf', 'no duplicates found', '—'],
      ],
    },
  },
  {
    type: 'scan',
    label: 'Auditing prompt history',
    result: '5 replayable prompts found across 3 IDEs',
    ms: 2400,
  },
  {
    type: 'thinking',
    lines: [
      'five prompts are re-sent verbatim every session and never change…',
      'all five are cache-stable — static prefix, varying tail. pinning them.',
      '12.4K tokens this week at $3/M. real money, not a rounding error.',
    ],
  },
  {
    type: 'card',
    icon: 'cache',
    title: 'Cached 5 Prompts',
    save: 'Saved 12.4K tokens this week',
    note: 'Static prefixes pinned for cache hits. Repeated sends now bill at cache-read rates.',
    details: {
      cols: ['Prompt', 'Where', 'Hits', 'Saved'],
      rows: [
        ['lint-fix preamble', 'Cursor · VS Code', '101', '5.9K tok'],
        ['commit-message spec', 'all 4 IDEs', '64', '3.1K tok'],
        ['review rubric', 'Claude Code', '23', '1.6K tok'],
        ['onboarding brief', 'Cursor', '12', '1.1K tok'],
        ['release checklist', 'Windsurf', '7', '0.7K tok'],
      ],
    },
  },
  {
    type: 'scan',
    label: 'Diffing skill folders',
    result: '2 skills duplicated Cursor ↔ Claude Code',
    ms: 2200,
  },
  {
    type: 'thinking',
    lines: [
      'commit-push and fix-lint exist twice with diverged copies…',
      'cursor’s fix-lint is 3 revisions ahead — the drift caused two “fixed it twice” incidents.',
      'symlinking both to one canonical copy.',
    ],
  },
  {
    type: 'card',
    icon: 'skill',
    title: 'Shared 2 Skills',
    save: 'Saved 890 tokens per session',
    note: 'commit-push and fix-lint now resolve to one canonical copy shared across IDEs.',
    details: {
      cols: ['Skill', 'Was', 'Now', 'Saved'],
      rows: [
        ['commit-push', '2 diverged copies', '1 shared copy', '470 tok'],
        ['fix-lint', '2 diverged copies', '1 shared copy', '420 tok'],
      ],
    },
  },
  {
    type: 'scan',
    label: 'Checking rule files for drift',
    result: '4 files with redundant always-on blocks',
    ms: 2000,
  },
  {
    type: 'thinking',
    lines: [
      'four rule files are past the inline budget and ship redundant blocks…',
      'demoting duplicated blocks to fetch-on-demand keeps behavior, drops the per-chat tax.',
    ],
  },
  {
    type: 'card',
    icon: 'rule',
    title: 'Deduped 4 Rule Files',
    save: 'Saved 1.3K tokens per chat',
    note: 'Redundant always-on blocks demoted to on-demand rules. Nothing was deleted — it moved.',
    details: {
      cols: ['File', 'Change', 'Saved'],
      rows: [
        ['payload-truncation.mdc', 'dropped restated shell-quirks block', '410 tok'],
        ['AGENTS.md (iris)', '2 lines → pointer to .cursor/rules', '380 tok'],
        ['AGENTS.md (ai-pulse)', '1 line → pointer to .cursor/rules', '280 tok'],
        ['view-it-live.mdc', 'collapsed 3 examples to 1', '230 tok'],
      ],
    },
  },
  {
    type: 'thinking',
    lines: [
      'sweep complete — totaling today’s ledger…',
      '16.7K tokens recovered; ~$1.48/wk if the duplicates stay dead. writing the summary.',
    ],
  },
];

const CHAT_REPLIES = [
  { match: /\b(save|saved|token|money|cost|spend)\b/i,
    text: '16.7K context tokens recovered today — $0.05 at $3/M, and 34 min of manual dedupe you didn’t do. biggest single win: 5 pinned prompts (12.4K).' },
  { match: /\bcache|prompt\b/i,
    text: '5 prompts pinned: lint-fix preamble, commit-message spec, review rubric, onboarding brief, release checklist. static prefixes bill at cache-read rates now.' },
  { match: /\bmerge|tool\b/i,
    text: '3 merges live: browser_open (cursor), net_fetch (vscode), code_search (claude-code). old names kept as aliases so nothing breaks.' },
  { match: /\breview|ledger|summary|today|day\b/i,
    text: 'full ledger is under Review — 9 tasks, per-IDE breakdown, tokens / cost / time for each.' },
  { match: /\bskill|share\b/i,
    text: 'commit-push and fix-lint had diverged copies in cursor and claude-code — now symlinked to one canonical version each. 890 tokens per session back.' },
  { match: /\b(rule|dedupe|agents\.md)\b/i,
    text: '4 rule files deduped: redundant always-on blocks demoted to fetch-on-demand. nothing deleted, just moved out of every chat’s tax.' },
  { match: /^(hi|hello|hey|yo)\b/i,
    text: 'hey. 4 IDEs connected, sweeps every 30 min. want today’s ledger, or should i keep scanning?' },
  { match: /\bstop|pause|quiet\b/i,
    text: 'switch the top control to “ask first” and i’ll hold every finding for your approval before applying it.' },
  { match: /\bthanks|thank|nice|good\b/i,
    text: 'noted. next sweep in 30 — i’ll flag anything new.' },
];

const CHAT_FALLBACK = 'noted — folding that into the next sweep. want it prioritized?';

const SCRIPT_TAIL = [
  {
    type: 'summary',
    time: '09:47',
    heading: 'Daily Summary — Sep 4',
    stats: [
      { label: 'tokens saved', value: '16.7K' },
      { label: 'money saved', value: '$0.05' },
      { label: 'time saved', value: '34 min' },
    ],
    sub: '5 optimizations applied across 4 IDEs · 0 files deleted',
  },
];

const SCRIPT = [...SCRIPT_PART1, ...SCRIPT_TAIL];

const REVIEW = {
  date: 'Sep 4, 2026',
  totals: [
    { label: 'Tokens saved', value: '16,690', sub: 'context recovered today' },
    { label: 'Money saved', value: '$0.05', sub: 'at $3/M input tokens' },
    { label: 'Time saved', value: '34 min', sub: 'no manual dedupe passes' },
  ],
  week: [
    { day: 'Aug 29', tokens: 9.2 },
    { day: 'Aug 30', tokens: 11.8 },
    { day: 'Aug 31', tokens: 7.4 },
    { day: 'Sep 1', tokens: 14.1 },
    { day: 'Sep 2', tokens: 12.6 },
    { day: 'Sep 3', tokens: 15.3 },
    { day: 'Sep 4', tokens: 16.7 },
  ],
  tasks: [
    { time: '09:41', task: 'Merged browser_navigate + open_url → browser_open', ide: 'Cursor', tokens: '840', cost: '$0.003', minutes: '4' },
    { time: '09:41', task: 'Merged grep + search_code → code_search', ide: 'Claude Code', tokens: '600', cost: '$0.002', minutes: '3' },
    { time: '09:42', task: 'Merged http_get → net_fetch', ide: 'VS Code', tokens: '660', cost: '$0.002', minutes: '3' },
    { time: '09:43', task: 'Pinned lint-fix preamble for cache hits (101 sends)', ide: 'Cursor · VS Code', tokens: '5.9K', cost: '$0.018', minutes: '9' },
    { time: '09:43', task: 'Pinned commit-message spec for cache hits (64 sends)', ide: 'All 4 IDEs', tokens: '3.1K', cost: '$0.009', minutes: '5' },
    { time: '09:43', task: 'Pinned review rubric + onboarding brief + release checklist', ide: '3 IDEs', tokens: '3.4K', cost: '$0.010', minutes: '6' },
    { time: '09:44', task: 'Symlinked commit-push to one canonical copy', ide: 'Cursor ↔ Claude Code', tokens: '470', cost: '$0.001', minutes: '3' },
    { time: '09:44', task: 'Symlinked fix-lint to one canonical copy', ide: 'Cursor ↔ Claude Code', tokens: '420', cost: '$0.001', minutes: '3' },
    { time: '09:45', task: 'Demoted redundant always-on rule blocks (4 files)', ide: 'All 4 IDEs', tokens: '1.3K', cost: '$0.004', minutes: '3' },
  ],
};
