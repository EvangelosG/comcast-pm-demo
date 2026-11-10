const PROFILE_ID = 'profile-1';
const DEVICES = [
  { id: 'living-room-tv', label: 'Living room TV' },
  { id: 'phone', label: 'Phone' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'web', label: 'Web' }
];
const WATCH_STEP_MIN = 15;

let currentDevice = DEVICES[0].id;
let catalog = [];
let progress = [];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function card(title, entry) {
  const button = el('button', 'card');
  const poster = el('div', 'poster', title.category);
  if (entry) {
    const bar = el('div', 'bar');
    const fill = el('span');
    fill.style.width = entry.percent + '%';
    bar.appendChild(fill);
    poster.appendChild(bar);
  }
  button.appendChild(poster);
  button.appendChild(el('div', 'card-title', title.title));
  const left = entry ? (title.runtimeMin - entry.positionMin) + ' min left' : title.runtimeMin + ' min';
  button.appendChild(el('div', 'card-meta', left));
  button.addEventListener('click', () => watch(title));
  return button;
}

async function watch(title) {
  const existing = progress.find((p) => p.titleId === title.id);
  const positionMin = Math.min(title.runtimeMin, (existing ? existing.positionMin : 0) + WATCH_STEP_MIN);
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: PROFILE_ID, deviceId: currentDevice, titleId: title.id, positionMin })
  });
  await refresh();
}

async function refresh() {
  const res = await fetch('/api/continue-watching?profileId=' + PROFILE_ID + '&deviceId=' + currentDevice);
  progress = await res.json();
  const row = document.getElementById('continue-watching');
  row.innerHTML = '';
  progress.forEach((entry) => row.appendChild(card(catalog.find((t) => t.id === entry.titleId), entry)));
  document.getElementById('cw-empty').hidden = progress.length > 0;
}

function renderDevices() {
  const nav = document.getElementById('devices');
  nav.innerHTML = '';
  DEVICES.forEach((device) => {
    const chip = el('button', 'chip' + (device.id === currentDevice ? ' active' : ''), device.label);
    chip.addEventListener('click', () => { currentDevice = device.id; renderDevices(); refresh(); });
    nav.appendChild(chip);
  });
}

async function start() {
  catalog = await (await fetch('/api/catalog')).json();
  const browse = document.getElementById('browse');
  catalog.forEach((title) => browse.appendChild(card(title)));
  renderDevices();
  await refresh();
}

start();
