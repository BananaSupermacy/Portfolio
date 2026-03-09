import lines from '/consoleLines.json';

console.log("console.js loaded");
console.log("consoleEl:", document.querySelector(".console"));
console.log("consoleText:", document.getElementById("output"));

const consoleText = document.getElementById("output");
const consoleEl   = document.querySelector(".console");

let currentChoice  = "";
let cursorInterval = null;


consoleEl.style.overflow   = "hidden";
consoleEl.style.userSelect = "none";


consoleText.appendChild(parseLine(lines[0].text));
appendPrompt();

// ── line parser ───────────────────────────────────────────────────────────────

function parseLine(raw) {
    const line     = document.createElement("div");
    line.className = "term-line";

    const match = raw.match(/^\[(\d{2}:\d{2}:\d{2})\] (guest@localhost:[^\$]+)(\$) (.*)$/);

    if (match) {
        const [, time, path, dollar, message] = match;

        const ts = document.createElement("span");
        ts.style.color = "#3d444d";
        ts.textContent = `[${time}] `;

        const pt = document.createElement("span");
        pt.style.color = "#4d9375";
        pt.textContent = path;

        const dl = document.createElement("span");
        dl.style.color = "#768390";
        dl.textContent = `${dollar} `;

        const msg = document.createElement("span");
        msg.style.color = getMessageColor(message);
        msg.textContent = message;

        line.append(ts, pt, dl, msg);
    } else {
        line.style.color = "#adbac7";
        line.textContent = raw;
    }

    return line;
}

function getMessageColor(message) {
    if (message.includes("✔"))                                       return "#57ab5a";
    if (/access granted|finished successfully/.test(message))        return "#57ab5a";
    if (/system ready|welcome/.test(message))                        return "#e3b341";
    if (/100%|optimization complete|render complete/.test(message))  return "#986ee2";
    if (/error|fail/.test(message))                                  return "#e5534b";
    if (/\.\.\.|loading|building/.test(message))                     return "#768390";
    return "#adbac7";
}

// ── section spacing ───────────────────────────────────────────────────────────

const SECTION_BREAKS = [5, 14, 23, 29, 33, 46, 58, 64, 69, 79, 86, 92, 96];

function maybeSpacer(id) {
    if (SECTION_BREAKS.includes(id)) {
        const spacer = document.createElement("div");
        spacer.style.height = "10px";
        consoleText.insertBefore(spacer, cursorRow());
    }
}

// ── cursor ────────────────────────────────────────────────────────────────────

function cursorRow() {
    return document.getElementById("cursor-row");
}

function appendCursor() {
    const row = document.createElement("div");
    row.id    = "cursor-row";
    row.style.cssText = "display:flex; align-items:center; margin-top:2px;";

    const block = document.createElement("span");
    block.id    = "cursor-block";
    block.style.cssText = `
        display: inline-block;
        width: 9px;
        height: 1.15em;
        background: #57ab5a;
        border-radius: 1px;
        vertical-align: middle;
    `;
    row.appendChild(block);
    consoleText.appendChild(row);

    cursorInterval = setInterval(() => {
        block.style.opacity = block.style.opacity === "0" ? "1" : "0";
    }, 530);
}

function removeCursor() {
    clearInterval(cursorInterval);
    const row = cursorRow();
    if (row) row.remove();
}

// ── prompt ────────────────────────────────────────────────────────────────────

function appendPrompt() {
    const prompt = document.createElement("div");
    prompt.id    = "prompt-line";
    prompt.style.cssText = "color:#768390; margin-top:4px;";
    prompt.textContent   = ">>> ";
    consoleText.appendChild(prompt);
    appendCursor();
}

// ── typewriter ────────────────────────────────────────────────────────────────

function typeCommand(text, callback) {
    const line = document.createElement("div");
    line.className = "term-line";

    const pt = document.createElement("span");
    pt.style.color = "#4d9375";
    pt.textContent = "guest@localhost:~/projects/portfolio";

    const dl = document.createElement("span");
    dl.style.color = "#768390";
    dl.textContent = "$ ";

    const msg = document.createElement("span");
    msg.style.color = "#adbac7";

    line.append(pt, dl, msg);
    consoleText.insertBefore(line, cursorRow());

    let i = 0;
    const interval = setInterval(() => {
        msg.textContent += text[i++];
        consoleEl.scrollTop = consoleEl.scrollHeight;
        if (i >= text.length) {
            clearInterval(interval);
            setTimeout(callback, 500);
        }
    }, 45);
}

// ── clear animation ───────────────────────────────────────────────────────────

function clearTerminal(callback) {
    const allLines = Array.from(consoleText.children);
    let i = 0;
    const interval = setInterval(() => {
        if (i < allLines.length) {
            allLines[i].style.transition = "opacity 0.05s";
            allLines[i].style.opacity    = "0";
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                consoleText.innerHTML = "";
                callback();
            }, 150);
        }
    }, 18);
}

// ── minimize to corner ────────────────────────────────────────────────────────

function minimizeToCorner() {
    sessionStorage.setItem("consoleMinimized", "true");

    // show portfolio
    const portfolio = document.getElementById("portfolio");
    if (portfolio) {
        portfolio.style.display = "block";
        requestAnimationFrame(() => { portfolio.style.opacity = "1"; });
    }

    const rect = consoleEl.getBoundingClientRect();

    // lock to current position before animating
    consoleEl.style.position = "fixed";
    consoleEl.style.top      = rect.top    + "px";
    consoleEl.style.left     = rect.left   + "px";
    consoleEl.style.width    = rect.width  + "px";
    consoleEl.style.height   = rect.height + "px";
    consoleEl.style.margin   = "0";
    consoleEl.style.overflow = "hidden";
    consoleEl.style.zIndex   = "999";

    // add label
    const label = document.createElement("div");
    label.id    = "mini-label";
    label.style.cssText = `
        display: none;
        padding: 8px 12px;
        font-size: 12px;
        color: #4d9375;
        letter-spacing: 0.05em;
    `;
    label.textContent = "guest@localhost ~";
    consoleEl.prepend(label);

    // animate to pill
    requestAnimationFrame(() => {
        consoleEl.style.transition   = "all 0.7s cubic-bezier(0.76, 0, 0.24, 1)";
        consoleEl.style.top          = "24px";
        consoleEl.style.left         = "24px";
        consoleEl.style.width        = "280px";
        consoleEl.style.height       = "38px";
        consoleEl.style.borderRadius = "8px";
        consoleEl.style.border       = "1px solid #21262d";
        consoleEl.style.padding      = "0";
        consoleEl.style.cursor       = "pointer";
        consoleEl.style.boxShadow    = "0 4px 24px rgba(0,0,0,0.4)";

        setTimeout(() => {
            consoleText.style.display = "none";
            label.style.display       = "block";

            const topbar = document.getElementById("topbar");
            if (topbar) {
                topbar.style.opacity = "1";
            }
        }, 700);
    });
}

// ── streaming ─────────────────────────────────────────────────────────────────

function printOutput() {
    const remaining = lines.slice(1);
    let i = 0;

    const promptLine = document.getElementById("prompt-line");
    if (promptLine) promptLine.remove();
    removeCursor();
    appendCursor();

    function next() {
        if (i >= remaining.length) {
            removeCursor();

            document.body.style.overflow = 'auto';
            consoleEl.style.overflow   = "auto";
            consoleEl.style.userSelect = "auto";

            setTimeout(() => {
                typeCommand("exec ./portfolio --open", () => {
                    clearTerminal(() => {
                        const cleared = document.createElement("div");
                        cleared.style.color    = "#3d444d";
                        cleared.style.fontSize = "12px";
                        cleared.textContent    = "launching portfolio...";
                        consoleText.appendChild(cleared);

                        setTimeout(() => minimizeToCorner(), 400);
                    });
                });
            }, 600);

            return;
        }

        const entry  = remaining[i++];
        const row    = cursorRow();
        const lineEl = parseLine(entry.text);
        consoleText.insertBefore(lineEl, row);

        maybeSpacer(entry.id);
        consoleEl.scrollTop = consoleEl.scrollHeight;

        const delay = entry.text.includes("...") ? 180 : 90;
        setTimeout(next, delay);
    }

    next();
}

// ── key handler ───────────────────────────────────────────────────────────────

function handleKey(event) {
    const key = event.key;

    if (key === "Backspace") {
        currentChoice = "";
    }

    if (key.toLowerCase() === "y" || key.toLowerCase() === "n") {
        currentChoice = key.toLowerCase();
    }

    if (key === "Enter" && currentChoice !== "") {
        const promptLine = document.getElementById("prompt-line");
        if (promptLine) {
            promptLine.textContent = ">>> " + currentChoice;
            promptLine.id = "";
        }

        if (currentChoice === "n") {
            const nope = document.createElement("div");
            nope.style.cssText = "color:#e5534b; margin-top:4px;";
            nope.textContent   = "[67:67:67] bozo@localhost:~$ it's still gonna boot bozo";
            consoleText.insertBefore(nope, cursorRow());
        }

        currentChoice = "";
        document.removeEventListener("keydown", handleKey);

        printOutput();
        return;
    }

    const promptLine = document.getElementById("prompt-line");
    if (promptLine) promptLine.textContent = ">>> " + currentChoice;
}

document.addEventListener("keydown", handleKey);
