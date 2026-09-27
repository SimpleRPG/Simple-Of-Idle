const PHASE5_VERSION = 1;

const PHASE5_MATERIALS = [
  { id: "wood", name: "木材", source: "木材収集・探索", description: "建築・加工に使う基本資源。" },
  { id: "ore", name: "鉱石", source: "採掘・探索", description: "精錬して金属へ加工できる鉱石。" },
  { id: "food", name: "食材", source: "探索・採取", description: "料理の基本材料。" },
  { id: "fish", name: "魚", source: "釣り・探索", description: "料理に使う水産資源。" },
  { id: "meat", name: "肉", source: "狩猟・探索", description: "料理に使う食肉資源。" },
  { id: "magicStone", name: "魔石", source: "探索・イベント", description: "研究や特殊生産に使う魔力資源。" },
  { id: "timber", name: "加工木材", source: "生産", description: "木材を加工した建築・装備素材。" },
  { id: "iron", name: "鉄", source: "精錬", description: "鍛冶の基本となる金属。" },
  { id: "cloth", name: "布", source: "採取・生産", description: "防具や装備加工に使う素材。" },
  { id: "herb", name: "薬草", source: "採取", description: "錬金で薬品を作る材料。" },
  { id: "refinedStone", name: "精製石材", source: "生産・探索", description: "高度な施設・生産に使う素材。" },
  { id: "metalPart", name: "金属部品", source: "生産", description: "装備・設備の加工部品。" },
  { id: "healingPotion", name: "回復薬", source: "錬金", description: "冒険者を支援する回復アイテム。" },
  { id: "explorationPotion", name: "探索薬", source: "錬金", description: "探索活動を支援する薬品。" },
  { id: "cookedMeal", name: "冒険者定食", source: "料理", description: "冒険者の活動を支援する料理。" }
];

const PHASE5_EQUIPMENT = [
  { id: "見習いの剣", name: "見習いの剣", description: "冒険を始めた者が使う基本武器。" },
  { id: "布の服", name: "布の服", description: "軽量な基本防具。" },
  { id: "木の護符", name: "木の護符", description: "探索者向けの基本アクセサリー。" },
  { id: "鉄製冒険剣", name: "鉄製冒険剣", description: "鉄と加工素材から作る武器。" },
  { id: "鉄製胸当て", name: "鉄製胸当て", description: "鉄で作られた防具。" }
];

const PHASE5_MONSTERS = [
  { id: "slime", name: "スライム", zone: "村周辺", minLevel: 1 },
  { id: "goblin", name: "ゴブリン", zone: "草原", minLevel: 1 },
  { id: "wolf", name: "ウルフ", zone: "森", minLevel: 1 },
  { id: "cave-guardian", name: "洞窟の守護者", zone: "鉱脈洞窟", minLevel: 5 },
  { id: "ancient-guardian", name: "古代遺跡の守護者", zone: "古代遺跡", minLevel: 8 },
  { id: "demon-lord", name: "魔王領の支配者", zone: "魔王領", minLevel: 12 }
];

const PHASE5_DISCOVERIES = [
  { id: "ancient-ruins", name: "古代遺跡", description: "古代文明の痕跡。研究対象になる。" },
  { id: "ancient-grimoire", name: "古文書", description: "失われた技術の記録。" },
  { id: "unknown-creature", name: "未知生物", description: "既存の図鑑にない生物の記録。" },
  { id: "special-ore", name: "特殊鉱石", description: "通常の鉱石とは異なる性質を持つ。" },
  { id: "ancient-device", name: "古代装置", description: "高度な研究・技術へつながる装置。" },
  { id: "ancient-technology", name: "古代技術", description: "新しい技術体系を解く鍵。" }
];

const PHASE5_PETS = [
  {
    id: "slime-pet",
    name: "スライム",
    icon: "🟢",
    description: "採取効率を少し高める。",
    unlock: () => state.kills >= 25,
    effect: { gathering: 0.05 }
  },
  {
    id: "wolf-pet",
    name: "ウルフ",
    icon: "🐺",
    description: "戦闘攻撃力を高める。",
    unlock: () => state.kills >= 100,
    effect: { attack: 3 }
  },
  {
    id: "ancient-pet",
    name: "古代獣",
    icon: "🦎",
    description: "研究と探索を支援する。",
    unlock: () => state.phase4?.discoveredUnknown?.length >= 1,
    effect: { research: 1, exploration: 0.05 }
  },
  {
    id: "magic-pet",
    name: "魔石獣",
    icon: "🔮",
    description: "魔石の獲得とレア発見を支援する。",
    unlock: () => (state.phase3?.resources?.magicStone || 0) >= 5,
    effect: { magicStone: 0.1, discovery: 0.03 }
  }
];

const PHASE5_ACHIEVEMENTS = [
  { id: "first-battle", name: "初戦闘", description: "初めて敵を1体討伐する。", target: 1, get: () => state.kills, reward: { collection: 0.01 } },
  { id: "kills-100", name: "百戦錬磨", description: "累計100体を討伐する。", target: 100, get: () => state.kills, reward: { attack: 1 } },
  { id: "kills-1000", name: "千体討伐", description: "累計1000体を討伐する。", target: 1000, get: () => state.kills, reward: { attack: 3 } },
  { id: "first-craft", name: "初製作", description: "初めて生産・クラフトを行う。", target: 1, get: () => phase5ProducedTotal(), reward: { production: 0.05 } },
  { id: "first-boss", name: "ボス討伐", description: "初めてボスを撃破する。", target: 1, get: () => state.phase4?.defeatedBosses?.length || 0, reward: { research: 1 } },
  { id: "research-5", name: "研究者", description: "5件の研究を完了する。", target: 5, get: () => Object.keys(state.phase4?.researchLevels || {}).length, reward: { research: 2 } },
  { id: "monster-collection", name: "図鑑収集家", description: "モンスターを4種類登録する。", target: 4, get: () => Object.keys(state.phase5?.monsters || {}).filter(id => state.phase5.monsters[id]?.discovered).length, reward: { collection: 0.02 } },
  { id: "equipment-collection", name: "装備収集家", description: "装備を5種類登録する。", target: 5, get: () => Object.keys(state.phase5?.equipment || {}).length, reward: { collection: 0.02 } },
  { id: "material-collection", name: "素材収集家", description: "素材を10種類登録する。", target: 10, get: () => Object.keys(state.phase5?.materials || {}).filter(id => state.phase5.materials[id]?.discovered).length, reward: { collection: 0.02 } },
  { id: "discovery", name: "未知への一歩", description: "発見物を1件登録する。", target: 1, get: () => state.phase5?.discoveries?.length || 0, reward: { discovery: 0.03 } },
  { id: "pet-owner", name: "仲間との旅", description: "ペットを1匹仲間にする。", target: 1, get: () => state.phase5?.pets?.length || 0, reward: { exploration: 0.03 } },
  { id: "all-categories", name: "記録者", description: "図鑑・発見・実績・ペットをすべて進行させる。", target: 4, get: () => {
      let n = 0;
      if (Object.keys(state.phase5?.monsters || {}).some(id => state.phase5.monsters[id]?.discovered)) n++;
      if (Object.keys(state.phase5?.equipment || {}).length) n++;
      if ((state.phase5?.discoveries || []).length) n++;
      if ((state.phase5?.pets || []).length) n++;
      return n;
    }, reward: { collection: 0.05 } }
];

const PHASE5_TITLES = [
  { id: "new-adventurer", name: "新人冒険者", condition: () => state.kills >= 1, description: "最初の戦闘を経験した者。", effect: { attack: 1 } },
  { id: "monster-hunter", name: "モンスターハンター", condition: () => state.kills >= 100, description: "多くの魔物を討伐した者。", effect: { attack: 2 } },
  { id: "collector", name: "収集家", condition: () => Object.keys(state.phase5?.equipment || {}).length >= 5, description: "多くの装備を記録した者。", effect: { discovery: 0.03 } },
  { id: "researcher", name: "研究者", condition: () => Object.keys(state.phase4?.researchLevels || {}).length >= 5, description: "複数の研究を完了した者。", effect: { research: 2 } },
  { id: "discoverer", name: "発見者", condition: () => (state.phase5?.discoveries || []).length >= 3, description: "未知の情報を発見した者。", effect: { exploration: 0.05 } },
  { id: "beast-friend", name: "獣の友", condition: () => (state.phase5?.pets || []).length >= 2, description: "複数のペットと旅する者。", effect: { gathering: 0.05 } }
];

const PHASE5_DEFAULT = {
  version: PHASE5_VERSION,
  monsters: {},
  equipment: {},
  materials: {},
  discoveries: [],
  pets: [],
  petLevels: {},
  achievements: {},
  titles: [],
  activeTitle: null,
  collectionBonus: 0,
  lastProcessedAt: Date.now()
};

function phase5EnsureState() {
  state.phase5 = {
    ...clone(PHASE5_DEFAULT),
    ...(state.phase5 || {}),
    monsters: { ...PHASE5_DEFAULT.monsters, ...(state.phase5?.monsters || {}) },
    equipment: { ...PHASE5_DEFAULT.equipment, ...(state.phase5?.equipment || {}) },
    materials: { ...PHASE5_DEFAULT.materials, ...(state.phase5?.materials || {}) },
    discoveries: Array.isArray(state.phase5?.discoveries) ? state.phase5.discoveries : [],
    pets: Array.isArray(state.phase5?.pets) ? state.phase5.pets : [],
    petLevels: { ...(state.phase5?.petLevels || {}) },
    achievements: { ...(state.phase5?.achievements || {}) },
    titles: Array.isArray(state.phase5?.titles) ? state.phase5.titles : []
  };
  state.phase5.version = PHASE5_VERSION;
}

function phase5ProducedTotal() {
  return Number(state.phase3?.produced?.timber || 0) +
    Number(state.phase3?.produced?.iron || 0) +
    Number(state.phase3?.produced?.metalPart || 0) +
    Number(state.phase3?.produced?.healingPotion || 0) +
    Number(state.phase3?.produced?.explorationPotion || 0) +
    Number(state.phase3?.produced?.cookedMeal || 0);
}

function phase5RegisterMonster(id, extra = {}) {
  phase5EnsureState();
  const entry = PHASE5_MONSTERS.find(item => item.id === id);
  if (!entry) return;

  const current = state.phase5.monsters[id] || {
    discovered: false,
    kills: 0,
    firstSeenAt: null,
    firstDefeatedAt: null
  };

  current.discovered = true;
  current.kills += Number(extra.kills) || 0;
  if (!current.firstSeenAt) current.firstSeenAt = Date.now();
  if (current.kills > 0 && !current.firstDefeatedAt) current.firstDefeatedAt = Date.now();

  state.phase5.monsters[id] = current;
}

function phase5CurrentMonsterId() {
  const zoneName = typeof ZONES !== "undefined" ? ZONES[state.zoneIndex]?.name : "村周辺";
  const mapping = {
    "村周辺": "slime",
    "草原": "goblin",
    "森": "wolf",
    "深緑の森": "wolf",
    "鉱脈洞窟": "cave-guardian",
    "古代遺跡": "ancient-guardian",
    "魔王領": "demon-lord"
  };
  return mapping[zoneName] || "slime";
}

function phase5RegisterEquipment(item) {
  if (!item?.name) return;
  phase5EnsureState();
  const id = String(item.name);
  const existing = state.phase5.equipment[id] || {
    firstObtainedAt: Date.now(),
    count: 0,
    bestEnhance: 0
  };
  existing.count += 1;
  existing.bestEnhance = Math.max(existing.bestEnhance, Number(item.enhance) || 0);
  state.phase5.equipment[id] = existing;
}

function phase5RegisterMaterials() {
  phase5EnsureState();
  const resources = state.phase3?.resources || {};

  PHASE5_MATERIALS.forEach(material => {
    const amount = Number(resources[material.id]) || 0;
    const discovered = amount > 0;

    if (discovered) {
      const current = state.phase5.materials[material.id] || {
        discoveredAt: Date.now(),
        highestAmount: 0
      };
      current.highestAmount = Math.max(current.highestAmount, amount);
      state.phase5.materials[material.id] = current;
    }
  });
}

function phase5RegisterDiscoveries() {
  phase5EnsureState();

  if (state.phase4?.discoveredUnknown) {
    state.phase4.discoveredUnknown.forEach(id => {
      const mapping = {
        "hidden-cavern": "ancient-device",
        "sealed-library": "ancient-grimoire",
        "unknown-frontier": "unknown-creature"
      };
      const discoveryId = mapping[id];
      if (discoveryId && !state.phase5.discoveries.includes(discoveryId)) {
        state.phase5.discoveries.push(discoveryId);
      }
    });
  }

  const research = state.phase4?.researchLevels || {};
  if (research["ancient-technology"] && !state.phase5.discoveries.includes("ancient-technology")) {
    state.phase5.discoveries.push("ancient-technology");
  }

  if ((state.phase4?.defeatedBosses || []).length >= 1 &&
      !state.phase5.discoveries.includes("ancient-ruins")) {
    state.phase5.discoveries.push("ancient-ruins");
  }
}

function phase5PetUnlocked(pet) {
  return Boolean(pet.unlock?.());
}

function phase5CollectPet(petId) {
  const pet = PHASE5_PETS.find(item => item.id === petId);
  if (!pet || state.phase5.pets.includes(petId) || !phase5PetUnlocked(pet)) return;

  state.phase5.pets.push(petId);
  state.phase5.petLevels[petId] = 1;
  addLog(`${pet.icon} ${pet.name} が仲間になった。`);
}

function phase5PetLevelUp(petId) {
  const pet = PHASE5_PETS.find(item => item.id === petId);
  if (!pet || !state.phase5.pets.includes(petId)) return;

  const level = Number(state.phase5.petLevels[petId]) || 1;
  const cost = 50 * level;

  if (state.gold < cost) {
    addLog(`ペット育成には ${cost.toLocaleString()}G が必要。`);
    return;
  }

  state.gold -= cost;
  state.phase5.petLevels[petId] = level + 1;
  addLog(`${pet.name} が Lv.${level + 1} になった。`);
}

function phase5PetEffects() {
  const result = {
    attack: 0,
    gathering: 0,
    research: 0,
    exploration: 0,
    magicStone: 0,
    discovery: 0
  };

  (state.phase5?.pets || []).forEach(id => {
    const pet = PHASE5_PETS.find(item => item.id === id);
    if (!pet) return;

    const level = Math.max(1, Number(state.phase5.petLevels[id]) || 1);
    Object.entries(pet.effect || {}).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value * level;
    });
  });

  const title = PHASE5_TITLES.find(item => item.id === state.phase5?.activeTitle);
  if (title) {
    Object.entries(title.effect || {}).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
  }

  return result;
}

function phase5UpdateCollectionBonus() {
  const monsters = Object.values(state.phase5.monsters || {}).filter(item => item.discovered).length;
  const equipment = Object.keys(state.phase5.equipment || {}).length;
  const materials = Object.values(state.phase5.materials || {}).filter(item => item.discoveredAt).length;
  const discoveries = state.phase5.discoveries.length;
  const pets = state.phase5.pets.length;
  const achievements = Object.values(state.phase5.achievements || {}).filter(Boolean).length;
  const titles = state.phase5.titles.length;

  state.phase5.collectionBonus =
    Math.min(0.25,
      (monsters * 0.005) +
      (equipment * 0.005) +
      (materials * 0.003) +
      (discoveries * 0.01) +
      (pets * 0.015) +
      (achievements * 0.003) +
      (titles * 0.005)
    );
}

function phase5CheckAchievements() {
  PHASE5_ACHIEVEMENTS.forEach(achievement => {
    if (state.phase5.achievements[achievement.id]) return;

    const value = Number(achievement.get()) || 0;
    if (value < achievement.target) return;

    state.phase5.achievements[achievement.id] = true;
    addLog(`🏆 実績「${achievement.name}」を達成した。`);

    if (achievement.reward?.attack) {
      state.adventurers.forEach(adventurer => {
        adventurer.phase5PermanentAttack =
          (Number(adventurer.phase5PermanentAttack) || 0) + achievement.reward.attack;
      });
    }

    phase5UpdateCollectionBonus();
  });
}

function phase5CheckTitles() {
  PHASE5_TITLES.forEach(title => {
    if (state.phase5.titles.includes(title.id)) return;
    if (!title.condition()) return;

    state.phase5.titles.push(title.id);
    addLog(`🏅 称号「${title.name}」を獲得した。`);

    if (!state.phase5.activeTitle) {
      state.phase5.activeTitle = title.id;
    }
  });
}

function phase5RegisterAllExisting() {
  phase5EnsureState();

  state.adventurers.forEach(adventurer => {
    (adventurer.equipment || []).forEach(item => phase5RegisterEquipment(item));
  });

  phase5RegisterMaterials();

  const monsterId = phase5CurrentMonsterId();
  if (state.kills > 0) {
    phase5RegisterMonster(monsterId);
  }

  phase5RegisterDiscoveries();
  phase5CheckAchievements();
  phase5CheckTitles();
  phase5UpdateCollectionBonus();
}

function phase5PatchBattle() {
  if (typeof processBattle !== "function") return;
  if (window.__phase5BattlePatched) return;

  const original = processBattle;
  processBattle = function(...args) {
    const beforeKills = state.kills;
    const beforeEquipment = state.adventurers.reduce(
      (sum, adventurer) => sum + adventurer.equipment.length, 0
    );

    const result = original.apply(this, args);

    const gainedKills = Math.max(0, state.kills - beforeKills);
    if (gainedKills > 0) {
      phase5RegisterMonster(phase5CurrentMonsterId(), { kills: gainedKills });
    }

    const afterEquipment = state.adventurers.reduce(
      (sum, adventurer) => sum + adventurer.equipment.length, 0
    );

    if (afterEquipment > beforeEquipment) {
      state.adventurers.forEach(adventurer => {
        (adventurer.equipment || []).forEach(item => phase5RegisterEquipment(item));
      });
    }

    phase5RegisterMaterials();
    phase5RegisterDiscoveries();
    phase5CheckAchievements();
    phase5CheckTitles();
    phase5UpdateCollectionBonus();

    return result;
  };

  window.__phase5BattlePatched = true;
}

function phase5PatchStats() {
  if (typeof adventurerStats !== "function") return;
  if (window.__phase5StatsPatched) return;

  const original = adventurerStats;
  adventurerStats = function(adventurer) {
    const result = original(adventurer);
    const pet = phase5PetEffects();
    const achievementAttack = state.phase5?.achievements
      ? Object.entries(state.phase5.achievements).filter(([, value]) => value).reduce((sum, [id]) => {
          const achievement = PHASE5_ACHIEVEMENTS.find(item => item.id === id);
          return sum + Number(achievement?.reward?.attack || 0);
        }, 0)
      : 0;

    result.attack += pet.attack + achievementAttack +
      Number(adventurer.phase5PermanentAttack || 0);

    result.speed = Math.max(
      0.1,
      result.speed * (1 + pet.exploration + (state.phase5?.collectionBonus || 0) * 0.2)
    );

    result.xpMultiplier *= 1 + (state.phase5?.collectionBonus || 0) * 0.25;
    return result;
  };

  window.__phase5StatsPatched = true;
}

function phase5PatchResourceGain() {
  if (typeof phase3AddResource !== "function") return;
  if (window.__phase5ResourcePatched) return;

  const original = phase3AddResource;
  phase3AddResource = function(id, amount, ...args) {
    const pet = phase5PetEffects();
    let adjusted = Number(amount) || 0;

    if (id === "magicStone") {
      adjusted *= 1 + pet.magicStone;
    }

    adjusted *= 1 + pet.gathering;
    const result = original.call(this, id, adjusted, ...args);

    phase5RegisterMaterials();
    phase5CheckAchievements();
    phase5UpdateCollectionBonus();
    return result;
  };

  window.__phase5ResourcePatched = true;
}

function phase5RenderMonster() {
  const root = document.getElementById("phase5MonsterList");
  if (!root) return;

  const discovered = PHASE5_MONSTERS.filter(
    monster => state.phase5.monsters[monster.id]?.discovered
  ).length;

  document.getElementById("phase5MonsterStatus").textContent =
    `${discovered} / ${PHASE5_MONSTERS.length}`;

  root.innerHTML = PHASE5_MONSTERS.map(monster => {
    const record = state.phase5.monsters[monster.id];
    const known = Boolean(record?.discovered);
    const kills = Number(record?.kills) || 0;

    return `
      <div class="phase5-card ${known ? "" : "locked"}">
        <div>
          <strong>${known ? "👹" : "❔"} ${known ? monster.name : "未確認モンスター"}</strong>
          <small>${known ? `出現: ${monster.zone} / 推奨Lv.${monster.minLevel} / 撃破数 ${kills.toLocaleString()}` : "探索で遭遇すると登録されます。"}</small>
          ${known ? `<span class="phase5-chip">${record.firstDefeatedAt ? "初回撃破済み" : "遭遇済み"}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function phase5RenderEquipment() {
  const root = document.getElementById("phase5EquipmentList");
  if (!root) return;

  const registered = Object.keys(state.phase5.equipment).length;
  document.getElementById("phase5EquipmentStatus").textContent =
    `${registered} / ${PHASE5_EQUIPMENT.length}`;

  root.innerHTML = PHASE5_EQUIPMENT.map(item => {
    const record = state.phase5.equipment[item.id];
    const known = Boolean(record);

    return `
      <div class="phase5-card ${known ? "" : "locked"}">
        <div>
          <strong>${known ? "⚔️" : "❔"} ${known ? item.name : "未登録装備"}</strong>
          <small>${known ? `${item.description} / 入手 ${record.count}個 / 最高強化 +${record.bestEnhance}` : "入手すると図鑑へ登録されます。"}</small>
        </div>
      </div>
    `;
  }).join("");
}

function phase5RenderMaterials() {
  const root = document.getElementById("phase5MaterialList");
  if (!root) return;

  const registered = Object.values(state.phase5.materials)
    .filter(item => item.discoveredAt).length;

  document.getElementById("phase5MaterialStatus").textContent =
    `${registered} / ${PHASE5_MATERIALS.length}`;

  root.innerHTML = PHASE5_MATERIALS.map(material => {
    const record = state.phase5.materials[material.id];
    const known = Boolean(record);

    return `
      <div class="phase5-card ${known ? "" : "locked"}">
        <div>
          <strong>${known ? "🧱" : "❔"} ${known ? material.name : "未登録素材"}</strong>
          <small>${known ? `${material.description} / 入手: ${material.source} / 最大保有 ${record.highestAmount.toLocaleString()}` : "入手すると図鑑へ登録されます。"}</small>
        </div>
      </div>
    `;
  }).join("");
}

function phase5RenderDiscoveries() {
  const root = document.getElementById("phase5DiscoveryList");
  if (!root) return;

  document.getElementById("phase5DiscoveryStatus").textContent =
    `${state.phase5.discoveries.length} / ${PHASE5_DISCOVERIES.length}`;

  root.innerHTML = PHASE5_DISCOVERIES.map(entry => {
    const known = state.phase5.discoveries.includes(entry.id);

    return `
      <div class="phase5-card ${known ? "" : "locked"}">
        <div>
          <strong>${known ? "✨" : "❔"} ${known ? entry.name : "未発見"}</strong>
          <small>${known ? entry.description : "未知エリア・研究・ボスなどを進めると発見できます。"}</small>
        </div>
      </div>
    `;
  }).join("");
}

function phase5RenderPets() {
  const root = document.getElementById("phase5PetList");
  if (!root) return;

  document.getElementById("phase5PetStatus").textContent =
    `${state.phase5.pets.length}匹`;

  root.innerHTML = PHASE5_PETS.map(pet => {
    const owned = state.phase5.pets.includes(pet.id);
    const unlocked = phase5PetUnlocked(pet);
    const level = Number(state.phase5.petLevels[pet.id]) || 1;
    const cost = 50 * level;

    return `
      <div class="phase5-card ${!unlocked && !owned ? "locked" : ""}">
        <div>
          <strong>${pet.icon} ${pet.name}</strong>
          <small>${pet.description}${owned ? ` / Lv.${level}` : ""}</small>
          ${owned ? `<span class="phase5-chip">効果適用中</span>` : ""}
        </div>
        <button
          class="small-button"
          data-phase5-action="${owned ? "pet-level" : "pet-get"}"
          data-id="${pet.id}"
          ${(!unlocked && !owned) || (owned && state.gold < cost) ? "disabled" : ""}
        >${owned ? `育成 ${cost.toLocaleString()}G` : unlocked ? "仲間にする" : "未解禁"}</button>
      </div>
    `;
  }).join("");
}

function phase5RenderAchievements() {
  const root = document.getElementById("phase5AchievementList");
  if (!root) return;

  const completed = Object.values(state.phase5.achievements).filter(Boolean).length;
  document.getElementById("phase5AchievementStatus").textContent =
    `${completed} / ${PHASE5_ACHIEVEMENTS.length}`;

  root.innerHTML = PHASE5_ACHIEVEMENTS.map(achievement => {
    const done = Boolean(state.phase5.achievements[achievement.id]);
    const value = Math.min(achievement.target, Number(achievement.get()) || 0);
    const percent = Math.min(100, value / achievement.target * 100);

    return `
      <div class="phase5-card">
        <div>
          <strong>${done ? "🏆" : "◇"} ${achievement.name}</strong>
          <small>${achievement.description} / ${value.toLocaleString()} / ${achievement.target.toLocaleString()}</small>
          <div class="phase5-progress"><i style="width:${percent}%"></i></div>
          ${done ? `<span class="phase5-chip">恒久報酬獲得済み</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function phase5RenderTitles() {
  const root = document.getElementById("phase5TitleList");
  if (!root) return;

  document.getElementById("phase5TitleStatus").textContent =
    `${state.phase5.titles.length} / ${PHASE5_TITLES.length}`;

  root.innerHTML = PHASE5_TITLES.map(title => {
    const owned = state.phase5.titles.includes(title.id);
    const active = state.phase5.activeTitle === title.id;

    return `
      <div class="phase5-card ${owned ? "" : "locked"}">
        <div>
          <strong>${owned ? "🏅" : "🔒"} ${title.name}</strong>
          <small>${title.description}</small>
          ${owned ? `<span class="phase5-chip">${active ? "装備中" : "獲得済み"}</span>` : ""}
        </div>
        <button
          class="small-button"
          data-phase5-action="title"
          data-id="${title.id}"
          ${!owned || active ? "disabled" : ""}
        >${active ? "装備中" : "装備"}</button>
      </div>
    `;
  }).join("");
}

function phase5Render() {
  phase5EnsureState();
  phase5RegisterAllExisting();
  phase5RenderMonster();
  phase5RenderEquipment();
  phase5RenderMaterials();
  phase5RenderDiscoveries();
  phase5RenderPets();
  phase5RenderAchievements();
  phase5RenderTitles();
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-phase5-action]");
  if (!button) return;

  const action = button.dataset.phase5Action;
  const id = button.dataset.id;

  if (action === "pet-get") {
    phase5CollectPet(id);
    saveState();
    render();
    phase5Render();
  }

  if (action === "pet-level") {
    phase5PetLevelUp(id);
    saveState();
    render();
    phase5Render();
  }

  if (action === "title") {
    if (state.phase5.titles.includes(id)) {
      state.phase5.activeTitle = id;
      addLog(`🏅 称号「${PHASE5_TITLES.find(item => item.id === id)?.name || id}」を装備した。`);
      saveState();
      render();
      phase5Render();
    }
  }
});

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.tab === "phase5") {
      phase5Render();
    }
  });
});

phase5EnsureState();
phase5PatchBattle();
phase5PatchStats();
phase5PatchResourceGain();
phase5RegisterAllExisting();
phase5Render();
saveState();

setInterval(() => {
  phase5RegisterMaterials();
  phase5RegisterDiscoveries();
  phase5CheckAchievements();
  phase5CheckTitles();
  phase5UpdateCollectionBonus();
  phase5Render();
  saveState();
}, 10000);
