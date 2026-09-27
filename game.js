const SAVE_KEY = "simple-of-idle-save-v2";
const SAVE_BACKUP_KEY = "simple-of-idle-save-v2-backup";
const LEGACY_SAVE_KEY = "simple-of-idle-save-v1";
const MAX_OFFLINE_SECONDS = 12 * 60 * 60;
const TICK_MS = 1000;

const ZONES = [
  { name: "村周辺", enemy: "スライム", hp: 30, gold: [5, 9], xp: [18, 25], interval: 5 },
  { name: "草原", enemy: "ゴブリン", hp: 55, gold: [10, 18], xp: [30, 42], interval: 7 },
  { name: "森", enemy: "ウルフ", hp: 95, gold: [18, 30], xp: [48, 65], interval: 9 }
];

const JOBS = {
  adventurer: {
    name: "冒険者",
    icon: "⚔",
    description: "探索速度と総合能力に優れる標準職。",
    attack: 1,
    defense: 1,
    speed: 1.15,
    critical: 0.02,
    xp: 0
  },
  warrior: {
    name: "戦士",
    icon: "🛡️",
    description: "高い攻撃・防御で安定して戦う。",
    attack: 5,
    defense: 4,
    speed: 1,
    critical: 0.01,
    xp: 0
  },
  ranger: {
    name: "レンジャー",
    icon: "🏹",
    description: "探索速度とクリティカルに特化する。",
    attack: 3,
    defense: 1,
    speed: 1.3,
    critical: 0.06,
    xp: 0.05
  },
  scholar: {
    name: "研究者",
    icon: "📖",
    description: "経験値獲得とスキル成長を重視する。",
    attack: 1,
    defense: 1,
    speed: 1.05,
    critical: 0.01,
    xp: 0.15
  }
};

const SKILLS = {
  power: {
    name: "強撃",
    description: "攻撃力を段階的に増加。",
    max: 5,
    cost: level => level + 1,
    effect: level => ({ attack: level * 3 })
  },
  guard: {
    name: "堅牢",
    description: "防御力を段階的に増加。",
    max: 5,
    cost: level => level + 1,
    effect: level => ({ defense: level * 2 })
  },
  quick: {
    name: "疾走",
    description: "探索速度を上昇。",
    max: 5,
    cost: level => level + 1,
    effect: level => ({ speed: level * 0.06 })
  },
  fortune: {
    name: "幸運",
    description: "ゴールド獲得量を増加。",
    max: 5,
    cost: level => level + 1,
    effect: level => ({ gold: level * 0.05 })
  }
};

const TREE_NODES = {
  combat: [
    { id: "combat-power", name: "戦闘訓練", description: "攻撃力 +5 / Lv", effect: { attack: 5 }, max: 5 },
    { id: "combat-crit", name: "急所狙い", description: "クリティカル +2% / Lv", effect: { critical: 0.02 }, max: 5 },
    { id: "combat-idle", name: "自動戦闘", description: "戦闘間隔 -3% / Lv", effect: { battleSpeed: 0.03 }, max: 5 }
  ],
  economy: [
    { id: "economy-gold", name: "商才", description: "ゴールド +5% / Lv", effect: { gold: 0.05 }, max: 5 },
    { id: "economy-enhance", name: "鍛冶知識", description: "装備強化費 -5% / Lv", effect: { enhanceCost: 0.05 }, max: 5 },
    { id: "economy-base", name: "建築知識", description: "施設費用 -5% / Lv", effect: { facilityCost: 0.05 }, max: 5 }
  ],
  exploration: [
    { id: "explore-speed", name: "踏破術", description: "探索速度 +5% / Lv", effect: { speed: 0.05 }, max: 5 },
    { id: "explore-xp", name: "狩猟知識", description: "経験値 +5% / Lv", effect: { xp: 0.05 }, max: 5 },
    { id: "explore-loot", name: "発見術", description: "装備発見率 +1% / Lv", effect: { loot: 0.01 }, max: 5 }
  ]
};

const FACILITIES = {
  training: {
    name: "訓練施設",
    icon: "🏋️",
    description: "冒険者全員の攻撃力・経験値を強化。",
    max: 10,
    cost: level => 100 * Math.pow(1.55, level - 1),
    effect: level => ({ attack: level * 2, xp: level * 0.03 })
  },
  guild: {
    name: "冒険者施設",
    icon: "🏰",
    description: "雇用枠を増やし、冒険者の基礎能力を強化。",
    max: 10,
    cost: level => 150 * Math.pow(1.6, level - 1),
    effect: level => ({ party: level, attack: level })
  },
  blacksmith: {
    name: "鍛冶場",
    icon: "⚒️",
    description: "装備強化の効率を高める。",
    max: 10,
    cost: level => 120 * Math.pow(1.55, level - 1),
    effect: level => ({ enhance: level * 0.05 })
  },
  warehouse: {
    name: "倉庫",
    icon: "📦",
    description: "装備保管数を増加。Phase 3の資源にも接続する。",
    max: 10,
    cost: level => 80 * Math.pow(1.5, level - 1),
    effect: level => ({ capacity: level * 5 })
  }
};

const EQUIPMENT_POOL = [
  { slot: "武器", name: "見習いの剣", attack: 4, defense: 0 },
  { slot: "防具", name: "布の服", attack: 0, defense: 2 },
  { slot: "アクセサリー", name: "木の護符", attack: 1, defense: 1 }
];

const DEFAULT_STATE = {
  version: 2,
  lastSavedAt: Date.now(),
  gold: 0,
  kills: 0,
  zoneIndex: 0,
  battleProgress: 0,
  recentXp: 0,
  recentGold: 0,
  recentLoot: "なし",
  logs: ["冒険を開始した。自動探索を開始します。"],
  nextAdventurerId: 2,
  selectedAdventurerId: 1,
  adventurers: [{
    id: 1,
    name: "見習い冒険者",
    level: 1,
    xp: 0,
    job: "adventurer",
    skillPoints: 0,
    skills: { power: 0, guard: 0, quick: 0, fortune: 0 },
    tree: {},
    equipment: []
  }],
  base: {
    level: 1,
    facilities: {
      training: 0,
      guild: 0,
      blacksmith: 0,
      warehouse: 0
    }
  }
};

let recoveredFromBackup = false;
let state = loadState();
let lastTick = Date.now();
let saveTimer = 0;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeAdventurer(adventurer, fallbackId) {
  const result = {
    id: Number(adventurer?.id) || fallbackId,
    name: adventurer?.name || `冒険者 ${fallbackId}`,
    level: Math.max(1, Number(adventurer?.level) || 1),
    xp: Math.max(0, Number(adventurer?.xp) || 0),
    // Phase 7職業はgame.jsより後に登録されるため、
    // ロード時点では未知の職業IDも保持し、後段のPhase統合で正規化する。
    job: typeof adventurer?.job === "string" && adventurer.job
      ? adventurer.job
      : "adventurer",
    skillPoints: Math.max(0, Number(adventurer?.skillPoints) || 0),
    skills: { power: 0, guard: 0, quick: 0, fortune: 0, ...(adventurer?.skills || {}) },
    tree: { ...(adventurer?.tree || {}) },
    equipment: Array.isArray(adventurer?.equipment) ? adventurer.equipment : []
  };

  Object.keys(SKILLS).forEach(id => {
    result.skills[id] = Math.max(0, Math.min(SKILLS[id].max, Number(result.skills[id]) || 0));
  });

  return result;
}

function migrateLegacy(saved) {
  const legacy = saved || {};
  const first = normalizeAdventurer({
    id: 1,
    name: "見習い冒険者",
    level: legacy.level,
    xp: legacy.xp,
    job: "adventurer",
    skillPoints: Math.max(0, (legacy.level || 1) - 1),
    equipment: legacy.equipment || []
  }, 1);

  return {
    ...clone(DEFAULT_STATE),
    lastSavedAt: Number(legacy.lastSavedAt) || Date.now(),
    gold: Number(legacy.gold) || 0,
    kills: Number(legacy.kills) || 0,
    zoneIndex: Math.max(0, Math.min(ZONES.length - 1, Number(legacy.zoneIndex) || 0)),
    battleProgress: Number(legacy.battleProgress) || 0,
    recentXp: Number(legacy.recentXp) || 0,
    recentGold: Number(legacy.recentGold) || 0,
    recentLoot: legacy.recentLoot || "なし",
    logs: Array.isArray(legacy.logs) ? legacy.logs.slice(0, 30) : [],
    adventurers: [first]
  };
}

function normalizeSavedState(saved) {
  const merged = {
    ...clone(DEFAULT_STATE),
    ...saved,
    base: {
      ...clone(DEFAULT_STATE).base,
      ...(saved.base || {}),
      facilities: {
        ...clone(DEFAULT_STATE).base.facilities,
        ...(saved.base?.facilities || {})
      }
    }
  };

  merged.adventurers = Array.isArray(saved.adventurers)
    ? saved.adventurers.map((item, index) => normalizeAdventurer(item, index + 1))
    : clone(DEFAULT_STATE.adventurers);

  if (!merged.adventurers.length) {
    merged.adventurers = clone(DEFAULT_STATE.adventurers);
  }

  merged.selectedAdventurerId = merged.adventurers.some(
    a => a.id === saved.selectedAdventurerId
  )
    ? saved.selectedAdventurerId
    : merged.adventurers[0].id;

  merged.version = 2;
  return merged;
}

function parseSave(raw) {
  if (!raw) return null;

  const saved = JSON.parse(raw);

  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    throw new Error("invalid save payload");
  }

  return normalizeSavedState(saved);
}

function loadState() {
  try {
    const current = localStorage.getItem(SAVE_KEY);

    if (current) {
      try {
        const saved = parseSave(current);
        if (saved) return saved;
      } catch {
        const backup = localStorage.getItem(SAVE_BACKUP_KEY);

        if (backup) {
          try {
            const recovered = parseSave(backup);
            if (recovered) {
              recoveredFromBackup = true;
              return recovered;
            }
          } catch {
            // Continue to legacy/default fallback.
          }
        }
      }
    }

    const backup = localStorage.getItem(SAVE_BACKUP_KEY);

    if (backup) {
      try {
        const recovered = parseSave(backup);
        if (recovered) {
          recoveredFromBackup = true;
          return recovered;
        }
      } catch {
        // Continue to legacy/default fallback.
      }
    }

    const legacy = localStorage.getItem(LEGACY_SAVE_KEY);
    return legacy ? migrateLegacy(JSON.parse(legacy)) : clone(DEFAULT_STATE);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function saveState() {
  state.lastSavedAt = Date.now();
  const serialized = JSON.stringify(state);

  try {
    const previous = localStorage.getItem(SAVE_KEY);

    if (!recoveredFromBackup && previous) {
      localStorage.setItem(SAVE_BACKUP_KEY, previous);
    }

    localStorage.setItem(SAVE_KEY, serialized);

    if (recoveredFromBackup) {
      localStorage.setItem(SAVE_BACKUP_KEY, serialized);
      recoveredFromBackup = false;
    }

    const indicator = document.getElementById("saveIndicator");
    const lastSave = document.getElementById("lastSave");
    if (indicator) indicator.textContent = "保存済み";
    if (lastSave) lastSave.textContent = formatClock(state.lastSavedAt);
  } catch {
    const indicator = document.getElementById("saveIndicator");
    if (indicator) indicator.textContent = "保存失敗";
  }
}

function exportSave() {
  saveState();

  const serialized = localStorage.getItem(SAVE_KEY);
  if (!serialized) {
    alert("現在のセーブデータを取得できませんでした。");
    return;
  }

  const blob = new Blob([serialized], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `simple-of-idle-save-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importSaveFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = parseSave(String(reader.result || ""));

      if (!imported) {
        throw new Error("empty save");
      }

      const serialized = JSON.stringify(imported);

      localStorage.setItem(SAVE_BACKUP_KEY, serialized);
      localStorage.setItem(SAVE_KEY, serialized);
      localStorage.removeItem(LEGACY_SAVE_KEY);

      alert("セーブデータを読み込みました。ゲームを再読み込みします。");
      location.reload();
    } catch {
      alert("セーブデータを読み込めませんでした。Simple-Of-Idleのセーブファイルを選択してください。");
    }
  };

  reader.onerror = () => {
    alert("セーブファイルの読み込みに失敗しました。");
  };

  reader.readAsText(file);
}

function resetSave() {
  if (!confirm("現在のセーブデータを削除して、最初から開始します。よろしいですか？")) {
    return;
  }

  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(SAVE_BACKUP_KEY);
  localStorage.removeItem(LEGACY_SAVE_KEY);
  location.reload();
}

function deleteLegacySave() {
  if (!confirm("旧v1セーブデータを削除します。現在のv2セーブには影響しません。よろしいですか？")) {
    return;
  }

  localStorage.removeItem(LEGACY_SAVE_KEY);
  alert("旧v1セーブデータを削除しました。");
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

function selectedAdventurer() {
  return state.adventurers.find(a => a.id === state.selectedAdventurerId) || state.adventurers[0];
}

function skillEffects(adventurer) {
  const result = {
    attack: 0,
    defense: 0,
    speed: 0,
    critical: 0,
    gold: 0,
    xp: 0,
    battleSpeed: 0,
    enhanceCost: 0,
    facilityCost: 0,
    loot: 0
  };

  Object.entries(adventurer.skills || {}).forEach(([id, level]) => {
    const skill = SKILLS[id];
    if (!skill || !level) return;
    Object.entries(skill.effect(level)).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
  });

  Object.values(TREE_NODES).flat().forEach(node => {
    const level = Number(adventurer.tree?.[node.id]) || 0;
    if (!level) return;
    Object.entries(node.effect).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value * level;
    });
  });

  return result;
}

function baseEffects() {
  const result = {
    attack: 0,
    xp: 0,
    party: 0,
    enhance: 0,
    capacity: 5
  };

  Object.entries(state.base.facilities).forEach(([id, level]) => {
    const facility = FACILITIES[id];
    if (!facility || !level) return;
    Object.entries(facility.effect(level)).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
  });

  return result;
}

function adventurerStats(adventurer) {
  const job = JOBS[adventurer.job] || JOBS.adventurer;
  const skills = skillEffects(adventurer);
  const base = baseEffects();
  const equipmentAttack = adventurer.equipment.reduce((sum, item) => sum + (item.attack || 0) * (item.enhanceMultiplier || 1), 0);
  const equipmentDefense = adventurer.equipment.reduce((sum, item) => sum + (item.defense || 0) * (item.enhanceMultiplier || 1), 0);

  return {
    attack: Math.floor(10 + adventurer.level - 1 + job.attack + skills.attack + base.attack + equipmentAttack),
    defense: Math.floor(5 + Math.floor((adventurer.level - 1) * 0.5) + job.defense + skills.defense + equipmentDefense),
    speed: Math.max(0.1, job.speed + skills.speed + base.xp * 0),
    critical: Math.min(0.95, 0.05 + job.critical + skills.critical),
    xpMultiplier: Math.max(0.1, 1 + job.xp + skills.xp + base.xp),
    goldMultiplier: Math.max(0.1, 1 + skills.gold),
    battleSpeed: Math.max(0.1, 1 + skills.battleSpeed)
  };
}

function guildStats() {
  const total = {
    attack: 0,
    defense: 0,
    speed: 0,
    critical: 0,
    xpMultiplier: 1,
    goldMultiplier: 1,
    battleSpeed: 1,
    adventurers: state.adventurers.length
  };

  state.adventurers.forEach(adventurer => {
    const stats = adventurerStats(adventurer);
    total.attack += stats.attack;
    total.defense += stats.defense;
    total.speed += stats.speed;
    total.critical += stats.critical;
  });

  const count = Math.max(1, state.adventurers.length);
  total.attack = Math.floor(total.attack);
  total.defense = Math.floor(total.defense);
  total.speed = total.speed / count;
  total.critical = total.critical / count;
  total.xpMultiplier = 1 + (total.speed - 1) * 0.05;
  total.goldMultiplier = 1 + Math.max(0, total.critical - 0.05);
  total.battleSpeed = 1;

  return total;
}

function addLog(message) {
  state.logs.unshift(`${formatClock(Date.now())}　${message}`);
  state.logs = state.logs.slice(0, 30);
}

function gainXp(adventurer, amount) {
  let gainedLevels = 0;
  adventurer.xp += amount;

  while (adventurer.xp >= xpRequired(adventurer.level)) {
    adventurer.xp -= xpRequired(adventurer.level);
    adventurer.level += 1;
    adventurer.skillPoints += 1;
    gainedLevels += 1;
    addLog(`${adventurer.name} が Lv.${adventurer.level} に到達。スキルポイント +1。`);
  }

  return gainedLevels;
}

function equipmentValue(item) {
  return (item.attack || 0) + (item.defense || 0);
}

function maybeDropEquipment() {
  const leader = selectedAdventurer();
  const effects = skillEffects(leader);
  const chance = Math.min(0.5, 0.055 + effects.loot);

  if (Math.random() > chance) return null;

  const base = EQUIPMENT_POOL[randomInt(0, EQUIPMENT_POOL.length - 1)];
  const item = {
    ...base,
    id: `${base.slot}-${Date.now()}-${Math.random()}`,
    level: Math.max(1, leader.level),
    enhance: 0,
    enhanceMultiplier: 1
  };

  leader.equipment.push(item);

  const capacity = 5 + baseEffects().capacity;
  const totalEquipment = state.adventurers.reduce((sum, a) => sum + a.equipment.length, 0);

  if (totalEquipment > capacity) {
    leader.equipment.shift();
    addLog("装備保管枠が満杯のため、古い装備を整理した。");
  }

  addLog(`${leader.name} が ${item.name} Lv.${item.level} を入手した。`);
  return item;
}

function processBattle() {
  const zone = ZONES[state.zoneIndex];
  const stats = guildStats();
  const attack = Math.max(1, stats.attack);

  state.battleProgress += Math.max(1, attack / zone.hp);

  if (state.battleProgress < 1) return;

  state.battleProgress -= 1;
  state.kills += 1;

  const crit = Math.random() < stats.critical;
  const xpBase = randomInt(zone.xp[0], zone.xp[1]);
  const goldBase = randomInt(zone.gold[0], zone.gold[1]);
  const xp = Math.floor(xpBase * stats.xpMultiplier * (crit ? 1.2 : 1));
  const gold = Math.floor(goldBase * stats.goldMultiplier * (crit ? 1.25 : 1));

  const share = xp / state.adventurers.length;
  state.adventurers.forEach(adventurer => {
    gainXp(adventurer, share);
  });

  state.gold += gold;
  state.recentXp = xp;
  state.recentGold = gold;

  const loot = maybeDropEquipment();
  state.recentLoot = loot ? loot.name : "なし";

  if (crit) addLog("クリティカル発生。報酬が増加した。");
  if (state.kills % 10 === 0) {
    addLog(`${zone.enemy}をギルド累計 ${state.kills}体まで討伐。`);
  }
}

function processOffline(seconds) {
  if (seconds <= 5) return null;

  const capped = Math.min(seconds, MAX_OFFLINE_SECONDS);
  const zone = ZONES[state.zoneIndex];
  const stats = guildStats();
  const secondsPerBattle = Math.max(1, zone.interval / stats.battleSpeed * zone.hp / Math.max(1, stats.attack));

  const battles = Math.floor(capped / secondsPerBattle);
  const baseXp = Math.floor((zone.xp[0] + zone.xp[1]) / 2);
  const baseGold = Math.floor((zone.gold[0] + zone.gold[1]) / 2);
  const xp = Math.floor(battles * baseXp * stats.xpMultiplier);
  const gold = Math.floor(battles * baseGold * stats.goldMultiplier);

  state.kills += battles;
  state.gold += gold;

  let levels = 0;
  const share = xp / Math.max(1, state.adventurers.length);
  state.adventurers.forEach(adventurer => {
    levels += gainXp(adventurer, share);
  });

  const found = Math.min(
    Math.floor(battles / 18),
    Math.max(0, 5 + baseEffects().capacity)
  );

  for (let i = 0; i < found; i++) {
    const base = EQUIPMENT_POOL[randomInt(0, EQUIPMENT_POOL.length - 1)];
    const target = state.adventurers[i % state.adventurers.length];
    target.equipment.push({
      ...base,
      id: `offline-${Date.now()}-${i}-${Math.random()}`,
      level: Math.max(1, target.level),
      enhance: 0,
      enhanceMultiplier: 1
    });
  }

  addLog(`放置中に${battles.toLocaleString()}戦をギルド全体で自動処理した。`);

  return {
    seconds: capped,
    battles,
    xp,
    gold,
    levels,
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

function equipmentEnhanceCost(item) {
  const level = Number(item.enhance) || 0;
  const discount = Math.min(0.8, skillEffects(selectedAdventurer()).enhanceCost + baseEffects().enhance);
  return Math.max(10, Math.floor(40 * Math.pow(1.55, level) * (1 - discount)));
}

function enhanceEquipment(adventurerId, itemId) {
  const adventurer = state.adventurers.find(a => a.id === adventurerId);
  if (!adventurer) return;

  const item = adventurer.equipment.find(entry => entry.id === itemId);
  if (!item) return;

  const cost = equipmentEnhanceCost(item);
  if (state.gold < cost) {
    addLog("ゴールドが足りない。");
    render();
    return;
  }

  state.gold -= cost;
  item.enhance = (item.enhance || 0) + 1;
  item.enhanceMultiplier = 1 + item.enhance * 0.15;

  addLog(`${adventurer.name} の ${item.name} を +${item.enhance} に強化した。`);
  saveState();
  render();
}

function hireAdventurer() {
  const guildLevel = state.base.facilities.guild || 0;
  const capacity = 1 + guildLevel;
  const requiredLevel = 5 + (state.adventurers.length - 1) * 5;

  if (state.adventurers.length >= capacity) {
    addLog(`冒険者施設の枠が足りない。施設を強化すると雇用枠が増える。`);
    render();
    return;
  }

  if (selectedAdventurer().level < requiredLevel) {
    addLog(`新しい冒険者はギルドLv.${requiredLevel}相当から雇用できる。`);
    render();
    return;
  }

  const cost = Math.floor(100 * Math.pow(2, state.adventurers.length - 1));
  if (state.gold < cost) {
    addLog(`雇用費 ${cost.toLocaleString()}G が必要。`);
    render();
    return;
  }

  state.gold -= cost;
  const id = state.nextAdventurerId++;
  const names = ["新人冒険者", "放浪剣士", "森の狩人", "見習い研究者", "旅の戦士"];
  const name = `${names[(id - 2) % names.length]} ${id}`;

  state.adventurers.push(normalizeAdventurer({
    id,
    name,
    job: "adventurer"
  }, id));

  addLog(`${name} をギルドへ迎え入れた。`);
  saveState();
  render();
}

function changeJob(adventurerId, jobId) {
  const adventurer = state.adventurers.find(a => a.id === adventurerId);
  if (!adventurer || !JOBS[jobId]) return;

  const phase7Job =
    jobId.startsWith("astral-") ||
    jobId.startsWith("ether-") ||
    jobId.startsWith("world-") ||
    jobId.startsWith("infinity-");

  if (phase7Job && !state.phase7?.unlockedJobs?.includes(jobId)) {
    addLog(`${JOBS[jobId].name} は新世界の解禁条件を満たしていない。`);
    return;
  }

  const minimum = jobId === "adventurer" ? 1 : 3;
  if (adventurer.level < minimum) {
    addLog(`${JOBS[jobId].name} は Lv.${minimum} から選択できる。`);
    return;
  }

  if (adventurer.job === jobId) return;

  adventurer.job = jobId;
  addLog(`${adventurer.name} が ${JOBS[jobId].name} に転職した。`);
  saveState();
  render();
}

function selectAdventurer(adventurerId) {
  if (!state.adventurers.some(a => a.id === adventurerId)) return;
  state.selectedAdventurerId = adventurerId;
  render();
}

function learnSkill(adventurerId, skillId) {
  const adventurer = state.adventurers.find(a => a.id === adventurerId);
  const skill = SKILLS[skillId];
  if (!adventurer || !skill) return;

  const current = Number(adventurer.skills[skillId]) || 0;
  if (current >= skill.max) return;

  const cost = skill.cost(current);
  if (adventurer.skillPoints < cost) {
    addLog("スキルポイントが足りない。");
    return;
  }

  adventurer.skillPoints -= cost;
  adventurer.skills[skillId] = current + 1;

  addLog(`${adventurer.name} が「${skill.name}」Lv.${current + 1} を習得した。`);
  saveState();
  render();
}

function learnTreeNode(adventurerId, nodeId) {
  const adventurer = state.adventurers.find(a => a.id === adventurerId);
  const node = Object.values(TREE_NODES).flat().find(entry => entry.id === nodeId);
  if (!adventurer || !node) return;

  const current = Number(adventurer.tree[nodeId]) || 0;
  if (current >= node.max) return;

  const cost = current + 1;
  if (adventurer.skillPoints < cost) {
    addLog("スキルポイントが足りない。");
    return;
  }

  adventurer.skillPoints -= cost;
  adventurer.tree[nodeId] = current + 1;

  addLog(`${adventurer.name} が「${node.name}」Lv.${current + 1} を取得した。`);
  saveState();
  render();
}

function facilityCost(id) {
  const facility = FACILITIES[id];
  const level = state.base.facilities[id] || 0;
  const discount = Math.min(0.8, baseEffects().facilityCost + skillEffects(selectedAdventurer()).facilityCost);
  return Math.floor(facility.cost(level + 1) * (1 - discount));
}

function upgradeFacility(id) {
  const facility = FACILITIES[id];
  const level = state.base.facilities[id] || 0;
  if (!facility || level >= facility.max) return;

  const cost = facilityCost(id);
  if (state.gold < cost) {
    addLog("施設強化に必要なゴールドが足りない。");
    return;
  }

  state.gold -= cost;
  state.base.facilities[id] = level + 1;
  state.base.level = Math.max(
    1,
    Math.floor(Object.values(state.base.facilities).reduce((sum, value) => sum + value, 0) / 2) + 1
  );

  addLog(`${facility.name} を Lv.${level + 1} に強化した。`);
  saveState();
  render();
}

function renderEquipmentList(adventurer, enhanced = false) {
  if (!adventurer.equipment.length) {
    return `<div class="equipment"><div><strong>装備なし</strong><small>冒険を続けると装備を発見します</small></div></div>`;
  }

  return adventurer.equipment.slice(-8).reverse().map(item => {
    const level = item.enhance || 0;
    const value = Math.floor(equipmentValue(item) * (item.enhanceMultiplier || 1));
    const action = enhanced
      ? `<button class="small-button" data-action="enhance" data-adventurer="${adventurer.id}" data-item="${item.id}" ${state.gold < equipmentEnhanceCost(item) ? "disabled" : ""}>+${level} → +${level + 1}<br>${equipmentEnhanceCost(item).toLocaleString()}G</button>`
      : `<b>+${value}</b>`;

    return `
      <div class="equipment">
        <div>
          <strong>${item.name}</strong>
          <small>${item.slot} / Lv.${item.level} / 強化 +${level}</small>
        </div>
        ${action}
      </div>
    `;
  }).join("");
}

function renderHome() {
  const leader = selectedAdventurer();
  const stats = adventurerStats(leader);
  const guild = guildStats();
  const zone = ZONES[state.zoneIndex];

  document.getElementById("level").textContent = leader.level;
  document.getElementById("gold").textContent = state.gold.toLocaleString();
  document.getElementById("kills").textContent = state.kills.toLocaleString();
  document.getElementById("adventurerCount").textContent = state.adventurers.length;
  document.getElementById("adventurerUnlock").textContent =
    state.adventurers.length >= 5
      ? "現在の雇用枠を使用中"
      : `次の雇用 Lv.${5 + (state.adventurers.length - 1) * 5}`;

  const required = xpRequired(leader.level);
  document.getElementById("xpBar").style.width = `${Math.min(100, leader.xp / required * 100)}%`;
  document.getElementById("xpText").textContent =
    `${Math.floor(leader.xp).toLocaleString()} / ${required.toLocaleString()} XP`;

  document.getElementById("className").textContent = JOBS[leader.job].name;
  document.getElementById("homeCharacterName").textContent = leader.name;
  document.getElementById("homeCharacterText").textContent = JOBS[leader.job].description;
  document.getElementById("attack").textContent = guild.attack;
  document.getElementById("defense").textContent = guild.defense;
  document.getElementById("speed").textContent = guild.speed.toFixed(2);
  document.getElementById("critical").textContent = `${(guild.critical * 100).toFixed(1)}%`;
  document.getElementById("xpMultiplier").textContent = `${stats.xpMultiplier.toFixed(2)}x`;
  document.getElementById("goldMultiplier").textContent = `${guild.goldMultiplier.toFixed(2)}x`;

  document.getElementById("zoneName").textContent = zone.name;
  document.getElementById("enemyName").textContent = zone.enemy;
  document.getElementById("battleBar").style.width = `${Math.min(100, state.battleProgress * 100)}%`;
  document.getElementById("battleText").textContent =
    `${Math.max(0, Math.ceil((1 - state.battleProgress) * zone.interval))}秒以内に次の戦闘`;

  document.getElementById("recentXp").textContent = `+${Math.floor(state.recentXp).toLocaleString()}`;
  document.getElementById("recentGold").textContent = `+${state.recentGold.toLocaleString()}`;
  document.getElementById("recentLoot").textContent = state.recentLoot;

  const equipmentPower = state.adventurers.reduce(
    (sum, a) => sum + a.equipment.reduce((inner, item) => inner + Math.floor(equipmentValue(item) * (item.enhanceMultiplier || 1)), 0),
    0
  );
  document.getElementById("equipmentPower").textContent = `+${equipmentPower}`;

  document.getElementById("equipmentList").innerHTML = renderEquipmentList(leader);

  document.getElementById("log").innerHTML = state.logs.map(
    entry => `<div class="log-entry">${entry}</div>`
  ).join("");

  renderRoadmap();
}

function renderRoadmap() {
  const items = [
    ["職業", state.adventurers.some(a => a.level >= 3)],
    ["スキル", state.adventurers.some(a => a.skillPoints > 0 || Object.values(a.skills).some(Boolean))],
    ["スキルツリー", state.adventurers.some(a => Object.values(a.tree).some(Boolean))],
    ["複数冒険者", state.adventurers.length > 1],
    ["装備強化", state.adventurers.some(a => a.equipment.some(i => i.enhance > 0))],
    ["拠点", true],
    ["施設", Object.values(state.base.facilities).some(Boolean)],
    ["採取", false],
    ["生産", false],
    ["研究", false],
    ["ダンジョン", false],
    ["ボス", false],
    ["ペット", false],
    ["コレクション", false],
    ["転生", false]
  ];

  document.getElementById("roadmap").innerHTML = items.map(([name, unlocked]) =>
    `<span class="${unlocked ? "unlocked" : ""}">${unlocked ? "✓ " : "◇ "}${name}</span>`
  ).join("");
}

function renderAdventurers() {
  const capacity = 1 + (state.base.facilities.guild || 0);
  document.getElementById("partyPower").textContent = `戦力 ${guildStats().attack.toLocaleString()}`;

  document.getElementById("adventurerList").innerHTML = state.adventurers.map(adventurer => {
    const stats = adventurerStats(adventurer);
    const selected = adventurer.id === state.selectedAdventurerId;
    const required = xpRequired(adventurer.level);

    return `
      <div class="adventurer-card">
        <div>
          <strong>${JOBS[adventurer.job].icon} ${adventurer.name}</strong>
          <small>Lv.${adventurer.level} / ${JOBS[adventurer.job].name} / XP ${Math.floor(adventurer.xp).toLocaleString()} / ${required.toLocaleString()}</small>
          <div class="adventurer-meta">
            <span class="meta-chip">ATK ${stats.attack}</span>
            <span class="meta-chip">DEF ${stats.defense}</span>
            <span class="meta-chip">SP ${adventurer.skillPoints}</span>
            <span class="meta-chip">${selected ? "選択中" : "待機中"}</span>
          </div>
        </div>
        <button class="small-button" data-action="select-adventurer" data-adventurer="${adventurer.id}" ${selected ? "disabled" : ""}>管理する</button>
      </div>
    `;
  }).join("");

  const leader = selectedAdventurer();
  const nextCost = Math.floor(100 * Math.pow(2, state.adventurers.length - 1));
  const requiredLevel = 5 + (state.adventurers.length - 1) * 5;
  const canHire = state.adventurers.length < capacity && leader.level >= requiredLevel && state.gold >= nextCost;

  const hire = document.getElementById("hireAdventurer");
  hire.textContent = state.adventurers.length >= capacity
    ? `雇用枠を増やす（冒険者施設 Lv.${state.adventurers.length + 1}）`
    : `冒険者を雇用（${nextCost.toLocaleString()}G / Lv.${requiredLevel}）`;
  hire.disabled = !canHire;
}

function renderJobs() {
  const adventurer = selectedAdventurer();

  document.getElementById("jobList").innerHTML = Object.entries(JOBS).map(([id, job]) => {
    const current = adventurer.job === id;
    const minimum = id === "adventurer" ? 1 : 3;

    const phase7Job =
      id.startsWith("astral-") ||
      id.startsWith("ether-") ||
      id.startsWith("world-") ||
      id.startsWith("infinity-");

    const phase7Unlocked =
      !phase7Job ||
      Boolean(state.phase7?.unlockedJobs?.includes(id));

    const available =
      phase7Unlocked &&
      adventurer.level >= minimum;

    return `
      <div class="choice ${current ? "current" : ""}">
        <div class="choice-info">
          <strong>${job.icon} ${job.name}</strong>
          <small>${job.description}</small>
        </div>
        <button
          class="small-button"
          data-action="job"
          data-job="${id}"
          ${current || !available ? "disabled" : ""}
        >
          ${current
            ? "現在"
            : !phase7Unlocked
              ? "未解禁"
              : `Lv.${minimum}から`}
        </button>
      </div>
    `;
  }).join("");

  document.getElementById("enhanceInfo").textContent =
    `${adventurer.name} の装備を強化。鍛冶場と「鍛冶知識」でコストを下げられます。`;

  document.getElementById("enhanceList").innerHTML =
    renderEquipmentList(adventurer, true);
}

function renderSkills() {
  const adventurer = selectedAdventurer();

  document.getElementById("skillPoints").textContent = adventurer.skillPoints;

  document.getElementById("skillList").innerHTML = Object.entries(SKILLS).map(([id, skill]) => {
    const level = adventurer.skills[id] || 0;
    const cost = level < skill.max ? skill.cost(level) : 0;

    return `
      <div class="skill-card">
        <div>
          <strong>${skill.name} Lv.${level}/${skill.max}</strong>
          <small>${skill.description}${level < skill.max ? ` / 次: ${cost}SP` : " / 最大"}</small>
        </div>
        <button class="small-button" data-action="skill" data-skill="${id}" ${level >= skill.max || adventurer.skillPoints < cost ? "disabled" : "">習得</button>
      </div>
    `;
  }).join("");

  document.getElementById("skillTree").innerHTML = Object.entries(TREE_NODES).map(([branch, nodes]) => `
    <div class="tree-branch">
      <p class="eyebrow">${branch === "combat" ? "COMBAT" : branch === "economy" ? "ECONOMY" : "EXPLORATION"}</p>
      ${nodes.map(node => {
        const level = adventurer.tree[node.id] || 0;
        const cost = level < node.max ? level + 1 : 0;

        return `
          <div class="tree-node">
            <div>
              <strong>${node.name} Lv.${level}/${node.max}</strong>
              <small>${node.description}${level < node.max ? ` / 次: ${cost}SP` : " / 最大"}</small>
            </div>
            <button class="small-button" data-action="tree" data-node="${node.id}" ${level >= node.max || adventurer.skillPoints < cost ? "disabled" : ""}>取得</button>
          </div>
        `;
      }).join("")}
    </div>
  `).join("");
}

function renderBase() {
  const effects = baseEffects();
  document.getElementById("baseLevel").textContent = state.base.level;

  document.getElementById("facilityList").innerHTML = Object.entries(FACILITIES).map(([id, facility]) => {
    const level = state.base.facilities[id] || 0;
    const nextCost = level < facility.max ? facilityCost(id) : 0;

    return `
      <div class="facility">
        <div>
          <strong>${facility.icon} ${facility.name} Lv.${level}/${facility.max}</strong>
          <small>${facility.description}${level < facility.max ? ` / 次: ${nextCost.toLocaleString()}G` : " / 最大"}</small>
        </div>
        <button class="small-button" data-action="facility" data-facility="${id}" ${level >= facility.max || state.gold < nextCost ? "disabled" : ""}>強化</button>
      </div>
    `;
  }).join("");

  document.getElementById("baseEffects").innerHTML = `
    <div><span>訓練攻撃力</span><b>+${effects.attack}</b></div>
    <div><span>経験値</span><b>+${(effects.xp * 100).toFixed(0)}%</b></div>
    <div><span>雇用枠</span><b>${1 + (state.base.facilities.guild || 0)}</b></div>
    <div><span>装備保管</span><b>${5 + effects.capacity}</b></div>
    <div><span>強化効率</span><b>+${(effects.enhance * 100).toFixed(0)}%</b></div>
    <div><span>拠点強化</span><b>Lv.${state.base.level}</b></div>
  `;
}

function render() {
  renderHome();
  renderAdventurers();
  renderJobs();
  renderSkills();
  renderBase();

  const save = document.getElementById("lastSave");
  if (save) save.textContent = formatClock(state.lastSavedAt);
}

function showOfflineReport(report) {
  if (!report) return;

  document.getElementById("offlineDuration").textContent =
    `${formatDuration(report.seconds)}の間、ギルド全体で自動冒険を続けました。`;

  document.getElementById("offlineResults").innerHTML = `
    <div class="result"><small>戦闘</small><b>${report.battles.toLocaleString()}</b></div>
    <div class="result"><small>経験値</small><b>+${Math.floor(report.xp).toLocaleString()}</b></div>
    <div class="result"><small>ゴールド</small><b>+${report.gold.toLocaleString()}</b></div>
    <div class="result"><small>レベルアップ</small><b>+${report.levels}</b></div>
    <div class="result"><small>装備発見</small><b>+${report.equipment}</b></div>
  `;

  document.getElementById("offlineModal").classList.remove("hidden");
}

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;

    document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === button));
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === `tab-${tab}`));
  });
});

document.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;

  if (action === "select-adventurer") {
    selectAdventurer(Number(button.dataset.adventurer));
  } else if (action === "job") {
    changeJob(selectedAdventurer().id, button.dataset.job);
  } else if (action === "skill") {
    learnSkill(selectedAdventurer().id, button.dataset.skill);
  } else if (action === "tree") {
    learnTreeNode(selectedAdventurer().id, button.dataset.node);
  } else if (action === "facility") {
    upgradeFacility(button.dataset.facility);
  } else if (action === "enhance") {
    enhanceEquipment(Number(button.dataset.adventurer), button.dataset.item);
  }
});

document.getElementById("hireAdventurer").addEventListener("click", hireAdventurer);

document.getElementById("manualSave").addEventListener("click", () => {
  saveState();
});

document.getElementById("exportSave").addEventListener("click", exportSave);

document.getElementById("importSave").addEventListener("change", event => {
  importSaveFile(event.target.files?.[0]);
  event.target.value = "";
});

document.getElementById("resetSave").addEventListener("click", resetSave);

document.getElementById("deleteLegacySave").addEventListener("click", deleteLegacySave);

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

function tick() {
  const now = Date.now();
  const delta = Math.min(5, (now - lastTick) / 1000);
  lastTick = now;

  const zone = ZONES[state.zoneIndex];
  const stats = guildStats();
  state.battleProgress += delta * stats.battleSpeed / zone.interval;

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

const startupOffline = processOffline(
  Math.max(0, (Date.now() - state.lastSavedAt) / 1000)
);

saveState();
render();
showOfflineReport(startupOffline);
setInterval(tick, TICK_MS);
