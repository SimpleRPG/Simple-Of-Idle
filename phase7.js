const PHASE7_VERSION = 1;

const PHASE7_DEFAULT = {
  version: PHASE7_VERSION,
  selectedWorld: "origin",
  discoveredWorlds: [],
  unlockedJobs: [],
  unlockedRecipes: [],
  completedResearch: [],
  clearedDungeons: [],
  defeatedBosses: [],
  collections: [],
  activeActivity: null,
  lastProcessedAt: Date.now(),
  upperPrestige: {
    count: 0,
    unlocked: false,
    permanentLevels: {}
  }
};

const PHASE7_WORLDS = [
  {
    id: "origin",
    name: "始原世界",
    description: "これまでの冒険を基盤にした既存世界。",
    requirement: () => true,
    requiredTranscendence: 0
  },
  {
    id: "astral",
    name: "星界",
    description: "超越の力で接続された新世界。星鉱石と星獣が存在する。",
    requirement: () => phase7TranscendenceCount() >= 1,
    requiredTranscendence: 1
  },
  {
    id: "ether",
    name: "エーテル界",
    description: "高度研究と星界の進行によって到達する上位世界。",
    requirement: () =>
      phase7TranscendenceCount() >= 3 &&
      state.phase7.completedResearch.length >= 2,
    requiredTranscendence: 3
  },
  {
    id: "infinity",
    name: "無限界",
    description: "超越と上位研究の先にある長期成長世界。",
    requirement: () =>
      phase7TranscendenceCount() >= 5 &&
      state.phase7.completedResearch.length >= 4,
    requiredTranscendence: 5
  }
];

const PHASE7_JOBS = [
  {
    id: "astral-knight",
    name: "星騎士",
    description: "星界の力を戦闘へ変換する上位戦闘職。",
    world: "astral",
    effect: { attack: 12, defense: 5 }
  },
  {
    id: "ether-scholar",
    name: "エーテル学者",
    description: "エーテル研究と研究進行に特化した職業。",
    world: "ether",
    effect: { research: 0.2, xp: 0.05 }
  },
  {
    id: "world-ranger",
    name: "世界探索者",
    description: "新世界探索と発見に特化した職業。",
    world: "astral",
    effect: { exploration: 0.15, discovery: 0.1 }
  },
  {
    id: "infinity-artisan",
    name: "無限鍛造師",
    description: "高位素材を装備・生産へ変換する職業。",
    world: "infinity",
    effect: { production: 0.2, attack: 8 }
  }
];

const PHASE7_RECIPES = [
  {
    id: "star-ingot",
    name: "星鋼",
    world: "astral",
    inputs: { starOre: 3, iron: 2 },
    output: { starIngot: 1 },
    research: "star-forging",
    description: "星鉱石と鉄を精錬した上位金属。"
  },
  {
    id: "ether-crystal",
    name: "エーテル結晶",
    world: "ether",
    inputs: { etherDust: 3, magicStone: 2 },
    output: { etherCrystal: 1 },
    research: "ether-theory",
    description: "高度研究と特殊装備に使う結晶。"
  },
  {
    id: "star-blade",
    name: "星鋼剣",
    world: "astral",
    inputs: { starIngot: 4, metalPart: 2 },
    output: { equipment: "星鋼剣" },
    research: "star-forging",
    description: "星鋼から作る新世界武器。"
  },
  {
    id: "ether-robe",
    name: "エーテルローブ",
    world: "ether",
    inputs: { etherCrystal: 3, cloth: 3 },
    output: { equipment: "エーテルローブ" },
    research: "ether-theory",
    description: "エーテル結晶を織り込んだ上位防具。"
  },
  {
    id: "infinity-core",
    name: "無限核",
    world: "infinity",
    inputs: { infinityFragment: 3, etherCrystal: 2 },
    output: { infinityCore: 1 },
    research: "infinity-research",
    description: "無限界の特殊生産に使う中核素材。"
  }
];

const PHASE7_RESEARCH = [
  {
    id: "astral-navigation",
    name: "星界航行",
    world: "astral",
    cost: 5,
    seconds: 60,
    requirements: [],
    description: "星界への探索経路を確立する。"
  },
  {
    id: "star-forging",
    name: "星鋼鍛造",
    world: "astral",
    cost: 8,
    seconds: 120,
    requirements: ["astral-navigation"],
    description: "星鋼と星鋼装備の生産を解禁する。"
  },
  {
    id: "ether-theory",
    name: "エーテル理論",
    world: "ether",
    cost: 10,
    seconds: 180,
    requirements: ["star-forging"],
    description: "エーテル界とエーテル結晶を解禁する。"
  },
  {
    id: "world-automation",
    name: "世界間自動化",
    world: "ether",
    cost: 12,
    seconds: 240,
    requirements: ["ether-theory"],
    description: "新世界の放置処理効率を高める。"
  },
  {
    id: "infinity-research",
    name: "無限研究",
    world: "infinity",
    cost: 20,
    seconds: 300,
    requirements: ["world-automation"],
    description: "無限界と上位プレステージへ接続する。"
  }
];

const PHASE7_DUNGEONS = [
  {
    id: "astral-ruins",
    name: "星界遺跡",
    world: "astral",
    floors: 10,
    requirement: () => phase7WorldUnlocked("astral"),
    reward: { starOre: 4 }
  },
  {
    id: "ether-labyrinth",
    name: "エーテル迷宮",
    world: "ether",
    floors: 15,
    requirement: () => phase7WorldUnlocked("ether"),
    reward: { etherDust: 4 }
  },
  {
    id: "infinity-abyss",
    name: "無限深淵",
    world: "infinity",
    floors: 20,
    requirement: () => phase7WorldUnlocked("infinity"),
    reward: { infinityFragment: 3 }
  }
];

const PHASE7_BOSSES = [
  {
    id: "astral-beast",
    name: "星界獣王",
    world: "astral",
    hp: 5000,
    requirement: () =>
      phase7WorldUnlocked("astral") &&
      state.phase7.completedResearch.includes("star-forging"),
    reward: { starOre: 10 }
  },
  {
    id: "ether-overseer",
    name: "エーテル監督者",
    world: "ether",
    hp: 15000,
    requirement: () =>
      phase7WorldUnlocked("ether") &&
      state.phase7.completedResearch.includes("ether-theory"),
    reward: { etherDust: 10 }
  },
  {
    id: "infinity-sovereign",
    name: "無限界の主",
    world: "infinity",
    hp: 50000,
    requirement: () =>
      phase7WorldUnlocked("infinity") &&
      state.phase7.completedResearch.includes("infinity-research"),
    reward: { infinityFragment: 12 }
  }
];

const PHASE7_INTEGRATION_MATERIALS = [
  { id: "starOre", name: "星鉱石", source: "星界遺跡・星界ボス", description: "星鋼の原料となる新世界鉱石。" },
  { id: "etherDust", name: "エーテル粉", source: "エーテル迷宮・エーテルボス", description: "エーテル結晶の原料。" },
  { id: "starIngot", name: "星鋼", source: "新世界生産", description: "星界の高位鍛造素材。" },
  { id: "etherCrystal", name: "エーテル結晶", source: "新世界生産", description: "エーテル系装備と無限核の素材。" },
  { id: "infinityFragment", name: "無限断片", source: "無限深淵・無限界の主", description: "無限界の上位素材。" },
  { id: "infinityCore", name: "無限核", source: "新世界生産", description: "上位プレステージへ接続する特殊素材。" }
];

const PHASE7_INTEGRATION_EQUIPMENT = [
  { id: "星鋼剣", name: "星鋼剣", description: "星鋼から製作する新世界武器。" },
  { id: "エーテルローブ", name: "エーテルローブ", description: "エーテル結晶を織り込んだ新世界防具。" }
];

const PHASE7_INTEGRATION_MONSTERS = [
  { id: "astral-beast", name: "星界獣王", zone: "星界", minLevel: 20 },
  { id: "ether-overseer", name: "エーテル監督者", zone: "エーテル界", minLevel: 30 },
  { id: "infinity-sovereign", name: "無限界の主", zone: "無限界", minLevel: 40 }
];

const PHASE7_JOB_REGISTRY = {
  "astral-knight": {
    name: "星騎士",
    icon: "🌠",
    description: "星界の力を戦闘へ変換する上位戦闘職。",
    attack: 12,
    defense: 5,
    speed: 1.05,
    critical: 0.03,
    xp: 0
  },
  "ether-scholar": {
    name: "エーテル学者",
    icon: "🔮",
    description: "エーテル研究と研究進行に特化した上位職。",
    attack: 2,
    defense: 2,
    speed: 1.05,
    critical: 0.02,
    xp: 0.2
  },
  "world-ranger": {
    name: "世界探索者",
    icon: "🌌",
    description: "新世界探索と発見に特化した上位職。",
    attack: 6,
    defense: 3,
    speed: 1.45,
    critical: 0.08,
    xp: 0.05
  },
  "infinity-artisan": {
    name: "無限鍛造師",
    icon: "♾️",
    description: "高位素材を装備・生産へ変換する上位職。",
    attack: 8,
    defense: 6,
    speed: 1.1,
    critical: 0.03,
    xp: 0.05
  }
};

const PHASE7_COLLECTIONS = [
  {
    id: "star-monsters",
    name: "星界モンスター記録",
    description: "星界のモンスターを記録する。",
    requirement: () =>
      state.phase7.defeatedBosses.includes("astral-beast"),
    effect: { collection: 0.03 }
  },
  {
    id: "ether-technology",
    name: "エーテル技術記録",
    description: "エーテル技術を記録する。",
    requirement: () =>
      state.phase7.completedResearch.includes("ether-theory"),
    effect: { research: 0.05 }
  },
  {
    id: "star-equipment",
    name: "星鋼装備記録",
    description: "星鋼製装備を記録する。",
    requirement: () =>
      phase7HasEquipment("星鋼剣"),
    effect: { attack: 5 }
  },
  {
    id: "infinity-record",
    name: "無限記録",
    description: "無限界の進行を記録する。",
    requirement: () =>
      state.phase7.upperPrestige.count >= 1,
    effect: { collection: 0.05 }
  }
];

function phase7IntegrateExistingSystems() {
  // Phase 7の職業を既存JOBSへ登録し、既存の職業選択・ステータス計算をそのまま利用する。
  if (typeof JOBS !== "undefined") {
    Object.entries(PHASE7_JOB_REGISTRY).forEach(([id, job]) => {
      JOBS[id] = JOBS[id] || { ...job };
    });

    // game.jsのロード時点ではPhase 7職業が未登録のため、
    // ここで保存済み職業IDを最終的に正規化する。
    if (Array.isArray(state.adventurers)) {
      state.adventurers.forEach(adventurer => {
        if (!JOBS[adventurer.job]) {
          adventurer.job = "adventurer";
        }
      });
    }
  }

  // Phase 7素材を既存Phase 5素材図鑑へ接続する。
  if (typeof PHASE5_MATERIALS !== "undefined") {
    PHASE7_INTEGRATION_MATERIALS.forEach(material => {
      if (!PHASE5_MATERIALS.some(item => item.id === material.id)) {
        PHASE5_MATERIALS.push(material);
      }
    });
  }

  // Phase 7装備を既存Phase 5装備図鑑へ接続する。
  if (typeof PHASE5_EQUIPMENT !== "undefined") {
    PHASE7_INTEGRATION_EQUIPMENT.forEach(equipment => {
      if (!PHASE5_EQUIPMENT.some(item => item.id === equipment.id)) {
        PHASE5_EQUIPMENT.push(equipment);
      }
    });
  }

  // Phase 7ボスを既存Phase 5モンスター図鑑へ接続する。
  if (typeof PHASE5_MONSTERS !== "undefined") {
    PHASE7_INTEGRATION_MONSTERS.forEach(monster => {
      if (!PHASE5_MONSTERS.some(item => item.id === monster.id)) {
        PHASE5_MONSTERS.push(monster);
      }
    });
  }

  // 既存図鑑の素材同期を即時反映する。
  if (typeof phase5RegisterMaterials === "function") {
    phase5RegisterMaterials();
  }

  if (typeof phase5UpdateCollectionBonus === "function") {
    phase5UpdateCollectionBonus();
  }
}

function phase7EnsureState() {
  state.phase7 = {
    ...clone(PHASE7_DEFAULT),
    ...(state.phase7 || {}),
    discoveredWorlds: Array.isArray(state.phase7?.discoveredWorlds)
      ? state.phase7.discoveredWorlds
      : [],
    unlockedJobs: Array.isArray(state.phase7?.unlockedJobs)
      ? state.phase7.unlockedJobs
      : [],
    unlockedRecipes: Array.isArray(state.phase7?.unlockedRecipes)
      ? state.phase7.unlockedRecipes
      : [],
    completedResearch: Array.isArray(state.phase7?.completedResearch)
      ? state.phase7.completedResearch
      : [],
    clearedDungeons: Array.isArray(state.phase7?.clearedDungeons)
      ? state.phase7.clearedDungeons
      : [],
    defeatedBosses: Array.isArray(state.phase7?.defeatedBosses)
      ? state.phase7.defeatedBosses
      : [],
    collections: Array.isArray(state.phase7?.collections)
      ? state.phase7.collections
      : [],
    upperPrestige: {
      ...PHASE7_DEFAULT.upperPrestige,
      ...(state.phase7?.upperPrestige || {}),
      permanentLevels: {
        ...(state.phase7?.upperPrestige?.permanentLevels || {})
      }
    }
  };

  state.phase7.version = PHASE7_VERSION;
}

function phase7TranscendenceCount() {
  return Number(state.phase6?.transcendenceCount) || 0;
}

function phase7WorldUnlocked(id) {
  if (id === "origin") return true;

  const world = PHASE7_WORLDS.find(item => item.id === id);
  if (!world) return false;

  return world.requirement();
}

function phase7RefreshUnlocks() {
  phase7EnsureState();

  PHASE7_WORLDS.forEach(world => {
    if (phase7WorldUnlocked(world.id) &&
        !state.phase7.discoveredWorlds.includes(world.id)) {
      state.phase7.discoveredWorlds.push(world.id);
      addLog(`🌌 ${world.name} が解禁された。`);
    }
  });

  PHASE7_JOBS.forEach(job => {
    if (state.phase7.discoveredWorlds.includes(job.world) &&
        !state.phase7.unlockedJobs.includes(job.id)) {
      state.phase7.unlockedJobs.push(job.id);
      addLog(`⚔️ 新職業「${job.name}」が解禁された。`);
    }
  });

  PHASE7_RECIPES.forEach(recipe => {
    const worldUnlocked = state.phase7.discoveredWorlds.includes(recipe.world);
    const researchUnlocked =
      !recipe.research ||
      state.phase7.completedResearch.includes(recipe.research);

    if (worldUnlocked &&
        researchUnlocked &&
        !state.phase7.unlockedRecipes.includes(recipe.id)) {
      state.phase7.unlockedRecipes.push(recipe.id);
    }
  });
}

function phase7ProcessOffline(seconds) {
  phase7EnsureState();

  const elapsed = Math.max(0, Number(seconds) || 0);
  if (elapsed <= 0) return;

  const world = state.phase7.selectedWorld;

  const worldRewards = {
    origin: [],
    astral: [
      ["starOre", 0.025]
    ],
    ether: [
      ["etherDust", 0.02]
    ],
    infinity: [
      ["infinityFragment", 0.012]
    ]
  };

  const rewards = worldRewards[world] || [];

  // 世界間自動化はPhase 7恒久効果として既存放置処理の報酬量へ反映する。
  const automation =
    state.phase7.completedResearch.includes("world-automation")
      ? 1.25
      : 1;

  rewards.forEach(([resource, rate]) => {
    phase7AddResource(resource, elapsed * rate * automation);
  });
}

function phase7ResearchPoints() {
  return Number(state.phase4?.researchPoints) || 0;
}

function phase7CanResearch(research) {
  if (!phase7WorldUnlocked(research.world)) return false;

  return research.requirements.every(
    id => state.phase7.completedResearch.includes(id)
  );
}

function phase7StartResearch(id) {
  const research = PHASE7_RESEARCH.find(item => item.id === id);
  if (!research || state.phase7.completedResearch.includes(id)) return;
  if (!phase7CanResearch(research)) return;

  if (state.phase4?.activeResearch) {
    addLog("現在の研究が完了するまで次の研究は開始できない。");
    return;
  }

  if (phase7ResearchPoints() < research.cost) {
    addLog(`${research.name} には研究ポイント ${research.cost} が必要。`);
    return;
  }

  state.phase4.researchPoints -= research.cost;
  state.phase4.activeResearch = {
    id: `phase7:${id}`,
    startedAt: Date.now(),
    progress: 0
  };

  addLog(`🔬 新研究「${research.name}」を開始した。`);
  phase7RenderResearch();
  saveState();
}

function phase7ProcessResearch(seconds) {
  const active = state.phase4?.activeResearch;
  if (!active || typeof active.id !== "string") return;
  if (!active.id.startsWith("phase7:")) return;

  const id = active.id.slice("phase7:".length);
  const research = PHASE7_RESEARCH.find(item => item.id === id);

  if (!research) {
    state.phase4.activeResearch = null;
    return;
  }

  active.progress = Math.min(
    research.seconds,
    Number(active.progress || 0) + Math.max(0, Number(seconds) || 0)
  );

  if (active.progress < research.seconds) return;

  if (!state.phase7.completedResearch.includes(id)) {
    state.phase7.completedResearch.push(id);
  }

  state.phase4.activeResearch = null;

  if (id === "infinity-research") {
    state.phase7.upperPrestige.unlocked = true;
  }

  addLog(`🔬 新研究「${research.name}」が完了した。`);
  phase7RefreshUnlocks();
}

function phase7AddResource(id, amount) {
  if (typeof phase3AddResource !== "function") return;

  phase3AddResource(id, amount);

  if (typeof phase5RegisterMaterials === "function") {
    phase5RegisterMaterials();
  }
}

function phase7Craft(id) {
  const recipe = PHASE7_RECIPES.find(item => item.id === id);
  if (!recipe || !state.phase7.unlockedRecipes.includes(id)) return;

  let targetAdventurer = null;
  if (recipe.output.equipment) {
    targetAdventurer = typeof selectedAdventurer === "function"
      ? selectedAdventurer()
      : state.adventurers?.[0];

    if (!targetAdventurer) {
      addLog(`${recipe.name} の装備先となる冒険者がいない。`);
      return;
    }
  }

  for (const [resource, amount] of Object.entries(recipe.inputs)) {
    const current = Number(state.phase3?.resources?.[resource]) || 0;
    if (current < amount) {
      addLog(`${recipe.name} の素材が不足している。`);
      return;
    }
  }

  for (const [resource, amount] of Object.entries(recipe.inputs)) {
    state.phase3.resources[resource] -= amount;
  }

  if (recipe.output.equipment) {
    const name = recipe.output.equipment;

    const adventurer = targetAdventurer;

    const equipment = {
      name,
      type: name === "エーテルローブ" ? "armor" : "weapon",
      slot: name === "エーテルローブ" ? "防具" : "武器",
      rarity: "epic",
      attack: name === "星鋼剣" ? 35 : 0,
      defense: name === "エーテルローブ" ? 30 : 0,
      enhance: 0,
      enhanceMultiplier: 1
    };

    adventurer.equipment.push(equipment);

    if (typeof phase5RegisterEquipment === "function") {
      phase5RegisterEquipment(equipment);
    }

    addLog(`⚒️ ${name} を製作した。`);
  } else {
    Object.entries(recipe.output).forEach(([resource, amount]) => {
      phase7AddResource(resource, amount);
    });

    addLog(`⚒️ ${recipe.name} を生産した。`);
  }

  phase7RefreshCollections();
}

function phase7ClearDungeon(id) {
  const dungeon = PHASE7_DUNGEONS.find(item => item.id === id);
  if (!dungeon || state.phase7.clearedDungeons.includes(id)) return;
  if (!dungeon.requirement()) return;

  if (state.phase4?.activeActivity) {
    addLog("現在の遠征が完了するまで、別のダンジョン・ボスには挑戦できない。");
    return;
  }

  const power = typeof adventurerStats === "function"
    ? state.adventurers.reduce(
        (sum, adventurer) => sum + Number(adventurerStats(adventurer).attack || 0),
        0
      )
    : 0;

  const requiredPower = dungeon.floors * 80;

  if (power < requiredPower) {
    addLog(`${dungeon.name} には戦力 ${requiredPower} 以上が必要。`);
    return;
  }

  state.phase4.activeActivity = {
    type: "phase7-dungeon",
    id,
    startedAt: Date.now()
  };
  state.phase4.mode = "dungeon";
  state.phase4.dungeonProgress = 0;

  addLog(`🏰 「${dungeon.name}」への新世界遠征を開始した。`);
}

function phase7DefeatBoss(id) {
  const boss = PHASE7_BOSSES.find(item => item.id === id);
  if (!boss || state.phase7.defeatedBosses.includes(id)) return;
  if (!boss.requirement()) return;

  if (state.phase4?.activeActivity) {
    addLog("現在の遠征が完了するまで、別のダンジョン・ボスには挑戦できない。");
    return;
  }

  const power = typeof adventurerStats === "function"
    ? state.adventurers.reduce(
        (sum, adventurer) => sum + Number(adventurerStats(adventurer).attack || 0),
        0
      )
    : 0;

  if (power * 20 < boss.hp) {
    addLog(`${boss.name} にはより高い戦力が必要。`);
    return;
  }

  state.phase4.activeActivity = {
    type: "phase7-boss",
    id,
    startedAt: Date.now()
  };
  state.phase4.mode = "boss";
  state.phase4.bossProgress[`phase7:${id}`] =
    Number(state.phase4.bossProgress[`phase7:${id}`]) || 0;

  addLog(`👑 「${boss.name}」への新世界ボス戦を開始した。`);
}

function phase7ProcessActivity(seconds) {
  if (!state.phase4?.activeActivity) return;

  const activity = state.phase4.activeActivity;
  const power = typeof phase4ActivityPower === "function"
    ? phase4ActivityPower()
    : Math.max(1, Number(state.adventurers?.length) || 1);
  const units = Math.max(0, Number(seconds) || 0) / 5;

  if (activity.type === "phase7-dungeon") {
    const dungeon = PHASE7_DUNGEONS.find(item => item.id === activity.id);

    if (!dungeon) {
      state.phase4.activeActivity = null;
      return;
    }

    state.phase4.dungeonProgress +=
      units * Math.max(1, power / 35);

    if (state.phase4.dungeonProgress >= dungeon.floors) {
      state.phase4.dungeonProgress = 0;

      if (!state.phase7.clearedDungeons.includes(dungeon.id)) {
        state.phase7.clearedDungeons.push(dungeon.id);
      }

      if (!state.phase4.clearedDungeons ||
          typeof state.phase4.clearedDungeons !== "object") {
        state.phase4.clearedDungeons = {};
      }

      state.phase4.clearedDungeons[`phase7:${dungeon.id}`] = true;

      Object.entries(dungeon.reward).forEach(([resource, amount]) => {
        phase7AddResource(resource, amount);
      });

      addLog(`🏰 ${dungeon.name} を踏破した。`);
      state.phase4.activeActivity = null;
      state.phase4.mode = "map";
      phase7RefreshCollections();
    }

    return;
  }

  if (activity.type === "phase7-boss") {
    const boss = PHASE7_BOSSES.find(item => item.id === activity.id);

    if (!boss) {
      state.phase4.activeActivity = null;
      return;
    }

    const progressId = `phase7:${boss.id}`;
    const current = Number(state.phase4.bossProgress[progressId]) || 0;
    const next = Math.min(
      boss.hp,
      current + units * power
    );

    state.phase4.bossProgress[progressId] = next;

    if (next >= boss.hp) {
      if (!state.phase7.defeatedBosses.includes(boss.id)) {
        state.phase7.defeatedBosses.push(boss.id);
      }

      if (!Array.isArray(state.phase4.defeatedBosses)) {
        state.phase4.defeatedBosses = [];
      }

      if (!state.phase4.defeatedBosses.includes(progressId)) {
        state.phase4.defeatedBosses.push(progressId);
      }

      if (typeof phase5RegisterMonster === "function") {
        phase5RegisterMonster(boss.id, { kills: 1 });
      }

      if (typeof phase5RegisterDiscoveries === "function") {
        phase5RegisterDiscoveries();
      }

      Object.entries(boss.reward).forEach(([resource, amount]) => {
        phase7AddResource(resource, amount);
      });

      addLog(`👑 ${boss.name} を撃破した。`);
      state.phase4.activeActivity = null;
      state.phase4.mode = "map";
      phase7RefreshCollections();
    }
  }
}

function phase7HasEquipment(name) {
  return Boolean(
    Object.prototype.hasOwnProperty.call(
      state.phase5?.equipment || {},
      name
    )
  );
}

function phase7RefreshCollections() {
  PHASE7_COLLECTIONS.forEach(collection => {
    if (collection.requirement() &&
        !state.phase7.collections.includes(collection.id)) {
      state.phase7.collections.push(collection.id);
      addLog(`📚 新コレクション「${collection.name}」を記録した。`);
    }
  });
}

function phase7Effects() {
  const result = {
    attack: 0,
    defense: 0,
    exploration: 0,
    research: 0,
    production: 0,
    xp: 0,
    discovery: 0,
    collection: 0
  };

  PHASE7_COLLECTIONS.forEach(collection => {
    if (!state.phase7.collections.includes(collection.id)) return;

    Object.entries(collection.effect || {}).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
  });

  const levels = state.phase7.upperPrestige.permanentLevels || {};

  Object.entries(levels).forEach(([id, level]) => {
    const value = Number(level) || 0;

    if (id === "world-mastery") {
      result.exploration += value * 0.05;
      result.discovery += value * 0.03;
    }

    if (id === "infinite-research") {
      result.research += value * 0.05;
    }

    if (id === "infinite-forging") {
      result.production += value * 0.05;
    }

    if (id === "infinite-battle") {
      result.attack += value * 5;
    }
  });

  return result;
}

function phase7UpperPrestigeGain() {
  return Math.max(
    1,
    Math.floor(
      Math.sqrt(Math.max(1, phase7TranscendenceCount())) +
      Math.sqrt(Math.max(1, state.phase7.defeatedBosses.length))
    )
  );
}

const PHASE7_UPPER_NODES = [
  {
    id: "world-mastery",
    name: "世界掌握",
    description: "新世界の探索と発見を恒久強化。",
    cost: 1
  },
  {
    id: "infinite-research",
    name: "無限研究",
    description: "研究進行を恒久強化。",
    cost: 1
  },
  {
    id: "infinite-forging",
    name: "無限鍛造",
    description: "新世界生産を恒久強化。",
    cost: 2
  },
  {
    id: "infinite-battle",
    name: "無限戦技",
    description: "上位世界の戦闘力を恒久強化。",
    cost: 2
  }
];

function phase7SpendUpperNode(id) {
  const node = PHASE7_UPPER_NODES.find(item => item.id === id);
  if (!node || !state.phase7.upperPrestige.unlocked) return;

  const levels = state.phase7.upperPrestige.permanentLevels;
  if (Number(levels[id]) > 0) return;

  const spent = Object.entries(levels).reduce(
    (sum, [, level]) => sum + Number(level || 0),
    0
  );

  const points = Number(state.phase7.upperPrestige.points) || 0;

  if (points < node.cost) {
    addLog(`${node.name} には上位ポイント ${node.cost} が必要。`);
    return;
  }

  state.phase7.upperPrestige.points = points - node.cost;
  levels[id] = 1;

  addLog(`∞ ${node.name} を解放した。`);
}

function phase7DoUpperPrestige() {
  phase7EnsureState();
  phase7RefreshUnlocks();

  if (!state.phase7.upperPrestige.unlocked) {
    addLog("上位プレステージはまだ解禁されていない。");
    return;
  }

  if (!state.phase7.defeatedBosses.includes("ether-overseer") &&
      !state.phase7.defeatedBosses.includes("infinity-sovereign")) {
    addLog("上位プレステージには新世界ボスの撃破が必要。");
    return;
  }

  const gain = phase7UpperPrestigeGain();

  state.phase7.upperPrestige.points =
    (Number(state.phase7.upperPrestige.points) || 0) + gain;

  state.phase7.upperPrestige.count += 1;

  // 通常進行のリセット範囲はPhase 6の正規処理へ統一する。
  // Phase 7固有の世界・研究・図鑑・恒久上位成長は保持する。
  if (typeof phase6ResetNormalProgress === "function") {
    phase6ResetNormalProgress();
  }

  phase7EnsureState();
  phase7IntegrateExistingSystems();
  phase7RefreshUnlocks();
  phase7RefreshCollections();

  if (typeof phase5RegisterAllExisting === "function") {
    phase5RegisterAllExisting();
  }

  addLog(`∞ 上位プレステージを実行した。上位ポイント +${gain}`);
}

function phase7PatchStats() {
  if (typeof adventurerStats !== "function") return;
  if (window.__phase7StatsPatched) return;

  const original = adventurerStats;

  adventurerStats = function(adventurer) {
    const result = original(adventurer);
    const effects = phase7Effects();

    result.attack += Number(effects.attack || 0);
    result.defense += Number(effects.defense || 0);

    result.speed = Math.max(
      0.1,
      result.speed * (
        1 +
        Number(effects.exploration || 0)
      )
    );

    result.xpMultiplier *= 1 + Number(effects.xp || 0);

    return result;
  };

  window.__phase7StatsPatched = true;
}

function phase7PatchOfflineProcessing() {
  if (typeof phase4ProcessOffline !== "function") return;
  if (window.__phase7OfflinePatched) return;

  const original = phase4ProcessOffline;

  phase4ProcessOffline = function phase7OfflineWrapper() {
    const now = Date.now();
    const previous = Number(state.phase4?.lastProcessedAt) || now;
    const elapsed = Math.min(
      Math.max(0, (now - previous) / 1000),
      12 * 60 * 60
    );

    original();

    if (elapsed > 0) {
      phase7ProcessOffline(elapsed);
    }
  };

  window.__phase7OfflinePatched = true;
}

function phase7PatchResourceGain() {
  if (typeof phase3AddResource !== "function") return;
  if (window.__phase7ResourcePatched) return;

  const original = phase3AddResource;

  phase3AddResource = function(id, amount, ...args) {
    const effects = phase7Effects();
    const adjusted =
      (Number(amount) || 0) *
      (1 + Number(effects.production || 0));

    return original.call(this, id, adjusted, ...args);
  };

  window.__phase7ResourcePatched = true;
}

function phase7RenderWorlds() {
  const root = document.getElementById("phase7WorldList");
  if (!root) return;

  const discovered = state.phase7.discoveredWorlds.length;

  document.getElementById("phase7WorldStatus").textContent =
    `${discovered} / ${PHASE7_WORLDS.length}`;

  root.innerHTML = PHASE7_WORLDS.map(world => {
    const unlocked = state.phase7.discoveredWorlds.includes(world.id);
    const selected = state.phase7.selectedWorld === world.id;

    return `
      <div class="phase7-card ${unlocked ? "" : "locked"}">
        <strong>${unlocked ? "🌌" : "🔒"} ${unlocked ? world.name : "未解禁世界"}</strong>
        <small>${unlocked ? world.description : `必要超越: ${world.requiredTranscendence}回`}</small>
        ${unlocked ? `<span class="phase7-chip">${selected ? "選択中" : "到達済み"}</span>` : ""}
        ${unlocked && !selected ? `
          <button class="small-button"
            data-phase7-action="world"
            data-id="${world.id}">移動</button>` : ""}
      </div>
    `;
  }).join("");
}

function phase7RenderJobs() {
  const root = document.getElementById("phase7JobList");
  if (!root) return;

  document.getElementById("phase7JobStatus").textContent =
    `${state.phase7.unlockedJobs.length} / ${PHASE7_JOBS.length}`;

  root.innerHTML = PHASE7_JOBS.map(job => {
    const unlocked = state.phase7.unlockedJobs.includes(job.id);

    return `
      <div class="phase7-card ${unlocked ? "" : "locked"}">
        <strong>${unlocked ? "⚔️" : "🔒"} ${unlocked ? job.name : "未解禁職業"}</strong>
        <small>${unlocked ? job.description : `世界「${job.world}」到達で解禁`}</small>
        ${unlocked ? `<span class="phase7-chip">職業システムへ追加済み</span>` : ""}
      </div>
    `;
  }).join("");
}

function phase7RenderProduction() {
  const root = document.getElementById("phase7ProductionList");
  if (!root) return;

  document.getElementById("phase7ProductionStatus").textContent =
    `${state.phase7.unlockedRecipes.length} / ${PHASE7_RECIPES.length}`;

  root.innerHTML = PHASE7_RECIPES.map(recipe => {
    const unlocked = state.phase7.unlockedRecipes.includes(recipe.id);
    const inputs = Object.entries(recipe.inputs)
      .map(([id, amount]) => `${id} ×${amount}`)
      .join(" / ");

    return `
      <div class="phase7-card ${unlocked ? "" : "locked"}">
        <strong>${unlocked ? "⚒️" : "🔒"} ${unlocked ? recipe.name : "未解禁生産"}</strong>
        <small>${unlocked ? recipe.description : `世界「${recipe.world}」到達で解禁`}</small>
        ${unlocked ? `<span class="phase7-chip">素材: ${inputs}</span>` : ""}
        ${unlocked ? `
          <button class="small-button"
            data-phase7-action="craft"
            data-id="${recipe.id}">生産</button>` : ""}
      </div>
    `;
  }).join("");
}

function phase7RenderResearch() {
  const root = document.getElementById("phase7ResearchList");
  if (!root) return;

  document.getElementById("phase7ResearchStatus").textContent =
    `${phase7ResearchPoints()} RP`;

  root.innerHTML = PHASE7_RESEARCH.map(research => {
    const done = state.phase7.completedResearch.includes(research.id);
    const available = phase7CanResearch(research);
    const active =
      state.phase4?.activeResearch?.id === `phase7:${research.id}`;
    const progress = active
      ? Math.min(
          100,
          Number(state.phase4.activeResearch.progress || 0) /
            research.seconds * 100
        )
      : 0;

    return `
      <div class="phase7-card ${done ? "" : available ? "" : "locked"}">
        <strong>${done ? "🔬" : active ? "⏳" : "◇"} ${research.name}</strong>
        <small>${research.description}</small>
        <span class="phase7-chip">必要RP ${research.cost} / ${research.seconds}秒</span>
        ${research.requirements.length
          ? `<small>前提: ${research.requirements.join(" → ")}</small>`
          : ""}
        ${active
          ? `<div class="phase4-progress"><i style="width:${progress}%"></i></div>`
          : ""}
        <button class="small-button"
          data-phase7-action="research"
          data-id="${research.id}"
          ${done || active || !available || phase7ResearchPoints() < research.cost || state.phase4?.activeResearch ? "disabled" : ""}
        >${done ? "完了" : active ? "研究中" : "研究開始"}</button>
      </div>
    `;
  }).join("");
}

function phase7RenderDungeons() {
  const root = document.getElementById("phase7DungeonList");
  if (!root) return;

  document.getElementById("phase7DungeonStatus").textContent =
    `${state.phase7.clearedDungeons.length} / ${PHASE7_DUNGEONS.length}`;

  const active = state.phase4?.activeActivity;

  root.innerHTML = PHASE7_DUNGEONS.map(dungeon => {
    const cleared = state.phase7.clearedDungeons.includes(dungeon.id);
    const available = dungeon.requirement();
    const running =
      active?.type === "phase7-dungeon" &&
      active.id === dungeon.id;
    const blocked = Boolean(active) && !running;

    const progress = running
      ? Math.min(
          100,
          Number(state.phase4.dungeonProgress || 0) /
            dungeon.floors * 100
        )
      : 0;

    return `
      <div class="phase7-card ${available ? "" : "locked"}">
        <strong>${cleared ? "🏰" : running ? "⏳" : available ? "◇" : "🔒"} ${dungeon.name}</strong>
        <small>${dungeon.floors}階層 / ${
          cleared ? "踏破済み" :
          running ? "遠征中" :
          available ? "挑戦可能" : "未解禁"
        }</small>
        ${running
          ? `<div class="phase4-progress"><i style="width:${progress}%"></i></div>`
          : ""}
        <button class="small-button"
          data-phase7-action="dungeon"
          data-id="${dungeon.id}"
          ${cleared || !available || blocked || running ? "disabled" : ""}
        >${cleared ? "踏破済み" : running ? "遠征中" : "挑戦"}</button>
      </div>
    `;
  }).join("");
}

function phase7RenderBosses() {
  const root = document.getElementById("phase7BossList");
  if (!root) return;

  document.getElementById("phase7BossStatus").textContent =
    `${state.phase7.defeatedBosses.length} / ${PHASE7_BOSSES.length}`;

  const active = state.phase4?.activeActivity;

  root.innerHTML = PHASE7_BOSSES.map(boss => {
    const defeated = state.phase7.defeatedBosses.includes(boss.id);
    const available = boss.requirement();
    const running =
      active?.type === "phase7-boss" &&
      active.id === boss.id;
    const blocked = Boolean(active) && !running;
    const progress = running
      ? Math.min(
          100,
          Number(state.phase4.bossProgress[`phase7:${boss.id}`] || 0) /
            boss.hp * 100
        )
      : 0;

    return `
      <div class="phase7-card ${available ? "" : "locked"}">
        <strong>${defeated ? "👑" : running ? "⏳" : available ? "👹" : "🔒"} ${boss.name}</strong>
        <small>HP ${boss.hp.toLocaleString()} / ${
          defeated ? "撃破済み" :
          running ? "戦闘中" :
          available ? "挑戦可能" : "未解禁"
        }</small>
        ${running
          ? `<div class="phase4-progress"><i style="width:${progress}%"></i></div>`
          : ""}
        <button class="small-button"
          data-phase7-action="boss"
          data-id="${boss.id}"
          ${defeated || !available || blocked || running ? "disabled" : ""}
        >${defeated ? "撃破済み" : running ? "戦闘中" : "挑戦"}</button>
      </div>
    `;
  }).join("");
}

function phase7RenderCollections() {
  const root = document.getElementById("phase7CollectionList");
  if (!root) return;

  document.getElementById("phase7CollectionStatus").textContent =
    `${state.phase7.collections.length} / ${PHASE7_COLLECTIONS.length}`;

  root.innerHTML = PHASE7_COLLECTIONS.map(collection => {
    const known = state.phase7.collections.includes(collection.id);

    return `
      <div class="phase7-card ${known ? "" : "locked"}">
        <strong>${known ? "📚" : "🔒"} ${known ? collection.name : "未登録コレクション"}</strong>
        <small>${known ? collection.description : "新世界・研究・ボス・生産を進めると登録されます。"}</small>
        ${known ? `<span class="phase7-chip">恒久効果適用中</span>` : ""}
      </div>
    `;
  }).join("");
}

function phase7RenderPrestige() {
  const root = document.getElementById("phase7PrestigePanel");
  if (!root) return;

  const unlocked = state.phase7.upperPrestige.unlocked;
  const points = Number(state.phase7.upperPrestige.points) || 0;
  const count = Number(state.phase7.upperPrestige.count) || 0;

  document.getElementById("phase7PrestigeStatus").textContent =
    unlocked ? `${count}回 / ${points} UP` : "未解禁";

  root.innerHTML = `
    <div class="phase7-card ${unlocked ? "" : "locked"}">
      <strong>${unlocked ? "∞ 上位プレステージ" : "🔒 上位プレステージ"}</strong>
      <small>${unlocked
        ? "エーテル以上のボス撃破後に周回し、上位ポイントを恒久成長へ振り分けます。"
        : "「無限研究」とエーテル以上のボス撃破が必要です。"
      }</small>
      ${unlocked ? `
        <span class="phase7-chip">上位ポイント ${points}</span>
        <button class="primary-button"
          data-phase7-action="prestige">上位プレステージする</button>
        <div class="phase7-list" style="margin-top:10px">
          ${PHASE7_UPPER_NODES.map(node => {
            const level = Number(
              state.phase7.upperPrestige.permanentLevels[node.id]
            ) || 0;

            return `
              <div class="phase7-card">
                <strong>${level ? "✦" : "◇"} ${node.name}</strong>
                <small>${node.description}</small>
                <span class="phase7-chip">必要 ${node.cost} UP / Lv.${level}</span>
                <button class="small-button"
                  data-phase7-action="upper-node"
                  data-id="${node.id}"
                  ${level || points < node.cost ? "disabled" : ""}
                >${level ? "取得済み" : "解放"}</button>
              </div>
            `;
          }).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

function phase7Render() {
  phase7EnsureState();
  phase7RefreshUnlocks();
  phase7RefreshCollections();

  phase7RenderWorlds();
  phase7RenderJobs();
  phase7RenderProduction();
  phase7RenderResearch();
  phase7RenderDungeons();
  phase7RenderBosses();
  phase7RenderCollections();
  phase7RenderPrestige();
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-phase7-action]");
  if (!button) return;

  const action = button.dataset.phase7Action;
  const id = button.dataset.id;

  if (action === "world") {
    if (state.phase7.discoveredWorlds.includes(id)) {
      state.phase7.selectedWorld = id;
      addLog(`🌌 ${PHASE7_WORLDS.find(item => item.id === id)?.name || id} へ移動した。`);
    }
  }

  if (action === "craft") {
    phase7Craft(id);
  }

  if (action === "research") {
    phase7StartResearch(id);
  }

  if (action === "dungeon") {
    phase7ClearDungeon(id);
  }

  if (action === "boss") {
    phase7DefeatBoss(id);
  }

  if (action === "prestige") {
    phase7DoUpperPrestige();
  }

  if (action === "upper-node") {
    phase7SpendUpperNode(id);
  }

  phase7RefreshUnlocks();
  phase7RefreshCollections();
  saveState();
  render();
  phase7Render();
});

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.tab === "phase7") {
      phase7Render();
    }
  });
});

phase7EnsureState();
phase7IntegrateExistingSystems();
phase7RefreshUnlocks();
phase7PatchStats();
phase7PatchResourceGain();
phase7PatchOfflineProcessing();
phase7Render();
saveState();

setInterval(() => {
  phase7RefreshUnlocks();
  phase7RefreshCollections();
  phase7Render();
  saveState();
}, 10000);
