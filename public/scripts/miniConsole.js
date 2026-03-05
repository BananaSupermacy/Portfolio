// ── shared mini-console logic ─────────────────────────────────────────────────
// Used by both console.js (after intro) and on every subsequent page load.

function buildMiniConsole(consoleEl, consoleText) {

    // apply fixed pill styles immediately (no animation)
    consoleEl.style.cssText = `
        position: fixed;
        top: 24px;
        left: 24px;
        width: 280px;
        height: 38px;
        border-radius: 8px;
        border: 1px solid #21262d;
        padding: 0;
        margin: 0;
        overflow: hidden;
        z-index: 999;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        background: #0D1117;
        font-family: "JetBrains Mono", monospace;
    `;

    consoleText.style.display = "none";

    // label bar
    let label = document.getElementById("mini-label");
    if (!label) {
        label = document.createElement("div");
        label.id = "mini-label";
        consoleEl.prepend(label);
    }
    label.style.cssText = `
        display: block;
        padding: 8px 12px;
        font-size: 12px;
        color: #4d9375;
        letter-spacing: 0.05em;
    `;
    label.textContent = "guest@localhost ~";
}

// ── page load check ───────────────────────────────────────────────────────────
// If intro already ran, rebuild the mini box immediately on any page.

if (sessionStorage.getItem("consoleMinimized") === "true") {
    const consoleEl   = document.querySelector(".console");
    const consoleText = document.getElementById("output");
    const topbar = document.getElementById("topbar");

    if (topbar) topbar.style.opacity = "1";

    if (consoleEl && consoleText) {
        // show portfolio immediately too
        const portfolio = document.getElementById("portfolio");
        if (portfolio) {
            portfolio.style.display = "block";
            portfolio.style.opacity = "1";
        }

        buildMiniConsole(consoleEl, consoleText);
    }
}