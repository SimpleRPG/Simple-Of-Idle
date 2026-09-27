const PHASE6_VERSION = 1;

const PHASE6_DEFAULT = {
  version: PHASE6_VERSION,
  rebirthCount: 0,
  rebirthPoints: 0,
  rebirthSpent: {},
  awakeningCount: 0,
  awakeningPoints: 0,
  awakeningSpent: {},
  transcendenceCount: 0,
  transcendencePoints: 0,
  transcendenceSpent: {},
  unlocked: {
    rebirth: false,
    awakening: false,
    transcendence: false
  },
  lastRebirthAt: null,
  lastAwakeningAt: null,
  lastTranscendenceAt: null
};

const PHASE6_REBIRTH_NODES = [
  {
    id: "rebirth-battle",
    name: "転生戦技",
    description: "転生後の戦闘攻撃力を恒久的に強化。",
    cost: 1,
    effect: { attack: 2 }
  },
  {
    id: "rebirth-experience",
    name: "輪廻の学習",
    description: "経験値獲得量を恒久的に強化。",
    cost: 1,
    effect: { xp: 0.05 }
  },
  {
    id: "rebirth-gold",
    name: "富の輪廻",
    description: "ゴールド獲得量を恒久的に強化。",
    cost: 1,
    effect: { gold: 0.05 }
  },
  {
    id: "rebirth-exploration",
    name: "再生探索",
    description: "探索速度を恒久的に強化。",
    cost: 2,
    effect: { exploration: 0.05 }
  },
  {
    id: "rebirth-production",
    name: "輪廻生産",
    description: "生産効率を恒久的に強化。",
    cost: 2,
    effect: { production: 0.05 }
  },
  {
    id: "rebirth-research",
    name: "輪廻研究",
    description: "研究進行を恒久的に強化。",
    cost: 2,
    effect: { research: 0.05 }
  },
  {
    id: "rebirth-depth",
    name: "深き輪廻",
    description: "上位プレステージへの必要転生回数を短縮する。",
    cost: 5,
    requires: "rebirth-battle",
    effect: { prestige: 1 }
  }
];

const PHASE6_AWAKENING_NODES = [
  {
    id: "awakening-power",
    name: "覚醒の力",
    description: "覚醒後の攻撃力を恒久強化。",
    cost: 1,
    effect: { attack: 5 }
  },
  {
    id: "awakening-speed",
    name: "覚醒速度",
    description: "探索と自動戦闘の進行を恒久強化。",
    cost: 1,
    effect: { speed: 0.08 }
  },
  {
    id: "awakening-discovery",
    name: "覚醒知覚",
    description: "発見・コレクション進行を恒久強化。",
    cost: 2,
    effect: { discovery: 0.08 }
  },
  {
    id: "awakening-research",
    name: "覚醒知識",
    description: "研究効率を恒久強化。",
    cost: 2,
    effect: { research: 0.1 }
  },
  {
    id: "awakening-resource",
    name: "覚醒採取",
    description: "資源獲得効率を恒久強化。",
    cost: 2,
    effect: { gathering: 0.1 }
  },
  {
    id: "awakening-automation",
    name: "覚醒自動化",
    description: "放置進行の効率を恒久強化。",
    cost: 3,
    effect: { idle: 0.1 }
  },
  {
    id: "awakening-gate",
    name: "超越への門",
    description: "超越への到達条件を満たすための上位ノード。",
    cost: 5,
    requires: "awakening-power",
    effect: { prestige: 1 }
  }
];

const PHASE6_TRANSCENDENCE_NODES = [
  {
    id: "transcendence-world",
    name: "世界超越",
    description: "新世界コンテンツへの恒久的なアクセス権を準備する。",
    cost: 1,
    effect: { world: 1 }
  },
  {
    id: "transcendence-class",
    name: "職業超越",
    description: "新しい職業体系への解禁枠を準備する。",
    cost: 1,
    effect: { class: 1 }
  },
  {
    id: "transcendence-production",
    name: "超越生産",
    description: "上位生産の効率を恒久強化。",
    cost: 2,
    effect: { production: 0.15 }
  },
  {
    id: "transcendence-research",
    name: "超越研究",
    description: "上位研究への進行効率を恒久強化。",
    cost: 2,
    effect: { research: 0.15 }
  },
  {
    id: "transcendence-dungeon",
    name: "超越探索",
    description: "高位ダンジョン・ボスへの進行を恒久強化。",
    cost: 2,
    effect: { dungeon: 0.1 }
  },
  {
    id: "transcendence-collection",
    name: "超越記録",
    description: "コレクションの恒久ボーナスを強化。",
    cost: 3,
    effect: { collection: 0.05 }
  },
  {
    id: "transcendence-infinity",
    name: "無限への扉",
    description: "次の世界・上位プレステージを受け入れる恒久枠。",
    cost: 5,
    requires: "transcendence-world",
    effect: { world: 1, prestige: 1 }
  }
];

function phase6EnsureState() {
  state.phase6 = {
    ...clone(PHASE6_DEFAULT),
    ...(state.phase6 || {}),
    unlocked: {
      ...PHASE6_DEFAULT.unlocked,
      ...(state.phase6?.unlocked || {})
    },
    rebirthSpent: { ...(state.phase6?.rebirthSpent || {}) },
    awakeningSpent: { ...(state.phase6?.awakeningSpent || {}) },
    transcendenceSpent: { ...(state.phase6?.transcendenceSpent || {}) }
  };

  state.phase6.version = PHASE6_VERSION;
}

function phase6PermanentLevels(nodes, spent) {
  const result = {};
  nodes.forEach(node => {
    result[node.id] = Number(spent[node.id]) || 0;
  });
  return result;
}

function phase6TreeEffect(nodes, spent) {
  const result = {};

  nodes.forEach(node => {
    const level = Number(spent[node.id]) || 0;
    Object.entries(node.effect || {}).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value * level;
    });
  });

  return result;
}

function phase6Effects() {
  phase6EnsureState();

  const rebirth = phase6TreeEffect(
    PHASE6_REBIRTH_NODES,
    state.phase6.rebirthSpent
  );

  const awakening = phase6TreeEffect(
    PHASE6_AWAKENING_NODES,
    state.phase6.awakeningSpent
  );

  const transcendence = phase6TreeEffect(
    PHASE6_TRANSCENDENCE_NODES,
    state.phase6.transcendenceSpent
  );

  const result = {};

  [rebirth, awakening, transcendence].forEach(group => {
    Object.entries(group).forEach(([key, value]) => {
      result[key] = (result[key] || 0) + value;
    });
  });

  return result;
}

function phase6TotalTreePoints(nodes, spent) {
  return nodes.reduce(
    (sum, node) => sum + node.cost * (Number(spent[node.id]) || 0),
    0
  );
}

function phase6CanUnlockNode(nodes, spent, node) {
  if (Number(spent[node.id]) > 0) return false;
  if (!node.requires) return true;
  return Number(spent[node.requires]) > 0;
}

function phase6SpendNode(type, nodeId) {
  phase6EnsureState();

  const config = {
    rebirth: {
      nodes: PHASE6_REBIRTH_NODES,
      spent: state.phase6.rebirthSpent,
      points: "rebirthPoints"
    },
    awakening: {
      nodes: PHASE6_AWAKENING_NODES,
      spent: state.phase6.awakeningSpent,
      points: "awakeningPoints"
    },
    transcendence: {
      nodes: PHASE6_TRANSCENDENCE_NODES,
      spent: state.phase6.transcendenceSpent,
      points: "transcendencePoints"
    }
  }[type];

  if (!config) return;

  const node = config.nodes.find(item => item.id === nodeId);
  if (!node || !phase6CanUnlockNode(config.nodes, config.spent, node)) return;

  if (state.phase6[config.points] < node.cost) {
    addLog(`${node.name} の解放には ${node.cost}ポイント必要。`);
    return;
  }

  state.phase6[config.points] -= node.cost;
  config.spent[node.id] = (Number(config.spent[node.id]) || 0) + 1;

  addLog(`✨ ${node.name} を解放した。`);
}

function phase6RebirthRequirement() {
  const level = Number(state.level) || 1;
  const kills = Number(state.kills) || 0;
  const research = Object.keys(state.phase4?.researchLevels || {}).length;

  return {
    unlocked: level >= 20 || kills >= 1000 || research >= 5,
    level,
    kills,
    research
  };
}

function phase6AwakeningRequirement() {
  return {
    unlocked:
      state.phase6.rebirthCount >= 5 &&
      phase6TotalTreePoints(PHASE6_REBIRTH_NODES, state.phase6.rebirthSpent) >= 5
  };
}

function phase6TranscendenceRequirement() {
  return {
    unlocked:
      state.phase6.awakeningCount >= 5 &&
      phase6TotalTreePoints(PHASE6_AWAKENING_NODES, state.phase6.awakeningSpent) >= 5
  };
}

function phase6RefreshUnlocks() {
  phase6EnsureState();

  const rebirth = phase6RebirthRequirement();
  const awakening = phase6AwakeningRequirement();
  const transcendence = phase6TranscendenceRequirement();

  state.phase6.unlocked.rebirth ||= rebirth.unlocked;
  state.phase6.unlocked.awakening ||= awakening.unlocked;
  state.phase6.unlocked.transcendence ||= transcendence.unlocked;
}

function phase6RebirthGain() {
  const level = Math.max(1, Number(state.level) || 1);
  const kills = Math.max(0, Number(state.kills) || 0);
  return Math.max(
    1,
    Math.floor(Math.sqrt(level / 10) + Math.sqrt(kills / 100))
  );
}

function phase6AwakeningGain() {
  return Math.max(
    1,
    Math.floor(
      Math.sqrt(state.phase6.rebirthCount / 5) +
      Math.sqrt(
        phase6TotalTreePoints(
          PHASE6_REBIRTH_NODES,
          state.phase6.rebirthSpent
        ) / 5
      )
    )
  );
}

function phase6TranscendenceGain() {
  return Math.max(
    1,
    Math.floor(
      Math.sqrt(state.phase6.awakeningCount / 5) +
      Math.sqrt(
        phase6TotalTreePoints(
          PHASE6_AWAKENING_NODES,
          state.phase6.awakeningSpent
        ) / 5
      )
    )
  );
}

function phase6ResetNormalProgress() {
  state.level = 1;
  state.xp = 0;
  state.gold = 0;
  state.kills = 0;
  state.zoneIndex = 0;

  if (Array.isArray(state.adventurers)) {
    state.adventurers.forEach((adventurer, index) => {
      adventurer.level = 1;
      adventurer.xp = 0;
      adventurer.equipment = index === 0
        ? (adventurer.equipment || []).slice(0, 1)
        : [];
      adventurer.phase5PermanentAttack =
        Number(adventurer.phase5PermanentAttack) || 0;
    });
  }

  if (state.phase3) {
    state.phase3.resources = {};
    state.phase3.produced = {};
    state.phase3.lastProcessedAt = Date.now();
  }

  if (state.phase4) {
    state.phase4.selectedMap = "村周辺";
    state.phase4.mode = "map";
    state.phase4.lastProcessedAt = Date.now();
    state.phase4.activeResearch = null;
    state.phase4.activeActivity = null;
    state.phase4.researchPoints = 0;
    state.phase4.researchLevels = {};
    state.phase4.mapProgress = {};
    state.phase4.dungeonProgress = {};
    state.phase4.bossProgress = {};
    state.phase4.raidProgress = {};
    state.phase4.discoveredUnknown = [];
    state.phase4.defeatedBosses = [];
    state.phase4.clearedDungeons = [];
    state.phase4.eventLog = [];
  }

  if (state.base) {
    state.base.level = 1;
    if (state.base.facilities) {
      Object.keys(state.base.facilities).forEach(key => {
        state.base.facilities[key] = 0;
      });
    }
  }
}

function phase6DoRebirth() {
  phase6RefreshUnlocks();

  if (!state.phase6.unlocked.rebirth) {
    addLog("転生条件をまだ満たしていない。");
    return;
  }

  const gain = phase6RebirthGain();
  state.phase6.rebirthPoints += gain;
  state.phase6.rebirthCount += 1;
  state.phase6.lastRebirthAt = Date.now();

  phase6ResetNormalProgress();

  addLog(`🔄 転生した。転生ポイント +${gain}`);
  phase6RefreshUnlocks();
}

function phase6DoAwakening() {
  phase6RefreshUnlocks();

  if (!state.phase6.unlocked.awakening) {
    addLog("覚醒条件をまだ満たしていない。");
    return;
  }

  const gain = phase6AwakeningGain();
  state.phase6.awakeningPoints += gain;
  state.phase6.awakeningCount += 1;
  state.phase6.lastAwakeningAt = Date.now();

  phase6ResetNormalProgress();

  addLog(`✨ 覚醒した。覚醒ポイント +${gain}`);
  phase6RefreshUnlocks();
}

function phase6DoTranscendence() {
  phase6RefreshUnlocks();

  if (!state.phase6.unlocked.transcendence) {
    addLog("超越条件をまだ満たしていない。");
    return;
  }

  const gain = phase6TranscendenceGain();
  state.phase6.transcendencePoints += gain;
  state.phase6.transcendenceCount += 1;
  state.phase6.lastTranscendenceAt = Date.now();

  phase6ResetNormalProgress();

  addLog(`⚡ 超越した。超越ポイント +${gain}`);
}

function phase6PatchStats() {
  if (typeof adventurerStats !== "function") return;
  if (window.__phase6StatsPatched) return;

  const original = adventurerStats;

  adventurerStats = function(adventurer) {
    const result = original(adventurer);
    const effects = phase6Effects();

    result.attack += Number(effects.attack || 0);
    result.speed = Math.max(
      0.1,
      result.speed * (
        1 +
        Number(effects.exploration || 0) +
        Number(effects.speed || 0) +
        Number(effects.idle || 0)
      )
    );

    result.xpMultiplier *= 1 + Number(effects.xp || 0);
    result.goldMultiplier *= 1 + Number(effects.gold || 0);

    return result;
  };

  window.__phase6StatsPatched = true;
}

function phase6PatchResourceGain() {
  if (typeof phase3AddResource !== "function") return;
  if (window.__phase6ResourcePatched) return;

  const original = phase3AddResource;

  phase3AddResource = function(id, amount, ...args) {
    const effects = phase6Effects();
    const adjusted =
      (Number(amount) || 0) *
      (1 + Number(effects.gathering || 0) + Number(effects.production || 0));

    return original.call(this, id, adjusted, ...args);
  };

  window.__phase6ResourcePatched = true;
}

function phase6PatchResearch() {
  if (typeof phase4StartResearch !== "function") return;
  if (window.__phase6ResearchPatched) return;

  const original = phase4StartResearch;

  phase4StartResearch = function(...args) {
    const effects = phase6Effects();
    const result = original.apply(this, args);

    if (state.phase4?.activeResearch) {
      state.phase4.activeResearch.phase6Speed =
        1 + Number(effects.research || 0);
    }

    return result;
  };

  window.__phase6ResearchPatched = true;
}

function phase6RenderTree(rootId, nodes, spent, points, type) {
  const root = document.getElementById(rootId);
  if (!root) return;

  root.innerHTML = nodes.map(node => {
    const level = Number(spent[node.id]) || 0;
    const owned = level > 0;
    const available = phase6CanUnlockNode(nodes, spent, node);
    const requires = node.requires
      ? `前提: ${nodes.find(item => item.id === node.requires)?.name || node.requires}`
      : "前提なし";

    return `
      <div class="phase6-node ${owned ? "unlocked" : available ? "" : "locked"}">
        <div class="phase6-node-head">
          <strong>${owned ? "✦" : "◇"} ${node.name}</strong>
          <span class="badge">${owned ? "Lv." + level : "未取得"}</span>
        </div>
        <small>${node.description}</small>
        <small>${requires}</small>
        <span class="phase6-cost">${node.cost}ポイント</span>
        <button
          class="small-button"
          data-phase6-action="node"
          data-phase6-type="${type}"
          data-phase6-id="${node.id}"
          ${!available || points < node.cost ? "disabled" : ""}
        >${owned ? "取得済み" : "解放"}</button>
      </div>
    `;
  }).join("");
}

function phase6Render() {
  phase6RefreshUnlocks();

  const effects = phase6Effects();

  document.getElementById("phase6RebirthStatus").textContent =
    state.phase6.unlocked.rebirth ? `転生 ${state.phase6.rebirthCount}回` : "未解禁";
  document.getElementById("phase6RebirthPoints").textContent =
    `${state.phase6.rebirthPoints} RP`;

  document.getElementById("phase6AwakeningStatus").textContent =
    state.phase6.unlocked.awakening
      ? `覚醒 ${state.phase6.awakeningCount}回`
      : "未解禁";
  document.getElementById("phase6AwakeningPoints").textContent =
    `${state.phase6.awakeningPoints} AP`;

  document.getElementById("phase6TranscendenceStatus").textContent =
    state.phase6.unlocked.transcendence
      ? `超越 ${state.phase6.transcendenceCount}回`
      : "未解禁";
  document.getElementById("phase6TranscendencePoints").textContent =
    `${state.phase6.transcendencePoints} TP`;

  const rebirthReq = phase6RebirthRequirement();
  const awakeningReq = phase6AwakeningRequirement();
  const transcendenceReq = phase6TranscendenceRequirement();

  document.getElementById("phase6RebirthPanel").innerHTML = `
    <div class="phase6-status">
      <div class="phase6-highlight">
        <strong>${phase6RebirthGain()} RP</strong>
        <small>現在の進行から獲得できる転生ポイント</small>
      </div>
      <div class="stats-list">
        <div><span>必要条件</span><b>Lv.20 / 1000討伐 / 研究5件のいずれか</b></div>
        <div><span>現在Lv.</span><b>${rebirthReq.level}</b></div>
        <div><span>討伐数</span><b>${rebirthReq.kills.toLocaleString()}</b></div>
        <div><span>研究件数</span><b>${rebirthReq.research}</b></div>
      </div>
      <button
        class="primary-button"
        data-phase6-action="rebirth"
        ${!state.phase6.unlocked.rebirth ? "disabled" : ""}
      >転生する</button>
    </div>
  `;

  document.getElementById("phase6AwakeningPanel").innerHTML = `
    <div class="phase6-status">
      <div class="phase6-highlight">
        <strong>${phase6AwakeningGain()} AP</strong>
        <small>現在の転生進行から獲得できる覚醒ポイント</small>
      </div>
      <div class="stats-list">
        <div><span>必要転生回数</span><b>5回</b></div>
        <div><span>現在転生回数</span><b>${state.phase6.rebirthCount}</b></div>
        <div><span>転生ツリー取得</span><b>${phase6TotalTreePoints(PHASE6_REBIRTH_NODES, state.phase6.rebirthSpent)}</b></div>
      </div>
      <button
        class="primary-button"
        data-phase6-action="awakening"
        ${!state.phase6.unlocked.awakening ? "disabled" : ""}
      >覚醒する</button>
      ${!state.phase6.unlocked.awakening ? `<small>条件: 転生5回以上 + 転生ツリー5ポイント以上</small>` : ""}
    </div>
  `;

  document.getElementById("phase6TranscendencePanel").innerHTML = `
    <div class="phase6-status">
      <div class="phase6-highlight">
        <strong>${phase6TranscendenceGain()} TP</strong>
        <small>現在の覚醒進行から獲得できる超越ポイント</small>
      </div>
      <div class="stats-list">
        <div><span>必要覚醒回数</span><b>5回</b></div>
        <div><span>現在覚醒回数</span><b>${state.phase6.awakeningCount}</b></div>
        <div><span>覚醒ツリー取得</span><b>${phase6TotalTreePoints(PHASE6_AWAKENING_NODES, state.phase6.awakeningSpent)}</b></div>
      </div>
      <button
        class="primary-button"
        data-phase6-action="transcendence"
        ${!state.phase6.unlocked.transcendence ? "disabled" : ""}
      >超越する</button>
      ${!state.phase6.unlocked.transcendence ? `<small>条件: 覚醒5回以上 + 覚醒ツリー5ポイント以上</small>` : ""}
    </div>
  `;

  phase6RenderTree(
    "phase6RebirthTree",
    PHASE6_REBIRTH_NODES,
    state.phase6.rebirthSpent,
    state.phase6.rebirthPoints,
    "rebirth"
  );

  phase6RenderTree(
    "phase6AwakeningTree",
    PHASE6_AWAKENING_NODES,
    state.phase6.awakeningSpent,
    state.phase6.awakeningPoints,
    "awakening"
  );

  phase6RenderTree(
    "phase6TranscendenceTree",
    PHASE6_TRANSCENDENCE_NODES,
    state.phase6.transcendenceSpent,
    state.phase6.transcendencePoints,
    "transcendence"
  );
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-phase6-action]");
  if (!button) return;

  const action = button.dataset.phase6Action;

  if (action === "rebirth") {
    phase6DoRebirth();
  }

  if (action === "awakening") {
    phase6DoAwakening();
  }

  if (action === "transcendence") {
    phase6DoTranscendence();
  }

  if (action === "node") {
    phase6SpendNode(
      button.dataset.phase6Type,
      button.dataset.phase6Id
    );
  }

  saveState();
  render();
  phase6Render();
});

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    if (button.dataset.tab === "phase6") {
      phase6Render();
    }
  });
});

phase6EnsureState();
phase6RefreshUnlocks();
phase6PatchStats();
phase6PatchResourceGain();
phase6PatchResearch();
phase6Render();
saveState();

setInterval(() => {
  phase6RefreshUnlocks();
  phase6Render();
  saveState();
}, 10000);
