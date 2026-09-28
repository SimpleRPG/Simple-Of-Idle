(() => {
  "use strict";

  let context = {
    phase: "初期化",
    file: "",
    operation: "",
    screen: ""
  };

  let modal = null;
  let lastPayload = null;
  let lastKey = "";
  let lastAt = 0;
  let retryAction = null;

  function screen() {
    const active = document.querySelector(".tab-panel.active, .tab-panel:not(.hidden)");
    if (!active) return "不明";
    const id = active.id || "";
    return id.replace(/^tab-/, "") || "不明";
  }

  function fileFromStack(stack) {
    const match = String(stack || "").match(
      /(?:at\s+.*?\()?((?:https?:\/\/|file:\/\/|\/)[^)\s]+):(\d+):(\d+)/
    );
    if (!match) return "";
    try {
      return decodeURIComponent(match[1]) + ":" + match[2] + ":" + match[3];
    } catch {
      return match[1] + ":" + match[2] + ":" + match[3];
    }
  }

  function normalize(error) {
    const value = error instanceof Error
      ? error
      : new Error(typeof error === "string" ? error : JSON.stringify(error));

    return {
      name: value.name || "Error",
      message: value.message || String(value),
      stack: value.stack || "",
      file: fileFromStack(value.stack)
    };
  }

  function ensureModal() {
    if (modal) return modal;

    modal = document.createElement("section");
    modal.id = "simpleIdleErrorModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="simpleIdleErrorBackdrop"></div>
      <div class="simpleIdleErrorDialog" role="alertdialog" aria-modal="true">
        <div class="simpleIdleErrorHeader">
          <div>
            <small>SIMPLE-OF-IDLE ERROR HANDLER</small>
            <h2>処理中にエラーが発生しました</h2>
          </div>
          <button type="button" data-error-close>閉じる</button>
        </div>

        <div class="simpleIdleErrorStatus" data-error-status></div>

        <div class="simpleIdleErrorGrid">
          <div><span>エラー種別</span><strong data-error-name></strong></div>
          <div><span>発生画面</span><strong data-error-screen></strong></div>
          <div><span>実行中の処理</span><strong data-error-operation></strong></div>
          <div><span>発生元ファイル</span><strong data-error-file></strong></div>
        </div>

        <div class="simpleIdleErrorSection">
          <span>エラー内容</span>
          <pre data-error-message></pre>
        </div>

        <div class="simpleIdleErrorSection">
          <span>スタックトレース</span>
          <pre data-error-stack></pre>
        </div>

        <div class="simpleIdleErrorActions">
          <button type="button" data-error-copy>エラーログをコピー</button>
          <button type="button" data-error-retry>現在の処理を再試行</button>
          <button type="button" data-error-reload>ページを再読み込み</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("[data-error-close]").onclick = hide;

    modal.querySelector("[data-error-retry]").onclick = () => {
      const retry = retryAction;
      hide();
      if (typeof retry !== "function") {
        window.location.reload();
        return;
      }
      try {
        retry();
        clearContext();
        setRetry(null);
      } catch (error) {
        report(error, context);
      }
    };

    modal.querySelector("[data-error-reload]").onclick = () => {
      window.location.reload();
    };

    modal.querySelector("[data-error-copy]").onclick = async event => {
      if (!lastPayload) return;

      const text = [
        "SIMPLE-OF-IDLE ERROR LOG",
        "=========================",
        "エラー種別: " + lastPayload.name,
        "発生画面: " + lastPayload.screen,
        "実行中の処理: " + lastPayload.operation,
        "発生元ファイル: " + lastPayload.file,
        "エラー内容: " + lastPayload.message,
        "スタックトレース:",
        lastPayload.stack || "取得できませんでした。",
        ""
      ].join("\n");

      let copied = false;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          copied = true;
        }
      } catch {}

      if (!copied) {
        try {
          const area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          copied = document.execCommand("copy");
          area.remove();
        } catch {}
      }

      const button = event.currentTarget;
      const previous = button.textContent;
      button.textContent = copied ? "コピーしました" : "コピーに失敗しました";
      setTimeout(() => { button.textContent = previous; }, 1500);
    };

    return modal;
  }

  function show(error, meta = {}) {
    const value = normalize(error);
    const merged = { ...context, ...meta };
    const source = meta.file || merged.file || value.file || "取得できませんでした";

    lastPayload = {
      name: value.name,
      message: value.message,
      stack: value.stack,
      screen: merged.screen || screen(),
      operation: merged.operation || "不明",
      file: source
    };

    const panel = ensureModal();

    panel.querySelector("[data-error-status]").textContent =
      merged.phase || "異常検知";
    panel.querySelector("[data-error-name]").textContent =
      lastPayload.name;
    panel.querySelector("[data-error-screen]").textContent =
      lastPayload.screen;
    panel.querySelector("[data-error-operation]").textContent =
      lastPayload.operation;
    panel.querySelector("[data-error-file]").textContent =
      lastPayload.file;
    panel.querySelector("[data-error-message]").textContent =
      lastPayload.message;
    panel.querySelector("[data-error-stack]").textContent =
      lastPayload.stack || "スタックトレースを取得できませんでした。";

    panel.hidden = false;
    document.body.classList.add("simpleIdleErrorActive");

    console.error("[Simple-Of-Idle Error]", lastPayload);
  }

  function report(error, meta = {}) {
    const value = normalize(error);
    const key = value.name + "|" + value.message + "|" +
      (meta.file || context.file || value.file || "");
    const now = Date.now();

    if (key === lastKey && now - lastAt < 1500) return;

    lastKey = key;
    lastAt = now;

    show(value, {
      ...context,
      ...meta,
      screen: meta.screen || context.screen || screen()
    });
  }

  function hide() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("simpleIdleErrorActive");
  }

  function setContext(meta = {}) {
    context = {
      ...context,
      ...meta,
      screen: meta.screen || screen()
    };
  }

  function setRetry(fn) {
    retryAction = typeof fn === "function" ? fn : null;
  }

  function clearContext() {
    context = {
      phase: "待機",
      file: "",
      operation: "",
      screen: screen()
    };
  }

  function run(operation, fn, meta = {}) {
    const previous = { ...context };
    setContext({ ...meta, operation });

    try {
      return fn();
    } catch (error) {
      report(error, { ...meta, operation });
      throw error;
    } finally {
      context = previous;
    }
  }

  window.addEventListener("error", event => {
    report(
      event.error || new Error(event.message || "Unknown error"),
      {
        phase: "グローバル例外",
        operation: context.operation || "ブラウザイベント処理",
        file: event.filename
          ? event.filename + ":" + event.lineno + ":" + event.colno
          : context.file
      }
    );
  });

  window.addEventListener("unhandledrejection", event => {
    report(
      event.reason instanceof Error
        ? event.reason
        : new Error("Unhandled Promise rejection: " + String(event.reason)),
      {
        phase: "未処理Promise例外",
        operation: context.operation || "非同期処理"
      }
    );
  });

  window.SimpleIdleErrorHandler = {
    setContext,
    clearContext,
    setRetry,
    run,
    report,
    show,
    hide,
    getContext: () => ({ ...context }),
    retry: () => window.location.reload()
  };

  function installStyle() {
    if (document.getElementById("simpleIdleErrorStyle")) return;

    const style = document.createElement("style");
    style.id = "simpleIdleErrorStyle";
    style.textContent = `
      #simpleIdleErrorModal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        padding: 16px;
        box-sizing: border-box;
      }

      #simpleIdleErrorModal[hidden] {
        display: none;
      }

      .simpleIdleErrorBackdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,.78);
        backdrop-filter: blur(4px);
      }

      .simpleIdleErrorDialog {
        position: relative;
        width: min(760px,100%);
        max-height: 88vh;
        overflow: auto;
        box-sizing: border-box;
        padding: 18px;
        border: 1px solid rgba(235,103,103,.58);
        border-radius: 14px;
        background: #17191d;
        color: #eee;
        box-shadow: 0 18px 60px rgba(0,0,0,.55);
      }

      .simpleIdleErrorHeader {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .simpleIdleErrorHeader small {
        opacity: .65;
        letter-spacing: .08em;
      }

      .simpleIdleErrorHeader h2 {
        margin: 5px 0 0;
        font-size: 20px;
      }

      .simpleIdleErrorHeader button,
      .simpleIdleErrorActions button {
        border: 1px solid rgba(255,255,255,.18);
        border-radius: 8px;
        background: #252931;
        color: #fff;
        padding: 9px 12px;
      }

      .simpleIdleErrorStatus {
        margin: 14px 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(220,82,82,.12);
        border: 1px solid rgba(220,82,82,.25);
      }

      .simpleIdleErrorGrid {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 9px;
      }

      .simpleIdleErrorGrid > div,
      .simpleIdleErrorSection {
        padding: 10px;
        border-radius: 8px;
        background: #202329;
      }

      .simpleIdleErrorGrid span,
      .simpleIdleErrorSection > span {
        display: block;
        font-size: 11px;
        opacity: .62;
        margin-bottom: 5px;
      }

      .simpleIdleErrorGrid strong {
        display: block;
        overflow-wrap: anywhere;
        font-size: 13px;
      }

      .simpleIdleErrorSection {
        margin-top: 9px;
      }

      .simpleIdleErrorSection pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font: 12px/1.5 monospace;
      }

      .simpleIdleErrorActions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 14px;
      }

      @media(max-width:560px) {
        .simpleIdleErrorGrid {
          grid-template-columns: 1fr;
        }

        .simpleIdleErrorDialog {
          padding: 14px;
        }
      }

      body.simpleIdleErrorActive {
        overflow: hidden;
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installStyle, { once: true });
  } else {
    installStyle();
  }
})();
