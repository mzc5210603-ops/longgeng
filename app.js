/* ============ 工具格 TOOLGRID — 逻辑 ============ */
"use strict";

/* ---------- 工具注册表 ---------- */
const TOOLS = [
  { id:"pwd",    name:"密码生成器",  tag:"安全",   icon:"🔑", sticker:"b-blue",   desc:"按规则随机生成高强度密码，可调长度与字符集。" },
  { id:"uuid",   name:"UUID 批量",  tag:"开发",   icon:"🏷️", sticker:"b-red",    desc:"一键生成 v4 UUID，支持批量与去横线格式。" },
  { id:"b64",    name:"Base64",     tag:"编解码", icon:"🧱", sticker:"b-yellow", desc:"文本与 Base64 互转，支持 UTF-8 中文。" },
  { id:"url",    name:"URL 编解码", tag:"编解码", icon:"🔗", sticker:"b-white",  desc:"encodeURIComponent / decodeURIComponent 互转。" },
  { id:"json",   name:"JSON 美化",  tag:"开发",   icon:"📐", sticker:"b-blue",   desc:"格式化、压缩与校验 JSON，错误行号提示。" },
  { id:"stamp",  name:"时间戳",     tag:"时间",   icon:"⏱️", sticker:"b-red",    desc:"秒/毫秒时间戳与日期双向转换。" },
  { id:"color",  name:"颜色转换",   tag:"设计",   icon:"🎨", sticker:"b-yellow", desc:"HEX / RGB / HSL 互转，实时色块预览。" },
  { id:"radix",  name:"进制转换",   tag:"开发",   icon:"🔀", sticker:"b-white",  desc:"2~36 进制任意互转，含位宽补零。" },
  { id:"count",  name:"字数统计",   tag:"文本",   icon:"✍️", sticker:"b-blue",   desc:"字数、词数、行数、字符数一屏看清。" },
  { id:"dice",   name:"掷骰子",     tag:"随机",   icon:"🎲", sticker:"b-red",    desc:"六面骰动画抽取，可连续多掷。" },
  { id:"lorem",  name:"占位文本",   tag:"文本",   icon:"📄", sticker:"b-yellow", desc:"生成中英占位段落，段落与句数可调。" },
  { id:"case",   name:"大小写",     tag:"文本",   icon:"🔠", sticker:"b-white",  desc:"全大写、全小写、驼峰、下划线一键切换。" },
];

/* ---------- 工具卡片渲染 ---------- */
const grid = document.getElementById("toolGrid");
TOOLS.forEach((t, i) => {
  const card = document.createElement("article");
  card.className = "tool-card";
  card.dataset.id = t.id;
  card.innerHTML = `
    <div class="tc-sticker ${t.sticker}">${t.icon}</div>
    <span class="tc-num">NO.${String(i + 1).padStart(2, "0")}</span>
    <h3 class="tc-name">${t.name}</h3>
    <p class="tc-desc">${t.desc}</p>
    <span class="tc-tag">${t.tag}</span>
    <div class="tc-open"><span>OPEN TOOL</span><span class="arr">→</span></div>`;
  card.addEventListener("click", () => openWorkbench(t));
  grid.appendChild(card);
});

/* ---------- 跑马灯 ---------- */
const TICKER_ITEMS = [
  "纯本地运行","不上传任何数据","<b>12</b> 件工具随取随用","零依赖零框架",
  "密码 · UUID · Base64 · JSON","时间戳 · 颜色 · 进制 · 字数","骰子 · 占位文本 · 大小写",
];
const half = TICKER_ITEMS.map(s => `<span>★ ${s}</span>`).join("");
document.getElementById("tickerTrack").innerHTML = half + half;

/* ---------- 工作台 ---------- */
const wb = document.getElementById("workbench");
const wbBody = document.getElementById("wbBody");
const wbName = document.getElementById("wbName");
const wbTag  = document.getElementById("wbTag");
const wbIcon = document.getElementById("wbIcon");

function openWorkbench(t) {
  wbName.textContent = t.name;
  wbTag.textContent  = "TOOL / " + t.tag;
  wbIcon.textContent = t.icon;
  wbBody.innerHTML = "";
  RENDER[t.id](wbBody);
  wb.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeWorkbench() {
  wb.hidden = true;
  document.body.style.overflow = "";
}
document.getElementById("wbClose").addEventListener("click", closeWorkbench);
wb.addEventListener("click", e => { if (e.target === wb) closeWorkbench(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !wb.hidden) closeWorkbench(); });

/* ---------- 控件工厂 ---------- */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
function label(text) { return el("label", "wb-label", text); }
function btn(text, primary) {
  const b = el("button", "wb-btn" + (primary ? " primary" : ""), text);
  return b;
}
function outBox(container, initial) {
  const out = el("div", "wb-out", initial || "—");
  container.appendChild(out);
  return out;
}
function withCopy(container, out) {
  const bar = el("div", "wb-row");
  const cb = btn("复制结果");
  const ok = el("span", "copy-ok", "已复制 ✓");
  ok.style.display = "none";
  cb.addEventListener("click", () => {
    navigator.clipboard.writeText(out.textContent).then(() => {
      ok.style.display = "";
      setTimeout(() => ok.style.display = "none", 1400);
    });
  });
  bar.append(cb, ok);
  container.appendChild(bar);
  return out;
}

/* ---------- 各工具实现 ---------- */
const RENDER = {};

/* 密码生成器 */
RENDER.pwd = box => {
  const row = el("div", "wb-row");
  row.append(label("长度"), null);
  box.innerHTML = "";
  const lab = label("密码长度");
  box.append(lab);
  const lenSel = el("select", "wb-select");
  [8, 12, 16, 20, 24, 32].forEach(n => {
    const o = el("option", "", n + " 位");
    o.value = n;
    if (n === 16) o.selected = true;
    lenSel.appendChild(o);
  });
  box.appendChild(lenSel);
  box.appendChild(el("div", "", "&nbsp;"));
  const checks = el("div", "wb-row");
  const mk = (txt, key, checked) => {
    const l = el("label", "wb-check");
    const c = el("input"); c.type = "checkbox"; c.checked = checked;
    l.append(c, document.createTextNode(txt));
    l.dataset.key = key;
    checks.appendChild(l);
    return c;
  };
  mk("大写 A-Z", "up", true);
  mk("小写 a-z", "low", true);
  mk("数字 0-9", "num", true);
  mk("符号 !@#", "sym", true);
  box.appendChild(checks);
  const bar = el("div", "wb-row");
  const gen = btn("生成密码", true);
  bar.appendChild(gen);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  const SETS = {
    up: "ABCDEFGHJKLMNPQRSTUVWXYZ",
    low: "abcdefghijkmnpqrstuvwxyz",
    num: "23456789",
    sym: "!@#$%^&*-_=+?",
  };
  function generate() {
    const len = +lenSel.value;
    let pool = "", ok = true;
    checks.querySelectorAll(".wb-check").forEach(l => {
      if (l.querySelector("input").checked) pool += SETS[l.dataset.key];
      else ok = false;
    });
    if (!pool) { out.textContent = "请至少勾选一种字符集"; return; }
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let pwd = "";
    for (let i = 0; i < len; i++) pwd += pool[arr[i] % pool.length];
    out.textContent = pwd;
  }
  gen.addEventListener("click", generate);
  generate();
};

/* UUID */
RENDER.uuid = box => {
  box.appendChild(label("生成数量"));
  const num = el("input", "wb-input");
  num.type = "number"; num.min = 1; num.max = 100; num.value = 5;
  box.appendChild(num);
  box.appendChild(el("div", "", "&nbsp;"));
  const checks = el("div", "wb-row");
  const dash = el("label", "wb-check");
  const dc = el("input"); dc.type = "checkbox"; dc.checked = true;
  dash.append(dc, document.createTextNode("保留横线 -"));
  checks.appendChild(dash);
  box.appendChild(checks);
  const bar = el("div", "wb-row");
  const gen = btn("批量生成", true);
  bar.appendChild(gen);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  function fmt(u) { return dc.checked ? u : u.replace(/-/g, ""); }
  function generate() {
    const n = Math.min(100, Math.max(1, +num.value || 1));
    const list = Array.from({ length: n }, () => fmt(crypto.randomUUID()));
    out.innerHTML = list.map(u => `<div>${u}</div>`).join("");
  }
  gen.addEventListener("click", generate);
  generate();
};

/* Base64 */
RENDER.b64 = box => {
  box.appendChild(label("输入文本"));
  const ta = el("textarea", "wb-textarea");
  ta.placeholder = "输入要编码或解码的内容…";
  box.appendChild(ta);
  const bar = el("div", "wb-row");
  const enc = btn("→ 编码");
  const dec = btn("→ 解码");
  bar.append(enc, dec);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  const b64enc = s => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  const b64dec = s => new TextDecoder().decode(Uint8Array.from(atob(s.trim()), c => c.charCodeAt(0)));
  enc.addEventListener("click", () => {
    try { out.textContent = b64enc(ta.value); } catch { out.textContent = "编码失败"; }
  });
  dec.addEventListener("click", () => {
    try { out.textContent = b64dec(ta.value); } catch { out.textContent = "解码失败：不是合法的 Base64"; }
  });
};

/* URL 编解码 */
RENDER.url = box => {
  box.appendChild(label("输入文本"));
  const ta = el("textarea", "wb-textarea");
  ta.placeholder = "输入 URL 或文本…";
  box.appendChild(ta);
  const bar = el("div", "wb-row");
  const enc = btn("→ 编码");
  const dec = btn("→ 解码");
  bar.append(enc, dec);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  enc.addEventListener("click", () => { out.textContent = encodeURIComponent(ta.value); });
  dec.addEventListener("click", () => {
    try { out.textContent = decodeURIComponent(ta.value); }
    catch { out.textContent = "解码失败：非法转义序列"; }
  });
};

/* JSON */
RENDER.json = box => {
  box.appendChild(label("JSON 文本"));
  const ta = el("textarea", "wb-textarea");
  ta.placeholder = '{"name":"toolgrid","list":[1,2,3]}';
  box.appendChild(ta);
  const bar = el("div", "wb-row");
  const fmt = btn("美化", true);
  const min = btn("压缩");
  bar.append(fmt, min);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  function run(space) {
    try {
      const o = JSON.parse(ta.value);
      out.innerHTML = "<pre style='margin:0;white-space:pre-wrap'>" +
        JSON.stringify(o, null, space).replace(/</g, "&lt;") + "</pre>";
    } catch (e) {
      out.textContent = "✕ " + e.message;
      const m = /position (\d+)/.exec(e.message);
      if (m) {
        const pos = +m[1];
        const line = ta.value.slice(0, pos).split("\n").length;
        out.textContent += "（约在第 " + line + " 行，第 " + (pos - ta.value.lastIndexOf("\n", pos - 1)) + " 列）";
      }
    }
  }
  fmt.addEventListener("click", () => run(2));
  min.addEventListener("click", () => run(0));
};

/* 时间戳 */
RENDER.stamp = box => {
  box.appendChild(label("当前时间"));
  const now = outBox(box);
  const tick = () => {
    const d = new Date();
    now.innerHTML = d.toLocaleString("zh-CN", { hour12: false }) +
      `<br>秒级 ${Math.floor(d.getTime() / 1000)} · 毫秒级 ${d.getTime()}`;
  };
  tick();
  setInterval(tick, 1000);

  box.appendChild(el("div", "", "&nbsp;"));
  box.appendChild(label("时间戳 → 日期"));
  const r1 = el("div", "wb-row");
  const inp1 = el("input", "wb-input");
  inp1.placeholder = "如 1760000000 或 1760000000000";
  const go1 = btn("转换");
  r1.append(inp1, go1);
  box.appendChild(r1);
  const out1 = outBox(box);

  box.appendChild(el("div", "", "&nbsp;"));
  box.appendChild(label("日期 → 时间戳"));
  const inp2 = el("input", "wb-input");
  inp2.placeholder = "如 2026-09-22 12:00:00";
  const go2 = btn("转换");
  const r2 = el("div", "wb-row");
  r2.append(inp2, go2);
  box.appendChild(r2);
  const out2 = outBox(box);

  go1.addEventListener("click", () => {
    const raw = inp1.value.trim();
    if (!/^\d+$/.test(raw)) { out1.textContent = "请输入纯数字时间戳"; return; }
    let n = +raw;
    if (raw.length === 10) n *= 1000;
    const d = new Date(n);
    if (isNaN(d)) { out1.textContent = "时间戳超出范围"; return; }
    out1.innerHTML = d.toLocaleString("zh-CN", { hour12: false }) +
      "（" + d.toISOString() + "）";
  });
  go2.addEventListener("click", () => {
    const d = new Date(inp2.value.trim().replace(" ", "T"));
    if (isNaN(d)) { out2.textContent = "日期格式无效，试试 2026-09-22 12:00:00"; return; }
    out2.innerHTML = "秒级 " + Math.floor(d.getTime() / 1000) + "<br>毫秒级 " + d.getTime();
  });
};

/* 颜色转换 */
RENDER.color = box => {
  const swatch = el("div", "color-swatch");
  box.appendChild(swatch);
  box.appendChild(label("HEX"));
  const hex = el("input", "wb-input");
  hex.value = "#2438ff";
  box.appendChild(hex);
  const out = outBox(box);
  withCopy(box, out);
  function show() {
    let h = hex.value.trim();
    if (/^#?[0-9a-f]{6}$/i.test(h)) {
      if (h[0] !== "#") h = "#" + h;
      hex.value = h;
      const r = parseInt(h.slice(1, 3), 16),
            g = parseInt(h.slice(3, 5), 16),
            b = parseInt(h.slice(5, 7), 16);
      const [R, G, B] = [r / 255, g / 255, b / 255];
      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      const l = (max + min) / 2;
      const d = max - min;
      let s = 0, hue = 0;
      if (d) {
        s = l > .5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case R: hue = ((G - B) / d + (G < B ? 6 : 0)); break;
          case G: hue = (B - R) / d + 2; break;
          default: hue = (R - G) / d + 4;
        }
        hue *= 60;
      }
      swatch.style.background = h;
      out.innerHTML =
        `HEX&nbsp; ${h.toUpperCase()}<br>` +
        `RGB&nbsp; rgb(${r}, ${g}, ${b})<br>` +
        `HSL&nbsp; hsl(${Math.round(hue)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    } else {
      out.textContent = "请输入 6 位十六进制颜色，如 #2438FF";
      swatch.style.background = "transparent";
    }
  }
  hex.addEventListener("input", show);
  show();
};

/* 进制转换 */
RENDER.radix = box => {
  box.appendChild(label("输入数值"));
  const val = el("input", "wb-input");
  val.value = "255";
  box.appendChild(val);
  const r1 = el("div", "wb-row");
  r1.appendChild(label("输入进制"));
  const sel = el("select", "wb-select");
  for (let i = 2; i <= 36; i++) {
    const o = el("option", "", i + " 进制");
    o.value = i;
    if (i === 10) o.selected = true;
    sel.appendChild(o);
  }
  r1.appendChild(sel);
  box.appendChild(r1);
  box.appendChild(label("补零位宽（可选）"));
  const pad = el("input", "wb-input");
  pad.type = "number"; pad.min = 0; pad.max = 32; pad.value = 8;
  box.appendChild(pad);
  const bar = el("div", "wb-row");
  const go = btn("全部转换", true);
  bar.appendChild(go);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  go.addEventListener("click", () => {
    const v = parseInt(val.value.trim(), +sel.value);
    if (isNaN(v)) { out.textContent = "在 " + sel.value + " 进制下无法解析：" + val.value; return; }
    const p = Math.min(32, Math.max(0, +pad.value || 0));
    const line = (r, name) => {
      let s = v.toString(r).toUpperCase();
      if (p && r === 2) s = s.padStart(p, "0");
      return name + "&nbsp; " + s;
    };
    out.innerHTML = [line(2, "BIN "), line(8, "OCT "), line(10, "DEC "), line(16, "HEX ")]
      .map(s => "<div>" + s + "</div>").join("");
  });
  go.click();
};

/* 字数统计 */
RENDER.count = box => {
  box.appendChild(label("粘贴文本"));
  const ta = el("textarea", "wb-textarea");
  ta.placeholder = "把文章粘进来，实时统计…";
  box.appendChild(ta);
  const out = outBox(box);
  function stat() {
    const t = ta.value;
    const cjk = (t.match(/[\u4e00-\u9fff]/g) || []).length;
    const words = (t.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9_'-]+/g) || []).length;
    out.innerHTML =
      `<div>汉字 ${cjk}</div>` +
      `<div>英文单词 ${words}</div>` +
      `<div>字符数（不含空格）${t.replace(/\s/g, "").length}</div>` +
      `<div>字符数（含空格）${t.length}</div>` +
      `<div>行数 ${t ? t.split("\n").length : 0}</div>` +
      `<div>段落数 ${t.split(/\n\s*\n/).filter(s => s.trim()).length}</div>`;
  }
  ta.addEventListener("input", stat);
  stat();
};

/* 掷骰子 */
RENDER.dice = box => {
  const face = el("div", "dice-face");
  for (let i = 0; i < 9; i++) face.appendChild(el("i"));
  box.appendChild(face);
  const bar = el("div", "wb-row");
  const roll = btn("掷一次", true);
  const roll3 = btn("掷三把");
  bar.append(roll, roll3);
  box.appendChild(bar);
  const out = outBox(box);
  const PAT = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
  };
  let timer = null;
  function draw(n) {
    face.querySelectorAll("i").forEach((d, i) =>
      d.classList.toggle("on", PAT[n].includes(i)));
  }
  function rollOnce() {
    if (timer) return;
    face.classList.add("rolling");
    let n = 1;
    timer = setInterval(() => { n = 1 + Math.floor(Math.random() * 6); draw(n); }, 80);
    setTimeout(() => {
      clearInterval(timer);
      timer = null;
      face.classList.remove("rolling");
      draw(n);
      out.textContent = "点数：" + n;
    }, 700);
    return n;
  }
  function rollMany(k) {
    if (timer) return;
    const res = [];
    let done = 0;
    face.classList.add("rolling");
    timer = setInterval(() => draw(1 + Math.floor(Math.random() * 6)), 70);
    for (let i = 0; i < k; i++) res.push(1 + Math.floor(Math.random() * 6));
    setTimeout(() => {
      clearInterval(timer); timer = null;
      face.classList.remove("rolling");
      draw(res[0]);
      out.innerHTML = "各把点数：" + res.join(" · ") +
        "<br>合计 " + res.reduce((a, b) => a + b, 0);
    }, 700);
  }
  roll.addEventListener("click", rollOnce);
  roll3.addEventListener("click", () => rollMany(3));
  draw(6);
};

/* 占位文本 */
RENDER.lorem = box => {
  box.appendChild(label("段落"));
  const r1 = el("div", "wb-row");
  const para = el("input", "wb-input");
  para.type = "number"; para.min = 1; para.max = 20; para.value = 3;
  r1.appendChild(para);
  box.appendChild(r1);
  box.appendChild(label("语言"));
  const lang = el("select", "wb-select");
  lang.append(
    Object.assign(el("option", "", "中文乱数假文"), { value: "zh" }),
    Object.assign(el("option", "", "Lorem Ipsum"), { value: "en" })
  );
  box.appendChild(lang);
  const bar = el("div", "wb-row");
  const go = btn("生成", true);
  bar.appendChild(go);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  const ZH = "山川湖海 星辰大地 布局排版 视觉层次 字里行间 留白呼吸 网格秩序 笔画结构 明暗节奏 画面张力 版面语言 设计之境 灰度梯度 锐利边界 圆角过渡 中轴对称 黄金比例 视觉动线 信息层级 色彩情绪".split(" ");
  const EN = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat".split(" ");
  const rand = arr => arr[Math.floor(Math.random() * arr.length)];
  function generate() {
    const n = Math.min(20, Math.max(1, +para.value || 1));
    const ps = [];
    for (let i = 0; i < n; i++) {
      if (lang.value === "zh") {
        ps.push(Array.from({ length: 18 + Math.floor(Math.random() * 14) }, () => rand(ZH)).join(""));
      } else {
        const ws = Array.from({ length: 24 + Math.floor(Math.random() * 20) }, () => rand(EN));
        const s = ws.join(" ");
        ps.push(s[0].toUpperCase() + s.slice(1) + ".");
      }
    }
    out.innerHTML = ps.map(p => "<div style='margin-bottom:10px'>" + p + "</div>").join("");
  }
  go.addEventListener("click", generate);
  generate();
};

/* 大小写 */
RENDER.case = box => {
  box.appendChild(label("输入文本"));
  const ta = el("textarea", "wb-textarea");
  ta.placeholder = "hello toolgrid 你好 / hello_world";
  box.appendChild(ta);
  const bar = el("div", "wb-row");
  const bUpper = btn("全大写");
  const bLower = btn("全小写");
  const bCamel = btn("驼峰");
  const bSnake = btn("下划线");
  bar.append(bUpper, bLower, bCamel, bSnake);
  box.appendChild(bar);
  const out = outBox(box);
  withCopy(box, out);
  const words = s => s.trim().split(/[\s_\-\-]+/).filter(Boolean);
  bUpper.addEventListener("click", () => out.textContent = ta.value.toUpperCase());
  bLower.addEventListener("click", () => out.textContent = ta.value.toLowerCase());
  bCamel.addEventListener("click", () => {
    out.textContent = words(ta.value).map((w, i) =>
      i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join("");
  });
  bSnake.addEventListener("click", () => {
    const s = ta.value.trim().replace(/([a-z0-9])([A-Z])/g, "$1_$2");
    out.textContent = words(s).join("_").toLowerCase();
  });
};
