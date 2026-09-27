const PHASE3_VERSION = 1;

const PHASE3_DEFAULT = {
  version: PHASE3_VERSION,
  lastProcessedAt: Date.now(),
  assignments: {},
  resources: {
    wood: 0,
    ore: 0,
    food: 0,
    fish: 0,
    meat: 0,
    magicStone: 0,
    timber: 0,
    iron: 0,
    cloth: 0,
    herb: 0,
    refinedStone: 0,
    metalPart: 0,
    healingPotion: 0,
    explorationPotion: 0,
    cookedMeal: 0
  },
  produced: {
    timber: 0,
    iron: 0,
    metalPart: 0,
    healingPotion: 0,
    explorationPotion: 0,
    cookedMeal: 0
  }
};

const GATHERING_JOBS = {
  mining: {
    name: "採掘",
    icon: "⛏️",
    description: "鉱石・魔石を集める。",
    outputs: { ore: 1.4, magicStone: 0.15 }
  },
  forestry: {
    name: "木材収集",
    icon: "🪵",
    description: "木材を集める。",
    outputs: { wood: 1.8 }
  },
  fishing: {
    name: "釣り",
    icon: "🎣",
    description: "魚を集める。",
    outputs: { fish: 1.4 }
  },
  hunting: {
    name: "狩猟",
    icon: "🏹",
    description: "肉・皮・食材を集める。",
    outputs: { meat: 1.1, food: 0.7, cloth: 0.15 }
  },
  foraging: {
    name: "採取",
    icon: "🌿",
    description: "食材・薬草を集める。",
    outputs: { food: 1.2, herb: 0.9 }
  }
};

const PRODUCTION_RECIPES = [
  {
    id: "timber",
    type: "production",
    name: "木材加工",
    icon: "🪚",
    inputs: { wood: 3 },
    output: { timber: 2 },
    description: "木材から建築・生産用の加工材を作る。"
  },
  {
    id: "iron",
    type: "production",
    name: "鉱石精錬",
    icon: "🔥",
    inputs: { ore: 3 },
    output: { iron: 2 },
    description: "鉱石を精錬して鉄を作る。"
  },
  {
    id: "metalPart",
    type: "production",
    name: "金属部品",
    icon: "⚙️",
    inputs: { iron: 2, timber: 1 },
    output: { metalPart: 1 },
    description: "鍛冶・設備に使う部品を作る。"
  }
];

const CRAFT_RECIPES = [
  {
    id: "blacksmithSword",
    type: "blacksmith",
    name: "鉄製冒険剣",
    icon: "⚔️",
    inputs: { iron: 6, timber: 2, metalPart: 1 },
    output: { equipment: "weapon" },
    description: "鍛冶場から攻撃力の高い武器を製作する。"
  },
  {
    id: "blacksmithArmor",
    type: "blacksmith",
    name: "鉄製胸当て",
    icon: "🛡️",
    inputs: { iron: 5, metalPart: 2, cloth: 2 },
    output: { equipment: "armor" },
    description: "鍛冶場から防御力の高い防具を製作する。"
  },
  {
    id: "healingPotion",
    type: "alchemy",
    name: "回復薬",
    icon: "🧪",
    inputs: { herb: 4, fish: 1 },
    output: { healingPotion: 1 },
    description: "冒険者の回復用アイテムを作る。"
  },
  {
    id: "explorationPotion",
    type: "alchemy",
    name: "探索薬",
    icon: "✨",
    inputs: { herb: 3, magicStone: 1 },
    output: { explorationPotion: 1 },
    description: "探索効率を一時的に高める薬品を作る。"
  },
  {
    id: "cookedMeal",
    type: "cooking",
    name: "冒険者定食",
    icon: "🍲",
    inputs: { fish: 2, meat: 2, food: 2 },
    output: { cookedMeal: 1 },
    description: "経験値・ゴールド・探索を強化する食事を作る。"
  }
];

function phase3Init() {
  if (!state.phase3 || typeof state.phase3 !== "object") {
    state.phase3 = clone(PHASE3_DEFAULT);
    state.phase3.lastProcessedAt = state.lastSavedAt || Date.now();
  }

  state.phase3.resources = {
    ...clone(PHASE3_DEFAULT.resources),
    ...(state.phase3.resources || {})
  };

  state.phase3.produced = {
    ...clone(PHASE3_DEFAULT.produced),
    ...(state.phase3.produced || {})
  };

  state.phase3.assignments = {
    ...(state.phase3.assignments || {})
  };

  state.adventurers.forEach(adventurer => {
    if (!state.phase3.assignments[adventurer.id]) {
      state.phase3.assignments[adventurer.id] = "adventure";
    }
  });

  state.phase3.lastProcessedAt = Number(state.phase3.lastProcessedAt) || Date.now();

  phase3ProcessOffline();
  phase3InjectUI();
  phase3PatchBattle();
  phase3PatchEnhancement();
  phase3Render();
  saveState();
}

function phase3WarehouseCapacity() {
  const base = 25 + ((state.base?.facilities?.warehouse || 0) * 15);
  return base;
}

function phase3UsedStorage() {
  const resources = state.phase3.resources;
  return Object.values(resources).reduce((sum, value) => sum + Math.max(0, Math.floor(value)), 0);
}

function phase3AddResource(id, amount) {
  if (!state.phase3.resources[id]) state.phase3.resources[id] = 0;

  const free = Math.max(0, phase3WarehouseCapacity() - phase3UsedStorage());
  const accepted = Math.min(Math.max(0, amount), free);

  state.phase3.resources[id] += accepted;
  return accepted;
}

function phase3CanAfford(inputs) {
  return Object.entries(inputs).every(
    ([id, amount]) => (state.phase3.resources[id] || 0) >= amount
  );
}

function phase3Consume(inputs) {
  if (!phase3CanAfford(inputs)) return false;

  Object.entries(inputs).forEach(([id, amount]) => {
    state.phase3.resources[id] -= amount;
  });

  return true;
}

function phase3GatherRate(adventurer) {
  const stats = adventurerStats(adventurer);
  const facilityLevel = state.base?.facilities?.training || 0;
  const speed = Math.max(0.5, stats.speed);
  return speed * (1 + facilityLevel * 0.025);
}

function phase3ProcessGathering(seconds) {
  const maxSeconds = Math.min(seconds, 12 * 60 * 60);
  let gathered = 0;

  state.adventurers.forEach(adventurer => {
    const assignment = state.phase3.assignments[adventurer.id] || "adventure";
    const job = GATHERING_JOBS[assignment];
    if (!job) return;

    const cycles = maxSeconds / 10;
    const rate = phase3GatherRate(adventurer);

    Object.entries(job.outputs).forEach(([resource, amount]) => {
      gathered += phase3AddResource(resource, cycles * amount * rate);
    });
  });

  return gathered;
}

function phase3ProcessOffline() {
  const now = Date.now();
  const previous = state.phase3.lastProcessedAt || now;
  const elapsed = Math.max(0, (now - previous) / 1000);

  if (elapsed > 1) {
    phase3ProcessGathering(elapsed);
  }

  state.phase3.lastProcessedAt = now;
}

function phase3PatchBattle() {
  if (window.__simpleOfIdlePhase3BattlePatched) return;
  window.__simpleOfIdlePhase3BattlePatched = true;

  const original = processBattle;

  processBattle = function phase3BattleWrapper() {
    original();

    const leader = selectedAdventurer();
    const stats = adventurerStats(leader);
    const bonus = Math.max(1, stats.speed);

    phase3AddResource("food", 0.15 * bonus);
    phase3AddResource("ore", 0.08 * bonus);
    phase3AddResource("wood", 0.12 * bonus);

    if (Math.random() < 0.04 * Math.min(2, bonus)) {
      phase3AddResource("magicStone", 1);
      addLog("戦闘後、魔石の欠片を発見した。");
    }
  };
}

function phase3PatchEnhancement() {
  if (window.__simpleOfIdlePhase3EnhancePatched) return;
  window.__simpleOfIdlePhase3EnhancePatched = true;

  const original = enhanceEquipment;

  enhanceEquipment = function phase3EnhanceWrapper(adventurerId, itemId) {
    const adventurer = state.adventurers.find(a => a.id === adventurerId);
    const item = adventurer?.equipment.find(entry => entry.id === itemId);

    if (!adventurer || !item) return;

    const level = Number(item.enhance) || 0;
    const materialCost = {
      iron: 2 + level,
      timber: 1 + Math.floor(level / 2)
    };

    if (!phase3CanAfford(materialCost)) {
      addLog("装備強化には鉄と加工木材が必要。");
      phase3Render();
      return;
    }

    if ((state.gold || 0) < equipmentEnhanceCost(item)) {
      original(adventurerId, itemId);
      return;
    }

    phase3Consume(materialCost);
    original(adventurerId, itemId);
    phase3Render();
  };
}

function phase3Craft(recipeId) {
  const recipe = [...PRODUCTION_RECIPES, ...CRAFT_RECIPES]
    .find(entry => entry.id === recipeId);

  if (!recipe) return;

  if (
    recipe.phase7Id &&
    !state.phase7?.unlockedRecipes?.includes(recipe.phase7Id)
  ) {
    addLog(`${recipe.name} はまだ解禁されていない。`);
    phase3Render();
    return;
  }

  if (!phase3CanAfford(recipe.inputs)) {
    addLog(`${recipe.name} に必要な素材が足りない。`);
    phase3Render();
    return;
  }

  if (recipe.type === "blacksmith" && !(state.base.facilities.blacksmith > 0)) {
    addLog("鍛冶場を建設すると鍛冶を開始できます。");
    phase3Render();
    return;
  }

  if (recipe.type === "alchemy" && !(state.base.facilities.warehouse > 0)) {
    addLog("錬金工房の基盤として倉庫をLv.1以上にしてください。");
    phase3Render();
    return;
  }

  phase3Consume(recipe.inputs);

  if (recipe.output.equipment) {
    const leader = selectedAdventurer();
    const isWeapon = recipe.output.equipment === "weapon";
    const equipmentData = recipe.equipment || {};
    const equipmentName =
      equipmentData.name ||
      (isWeapon ? "鉄製冒険剣" : "鉄製胸当て");

    const equipment = {
      slot:
        equipmentData.slot ||
        (isWeapon ? "武器" : "防具"),
      name: equipmentName,
      type:
        equipmentData.type ||
        (isWeapon ? "weapon" : "armor"),
      rarity:
        equipmentData.rarity || "common",
      attack:
        Number.isFinite(equipmentData.attack)
          ? equipmentData.attack
          : (isWeapon ? 12 + leader.level : 2),
      defense:
        Number.isFinite(equipmentData.defense)
          ? equipmentData.defense
          : (isWeapon ? 2 : 10 + leader.level),
      id: `crafted-${Date.now()}-${Math.random()}`,
      level: leader.level,
      enhance: 0,
      enhanceMultiplier: 1
    };

    leader.equipment.push(equipment);

    if (typeof phase5RegisterEquipment === "function") {
      phase5RegisterEquipment(equipment);
    }

    addLog(`${leader.name} が ${recipe.name} を製作した。`);
  } else {
    Object.entries(recipe.output).forEach(([id, amount]) => {
      phase3AddResource(id, amount);
      state.phase3.produced[id] = (state.phase3.produced[id] || 0) + amount;
    });

    addLog(`${recipe.name} を生産した。`);
  }

  saveState();
  render();
  phase3Render();
}

function phase3SetAssignment(adventurerId, assignment) {
  if (!state.adventurers.some(a => a.id === adventurerId)) return;

  state.phase3.assignments[adventurerId] = assignment;
  saveState();
  phase3Render();
}

function phase3AssignmentName(id) {
  if (id === "adventure") return "冒険";
  return GATHERING_JOBS[id]?.name || "冒険";
}

function phase3InjectUI() {
  if (document.getElementById("phase3Injected")) return;

  const marker = document.createElement("span");
  marker.id = "phase3Injected";
  marker.hidden = true;
  document.body.appendChild(marker);

  document.querySelectorAll(".tab").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.tab === "production") {
        phase3Render();
      }
    });
  });
}

function phase3RenderGathering() {
  const root = document.getElementById("gatheringList");
  if (!root) return;

  root.innerHTML = state.adventurers.map(adventurer => {
    const current = state.phase3.assignments[adventurer.id] || "adventure";

    const buttons = [
      `<button class="small-button ${current === "adventure" ? "active" : ""}" data-phase3-action="assignment" data-adventurer="${adventurer.id}" data-assignment="adventure">⚔ 冒険</button>`,
      ...Object.entries(GATHERING_JOBS).map(([id, job]) =>
        `<button class="small-button ${current === id ? "active" : ""}" data-phase3-action="assignment" data-adventurer="${adventurer.id}" data-assignment="${id}">${job.icon} ${job.name}</button>`
      )
    ].join("");

    return `
      <div class="gathering-row">
        <div>
          <strong>${JOBS[adventurer.job].icon} ${adventurer.name}</strong>
          <small>${phase3AssignmentName(current)} / 採取効率 ${phase3GatherRate(adventurer).toFixed(2)}</small>
        </div>
        <div class="gathering-actions">${buttons}</div>
      </div>
    `;
  }).join("");

  const gatheringCount = state.adventurers.filter(
    a => state.phase3.assignments[a.id] && state.phase3.assignments[a.id] !== "adventure"
  ).length;

  document.getElementById("gatheringRate").textContent = `${gatheringCount}人稼働`;
}

function phase3RenderResources() {
  const root = document.getElementById("resourceList");
  if (!root) return;

  const labels = {
    wood: ["木材", "🪵"],
    ore: ["鉱石", "⛏️"],
    food: ["食材", "🌾"],
    fish: ["魚", "🐟"],
    meat: ["肉", "🥩"],
    magicStone: ["魔石", "💎"],
    timber: ["加工木材", "🪚"],
    iron: ["鉄", "🔩"],
    cloth: ["布", "🧵"],
    herb: ["薬草", "🌿"],
    refinedStone: ["精製石", "🪨"],
    metalPart: ["金属部品", "⚙️"],
    healingPotion: ["回復薬", "🧪"],
    explorationPotion: ["探索薬", "✨"],
    cookedMeal: ["冒険者定食", "🍲"]
  };

  root.innerHTML = Object.entries(labels).map(([id, [name, icon]]) => `
    <div class="resource-item">
      <strong>${icon} ${name}</strong>
      <small>${Math.floor(state.phase3.resources[id] || 0).toLocaleString()}</small>
    </div>
  `).join("");

  document.getElementById("warehouseCapacity").textContent =
    `${phase3UsedStorage().toLocaleString()} / ${phase3WarehouseCapacity().toLocaleString()}`;
}

function phase3RecipeHTML(recipe) {
  if (
    recipe.phase7Id &&
    !state.phase7?.unlockedRecipes?.includes(recipe.phase7Id)
  ) {
    return "";
  }

  const inputText = Object.entries(recipe.inputs).map(([id, amount]) =>
    `${id}: ${amount}`
  ).join(" / ");

  const available = phase3CanAfford(recipe.inputs);

  return `
    <div class="recipe">
      <div>
        <strong>${recipe.icon} ${recipe.name}</strong>
        <small>${recipe.description}</small>
        <small>必要: ${inputText}</small>
      </div>
      <button class="small-button"
        data-phase3-action="craft"
        data-recipe="${recipe.id}"
        ${available ? "" : "disabled"}>製作</button>
    </div>
  `;
}

function phase3RenderRecipes() {
  const production = document.getElementById("productionList");
  const crafting = document.getElementById("craftingList");

  if (production) {
    production.innerHTML =
      `<div class="production-summary">採取した木材・鉱石を加工して、鍛冶や拠点発展へつなげます。</div>` +
      PRODUCTION_RECIPES.map(phase3RecipeHTML).join("");
  }

  if (crafting) {
    crafting.innerHTML =
      `<div class="production-summary">鍛冶・錬金・料理は採取資源を別の成長要素へ変換します。</div>` +
      CRAFT_RECIPES.map(phase3RecipeHTML).join("");
  }
}

function phase3Render() {
  phase3ProcessOffline();
  phase3RenderGathering();
  phase3RenderResources();
  phase3RenderRecipes();
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-phase3-action]");
  if (!button) return;

  const action = button.dataset.phase3Action;

  if (action === "assignment") {
    phase3SetAssignment(
      Number(button.dataset.adventurer),
      button.dataset.assignment
    );
  }

  if (action === "craft") {
    phase3Craft(button.dataset.recipe);
  }
});

phase3Init();

setInterval(() => {
  phase3ProcessOffline();
  phase3Render();
  saveState();
}, 10000);
