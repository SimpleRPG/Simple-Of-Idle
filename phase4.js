const PHASE4_VERSION = 1;

const PHASE4_DEFAULT = {
  version: PHASE4_VERSION,
  selectedMap: "village",
  mode: "map",
  lastProcessedAt: Date.now(),
  mapProgress: 0,
  dungeonProgress: 0,
  bossProgress: {},
  raidProgress: {},
  researchPoints: 0,
  researchLevels: {},
  discoveredUnknown: [],
  defeatedBosses: [],
  clearedDungeons: {},
  eventLog: [],
  activeResearch: null,
  activeActivity: null
};

const PHASE4_MAPS = [
  {
    id: "village",
    name: "村周辺",
    icon: "🏘️",
    enemy: "スライム",
    description: "冒険の起点。既存の基本探索と接続する。",
    minLevel: 1,
    minKills: 0,
    research: null,
    boss: null,
    zoneIndex: 0
  },
  {
    id: "grassland",
    name: "草原",
    icon: "🌾",
    enemy: "ゴブリン",
    description: "素材と装備を集めながら探索を進める。",
    minLevel: 2,
    minKills: 5,
    research: null,
    boss: null,
    zoneIndex: 1
  },
  {
    id: "forest",
    name: "深緑の森",
    icon: "🌲",
    enemy: "ウルフ",
    description: "狩猟・採取と戦闘を接続する中級エリア。",
    minLevel: 4,
    minKills: 20,
    research: null,
    boss: null,
    zoneIndex: 2
  },
  {
    id: "cave",
    name: "鉱脈洞窟",
    icon: "⛏️",
    enemy: "洞窟ゴブリン",
    description: "採掘資源と特殊鉱石が増える。",
    minLevel: 6,
    minKills: 45,
    research: "mine-survey",
    boss: "cave-guardian"
  },
  {
    id: "ruins",
    name: "古代遺跡",
    icon: "🏛️",
    enemy: "遺跡守衛",
    description: "研究素材と古代技術につながる。",
    minLevel: 10,
    minKills: 100,
    research: "ancient-study",
    boss: "ruins-guardian"
  },
  {
    id: "demon",
    name: "魔王領",
    icon: "🔥",
    enemy: "魔族兵",
    description: "高難度素材・ボス・レイドへの入口。",
    minLevel: 16,
    minKills: 220,
    research: "advanced-exploration",
    boss: "demon-lord"
  }
];

const PHASE4_DUNGEONS = [
  {
    id: "cave-dungeon",
    name: "鉱脈洞窟・深層",
    icon: "🕳️",
    floors: 5,
    minLevel: 7,
    research: "dungeon-training",
    reward: { ore: 8, magicStone: 2, researchPoints: 2 }
  },
  {
    id: "ruins-dungeon",
    name: "古代遺跡・地下区画",
    icon: "🏺",
    floors: 8,
    minLevel: 11,
    research: "ancient-study",
    reward: { iron: 8, metalPart: 4, researchPoints: 4 }
  },
  {
    id: "demon-dungeon",
    name: "魔王領・奈落",
    icon: "🌋",
    floors: 12,
    minLevel: 17,
    research: "advanced-exploration",
    reward: { magicStone: 8, metalPart: 8, researchPoints: 8 }
  }
];

const PHASE4_BOSSES = [
  {
    id: "cave-guardian",
    name: "洞窟の守護者",
    icon: "🪨",
    hp: 700,
    minLevel: 7,
    reward: { ore: 15, magicStone: 4, researchPoints: 6 },
    unlock: "mine-survey"
  },
  {
    id: "ruins-guardian",
    name: "古代遺跡の守護者",
    icon: "🗿",
    hp: 1800,
    minLevel: 11,
    reward: { iron: 15, metalPart: 6, researchPoints: 12 },
    unlock: "ancient-study"
  },
  {
    id: "demon-lord",
    name: "魔王領の支配者",
    icon: "👹",
    hp: 5000,
    minLevel: 17,
    reward: { magicStone: 15, metalPart: 12, researchPoints: 25 },
    unlock: "advanced-exploration"
  }
];

const PHASE4_RAIDS = [
  {
    id: "guild-raid",
    name: "魔王軍前線基地",
    icon: "⚔️",
    hp: 9000,
    minLevel: 18,
    minParty: 3,
    research: "raid-command",
    reward: { gold: 1200, magicStone: 20, metalPart: 15, researchPoints: 35 }
  },
  {
    id: "ancient-raid",
    name: "古代装置制圧戦",
    icon: "⚙️",
    hp: 15000,
    minLevel: 22,
    minParty: 3,
    research: "raid-command",
    reward: { gold: 2500, iron: 25, metalPart: 25, researchPoints: 50 }
  }
];

const PHASE4_RESEARCH = [
  {
    id: "mine-survey",
    name: "鉱脈調査",
    icon: "🧭",
    description: "鉱脈洞窟を探索可能にする。",
    cost: 5,
    seconds: 30,
    inputs: { ore: 8, wood: 4 }
  },
  {
    id: "dungeon-training",
    name: "ダンジョン訓練",
    icon: "🛡️",
    description: "高難度ダンジョンへの遠征手順を確立する。",
    cost: 8,
    seconds: 45,
    inputs: { iron: 3, timber: 3 }
  },
  {
    id: "ancient-study",
    name: "古代技術研究",
    icon: "📜",
    description: "古代遺跡と未知技術を解禁する。",
    cost: 12,
    seconds: 60,
    inputs: { magicStone: 4, metalPart: 2 }
  },
  {
    id: "advanced-exploration",
    name: "高度探索技術",
    icon: "🔭",
    description: "魔王領と未知領域への探索能力を得る。",
    cost: 18,
    seconds: 90,
    inputs: { magicStone: 6, iron: 6, cookedMeal: 2 }
  },
  {
    id: "raid-command",
    name: "レイド指揮",
    icon: "🚩",
    description: "複数冒険者によるレイドを解禁する。",
    cost: 25,
    seconds: 120,
    inputs: { metalPart: 5, cookedMeal: 3, explorationPotion: 2 }
  }
];

const PHASE4_EVENTS = [
  {
    id: "merchant",
    name: "旅商人",
    icon: "🧳",
    description: "探索中に商人と出会い、素材を交換した。",
    reward: { gold: 80 }
  },
  {
    id: "treasure",
    name: "隠された宝箱",
    icon: "🎁",
    description: "探索で宝箱を発見した。",
    reward: { gold: 120, magicStone: 1 }
  },
  {
    id: "rare-resource",
    name: "希少資源発見",
    icon: "💎",
    description: "希少資源の鉱脈を発見した。",
    reward: { ore: 4, magicStone: 2 }
  },
  {
    id: "rescue",
    name: "救難依頼",
    icon: "🆘",
    description: "救難した冒険者から研究素材を受け取った。",
    reward: { researchPoints: 3, food: 3 }
  },
  {
    id: "ambush",
    name: "モンスター襲撃",
    icon: "👾",
    description: "不意の襲撃を退け、戦利品を得た。",
    reward: { gold: 150, ore: 2 }
  }
];

function phase4EnsureState() {
  if (!state.phase4 || typeof state.phase4 !== "object") {
    state.phase4 = clone(PHASE4_DEFAULT);
    state.phase4.lastProcessedAt = state.lastSavedAt || Date.now();
  }

  state.phase4 = {
    ...clone(PHASE4_DEFAULT),
    ...state.phase4,
    bossProgress: { ...(state.phase4.bossProgress || {}) },
    raidProgress: { ...(state.phase4.raidProgress || {}) },
    researchLevels: { ...(state.phase4.researchLevels || {}) },
    clearedDungeons: { ...(state.phase4.clearedDungeons || {}) },
    discoveredUnknown: Array.isArray(state.phase4.discoveredUnknown)
      ? state.phase4.discoveredUnknown
      : [],
    defeatedBosses: Array.isArray(state.phase4.defeatedBosses)
      ? state.phase4.defeatedBosses
      : [],
    eventLog: Array.isArray(state.phase4.eventLog)
      ? state.phase4.eventLog
      : []
  };

  state.phase4.lastProcessedAt =
    Number(state.phase4.lastProcessedAt) || Date.now();
}

function phase4LeaderLevel() {
  return Math.max(
    1,
    ...state.adventurers.map(adventurer => Number(adventurer.level) || 1)
  );
}

function phase4ResearchDone(id) {
  return Number(state.phase4.researchLevels[id]) > 0;
}

function phase4MapUnlocked(map) {
  return phase4LeaderLevel() >= map.minLevel &&
    (state.kills || 0) >= map.minKills &&
    (!map.research || phase4ResearchDone(map.research));
}

function phase4ResearchUnlocked(research) {
  const index = PHASE4_RESEARCH.findIndex(entry => entry.id === research.id);
  if (index <= 0) return true;
  return phase4ResearchDone(PHASE4_RESEARCH[index - 1].id);
}

function phase4CanUseResources(inputs) {
  if (typeof phase3CanAfford === "function") {
    return phase3CanAfford(inputs);
  }
  return Object.entries(inputs).every(
    ([id, amount]) => (state.phase3?.resources?.[id] || 0) >= amount
  );
}

function phase4ConsumeResources(inputs) {
  if (typeof phase3Consume === "function") return phase3Consume(inputs);
  if (!phase4CanUseResources(inputs)) return false;

  Object.entries(inputs).forEach(([id, amount]) => {
    state.phase3.resources[id] -= amount;
  });
  return true;
}

function phase4AddResource(id, amount) {
  if (typeof phase3AddResource === "function") {
    return phase3AddResource(id, amount);
  }
  state.phase3.resources[id] = (state.phase3.resources[id] || 0) + amount;
  return amount;
}

function phase4GrantReward(reward) {
  Object.entries(reward).forEach(([id, amount]) => {
    if (id === "gold") {
      state.gold += amount;
    } else if (id === "researchPoints") {
      state.phase4.researchPoints += amount;
    } else {
      phase4AddResource(id, amount);
    }
  });
}

function phase4ResearchStart(id) {
  const research = PHASE4_RESEARCH.find(entry => entry.id === id);
  if (!research) return;
  if (phase4ResearchDone(id)) return;
  if (!phase4ResearchUnlocked(research)) {
    addLog(`「${research.name}」には前提研究が必要。`);
    phase4Render();
    return;
  }
  if (state.phase4.activeResearch) {
    addLog("現在の研究が完了するまで次の研究は開始できない。");
    phase4Render();
    return;
  }
  if (state.phase4.researchPoints < research.cost) {
    addLog(`「${research.name}」には研究ポイント ${research.cost} が必要。`);
    phase4Render();
    return;
  }
  if (!phase4CanUseResources(research.inputs)) {
    addLog(`「${research.name}」の研究素材が足りない。`);
    phase4Render();
    return;
  }

  phase4ConsumeResources(research.inputs);
  state.phase4.researchPoints -= research.cost;
  state.phase4.activeResearch = {
    id,
    startedAt: Date.now(),
    progress: 0
  };
  addLog(`「${research.name}」の研究を開始した。`);
  saveState();
  phase4Render();
}

function phase4ProcessResearch(seconds) {
  const active = state.phase4.activeResearch;
  if (!active) return;

  const researchSpeed =
    typeof phase7ResearchSpeedMultiplier === "function"
      ? phase7ResearchSpeedMultiplier()
      : 1;

  // Phase 7研究も既存Phase 4研究進行へ接続する。
  // Phase 7専用の研究タイマーは作らず、同じoffline/online経路を利用する。
  if (
    typeof active.id === "string" &&
    active.id.startsWith("phase7:")
  ) {
    if (typeof phase7ProcessResearch === "function") {
      phase7ProcessResearch(
        Math.max(0, seconds) * researchSpeed
      );
    }
    return;
  }

  const research = PHASE4_RESEARCH.find(entry => entry.id === active.id);
  if (!research) {
    state.phase4.activeResearch = null;
    return;
  }

  active.progress = Math.min(
    research.seconds,
    Number(active.progress || 0) +
      Math.max(0, seconds) * researchSpeed
  );

  if (active.progress >= research.seconds) {
    state.phase4.researchLevels[research.id] = 1;
    state.phase4.activeResearch = null;
    addLog(`研究完了：「${research.name}」。新しい探索技術が解禁された。`);
  }
}

function phase4ResearchPointsFromKills(beforeKills, afterKills) {
  const before = Math.floor(beforeKills / 10);
  const after = Math.floor(afterKills / 10);
  if (after > before) {
    state.phase4.researchPoints += after - before;
  }
}

function phase4UnlockedUnknown() {
  const level = phase4LeaderLevel();
  const result = [];

  if (level >= 8 && phase4ResearchDone("mine-survey")) {
    result.push({
      id: "hidden-cavern",
      name: "隠された地下水脈",
      icon: "💧",
      description: "洞窟探索中に発見された未知の採取地点。",
      reward: { fish: 6, magicStone: 2 }
    });
  }

  if (level >= 13 && phase4ResearchDone("ancient-study")) {
    result.push({
      id: "sealed-library",
      name: "封印された古文書庫",
      icon: "📚",
      description: "古代技術の研究材料を発見できる未知領域。",
      reward: { researchPoints: 8, magicStone: 3 }
    });
  }

  if (level >= 20 && phase4ResearchDone("advanced-exploration")) {
    result.push({
      id: "unknown-frontier",
      name: "未知領域",
      icon: "🌌",
      description: "新世界へ続く可能性を持つ未知の境界。",
      reward: { researchPoints: 15, metalPart: 8 }
    });
  }

  return result;
}

function phase4DiscoverUnknown(id) {
  const unknown = phase4UnlockedUnknown().find(entry => entry.id === id);
  if (!unknown) return;
  if (state.phase4.discoveredUnknown.includes(id)) return;

  state.phase4.discoveredUnknown.push(id);
  phase4GrantReward(unknown.reward);
  addLog(`未知エリア「${unknown.name}」を発見した。`);
  saveState();
  phase4Render();
}

function phase4MapSelect(id) {
  const map = PHASE4_MAPS.find(entry => entry.id === id);
  if (!map || !phase4MapUnlocked(map)) return;

  state.phase4.selectedMap = id;
  state.phase4.mode = "map";

  if (typeof map.zoneIndex === "number") {
    state.zoneIndex = map.zoneIndex;
  }

  state.phase4.mapProgress = 0;
  addLog(`探索先を「${map.name}」へ変更した。`);
  saveState();
  render();
  phase4Render();
}

function phase4DungeonStart(id) {
  const dungeon = PHASE4_DUNGEONS.find(entry => entry.id === id);
  if (!dungeon) return;
  if (phase4LeaderLevel() < dungeon.minLevel) return;
  if (!phase4ResearchDone(dungeon.research)) {
    addLog(`「${dungeon.name}」には研究「${dungeon.research}」が必要。`);
    phase4Render();
    return;
  }

  state.phase4.mode = "dungeon";
  state.phase4.activeActivity = {
    type: "dungeon",
    id,
    startedAt: Date.now()
  };
  state.phase4.dungeonProgress = 0;
  addLog(`ダンジョン「${dungeon.name}」への遠征を開始した。`);
  saveState();
  phase4Render();
}

function phase4BossStart(id) {
  const boss = PHASE4_BOSSES.find(entry => entry.id === id);
  if (!boss) return;
  if (phase4LeaderLevel() < boss.minLevel || !phase4ResearchDone(boss.unlock)) return;
  if (state.phase4.bossProgress[id] >= boss.hp) return;

  state.phase4.mode = "boss";
  state.phase4.activeActivity = {
    type: "boss",
    id,
    startedAt: Date.now()
  };
  addLog(`ボス「${boss.name}」への挑戦を開始した。`);
  saveState();
  phase4Render();
}

function phase4RaidStart(id) {
  const raid = PHASE4_RAIDS.find(entry => entry.id === id);
  if (!raid) return;
  if (phase4LeaderLevel() < raid.minLevel) return;
  if (state.adventurers.length < raid.minParty) {
    addLog(`「${raid.name}」には ${raid.minParty}人以上の冒険者が必要。`);
    phase4Render();
    return;
  }
  if (!phase4ResearchDone(raid.research)) {
    addLog(`「${raid.name}」には研究「${raid.research}」が必要。`);
    phase4Render();
    return;
  }

  state.phase4.mode = "raid";
  state.phase4.activeActivity = {
    type: "raid",
    id,
    startedAt: Date.now()
  };
  state.phase4.raidProgress[id] = Number(state.phase4.raidProgress[id]) || 0;
  addLog(`レイド「${raid.name}」を開始した。`);
  saveState();
  phase4Render();
}

function phase4ActivityPower() {
  const stats = guildStats();
  return Math.max(
    1,
    stats.attack +
      stats.defense * 0.35 +
      state.adventurers.length * 4
  );
}

function phase4ProcessActivity(seconds) {
  const activity = state.phase4.activeActivity;
  if (!activity) return;

  if (
    (activity.type === "phase7-dungeon" ||
      activity.type === "phase7-boss") &&
    typeof phase7ProcessActivity === "function"
  ) {
    phase7ProcessActivity(seconds);
    return;
  }

  const power = phase4ActivityPower();
  const units = Math.max(0, seconds) / 5;

  if (activity.type === "dungeon") {
    const dungeon = PHASE4_DUNGEONS.find(entry => entry.id === activity.id);
    if (!dungeon) {
      state.phase4.activeActivity = null;
      return;
    }

    state.phase4.dungeonProgress += units * Math.max(1, power / 35);

    if (state.phase4.dungeonProgress >= dungeon.floors) {
      state.phase4.dungeonProgress = 0;
      state.phase4.clearedDungeons[dungeon.id] =
        (state.phase4.clearedDungeons[dungeon.id] || 0) + 1;
      phase4GrantReward(dungeon.reward);
      addLog(`ダンジョン「${dungeon.name}」を踏破した。`);
      state.phase4.activeActivity = null;
      state.phase4.mode = "map";
    }
    return;
  }

  if (activity.type === "boss") {
    const boss = PHASE4_BOSSES.find(entry => entry.id === activity.id);
    if (!boss) {
      state.phase4.activeActivity = null;
      return;
    }

    const current = Number(state.phase4.bossProgress[boss.id]) || 0;
    const next = Math.min(
      boss.hp,
      current + units * power
    );
    state.phase4.bossProgress[boss.id] = next;

    if (next >= boss.hp) {
      if (!state.phase4.defeatedBosses.includes(boss.id)) {
        state.phase4.defeatedBosses.push(boss.id);
        phase4GrantReward(boss.reward);
        addLog(`ボス「${boss.name}」を撃破した。新しい研究・探索につながる報酬を獲得。`);
      }
      state.phase4.activeActivity = null;
      state.phase4.mode = "map";
    }
    return;
  }

  if (activity.type === "raid") {
    const raid = PHASE4_RAIDS.find(entry => entry.id === activity.id);
    if (!raid) {
      state.phase4.activeActivity = null;
      return;
    }

    const current = Number(state.phase4.raidProgress[raid.id]) || 0;
    const next = Math.min(
      raid.hp,
      current + units * power * Math.max(1, state.adventurers.length / 2)
    );
    state.phase4.raidProgress[raid.id] = next;

    if (next >= raid.hp) {
      phase4GrantReward(raid.reward);
      addLog(`レイド「${raid.name}」を制圧した。`);
      state.phase4.activeActivity = null;
      state.phase4.mode = "map";
    }
  }
}

function phase4RollRandomEvent() {
  if (Math.random() > 0.025) return null;

  const event = PHASE4_EVENTS[
    randomInt(0, PHASE4_EVENTS.length - 1)
  ];

  phase4GrantReward(event.reward);
  state.phase4.eventLog.unshift({
    id: event.id,
    name: event.name,
    time: Date.now()
  });
  state.phase4.eventLog = state.phase4.eventLog.slice(0, 12);

  addLog(`ランダムイベント「${event.name}」が発生した。`);
  return event;
}

function phase4ProcessOffline() {
  const now = Date.now();
  const previous = Number(state.phase4.lastProcessedAt) || now;
  const elapsed = Math.max(0, (now - previous) / 1000);
  const capped = Math.min(elapsed, 12 * 60 * 60);

  if (capped > 0) {
    phase4ProcessResearch(capped);
    phase4ProcessActivity(capped);

    const eventRolls = Math.floor(capped / 60);
    for (let i = 0; i < eventRolls; i++) {
      phase4RollRandomEvent();
    }
  }

  state.phase4.lastProcessedAt = now;
}

function phase4PatchBattle() {
  if (window.__simpleOfIdlePhase4BattlePatched) return;
  window.__simpleOfIdlePhase4BattlePatched = true;

  const original = processBattle;

  processBattle = function phase4BattleWrapper() {
    const before = state.kills || 0;
    original();
    const after = state.kills || 0;

    phase4ResearchPointsFromKills(before, after);

    if (after > before && Math.random() < 0.035) {
      phase4RollRandomEvent();
    }
  };
}

function phase4Card(title, icon, description, meta, button) {
  return `
    <div class="phase4-card">
      <div>
        <strong>${icon} ${title}</strong>
        <small>${description}</small>
        <div class="phase4-meta">${meta}</div>
      </div>
      <div>${button || ""}</div>
    </div>
  `;
}

function phase4RenderMaps() {
  const root = document.getElementById("phase4MapList");
  if (!root) return;

  root.innerHTML = PHASE4_MAPS.map(map => {
    const unlocked = phase4MapUnlocked(map);
    const current = state.phase4.selectedMap === map.id;
    const requirement = `Lv.${map.minLevel} / 討伐 ${map.minKills}` +
      (map.research ? ` / 研究「${PHASE4_RESEARCH.find(r => r.id === map.research)?.name || map.research}」` : "");

    return phase4Card(
      map.name,
      map.icon,
      `${map.description} 敵: ${map.enemy}`,
      `<span class="phase4-chip">${requirement}</span>` +
      (current ? `<span class="phase4-chip">現在地</span>` : ""),
      `<button class="small-button ${current ? "active" : ""}" data-phase4-action="map" data-id="${map.id}" ${unlocked ? "" : "disabled"}>${current ? "探索中" : unlocked ? "探索する" : "未解禁"}</button>`
    );
  }).join("");

  const activeMap = PHASE4_MAPS.find(map => map.id === state.phase4.selectedMap);
  document.getElementById("phase4MapStatus").textContent =
    activeMap ? activeMap.name : "探索中";
}

function phase4RenderDungeons() {
  const root = document.getElementById("phase4DungeonList");
  if (!root) return;

  root.innerHTML = PHASE4_DUNGEONS.map(dungeon => {
    const unlocked =
      phase4LeaderLevel() >= dungeon.minLevel &&
      phase4ResearchDone(dungeon.research);
    const clearCount = state.phase4.clearedDungeons[dungeon.id] || 0;
    const active =
      state.phase4.activeActivity?.type === "dungeon" &&
      state.phase4.activeActivity?.id === dungeon.id;

    const progress = active
      ? Math.min(100, state.phase4.dungeonProgress / dungeon.floors * 100)
      : 0;

    return `
      <div class="phase4-card">
        <div>
          <strong>${dungeon.icon} ${dungeon.name}</strong>
          <small>全${dungeon.floors}階 / 推奨Lv.${dungeon.minLevel} / 踏破 ${clearCount}回</small>
          ${active ? `<div class="phase4-progress"><i style="width:${progress}%"></i></div>` : ""}
        </div>
        <button class="small-button" data-phase4-action="dungeon" data-id="${dungeon.id}" ${unlocked && !state.phase4.activeActivity ? "" : "disabled"}>${active ? "遠征中" : unlocked ? "遠征開始" : "未解禁"}</button>
      </div>
    `;
  }).join("");

  const active = state.phase4.activeActivity;
  document.getElementById("phase4DungeonStatus").textContent =
    active?.type === "dungeon" ? "遠征中" : "待機";
}

function phase4RenderBosses() {
  const root = document.getElementById("phase4BossList");
  if (!root) return;

  const bosses = PHASE4_BOSSES.map(boss => {
    const unlocked =
      phase4LeaderLevel() >= boss.minLevel &&
      phase4ResearchDone(boss.unlock);
    const progress = Number(state.phase4.bossProgress[boss.id]) || 0;
    const defeated = state.phase4.defeatedBosses.includes(boss.id);
    const active =
      state.phase4.activeActivity?.type === "boss" &&
      state.phase4.activeActivity?.id === boss.id;

    return `
      <div class="phase4-card">
        <div>
          <strong>${boss.icon} ${boss.name}</strong>
          <small>HP ${boss.hp.toLocaleString()} / 推奨Lv.${boss.minLevel} / 報酬: 研究ポイント +${boss.reward.researchPoints}</small>
          <div class="phase4-progress"><i style="width:${Math.min(100, progress / boss.hp * 100)}%"></i></div>
        </div>
        <button class="small-button" data-phase4-action="boss" data-id="${boss.id}" ${unlocked && !defeated && !state.phase4.activeActivity ? "" : "disabled"}>${defeated ? "撃破済み" : active ? "戦闘中" : unlocked ? "挑戦" : "未解禁"}</button>
      </div>
    `;
  });

  const raids = PHASE4_RAIDS.map(raid => {
    const progress = Number(state.phase4.raidProgress[raid.id]) || 0;
    const active =
      state.phase4.activeActivity?.type === "raid" &&
      state.phase4.activeActivity?.id === raid.id;
    const unlocked =
      phase4LeaderLevel() >= raid.minLevel &&
      state.adventurers.length >= raid.minParty &&
      phase4ResearchDone(raid.research);

    return `
      <div class="phase4-card">
        <div>
          <strong>${raid.icon} ${raid.name}</strong>
          <small>HP ${raid.hp.toLocaleString()} / Lv.${raid.minLevel} / ${raid.minParty}人以上 / 制圧報酬あり</small>
          <div class="phase4-progress"><i style="width:${Math.min(100, progress / raid.hp * 100)}%"></i></div>
        </div>
        <button class="small-button" data-phase4-action="raid" data-id="${raid.id}" ${unlocked && !state.phase4.activeActivity ? "" : "disabled"}>${active ? "制圧中" : unlocked ? "開始" : "未解禁"}</button>
      </div>
    `;
  });

  root.innerHTML = bosses.join("") + raids.join("");

  const active = state.phase4.activeActivity;
  document.getElementById("phase4BossStatus").textContent =
    active?.type === "boss" ? "ボス戦中" :
    active?.type === "raid" ? "レイド中" :
    state.phase4.defeatedBosses.length ? `${state.phase4.defeatedBosses.length}体撃破` : "未挑戦";
}

function phase4RenderResearch() {
  const root = document.getElementById("phase4ResearchList");
  if (!root) return;

  root.innerHTML = PHASE4_RESEARCH.map(research => {
    const done = phase4ResearchDone(research.id);
    const active = state.phase4.activeResearch?.id === research.id;
    const unlocked = phase4ResearchUnlocked(research);
    const affordable =
      state.phase4.researchPoints >= research.cost &&
      phase4CanUseResources(research.inputs);

    const progress = active
      ? Math.min(100, (state.phase4.activeResearch.progress / research.seconds) * 100)
      : 0;

    const inputs = Object.entries(research.inputs)
      .map(([id, amount]) => `${id} ${amount}`)
      .join(" / ");

    return `
      <div class="phase4-card ${!unlocked ? "locked" : ""}">
        <div>
          <strong>${research.icon} ${research.name}</strong>
          <small>${research.description}</small>
          <small>必要: 研究P ${research.cost} / ${inputs}</small>
          ${active ? `<div class="phase4-progress"><i style="width:${progress}%"></i></div>` : ""}
        </div>
        <button class="small-button" data-phase4-action="research" data-id="${research.id}" ${done || active || !unlocked || !affordable || state.phase4.activeResearch ? "disabled" : ""}>${done ? "完了" : active ? "研究中" : "研究開始"}</button>
      </div>
    `;
  }).join("");

  const active = state.phase4.activeResearch;
  document.getElementById("phase4ResearchStatus").textContent =
    active
      ? `研究中: ${PHASE4_RESEARCH.find(r => r.id === active.id)?.name || active.id}`
      : `研究ポイント ${state.phase4.researchPoints}`;
}

function phase4RenderUnknown() {
  const root = document.getElementById("phase4UnknownList");
  if (!root) return;

  const unknown = phase4UnlockedUnknown();

  root.innerHTML = unknown.length
    ? unknown.map(entry => {
        const discovered = state.phase4.discoveredUnknown.includes(entry.id);
        return phase4Card(
          entry.name,
          entry.icon,
          entry.description,
          `<span class="phase4-chip">${discovered ? "発見済み" : "発見可能"}</span>`,
          `<button class="small-button" data-phase4-action="unknown" data-id="${entry.id}" ${discovered ? "disabled" : ""}>${discovered ? "発見済み" : "発見する"}</button>`
        );
      }).join("")
    : `<div class="phase4-card locked"><div><strong>🔒 未知領域</strong><small>研究と冒険者の成長を進めると発見候補が現れます。</small></div></div>`;
}

function phase4RenderEvents() {
  const root = document.getElementById("phase4EventList");
  if (!root) return;

  if (!state.phase4.eventLog.length) {
    root.innerHTML = `<div class="phase4-card"><div><strong>まだイベントはありません</strong><small>探索・放置中にランダムイベントが発生します。</small></div></div>`;
    return;
  }

  root.innerHTML = state.phase4.eventLog.slice(0, 8).map(entry => {
    const event = PHASE4_EVENTS.find(item => item.id === entry.id);
    return `<div class="phase4-card"><div><strong>${event?.icon || "✨"} ${entry.name}</strong><small>${new Date(entry.time).toLocaleString("ja-JP")}</small></div></div>`;
  }).join("");
}

function phase4Render() {
  phase4EnsureState();
  phase4ProcessOffline();
  phase4RenderMaps();
  phase4RenderDungeons();
  phase4RenderBosses();
  phase4RenderResearch();
  phase4RenderUnknown();
  phase4RenderEvents();
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-phase4-action]");
  if (!button) return;

  const action = button.dataset.phase4Action;
  const id = button.dataset.id;

  if (action === "map") phase4MapSelect(id);
  if (action === "dungeon") phase4DungeonStart(id);
  if (action === "boss") phase4BossStart(id);
  if (action === "raid") phase4RaidStart(id);
  if (action === "research") phase4ResearchStart(id);
  if (action === "unknown") phase4DiscoverUnknown(id);
});

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.tab === "phase4") phase4Render();
  });
});

phase4EnsureState();
phase4PatchBattle();
phase4ProcessOffline();
phase4Render();
saveState();

setInterval(() => {
  phase4ProcessOffline();
  phase4Render();
  saveState();
}, 10000);
