const SAVE_KEY = "simple-of-idle-save-v1";
const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
const TICK_MS = 1000;

const ZONES = [
  {
    name: "村周辺",
    enemy: "スライム",
    hp: 30,
    gold: [5, 9],
    xp: [18, 25],
    interval: 5
  },
  {
    name: "草原",
    enemy: "ゴブリン",
    hp: 55,
    gold: [10, 18],
    xp: [30, 42],
    interval: 7
  },
  {
    name: "森",
    enemy: "ウルフ",
    hp: 95,
    gold: [18, 30],
    xp: [48, 65],
    interval: 9
  }
];

const EQUIPMENT_POOL = [
  { slot: "武器", name: "見習いの剣", attack: 4, defense: 0 },
  { slot: "防具", name: "布の服", attack: 0, defense: 2 },
  { slot: "アクセサリー", name: "木の護符", attack: 1, defense: 1 }
];

const DEFAULT_STATE = {
  version: 1,
  lastSavedAt: Date.now(),
  level: 1,
  xp: 0,
  gold: 0,
  kills: 0,
  zoneIndex: 0,
  battleProgress: 0,
  equipment: [],
  recentXp: 0,
  recentGold: 0,
  recentLoot: "なし",
  logs: ["冒険を開始した。自動探索を開始します。"]
};

let state = loadState();
let lastTick = Date.now();
let saveTimer = 0;

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const saved = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...saved,
      equipment: Array.isArray(saved.equipment) ? saved.equipment : [],
      logs: Array.isArray(saved.logs) ? saved.logs.slice(0, 30) : []
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  state.lastSavedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  document.getElementById("saveIndicator").textContent = "保存済み";
  document.getElementById("lastSave").textContent = formatClock(state.lastSavedAt);
}

function formatClock(timestamp) {
  return new Date(timestamp).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function xpRequired(level) {
  return Math.floor(100 * Math.pow(1.18, level - 1));
}

function totalAttack() {
  return 10 + state.level - 1 +
    state.equipment.reduce((sum, item) => sum + (item.attack || 0), 0);
}

function totalDefense() {
  return 5 +
    Math.floor((state.level - 1) * 0.5) +
    state.equipment.reduce((sum, item) => sum + (item.defense || 0), 0);
}

function addLog(message) {
  state.logs.unshift(`${formatClock(Date.now())}　${message}`);
  state.logs = state.logs.slice(0, 30);
}

function gainXp(amount) {
  state.xp += amount;

  while (state.xp >= xpRequired(state.level)) {
    state.xp -= xpRequired(state.level);
    state.level += 1;
    addLog(`レベル ${state.level} に到達した。`);
  }
}

function maybeDropEquipment() {
  if (Math.random() > 0.055) return null;

  const base = EQUIPMENT_POOL[randomInt(0, EQUIPMENT_POOL.length - 1)];
  const item = {
    ...base,
    id: `${base.slot}-${Date.now()}-${Math.random()}`,
    level: Math.max(1, state.level)
  };

  state.equipment.push(item);
  addLog(`${item.name} Lv.${item.level} を入手した。`);
  return item;
}

function processBattle() {
  const zone = ZONES[state.zoneIndex];
  const attack = totalAttack();

  state.battleProgress += Math.max(1, attack / zone.hp);

  if (state.battleProgress < 1) return;

  state.battleProgress -= 1;
  state.kills += 1;

  const xp = randomInt(zone.xp[0], zone.xp[1]);
  const gold = randomInt(zone.gold[0], zone.gold[1]);

  gainXp(xp);
  state.gold += gold;
  state.recentXp = xp;
  state.recentGold = gold;

  const loot = maybeDropEquipment();
  state.recentLoot = loot ? loot.name : "なし";

  if (state.kills % 10 === 0) {
    addLog(`${zone.enemy}を${state.kills}体まで討伐。`);
  }
}

function processOffline(seconds) {
  if (seconds <= 5) return null;

  const capped = Math.min(seconds, MAX_OFFLINE_SECONDS);
  let battles = 0;
  let xp = 0;
  let gold = 0;

  const zone = ZONES[state.zoneIndex];
  const attack = totalAttack();
  const secondsPerBattle = Math.max(1, zone.interval * zone.hp / attack);

  battles = Math.floor(capped / secondsPerBattle);
  xp = battles * Math.floor((zone.xp[0] + zone.xp[1]) / 2);
  gold = battles * Math.floor((zone.gold[0] + zone.gold[1]) / 2);

  state.kills += battles;
  state.gold += gold;

  let oldLevel = state.level;
  gainXp(xp);

  const found = Math.floor(battles / 18);
  for (let i = 0; i < found; i++) {
    const base = EQUIPMENT_POOL[randomInt(0, EQUIPMENT_POOL.length - 1)];
    state.equipment.push({
      ...base,
      id: `offline-${Date.now()}-${i}-${Math.random()}`,
      level: Math.max(1, state.level)
    });
  }

  addLog(`放置中に${battles}戦を自動処理した。`);

  return {
    seconds: capped,
    battles,
    xp,
    gold,
    levels: state.level - oldLevel,
    equipment: found
  };
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h) return `${h}時間 ${m}分`;
  if (m) return `${m}分 ${s}秒`;
  return `${s}秒`;
}

function render() {
  const zone = ZONES[state.zoneIndex];
  const required = xpRequired(state.level);

  document.getElementById("level").textContent = state.level;
  document.getElementById("gold").textContent = state.gold.toLocaleString();
  document.getElementById("kills").textContent = state.kills.toLocaleString();
  document.getElementById("exploration").textContent = zone.name;
  document.getElementById("explorationProgress").textContent =
    `${state.kills}戦を自動処理中`;

  document.getElementById("xpBar").style.width =
    `${Math.min(100, state.xp / required * 100)}%`;
  document.getElementById("xpText").textContent =
    `${state.xp.toLocaleString()} / ${required.toLocaleString()} XP`;

  document.getElementById("attack").textContent = totalAttack();
  document.getElementById("defense").textContent = totalDefense();
  document.getElementById("speed").textContent = "1.0";

  document.getElementById("zoneName").textContent = zone.name;
  document.getElementById("enemyName").textContent = zone.enemy;
  document.getElementById("battleBar").style.width =
    `${Math.min(100, state.battleProgress * 100)}%`;
  document.getElementById("battleText").textContent =
    `${Math.max(0, Math.ceil((1 - state.battleProgress) * zone.hp / Math.max(1, totalAttack())))}秒以内に次の戦闘`;

  document.getElementById("recentXp").textContent = `+${state.recentXp}`;
  document.getElementById("recentGold").textContent = `+${state.recentGold}`;
  document.getElementById("recentLoot").textContent = state.recentLoot;

  const equipmentList = document.getElementById("equipmentList");
  if (!state.equipment.length) {
    equipmentList.innerHTML =
      `<div class="equipment"><div><strong>装備なし</strong><small>冒険を続けると装備を発見します</small></div></div>`;
  } else {
    equipmentList.innerHTML = state.equipment.slice(-5).reverse().map(item => `
      <div class="equipment">
        <div>
          <strong>${item.name}</strong>
          <small>${item.slot} / Lv.${item.level}</small>
        </div>
        <b>${item.attack ? `ATK +${item.attack}` : `DEF +${item.defense}`}</b>
      </div>
    `).join("");
  }

  document.getElementById("log").innerHTML = state.logs.map(
    entry => `<div class="log-entry">${entry}</div>`
  ).join("");

  document.getElementById("lastSave").textContent = formatClock(state.lastSavedAt);
}

function tick() {
  const now = Date.now();
  const delta = Math.min(5, (now - lastTick) / 1000);
  lastTick = now;

  const zone = ZONES[state.zoneIndex];
  state.battleProgress += delta / zone.interval;

  if (state.battleProgress >= 1) {
    const battles = Math.floor(state.battleProgress);
    state.battleProgress -= battles;

    for (let i = 0; i < battles; i++) {
      processBattle();
    }
  }

  saveTimer += delta;
  if (saveTimer >= 10) {
    saveTimer = 0;
    saveState();
  }

  render();
}

function showOfflineReport(report) {
  if (!report) return;

  document.getElementById("offlineDuration").textContent =
    `${formatDuration(report.seconds)}の間、自動冒険を続けました。`;

  document.getElementById("offlineResults").innerHTML = `
    <div class="result"><small>戦闘</small><b>${report.battles.toLocaleString()}</b></div>
    <div class="result"><small>経験値</small><b>+${report.xp.toLocaleString()}</b></div>
    <div class="result"><small>ゴールド</small><b>+${report.gold.toLocaleString()}</b></div>
    <div class="result"><small>レベルアップ</small><b>+${report.levels}</b></div>
    <div class="result"><small>装備発見</small><b>+${report.equipment}</b></div>
  `;

  document.getElementById("offlineModal").classList.remove("hidden");
}

document.getElementById("closeOffline").addEventListener("click", () => {
  document.getElementById("offlineModal").classList.add("hidden");
  saveState();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveState();
  } else {
    const now = Date.now();
    const seconds = Math.max(0, (now - state.lastSavedAt) / 1000);

    if (seconds > 5) {
      const report = processOffline(seconds);
      saveState();
      showOfflineReport(report);
      render();
    }

    lastTick = now;
  }
});

window.addEventListener("beforeunload", saveState);

const startupOffline = processOffline(
  Math.max(0, (Date.now() - state.lastSavedAt) / 1000)
);
saveState();
render();
showOfflineReport(startupOffline);

setInterval(tick, TICK_MS);
