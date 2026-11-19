// Leonida Trophy Atlas: guide + tracker for the 55 GTA VI PS5 trophies.
// Loads only data/trophies.json from its own folder; progress lives in
// localStorage and in the file the reader exports. No network at run time.

const STORE_KEY = 'leonida-trophy-atlas-v1';
const SPOILER_KEY = 'leonida-trophy-atlas-spoilers';
const DATA_URL = 'data/trophies.json';

const STAGES = [
  { n: 1, title: 'Play the story', blurb: 'Chapters 1–4 and the final mission, in order. Save at the start of every chapter — there is no mission replay.', kinds: ['story'] },
  { n: 2, title: 'Strangers & side strands', blurb: 'Finish the stranger chains (Andy, Kenton, Billy, Randy, Tyrone, Bret and more) until 8 strands are done.', kinds: ['side'] },
  { n: 3, title: 'Activities & challenges', blurb: 'Shooting range gold, stunts, races, drone races, fishing, arcade, bowling and 50 challenges.', kinds: ['activity'] },
  { n: 4, title: 'Collectibles & exploration', blurb: 'Meditation spots, card sets, WAiNK scans, vehicles, all 52 areas, garages and Scooter Bros registrations.', kinds: ['collectible', 'other'] },
  { n: 5, title: 'Crime, cleanup & Platinum', blurb: 'Robberies, wanted escapes, laundering and spending — then 100% completion and the Platinum.', kinds: ['crime', 'completion', 'platinum'] },
];

const KIND_LABELS = {
  story: 'Story', missable: 'Missable', collectible: 'Collectible',
  activity: 'Activity', side: 'Side strand', crime: 'Crime',
  other: 'World', completion: '100%', platinum: 'Platinum', online: 'Online',
};

const listEl = document.getElementById('trophyList');
const detailBody = document.getElementById('detailBody');
const statusLine = document.getElementById('statusLine');
const emptyNote = document.getElementById('emptyNote');
const searchBox = document.getElementById('searchBox');
const gradeSelect = document.getElementById('gradeSelect');
const spoilerToggle = document.getElementById('spoilerToggle');
const earnedOnlyBox = document.getElementById('earnedOnly');

const params = new URLSearchParams(location.search);
let kindFilter = params.get('filter') || 'all';
let earned = loadEarned();
let selectedName = null;
let trophies = [];

/* Load saved progress: an array of earned trophy names, nothing else. */
function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort()));
}

function spoilersOn() {
  return spoilerToggle.checked;
}

function isHiddenFromReader(t) {
  return spoilersOn() && t.kind === 'story' && !earned.has(t.name);
}

function trophyMatches(t) {
  const q = searchBox.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
  if (gradeSelect.value !== 'all' && t.grade !== gradeSelect.value) return false;
  if (earnedOnlyBox.checked && !earned.has(t.name)) return false;
  if (kindFilter === 'missable') return t.missable === true;
  if (kindFilter === 'online') return false; // No online trophies: all 55 are single-player.
  if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
  return true;
}

function gradeBadge(t) {
  const s = document.createElement('span');
  s.className = 'badge badge-' + t.grade;
  s.textContent = t.grade;
  return s;
}

function renderRoadmap() {
  const stageList = document.getElementById('stageList');
  stageList.replaceChildren();
  for (const stage of STAGES) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = 'Stage ' + stage.n + ' — ' + stage.title;
    const p = document.createElement('p');
    p.textContent = stage.blurb;
    const inStage = trophies.filter((t) => t.stage === stage.n);
    const got = inStage.filter((t) => earned.has(t.name)).length;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = got + ' of ' + inStage.length + ' earned in this stage';
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    names.textContent = inStage.map((t) => (isHiddenFromReader(t) ? 'Hidden story trophy' : t.name)).join(' · ');
    li.append(h, p, count, names);
    stageList.append(li);
  }
}

function renderProgress() {
  const total = trophies.length;
  const got = trophies.filter((t) => earned.has(t.name)).length;
  document.getElementById('ringNumber').textContent = got + '/' + total;
  const ring = document.getElementById('ringFill');
  const circle = 2 * Math.PI * 52;
  ring.style.strokeDashoffset = String(circle * (1 - (total ? got / total : 0)));
  const byGrade = {};
  for (const t of trophies) {
    if (!earned.has(t.name)) continue;
    byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  }
  document.getElementById('gradeCounts').textContent =
    ['platinum', 'gold', 'silver', 'bronze']
      .map((g) => (byGrade[g] || 0) + ' ' + g)
      .join(' · ') + '  ·  ' + (total - got) + ' left';
}

function renderList() {
  listEl.replaceChildren();
  const visible = trophies.filter(trophyMatches);
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (earned.has(t.name) ? ' earned' : '') + (selectedName === t.name ? ' selected' : '');
    li.dataset.name = t.name;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('click', (ev) => ev.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned();
      renderAll();
    });

    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    if (isHiddenFromReader(t)) {
      name.textContent = 'Hidden story trophy';
      name.classList.add('spoiler-hidden');
      desc.textContent = 'Spoilers hidden — earn this trophy to reveal its name and description.';
    } else {
      name.textContent = t.name;
      desc.textContent = t.description;
    }
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    meta.append(gradeBadge(t));
    if (earned.has(t.name)) {
      const e = document.createElement('span');
      e.className = 'badge badge-earned';
      e.textContent = 'Earned';
      meta.append(e);
    }
    const kind = document.createElement('span');
    kind.className = 'badge badge-kind';
    kind.textContent = KIND_LABELS[t.kind] || t.kind;
    meta.append(kind);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'badge badge-missable';
      m.textContent = 'Potentially missable';
      meta.append(m);
    }
    if (typeof t.count === 'number') {
      const c = document.createElement('span');
      c.className = 'badge badge-count';
      c.textContent = '× ' + t.count.toLocaleString('en-US');
      meta.append(c);
    }
    body.append(name, desc, meta);

    const dot = document.createElement('span');
    dot.className = 'grade-dot ' + t.grade;
    dot.title = t.grade;

    li.append(box, body, dot);
    li.addEventListener('click', () => {
      selectedName = t.name;
      renderAll();
      detailBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    listEl.append(li);
  }
  emptyNote.hidden = visible.length !== 0;
  const shown = visible.length;
  const got = trophies.filter((t) => earned.has(t.name)).length;
  statusLine.textContent = kindFilter === 'online'
    ? 'Online filter: this game has no online trophies — all 55 are single-player, so this list is meant to be empty.'
    : 'Showing ' + shown + ' of ' + trophies.length + ' trophies · ' + got + ' earned · ' +
      trophies.filter((t) => t.missable).length + ' flagged potentially missable';
}

function renderDetail() {
  detailBody.replaceChildren();
  const t = trophies.find((x) => x.name === selectedName);
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick any trophy on the left to read its guide, its sources and when it can be missed.';
    detailBody.append(p);
    return;
  }
  if (isHiddenFromReader(t)) {
    const h = document.createElement('h3');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Spoilers are on, so this story trophy stays hidden until you earn it. Tick its box in the list (or turn spoilers off) to read its guide.';
    detailBody.append(h, p);
    return;
  }
  const h = document.createElement('h3');
  h.textContent = t.name;
  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = 'Official: "' + t.description + '" — ' + t.grade;
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = t.guide;
  const facts = document.createElement('ul');
  facts.className = 'detail-facts';
  const factRows = [
    ['Kind', (KIND_LABELS[t.kind] || t.kind)],
    ['Roadmap stage', 'Stage ' + t.stage + ' — ' + STAGES[t.stage - 1].title],
    ['Missable?', t.missable ? 'Yes — potentially missable. See the guide.' : 'No. It can be earned in free roam after the story.'],
  ];
  if (typeof t.count === 'number') factRows.push(['Count to reach', t.count.toLocaleString('en-US')]);
  for (const [label, value] of factRows) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    li.append(strong, document.createTextNode(value));
    facts.append(li);
  }
  const srcWrap = document.createElement('div');
  srcWrap.className = 'detail-sources';
  const srcH = document.createElement('h4');
  srcH.textContent = 'Sources for this guide';
  const srcList = document.createElement('ul');
  for (const s of t.sources || []) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.rel = 'noopener';
    li.append(a);
    srcList.append(li);
  }
  srcWrap.append(srcH, srcList);
  const toggle = document.createElement('div');
  toggle.className = 'detail-toggle';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = earned.has(t.name) ? 'Mark as not earned' : 'Mark as earned';
  btn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    saveEarned();
    renderAll();
  });
  toggle.append(btn);
  detailBody.append(h, official, guide, facts, srcWrap, toggle);
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
  renderDetail();
  window.__atlas = {
    total: trophies.length,
    earned: trophies.filter((t) => earned.has(t.name)).length,
    shown: listEl.children.length,
  };
}

/* Export progress as a JSON file the reader can keep or move to another browser. */
document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { app: 'leonida-trophy-atlas', version: 1, earned: [...earned].sort() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

/* Import: accept only names that exist in the official list; ignore the rest. */
document.getElementById('importFile').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list in file');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    saveEarned();
    renderAll();
    statusLine.textContent = 'Imported ' + earned.size + ' earned trophies from ' + file.name + '.';
  } catch (err) {
    statusLine.textContent = 'Import failed: that file is not a Leonida Trophy Atlas progress file (' + err.message + ').';
  }
  ev.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies in this browser?')) return;
  earned = new Set();
  saveEarned();
  renderAll();
});

document.getElementById('kindFilters').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-kind]');
  if (!btn) return;
  kindFilter = btn.dataset.kind;
  for (const b of document.querySelectorAll('#kindFilters .filter-btn')) {
    b.classList.toggle('active', b === btn);
  }
  renderAll();
});
searchBox.addEventListener('input', renderAll);
gradeSelect.addEventListener('change', renderAll);
earnedOnlyBox.addEventListener('change', renderAll);
spoilerToggle.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerToggle.checked ? 'on' : 'off');
  renderAll();
});

/* Restore the reader's spoiler preference, unless the URL overrides it
   for this first load only (the toggle still works after that). */
if (params.get('spoilers') === 'off') {
  spoilerToggle.checked = false;
} else if (localStorage.getItem(SPOILER_KEY) === 'off') {
  spoilerToggle.checked = false;
}
if (params.get('filter')) {
  const btn = document.querySelector('#kindFilters [data-kind="' + params.get('filter') + '"]');
  if (btn) {
    for (const b of document.querySelectorAll('#kindFilters .filter-btn')) b.classList.toggle('active', b === btn);
  }
}

/* First load: fetch the official list, then render everything. */
const doc = await (await fetch(DATA_URL)).json();
trophies = doc.trophies;
if (params.get('select')) {
  const wanted = trophies.find((t) => t.name === params.get('select'));
  if (wanted) selectedName = wanted.name;
}
renderAll();
