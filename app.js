/* Bahçıvanlık Eğitimi 2027 – ortak hazırlık uygulaması */
(function () {
  "use strict";
  const DB_ROOT = "bahcivanlik2027";
  const APP_VERSION = "10 · 27 Ekim 2026";
  const FB_CFG = {
    apiKey: "AIzaSyAzQewf1D8AUe5ue7unEFSN4RWiToLIV_I",
    databaseURL: "https://kent-bostanlari-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "kent-bostanlari"
  };
  const LS = { data: "bhc27_data", done: "bhc27_done", me: "bhc27_me", dirty: "bhc27_dirty", view: "bhc27_view", log: "bhc27_log" };
  const DEF = window.DEFAULT_DATA;
  const $ = s => document.querySelector(s);
  const clone = o => JSON.parse(JSON.stringify(o));
  const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const phHtml = s => esc(s).replace(/\[[^\]\n]*\]/g, m => `<span class="ph">${m}</span>`);

  let data = load(LS.data);
  if (!data || !data.sections || data.version !== DEF.version) data = clone(DEF);
  DEF.sections.forEach((ds, i) => {
    const have = data.sections.find(s => s.id === ds.id);
    if (have) {
      have.title = ds.title; have.icon = ds.icon;
      have.parts.forEach(p => { const dp = ds.parts.find(x => x.id === p.id); if (dp) { p.title = dp.title; if (dp.special) p.special = dp.special; } });
      ds.parts.forEach((dp, j) => { if (!have.parts.some(p => p.id === dp.id)) have.parts.splice(j, 0, clone(dp)); });
      return;
    }
    const prev = i > 0 ? data.sections.findIndex(s => s.id === DEF.sections[i - 1].id) : -1;
    data.sections.splice(prev + 1, 0, clone(ds));
  });
  let done = load(LS.done) || {};
  let me = localStorage.getItem(LS.me) || "";
  let dirty = new Set(load(LS.dirty) || []);
  let log = load(LS.log) || [];
  let view = load(LS.view) || { sec: "program", part: {} };
  let editing = false, editChanged = false, remoteWhileEditing = false;
  const fb = { db: null, ok: false, connected: false, root: null };
  const writeTimers = {};
  let installEvt = null;
  let att = load("bhc27_att") || {};
  let settings = load("bhc27_settings") || {};
  let yokDay = null, yokQ = "", belgeOnly = false, yokFilter = "absent";
  const fold = s => String(s || "").toLocaleLowerCase("tr").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/â/g, "a").replace(/î/g, "i").replace(/û/g, "u").replace(/\s+/g, " ").trim();
  const nameMatch = (name, q) => { if (!q) return true; const f = fold(name); return f.split(" ").some(w => w.startsWith(q)) || f.includes(q); };
  const openLogs = new Set();
  const loggedYok = new Set();
  let presence = {}, presRef = null, presDay = null;
  const deviceId = localStorage.getItem("bhc27_dev") || (() => { const id = "d" + Math.random().toString(36).slice(2, 10); localStorage.setItem("bhc27_dev", id); return id; })();
  const todayKey = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const hhmm = ts => ts ? new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
  const deviceLabel = () => /iPhone|iPad|iPod/.test(navigator.userAgent) ? "iPhone" : /Android/.test(navigator.userAgent) ? "Android" : "Bilgisayar";

  /* ---------- yardımcılar ---------- */
  const keyOf = (s, p) => s.id + "__" + p.id;
  const secById = id => data.sections.find(s => s.id === id);
  function eachPart(fn) { data.sections.forEach(s => s.parts.forEach(p => fn(s, p, keyOf(s, p)))); }
  function partByKey(k) { let r = null; eachPart((s, p, key) => { if (key === k) r = p; }); return r; }
  function curSec() { return secById(view.sec) || data.sections[0]; }
  function curPart() { const s = curSec(); const pid = (view.part || {})[s.id]; return s.parts.find(p => p.id === pid) || s.parts[0]; }
  const curKey = () => keyOf(curSec(), curPart());
  const toArr = v => Array.isArray(v) ? v : (v && typeof v === "object" ? Object.keys(v).sort((a, b) => a - b).map(k => v[k]) : []);
  function normBlocks(v) {
    return toArr(v).filter(Boolean).map(b => {
      const o = { ...b };
      if (o.t === "ul" || o.t === "ol") o.items = toArr(o.items).map(x => x == null ? "" : String(x));
      if (o.t === "chk") o.items = toArr(o.items).filter(Boolean).map(i => ({ x: i.x || "", done: !!i.done }));
      if (o.t === "tbl") {
        o.head = toArr(o.head).map(x => x == null ? "" : String(x));
        const n = o.head.length;
        o.rows = toArr(o.rows).map(r => { const a = toArr(r).map(x => x == null ? "" : String(x)); while (a.length < n) a.push(""); return a; });
      }
      if ("x" in o && o.x == null) o.x = "";
      return o;
    });
  }
  function toast(msg, ms) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), ms || 2600);
  }
  function timeAgo(ts) {
    if (!ts) return "";
    const d = (Date.now() - ts) / 1000;
    if (d < 60) return "az önce";
    if (d < 3600) return Math.floor(d / 60) + " dk önce";
    if (d < 86400) return Math.floor(d / 3600) + " sa önce";
    return new Date(ts).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  /* ---------- ilerleme ---------- */
  function checklistItems() {
    const out = [];
    eachPart((s, p) => p.blocks.forEach(b => { if (b.t === "chk") (b.items || []).forEach(i => out.push(i)); }));
    return out;
  }
  function placeholderCount(sec) {
    let n = 0;
    sec.parts.forEach(p => p.blocks.forEach(b => {
      const txt = b.t === "tbl" ? [].concat(b.head || [], ...(b.rows || [])).join("\n") : (b.t === "ul" || b.t === "ol") ? (b.items || []).join("\n") : b.t === "chk" ? "" : (b.x || "");
      n += (txt.match(/\[[^\]\n]*\]/g) || []).length;
    }));
    return n;
  }
  function progress() {
    const items = checklistItems();
    const secDone = data.sections.filter(s => done[s.id]).length;
    const total = data.sections.length + items.length;
    const got = secDone + items.filter(i => i.done).length;
    return { pct: total ? Math.round(got * 100 / total) : 0, secDone, secTotal: data.sections.length, chkDone: items.filter(i => i.done).length, chkTotal: items.length, got, total };
  }
  function renderProgress() {
    const p = progress();
    $("#progFill").style.width = p.pct + "%";
    $("#progTxt").textContent = "%" + p.pct + " · " + p.got + "/" + p.total;
    renderDash(p);
  }

  /* ---------- gösterge paneli ---------- */
  const AYLAR = ["ocak", "şubat", "mart", "nisan", "mayıs", "haziran", "temmuz", "ağustos", "eylül", "ekim", "kasım", "aralık"];
  function programInfo() {
    const s = secById("program"); if (!s) return null;
    const t = s.parts[0].blocks.find(b => b.t === "tbl"); if (!t) return null;
    const yearM = String((t.head || [])[0] || "").match(/(20\d\d)/);
    const year = yearM ? +yearM[1] : 2027;
    let start = null, end = null;
    (t.rows || []).forEach(r => {
      const m = String(r[0] || "").toLocaleLowerCase("tr").match(/(\d{1,2})\s+(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/);
      if (!m) return;
      const d = new Date(year, AYLAR.indexOf(m[2]), +m[1]);
      if (!start || d < start) start = d;
      if (!end || d > end) end = d;
    });
    const ramDays = new Set((t.rows || []).filter(r => /ramazan/i.test(r.join(" "))).map(r => r[0]).filter(Boolean)).size;
    return { start, end, ramDays };
  }
  function renderDash(p) {
    const el = $("#dash"); if (!el) return;
    const pi = programInfo();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const fmt = d => d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    let dVal = "–", dSub = "Program tarihi yok";
    if (pi && pi.start) {
      const diff = Math.round((pi.start - today) / 86400000);
      if (diff > 0) { dVal = diff + " gün"; dSub = fmt(pi.start) + " başlangıç"; }
      else if (pi.end && today <= pi.end) { dVal = "Sürüyor"; dSub = fmt(pi.end) + " bitiş"; }
      else { dVal = "Bitti"; dSub = fmt(pi.end || pi.start); }
    }
    const items = checklistItems();
    const openN = items.filter(i => !i.done).length;
    const ph = data.sections.filter(s => s.id !== "acik").reduce((a, s) => a + placeholderCount(s), 0);
    const kc = kursiyerCount();
    const ppl = fb.ok ? people() : [];
    const onN = ppl.filter(x => x.online).length;
    const dateItem = items.find(i => /^Tarih/i.test(i.x));
    const tile = (go, icon, lbl, val, sub, cls) => `<button type="button" class="tile ${cls || ""}" data-nav="${go}"><span class="t-lbl">${icon} ${lbl}</span><span class="t-val">${val}</span><span class="t-sub">${sub}</span></button>`;
    el.innerHTML = `<div class="dash-inner"><div class="dash-grid">
      ${tile("program", "⏳", "Eğitime kalan", dVal, dSub)}
      ${tile("durum", "📈", "Hazırlık", "%" + p.pct, p.got + "/" + p.total + " adım tamam", p.pct === 100 ? "ok-t" : "")}
      ${tile("kursiyer", "👥", "Kursiyer", kc == null ? "–" : kc, kc ? (attTaken() ? belgeStats().eligible + " belge hakkı" : "kayıtlı") : "liste yüklenmedi")}
      ${tile("acik", "📝", "Açık nokta", openN, openN ? "karar bekliyor" : "hepsi tamam", openN ? "" : "ok-t")}
      ${tile("durum", "✍️", "Boş alan", ph, "[ ] doldurulacak", ph ? "" : "ok-t")}
      ${tile("durum", "🟢", "Bugün", fb.ok ? ppl.length + " kişi" : "–", fb.ok ? (onN ? onN + " kişi şu an açık" : "şu an açık yok") : "ortak kayıt yok")}
    </div>
    ${pi && pi.ramDays && dateItem && !dateItem.done ? `<button type="button" class="dash-alert" data-nav="tarih">⚠️ <span>Programda ${pi.ramDays} eğitim günü Ramazan'a denk geliyor. Tarih kararı bekliyor — öneriler için dokunun.</span></button>` : ""}
    </div>`;
  }

  /* ---------- gezinme ---------- */
  function renderNav() {
    const nav = $("#nav");
    nav.innerHTML = data.sections.map(s =>
      `<button type="button" class="nav-btn ${view.sec === s.id ? "active" : ""} ${done[s.id] ? "done" : ""}" data-nav="${s.id}"><span class="ic">${s.icon}</span><span>${esc(s.title)}</span></button>`
    ).join("") + `<button type="button" class="nav-btn durum ${view.sec === "durum" ? "active" : ""}" data-nav="durum"><span class="ic">📊</span><span>Son Durum</span></button><button type="button" class="nav-btn ayar" id="navSettings"><span class="ic">⚙️</span><span>Ayarlar</span></button>`;
  }
  function go(secId) {
    if (editing) finishEdit();
    view.sec = secId; store(LS.view, view);
    renderNav(); render();
    window.scrollTo({ top: $("#nav").offsetTop - 70, behavior: "smooth" });
  }

  /* ---------- bölüm görünümü ---------- */
  function render() {
    renderProgress();
    if (view.sec === "durum") return renderDurum();
    const s = curSec(), p = curPart();
    const multi = s.parts.length > 1;
    $("#main").innerHTML = `
      <section class="card">
        <div class="sec-head">
          <h2 class="sec-title">${s.icon} ${esc(s.title)}</h2>
          <label class="done-toggle ${done[s.id] ? "is-done" : ""}"><input type="checkbox" id="doneChk" ${done[s.id] ? "checked" : ""}> Tamamlandı</label>
        </div>
        ${multi ? `<div class="parts">${s.parts.map(x => `<button type="button" class="chip ${x.id === p.id ? "active" : ""}" data-part="${x.id}">${esc(x.title)}</button>`).join("")}</div>` : ""}
        <div class="tools">
          ${p.special ? "" : `<button type="button" class="tbtn ${editing ? "primary" : ""}" id="editBtn">${editing ? "✓ Düzenlemeyi bitir" : "✏️ Düzenle"}</button>`}
          <button type="button" class="tbtn word" data-exp="word">📝 Word</button>
          <button type="button" class="tbtn pdf" data-exp="pdf">📄 PDF</button>
          <button type="button" class="tbtn excel" data-exp="excel">📊 Excel</button>
        </div>
        ${editing ? `<div class="editing-note">Düzenleme açık. Metne ve tablo hücrelerine dokunup yazın; değişiklikler kaydedilir ve herkese yansır.</div>` : ""}
        ${s.id === "tarih" && !editing ? renderShiftBox() : ""}
        <div class="doc" id="doc">${p.special === "yoklama" ? renderYoklama() : p.special === "belge" ? renderBelge() : renderBlocks(p.blocks)}</div>
      </section>`;
    if (p.special === "yoklama") { document.documentElement.style.setProperty("--hdr", ($(".top").offsetHeight || 90) + "px"); yokApplyFilter(); }
  }

  function renderBlocks(blocks) {
    return blocks.map((b, bi) => {
      const ce = editing ? ` contenteditable="true" data-bi="${bi}" data-k="x"` : "";
      const txt = v => editing ? esc(v) : phHtml(v);
      switch (b.t) {
        case "h": return `<h3${ce}>${txt(b.x)}</h3>`;
        case "b": return `<p class="b"${ce}>${txt(b.x)}</p>`;
        case "c": return `<div class="c"${ce}>${txt(b.x)}</div>`;
        case "r": return `<div class="r"${ce}>${txt(b.x)}</div>`;
        case "p": return `<p${ce}>${txt(b.x)}</p>`;
        case "ul": case "ol": return renderList(b, bi);
        case "chk": return renderChk(b, bi);
        case "tbl": return renderTable(b, bi);
        default: return "";
      }
    }).join("");
  }
  function renderList(b, bi) {
    const tag = b.t;
    if (!editing) return `<${tag}>${(b.items || []).map(i => `<li>${i ? phHtml(i) : "&nbsp;"}</li>`).join("")}</${tag}>`;
    return `<div>${(b.items || []).map((i, ii) => `<div class="li-edit"><span>${tag === "ol" ? (ii + 1) + "." : "•"}</span><div contenteditable="true" data-bi="${bi}" data-k="item" data-i="${ii}">${esc(i)}</div><button type="button" class="mini del" data-op="li-del" data-bi="${bi}" data-i="${ii}" aria-label="Sil">✕</button></div>`).join("")}
      <button type="button" class="add-line" data-op="li-add" data-bi="${bi}">+ Madde ekle</button></div>`;
  }
  function renderChk(b, bi) {
    return `<ul class="chk">${(b.items || []).map((i, ii) => `<li class="${i.done ? "done" : ""}"><input type="checkbox" data-op="chk" data-bi="${bi}" data-i="${ii}" ${i.done ? "checked" : ""} aria-label="Tamamlandı">${editing
      ? `<div style="flex:1" contenteditable="true" data-bi="${bi}" data-k="chk" data-i="${ii}">${esc(i.x)}</div><button type="button" class="mini del" data-op="chk-del" data-bi="${bi}" data-i="${ii}" aria-label="Sil">✕</button>`
      : `<span>${phHtml(i.x)}</span>`}</li>`).join("")}</ul>
      ${editing ? `<button type="button" class="add-line" data-op="chk-add" data-bi="${bi}">+ Madde ekle</button>` : ""}`;
  }
  function renderTable(b, bi) {
    const head = b.head || [];
    const n = head.length;
    const W = window.Exporter;
    const cnt = b.count ? (b.rows || []).filter(r => r.some((c, j) => String(c || "").trim() && !(j === 0 && /^no$/i.test(head[0] || "")))).length : 0;
    let h = b.count ? `<div class="count-bar"><b>Toplam: ${cnt}</b> ${esc(b.count)}${b.sort ? ` <span class="muted">· ada göre A→Z</span>` : ""}</div>` : "";
    h += `<div class="tbl-wrap"><table><thead><tr>${head.map((c, j) => `<th${editing ? ` contenteditable="true" data-bi="${bi}" data-k="head" data-j="${j}"` : ""}>${esc(c)}</th>`).join("")}${editing ? `<th class="row-ops"></th>` : ""}</tr></thead><tbody>`;
    (b.rows || []).forEach((r, ri) => {
      const week = W.isWeekRow(r), ram = W.isRamazan(r);
      if (!editing && week) { h += `<tr class="week"><td colspan="${n}">${phHtml(r[0])}</td></tr>`; return; }
      h += `<tr class="${week ? "week" : ""} ${ram ? "ramazan" : ""}">`;
      for (let j = 0; j < n; j++) {
        const v = r[j] || "";
        h += editing ? `<td contenteditable="true" data-bi="${bi}" data-k="cell" data-i="${ri}" data-j="${j}">${esc(v)}</td>` : `<td>${phHtml(v)}</td>`;
      }
      if (editing) h += `<td class="row-ops"><button type="button" class="mini" data-op="row-add" data-bi="${bi}" data-i="${ri}" aria-label="Altına satır ekle">＋</button> <button type="button" class="mini del" data-op="row-del" data-bi="${bi}" data-i="${ri}" aria-label="Satırı sil">✕</button></td>`;
      h += `</tr>`;
    });
    if (!(b.rows || []).length) h += `<tr><td colspan="${n + (editing ? 1 : 0)}" class="muted">Henüz kayıt yok.</td></tr>`;
    h += `</tbody></table></div>`;
    if (editing) h += `<button type="button" class="add-line" data-op="row-end" data-bi="${bi}">+ Satır ekle</button> <button type="button" class="add-line" data-op="col-add" data-bi="${bi}">+ Sütun</button> ${n > 1 ? `<button type="button" class="add-line" data-op="col-del" data-bi="${bi}" style="border-color:var(--red);color:var(--red)">− Son sütunu sil</button>` : ""}`;
    return h;
  }

  /* ---------- düzenleme ---------- */
  function partChanged(immediate) {
    const k = curKey();
    editChanged = true;
    dirty.add(k); store(LS.dirty, [...dirty]);
    store(LS.data, data);
    renderProgress();
    queueWrite(k, immediate);
  }
  function onInput(e) {
    const el = e.target.closest("[contenteditable][data-k]");
    if (!el) return;
    const p = curPart(), b = p.blocks[+el.dataset.bi];
    if (!b) return;
    const v = el.innerText.replace(/\n$/, "");
    const k = el.dataset.k, i = +el.dataset.i, j = +el.dataset.j;
    if (k === "x") b.x = v;
    else if (k === "item") b.items[i] = v;
    else if (k === "chk") b.items[i].x = v;
    else if (k === "head") b.head[j] = v;
    else if (k === "cell") b.rows[i][j] = v;
    partChanged(false);
  }
  function onOp(btn) {
    const op = btn.dataset.op, p = curPart(), b = p.blocks[+btn.dataset.bi], i = +btn.dataset.i;
    if (!b) return;
    const blank = () => (b.head || []).map(() => "");
    if (op === "chk") {
      b.items[i].done = btn.checked;
      partChanged(true);
      addLog((btn.checked ? "İşaretledi: " : "İşareti kaldırdı: ") + b.items[i].x);
      if (!editing) render(); else renderProgress();
      renderNav();
      return;
    }
    if (op === "li-add") b.items.push("");
    if (op === "li-del") b.items.splice(i, 1);
    if (op === "chk-add") b.items.push({ x: "", done: false });
    if (op === "chk-del") b.items.splice(i, 1);
    if (op === "row-add") b.rows.splice(i + 1, 0, blank());
    if (op === "row-del") { if (!confirm("Bu satır silinsin mi?")) return; b.rows.splice(i, 1); }
    if (op === "row-end") b.rows.push(blank());
    if (op === "col-add") { b.head.push("Yeni sütun"); b.rows.forEach(r => r.push("")); }
    if (op === "col-del") { if (!confirm("Son sütun (" + b.head[b.head.length - 1] + ") silinsin mi?")) return; b.head.pop(); b.rows.forEach(r => r.pop()); }
    partChanged(true);
    render();
  }
  function startEdit() { editing = true; editChanged = false; remoteWhileEditing = false; render(); }
  function finishEdit() {
    if (!editing) return;
    editing = false;
    if (curPart().blocks.some(b => b.t === "tbl" && b.sort)) { curPart().blocks.forEach(tidyTable); store(LS.data, data); }
    const s = curSec(), p = curPart();
    if (editChanged) { flushWrite(curKey()); addLog(`${s.title} › ${p.title} düzenlendi`); toast("Kaydedildi ✓"); }
    if (remoteWhileEditing) toast("Bu sayfada başka biri de değişiklik yaptı; son kaydedilen hâl geçerli.", 4000);
    editChanged = false; remoteWhileEditing = false;
  }

  /* ---------- Firebase ortak kayıt ---------- */
  function setSync(state, txt) {
    $("#syncDot").className = "dot " + (state === "on" ? "on" : state === "off" ? "off" : "");
    $("#syncTxt").textContent = txt;
  }
  function queueWrite(k, immediate) {
    if (!fb.ok) return;
    clearTimeout(writeTimers[k]);
    writeTimers[k] = setTimeout(() => flushWrite(k), immediate ? 0 : 700);
  }
  function flushWrite(k) {
    clearTimeout(writeTimers[k]);
    if (!fb.ok) return;
    const p = partByKey(k); if (!p) return;
    const snapshot = JSON.stringify(p.blocks);
    fb.root.child("parts/" + k).set(JSON.parse(snapshot)).then(() => {
      if (JSON.stringify(p.blocks) === snapshot) { dirty.delete(k); store(LS.dirty, [...dirty]); }
    }).catch(err => toast("Kaydedilemedi: " + err.message, 4000));
    fb.root.child("meta/updated").set({ who: me || "?", at: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  }
  function addLog(what) {
    const entry = { who: me || "Bilinmeyen", what: String(what).slice(0, 160), at: Date.now() };
    if (fb.ok) {
      fb.root.child("log").push({ ...entry, at: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
    } else {
      log.unshift(entry); log = log.slice(0, 100); store(LS.log, log);
      if (view.sec === "durum") render();
    }
  }
  function setDone(secId, val) {
    done[secId] = val; if (!val) delete done[secId];
    store(LS.done, done);
    if (fb.ok) fb.root.child("done/" + secId).set(val ? true : null).catch(() => {});
    const s = secById(secId);
    addLog(`${s ? s.title : secId} ${val ? "tamamlandı olarak işaretlendi" : "yeniden açıldı"}`);
    renderNav(); render();
  }

  function fbInit() {
    if (!window.firebase || !firebase.database) { setSync("off", "Çevrimdışı"); return; }
    try {
      firebase.initializeApp(FB_CFG);
      fb.db = firebase.database();
      fb.root = fb.db.ref(DB_ROOT);
    } catch (e) { setSync("off", "Yalnız bu cihaz"); return; }
    const authReady = (firebase.auth ? firebase.auth().signInAnonymously().catch(() => null) : Promise.resolve());
    fb.db.ref(".info/connected").on("value", s => {
      fb.connected = !!s.val();
      if (fb.ok) { syncLabel(); if (fb.connected) presenceStart(); }
    });
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("zaman aşımı")), 15000));
    Promise.race([authReady.then(() => fb.root.child("meta/seeded").once("value")), timeout]).then(snap => {
      fb.ok = true;
      if (!snap.val()) {
        const parts = {}; eachPart((s, p, k) => { parts[k] = p.blocks; });
        return fb.root.update({ parts, done, custom: customMap(), "meta/seeded": true, "meta/created": firebase.database.ServerValue.TIMESTAMP })
          .then(() => { dirty.clear(); store(LS.dirty, []); });
      }
      const upd = {};
      dirty.forEach(k => { const p = partByKey(k); if (p) upd["parts/" + k] = p.blocks; });
      if (Object.keys(upd).length) return fb.root.update(upd).then(() => { dirty.clear(); store(LS.dirty, []); });
    }).then(() => {
      syncLabel();
      listen();
      presenceStart();
    }).catch(err => {
      fb.ok = false;
      setSync("off", "Yalnız bu cihaz");
      console.warn("Firebase:", err);
      toast("Ortak kayda bağlanılamadı; değişiklikler şimdilik yalnız bu cihazda.", 4500);
    });
  }
  /* ---------- kim bağlı ---------- */
  function people() {
    const map = {};
    Object.keys(presence || {}).forEach(id => {
      const e = presence[id]; if (!e || !e.who) return;
      const k = e.who.trim().toLocaleLowerCase("tr");
      const m = map[k] || (map[k] = { who: e.who, online: false, first: 0, last: 0, devices: new Set() });
      if (e.online) m.online = true;
      if (e.first && (!m.first || e.first < m.first)) m.first = e.first;
      if ((e.last || 0) > m.last) m.last = e.last || 0;
      if (e.ua) m.devices.add(e.ua);
    });
    return Object.values(map).sort((a, b) => (b.online - a.online) || (b.last - a.last));
  }
  function syncLabel() {
    if (!fb.ok) { setSync("off", "Yalnız bu cihaz"); return; }
    if (!fb.connected) { setSync("off", "Çevrimdışı"); return; }
    const n = people().filter(x => x.online).length;
    setSync("on", n > 1 ? "Canlı · " + n + " kişi açık" : "Canlı · ortak");
  }
  function presenceStart() {
    if (!fb.ok || !me) return;
    const TS = firebase.database.ServerValue.TIMESTAMP;
    const day = todayKey();
    if (presDay !== day) {
      if (presRef) { presRef.onDisconnect().cancel(); presRef.update({ online: false, last: TS }).catch(() => {}); }
      if (presDay) fb.root.child("presence/" + presDay).off();
      presDay = day;
      presRef = fb.root.child("presence/" + day + "/" + deviceId);
      presRef.child("first").transaction(v => v || Date.now()).catch(() => {});
      fb.root.child("presence/" + day).on("value", snap => {
        presence = snap.val() || {};
        syncLabel(); renderProgress();
        if (view.sec === "durum" && !editing && $("#sheetBack").hidden) render();
      });
    }
    presRef.update({ who: me, online: document.visibilityState !== "hidden", last: TS, ua: deviceLabel() }).catch(() => {});
    presRef.onDisconnect().update({ online: false, last: TS });
  }
  function presenceAway() {
    if (presRef) presRef.update({ online: false, last: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  }

  function listen() {
    fb.root.child("parts").on("value", s => {
      const v = s.val() || {};
      remoteParts = v;
      let any = false, cur = false;
      Object.keys(v).forEach(k => {
        const p = partByKey(k);
        if (!p || dirty.has(k)) return;
        const blocks = normBlocks(v[k]);
        if (JSON.stringify(blocks) === JSON.stringify(p.blocks)) return;
        if (editing && k === curKey()) { remoteWhileEditing = true; return; }
        p.blocks = blocks; any = true;
        if (k === curKey()) cur = true;
      });
      if (any) {
        store(LS.data, data);
        renderNav(); renderProgress();
        if (!editing && (cur || view.sec === "durum")) render();
      }
    });
    fb.root.child("done").on("value", s => {
      const v = s.val() || {};
      if (JSON.stringify(v) === JSON.stringify(done)) return;
      done = v; store(LS.done, done);
      renderNav();
      if (!editing) render(); else renderProgress();
    });
    fb.root.child("custom").on("value", s => {
      const v = s.val() || {};
      let changed = false, needPush = false;
      data.sections.filter(x => x.custom).forEach(sec => {
        if (v[sec.id]) return;
        if (sec.parts.some(p => dirty.has(keyOf(sec, p)))) needPush = true;
        else { data.sections = data.sections.filter(x => x !== sec); changed = true; }
      });
      Object.keys(v).sort((a, b) => ((v[a] || {}).order || 0) - ((v[b] || {}).order || 0)).forEach(id => {
        const d = v[id] || {};
        let sec = secById(id);
        if (!sec) {
          const parts = toArr(d.parts).filter(Boolean);
          sec = { id, custom: true, icon: d.icon || "📋", title: d.title || "Sekme",
            parts: (parts.length ? parts : [{ id: "main", title: d.title || "Sekme" }]).map(p => ({ id: p.id, title: p.title || d.title || "Sekme", blocks: normBlocks(remoteParts[id + "__" + p.id] || []) })) };
          data.sections.push(sec); changed = true;
        } else if (sec.custom && (sec.title !== d.title || sec.icon !== d.icon)) {
          sec.title = d.title || sec.title; sec.icon = d.icon || sec.icon;
          if (sec.parts.length === 1) sec.parts[0].title = sec.title;
          changed = true;
        }
      });
      if (needPush) pushCustom();
      if (changed) {
        store(LS.data, data);
        if (view.sec !== "durum" && !secById(view.sec)) view.sec = "program";
        renderNav();
        if (!editing) render(); else renderProgress();
      }
    });
    fb.root.child("attendance").on("value", s => {
      const v = s.val() || {};
      if (JSON.stringify(v) === JSON.stringify(att)) return;
      att = v; store("bhc27_att", att);
      renderProgress();
      const p = view.sec === "kursiyer" ? curPart() : null;
      const typing = document.activeElement && document.activeElement.id === "yokQ";
      if (p && p.special && !editing && !typing) render();
      if (view.sec === "durum" && !editing) render();
    });
    fb.root.child("settings").on("value", s => {
      const v = s.val() || {};
      if (JSON.stringify(v) === JSON.stringify(settings)) return;
      settings = v; store("bhc27_settings", settings);
      if (view.sec === "kursiyer" && !editing) render(); else renderProgress();
    });
    fb.root.child("log").limitToLast(100).on("value", s => {
      const v = s.val() || {};
      log = Object.keys(v).map(k => v[k]).filter(Boolean).sort((a, b) => (b.at || 0) - (a.at || 0));
      store(LS.log, log);
      if (view.sec === "durum" && !editing) render();
    });
  }

  /* ---------- Son Durum ---------- */
  function statusSummary() {
    const p = progress();
    const doneSecs = data.sections.filter(s => done[s.id]).map(s => s.title);
    const openSecs = data.sections.filter(s => !done[s.id]).map(s => s.title);
    const items = checklistItems();
    const openItems = items.filter(i => !i.done).map(i => i.x);
    const ph = data.sections.filter(s => s.id !== "acik").reduce((a, s) => a + placeholderCount(s), 0);
    const dateItem = items.find(i => /^Tarih/i.test(i.x));
    const dateOpen = dateItem ? !dateItem.done : false;
    return { p, doneSecs, openSecs, openItems, ph, dateOpen };
  }
  function renderDurum() {
    const S = statusSummary(), p = S.p;
    const last = log[0];
    $("#main").innerHTML = `
      <section class="card">
        <h2 class="sec-title" style="margin-bottom:12px">📊 Son Durum</h2>
        <div class="big">
          <div class="ring" style="--p:${p.pct}"><span>%${p.pct}</span></div>
          <div class="stat-lines">
            <div><b>${p.secDone}/${p.secTotal}</b> bölüm tamamlandı</div>
            <div><b>${p.chkDone}/${p.chkTotal}</b> açık nokta işaretlendi</div>
            <div><b>${S.ph}</b> doldurulacak [ ] alan kaldı</div>
            ${kursiyerCount() !== null ? `<div><b>${kursiyerCount()}</b> kursiyer kayıtlı${attTaken() ? ` · <b>${belgeStats().eligible}</b> belge hakkı` : ""}</div>` : ""}
            ${last ? `<div class="muted">Son değişiklik: ${esc(last.who)} · ${timeAgo(last.at)}</div>` : ""}
          </div>
        </div>
        <div class="listen">
          <button type="button" class="tbtn primary" id="speakBtn">🔊 Dinle</button>
          <button type="button" class="tbtn" id="stopBtn">⏹ Durdur</button>
        </div>
        ${S.dateOpen ? `<div class="warn">Tarih kararı bekliyor: Şubat planında 15 eğitim gününün 10'u Ramazan'a denk geliyor. Öneri B (15 Mart–2 Nisan) çakışmasız.</div>` : ""}
      </section>
      <section class="card">
        <h3 style="margin:0">Bölümler</h3>
        <ul class="status-list">${data.sections.map(s => {
          const n = placeholderCount(s);
          return `<li><span class="st ${done[s.id] ? "ok" : ""}">${done[s.id] ? "Tamamlandı" : "Devam ediyor"}</span><span class="nm">${s.icon} ${esc(s.title)}</span>${s.id !== "acik" && n ? `<span class="ph-count">${n} boş alan</span>` : ""}<button type="button" class="mini" data-nav="${s.id}" aria-label="Aç">›</button></li>`;
        }).join("")}</ul>
      </section>
      <section class="card">
        <h3 style="margin:0">Bugün bağlananlar (${people().length})</h3>
        ${!fb.ok ? `<p class="muted">Ortak kayda bağlı olunmadığı için görüntülenemiyor.</p>` : people().length ? `<ul class="status-list">${people().map(x => `<li><span class="st ${x.online ? "ok" : ""}">${x.online ? "Şu an açık" : "Son " + hhmm(x.last)}</span><span class="nm">${esc(x.who)}<br><span class="muted" style="font-size:12px">İlk giriş ${hhmm(x.first)}${x.devices.size ? " · " + [...x.devices].join(", ") : ""}</span></span></li>`).join("")}</ul>` : `<p class="muted">Bugün henüz kimse bağlanmadı.</p>`}
      </section>
      <section class="card">
        <h3 style="margin:0">Bekleyen açık noktalar (${S.openItems.length})</h3>
        ${S.openItems.length ? `<ul>${S.openItems.map(x => `<li>${phHtml(x)}</li>`).join("")}</ul>` : `<p class="muted">Hepsi tamamlandı.</p>`}
      </section>
      <section class="card">
        <h3 style="margin:0">Son değişiklikler</h3>
        ${log.length ? renderLogGroups() : `<p class="muted">Henüz değişiklik yok.</p>`}
      </section>`;
  }
  function speakText() {
    const S = statusSummary(), p = S.p;
    const parts = [`Bahçıvanlık Eğitimi 2027 hazırlığı yüzde ${p.pct} tamamlandı.`];
    parts.push(`${p.secTotal} bölümden ${p.secDone} tanesi tamamlandı.`);
    if (kursiyerCount()) parts.push(`Kursiyer listesinde ${kursiyerCount()} kişi kayıtlı.`);
    if (attTaken()) { const B = belgeStats(); parts.push(`Yoklamaya göre ${B.eligible} kursiyer belge almaya hak kazandı.`); }
    if (S.doneSecs.length) parts.push(`Tamamlanan bölümler: ${S.doneSecs.join(", ")}.`);
    if (S.openSecs.length) parts.push(`Devam eden bölümler: ${S.openSecs.join(", ")}.`);
    if (S.openItems.length) {
      parts.push(`Açık noktalardan ${S.openItems.length} tanesi bekliyor.`);
      S.openItems.slice(0, 6).forEach((x, i) => parts.push(`${i + 1}: ${x.replace(/[\[\]"]/g, "")}.`));
      if (S.openItems.length > 6) parts.push(`ve ${S.openItems.length - 6} madde daha.`);
    } else parts.push("Tüm açık noktalar tamamlandı.");
    parts.push(`Belgelerde doldurulması gereken ${S.ph} alan var.`);
    const ppl = fb.ok ? people() : [];
    if (ppl.length) {
      parts.push(`Bugün ${ppl.length} kişi bağlandı: ${ppl.map(x => x.who).join(", ")}.`);
      const on = ppl.filter(x => x.online).map(x => x.who);
      if (on.length) parts.push(`Şu an açık olanlar: ${on.join(", ")}.`);
    }
    if (S.dateOpen) parts.push("Tarih kararı henüz verilmedi. Şubat planında on gün Ramazan'a denk geliyor.");
    if (log[0]) parts.push(`Son değişikliği ${log[0].who} yaptı: ${log[0].what.replace(/›/g, ",")}.`);
    return parts;
  }
  function speak() {
    if (!("speechSynthesis" in window)) { toast("Bu cihaz sesli okumayı desteklemiyor."); return; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();
    const tr = voices.find(v => /^tr/i.test(v.lang));
    speakText().forEach(t => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = "tr-TR"; u.rate = 1; if (tr) u.voice = tr;
      synth.speak(u);
    });
    if (!tr && voices.length) toast("Türkçe ses bulunamadı; cihazın varsayılan sesi kullanılıyor.", 3500);
  }

  /* ---------- alt sayfa (menü, dışa aktarım) ---------- */
  function openSheet(html) { $("#sheet").innerHTML = html; $("#sheetBack").hidden = false; }
  function closeSheet() { $("#sheetBack").hidden = true; $("#sheet").innerHTML = ""; }

  const FMT = { word: "Word", pdf: "PDF", excel: "Excel" };
  function exportChooser(fmt) {
    const s = curSec(), p = curPart(), multi = s.parts.length > 1;
    openSheet(`<h4>${FMT[fmt]} çıktısı</h4><p>Hangi kısmı indirmek istiyorsunuz?</p>
      ${multi ? `<button type="button" class="opt" data-run="${fmt}" data-scope="part">Bu sayfa<small>${esc(p.title)}</small></button>` : ""}
      <button type="button" class="opt" data-run="${fmt}" data-scope="sec">${multi ? "Bu bölümün tümü" : "Bu bölüm"}<small>${esc(s.title)}${multi ? " · " + s.parts.length + " sayfa" : ""}</small></button>
      <button type="button" class="opt" data-run="${fmt}" data-scope="all">Tüm dosya<small>Bütün bölümler, her biri ayrı sayfada</small></button>
      <div class="row"><button type="button" class="tbtn" data-close>Vazgeç</button></div>`);
  }
  async function runExport(fmt, scope, secOverride) {
    closeSheet();
    const s = secOverride ? null : curSec(), p = secOverride ? null : curPart();
    let parts, title, heads;
    if (scope === "part") { parts = [{ label: p.title, sheet: p.title, blocks: blocksOf(p) }]; title = "Bahçıvanlık 2027 - " + p.title; heads = false; }
    else if (scope === "sec") {
      parts = s.parts.map(x => ({ label: s.parts.length > 1 ? s.title + " – " + x.title : s.title, sheet: x.title, blocks: blocksOf(x) }));
      title = "Bahçıvanlık 2027 - " + s.title; heads = s.parts.length > 1;
    } else {
      parts = []; data.sections.forEach(sec => sec.parts.forEach(x => parts.push({ label: sec.parts.length > 1 ? sec.title + " – " + x.title : sec.title, sheet: sec.parts.length > 1 ? x.title : sec.title, blocks: blocksOf(x) })));
      title = "Bahçıvanlık Eğitimi 2027 Dosyası"; heads = true;
    }
    toast(FMT[fmt] + " hazırlanıyor…", 6000);
    try {
      if (fmt === "word") await Exporter.toWord(parts, title, heads);
      if (fmt === "pdf") await Exporter.toPdf(parts, title, heads);
      if (fmt === "excel") await Exporter.toExcel(parts, title);
      toast(FMT[fmt] + " dosyası hazır ✓");
    } catch (e) {
      console.error(e);
      toast("Çıktı alınamadı: " + (e.message || e), 5000);
    }
  }
  function menu() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    openSheet(`<h4>⚙️ Ayarlar</h4><p>Bağlantı: ${esc($("#syncTxt").textContent)}. ${fb.ok ? "Yaptığınız her değişiklik bu uygulamayı açan herkeste anında görünür." : "Ortak kayda bağlı değil; değişiklikler bu cihazda tutuluyor."}</p>
      <button type="button" class="opt" data-act="name">👤 Adım: ${esc(me || "belirtilmedi")}<small>Değişiklik geçmişinde görünen ad</small></button>
      <button type="button" class="opt" data-act="tabNew" style="border-color:var(--green);background:var(--green-soft)">➕ Yeni sekme ekle<small>Adını yazın, boş tabloyla açılır</small></button>
      <button type="button" class="opt" data-act="tabs">🗂️ Eklenen sekmeler<small>Adını değiştir veya sil</small></button>
      <button type="button" class="opt" data-act="xlsx">📥 Excel'den yükle<small>Bir tabloyu yeni ya da mevcut sekmeye aktar</small></button>
      <button type="button" class="opt" data-run="word" data-scope="all">📝 Tüm dosya – Word</button>
      <button type="button" class="opt" data-run="pdf" data-scope="all">📄 Tüm dosya – PDF</button>
      <button type="button" class="opt" data-run="excel" data-scope="all">📊 Tüm dosya – Excel</button>
      ${installEvt ? `<button type="button" class="opt" data-act="install">📲 Telefona uygulama olarak yükle</button>` : ""}
      ${isIOS && !standalone ? `<div class="opt">📲 iPhone'a yüklemek için<small>Safari'de Paylaş düğmesi → "Ana Ekrana Ekle"</small></div>` : ""}
      <button type="button" class="opt" data-act="backup">💾 Yedek indir<small>Tüm içerik ve tikler (JSON)</small></button>
      <button type="button" class="opt" data-act="restore">📂 Yedekten geri yükle<small>Herkes için geçerli olur</small></button>
      <button type="button" class="opt" data-act="reset">↺ İlk taslağa dön<small>Tüm düzenlemeler silinir, herkes için</small></button>
      <p style="margin-top:10px;font-size:12px">Sürüm ${APP_VERSION}</p>
      <div class="row"><button type="button" class="tbtn" data-close>Kapat</button></div>`);
  }
  function askName(force) {
    if (me && !force) return;
    openSheet(`<h4>Adınız</h4><p>Değişiklik geçmişinde ve "Son Durum"da kimin ne yaptığı bu adla görünür.</p>
      <input type="text" id="nameIn" value="${esc(me)}" placeholder="Ör. Sertaç Hekim" autocomplete="name">
      <div class="row">${me ? `<button type="button" class="tbtn" data-close>Vazgeç</button>` : ""}<button type="button" class="tbtn primary" data-act="saveName">Kaydet</button></div>`);
    setTimeout(() => { const i = $("#nameIn"); if (i) i.focus(); }, 50);
  }
  function backup() {
    const blob = new Blob([JSON.stringify({ app: "bahcivanlik2027", savedAt: new Date().toISOString(), data, done }, null, 1)], { type: "application/json" });
    Exporter.save(blob, "bahcivanlik-2027-yedek-" + new Date().toISOString().slice(0, 10) + ".json");
  }
  function restoreFrom(obj) {
    if (!obj || !obj.data || !obj.data.sections) { toast("Geçersiz yedek dosyası"); return; }
    data = obj.data; done = obj.done || {};
    store(LS.data, data); store(LS.done, done);
    if (fb.ok) {
      const parts = {}; eachPart((s, p, k) => { parts[k] = p.blocks; });
      fb.root.update({ parts, done, custom: customMap() }).catch(err => toast("Yüklenemedi: " + err.message));
    }
    addLog("Yedekten geri yükleme yaptı");
    renderNav(); render(); toast("Yedek yüklendi ✓");
  }

  /* ---------- sıralı listeler ---------- */
  function tidyTable(b) {
    if (!b || b.t !== "tbl" || !b.sort) return;
    const head = b.head || [];
    const hasNo = /^no$/i.test(head[0] || "");
    const nameCol = hasNo ? 1 : 0;
    b.rows = (b.rows || []).filter(r => r.some((c, j) => String(c || "").trim() && !(hasNo && j === 0)));
    b.rows.sort((x, y) => String(x[nameCol] || "").localeCompare(String(y[nameCol] || ""), "tr", { sensitivity: "base" }));
    if (hasNo) b.rows.forEach((r, i) => { r[0] = String(i + 1); });
  }
  function kursiyerCount() {
    const s = secById("kursiyer"); if (!s) return null;
    let n = 0;
    s.parts.forEach(p => p.blocks.forEach(b => { if (b.t === "tbl") n += (b.rows || []).filter(r => r.slice(/^no$/i.test((b.head || [])[0] || "") ? 1 : 0).some(c => String(c || "").trim())).length; }));
    return n;
  }

  /* ---------- tarih kaydırma ---------- */
  const AY_CAP = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const GUN_UZUN = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const GUN_KISA = ["Paz.", "Pzt.", "Salı", "Çarş.", "Perş.", "Cuma", "Cmt."];
  const ymd = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const parseYmd = s => { const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const RAM_S = new Date(2027, 1, 8), RAM_E = new Date(2027, 2, 8);
  const BAY_S = new Date(2027, 2, 9), BAY_E = new Date(2027, 2, 11);
  const TATIL = { "2027-01-01": "Yılbaşı", "2027-04-23": "23 Nisan", "2027-05-01": "1 Mayıs", "2027-05-19": "19 Mayıs",
    "2027-05-15": "Kurban Bayramı arifesi", "2027-05-16": "Kurban Bayramı", "2027-05-17": "Kurban Bayramı", "2027-05-18": "Kurban Bayramı" };
  const MON_RE = AY_CAP.join("|");
  const DAY_RE = "Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar|Pzt\\.|Çarş\\.|Perş\\.|Cmt\\.|Paz\\.";
  const dayTag = d => {
    if (d >= BAY_S && d <= BAY_E) return "BAYRAM – eğitim yapılamaz";
    if (TATIL[ymd(d)]) return "Resmî tatil: " + TATIL[ymd(d)];
    if (d >= RAM_S && d <= RAM_E) return "Ramazan";
    return "";
  };
  function programTable() { const s = secById("program"); return s ? s.parts[0].blocks.find(b => b.t === "tbl") : null; }
  function programDates() {
    const t = programTable(); if (!t) return [];
    const yM = String((t.head || [])[0] || "").match(/(20\d\d)/); const year = yM ? +yM[1] : 2027;
    const out = []; let cur = null;
    (t.rows || []).forEach(r => {
      if (Exporter.isWeekRow(r)) return;
      const m = String(r[0] || "").match(new RegExp("(\\d{1,2})\\s+(" + MON_RE + ")"));
      if (m) { cur = new Date(year, AY_CAP.indexOf(m[2]), +m[1]); if (!out.some(o => +o.d === +cur)) out.push({ d: cur, rows: [] }); }
      if (cur) out.find(o => +o.d === +cur).rows.push(r);
    });
    return out.sort((a, b) => a.d - b.d);
  }
  function workdays(start, n) {
    const out = []; const d = new Date(start);
    while (out.length < n) { if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d)); d.setDate(d.getDate() + 1); }
    return out;
  }
  const fmtLong = d => d.getDate() + " " + AY_CAP[d.getMonth()] + " " + d.getFullYear();
  const fmtRange = (a, b) => a.getMonth() === b.getMonth() ? a.getDate() + "–" + b.getDate() + " " + AY_CAP[b.getMonth()] + " " + b.getFullYear() : a.getDate() + " " + AY_CAP[a.getMonth()] + "–" + b.getDate() + " " + AY_CAP[b.getMonth()] + " " + b.getFullYear();
  function renderShiftBox() {
    const pd = programDates();
    const cur = pd.length ? fmtRange(pd[0].d, pd[pd.length - 1].d) : "–";
    const tags = pd.map(o => dayTag(o.d)).filter(Boolean);
    const ram = tags.filter(t => t === "Ramazan").length, other = tags.length - ram;
    const q = (v, l) => `<button type="button" class="chip ${pd.length && ymd(pd[0].d) === v ? "active" : ""}" data-shift="${v}">${l}</button>`;
    return `<div class="shift-box">
      <div class="b">📅 Eğitim başlangıcını değiştir</div>
      <div class="muted" style="font-size:14px">Şu anki program: <b>${cur}</b> · ${ram ? `<span style="color:var(--amber);font-weight:600">${ram} gün Ramazan'a denk</span>` : "Ramazan çakışması yok"}${other ? ` · <span style="color:var(--red);font-weight:600">${other} gün tatil/bayram</span>` : ""}</div>
      <div class="parts" style="padding-top:10px">${q("2027-02-01", "Şubat planı · 1 Şubat")}${q("2027-01-18", "Öneri A · 18 Ocak")}${q("2027-03-15", "Öneri B · 15 Mart")}</div>
      <div class="shift-row"><input type="date" id="shiftDate" value="${pd.length ? ymd(pd[0].d) : "2027-02-01"}" min="2026-11-01" max="2027-12-31"><button type="button" class="tbtn primary" data-shift="input">Bu tarihe taşı</button></div>
      <div class="muted" style="font-size:12.5px;margin-top:6px">Seçince program, görev takvimi, resmî yazılar, ihtiyaç listeleri ve sunucu metinlerindeki tüm tarihler, gün adları ve Ramazan işaretleri birlikte güncellenir. Yoklama kayıtları da yeni tarihlere taşınır.</div>
    </div>`;
  }
  let shiftPlan = null;
  function shiftPreview(val) {
    let d = parseYmd(val); if (!d) { toast("Geçerli bir tarih seçin"); return; }
    const snapped = d.getDay() !== 1;
    if (snapped) { const back = (d.getDay() + 6) % 7; d.setDate(d.getDate() - back); }
    const old = programDates(); if (!old.length) { toast("Programda tarih bulunamadı"); return; }
    if (ymd(old[0].d) === ymd(d)) { toast("Program zaten bu tarihte başlıyor"); return; }
    const nd = workdays(d, old.length);
    const map = {}; old.forEach((o, i) => { map[ymd(o.d)] = nd[i]; });
    const tags = nd.map(dayTag).filter(Boolean);
    const ram = tags.filter(t => t === "Ramazan").length, other = tags.length - ram;
    shiftPlan = { map, oldYear: old[0].d.getFullYear(), newStart: d };
    openSheet(`<h4>Programı taşı</h4>
      ${snapped ? `<p style="color:var(--amber)">Program haftalık düzende olduğu için başlangıç o haftanın pazartesisine (${fmtLong(d)}) alındı.</p>` : ""}
      <p><b>${fmtRange(old[0].d, old[old.length - 1].d)}</b> → <b>${fmtRange(nd[0], nd[nd.length - 1])}</b></p>
      <p>${ram ? `⚠️ ${ram} eğitim günü Ramazan'a denk geliyor.` : "✅ Ramazan çakışması yok."}${other ? `<br>⛔ ${other} gün resmî tatil veya bayrama denk geliyor; programda işaretlenecek.` : ""}</p>
      <p>Tüm bölümlerdeki tarihler, gün adları ve Ramazan işaretleri güncellenecek; değişiklik herkese yansır. Açık Noktalar'daki tarih maddesi tamamlandı olarak işaretlenecek.</p>
      <div class="row"><button type="button" class="tbtn" data-close>Vazgeç</button><button type="button" class="tbtn primary" data-act="shiftGo">Taşı</button></div>`);
  }
  function shiftText(text, map, year, style) {
    if (!text || !/\d/.test(text)) return text;
    const re = new RegExp("(\\d{1,2})\\.(\\d{1,2})\\.(\\d{4})|(\\d{1,2})\\s*[–-]\\s*(\\d{1,2})\\s+(" + MON_RE + ")(\\s+\\d{4})?|(\\d{1,2})\\s+(" + MON_RE + ")(?:\\s+(" + DAY_RE + "))?(\\s+\\d{4})?", "g");
    const look = d => map[ymd(d)];
    const pad = (n, like) => like.length === 2 ? String(n).padStart(2, "0") : String(n);
    return text.replace(re, (m, a1, a2, a3, b1, b2, bM, bY, c1, cM, cD, cY) => {
      if (a1) {
        const n = look(new Date(+a3, +a2 - 1, +a1)); if (!n) return m;
        return String(n.getDate()).padStart(2, "0") + "." + String(n.getMonth() + 1).padStart(2, "0") + "." + n.getFullYear();
      }
      if (b1) {
        const y = bY ? +bY.trim() : year, mi = AY_CAP.indexOf(bM);
        const na = look(new Date(y, mi, +b1)), nb = look(new Date(y, mi, +b2)); if (!na || !nb) return m;
        const out = na.getMonth() === nb.getMonth() ? na.getDate() + "–" + nb.getDate() + " " + AY_CAP[nb.getMonth()]
          : na.getDate() + " " + AY_CAP[na.getMonth()] + "–" + nb.getDate() + " " + AY_CAP[nb.getMonth()];
        return out + (bY ? " " + nb.getFullYear() : "");
      }
      const y = cY ? +cY.trim() : year;
      const n = look(new Date(y, AY_CAP.indexOf(cM), +c1)); if (!n) return m;
      let out = pad(n.getDate(), c1) + " " + AY_CAP[n.getMonth()];
      if (cD) out += " " + (style === "short" ? GUN_KISA : GUN_UZUN)[n.getDay()];
      if (cY) out += " " + n.getFullYear();
      return out;
    });
  }
  function blockStyle(b) {
    const t = b.t === "tbl" ? (b.rows || []).map(r => r[0]).join(" ") : (b.x || "");
    return /Pzt\.|Çarş\.|Perş\./.test(t) ? "short" : "long";
  }
  function retagProgram() {
    const t = programTable(); if (!t) return;
    const ni = (t.head || []).findIndex(h => /^not$/i.test(String(h).trim())); if (ni < 0) return;
    const yM = String((t.head || [])[0] || "").match(/(20\d\d)/); const year = yM ? +yM[1] : 2027;
    let cur = null;
    t.rows.forEach(r => {
      if (Exporter.isWeekRow(r)) return;
      const m = String(r[0] || "").match(new RegExp("(\\d{1,2})\\s+(" + MON_RE + ")"));
      if (m) cur = new Date(year, AY_CAP.indexOf(m[2]), +m[1]);
      if (!cur) return;
      let rest = String(r[ni] || "").replace(/Ramazan( 1\. gün)?/g, "").replace(/BAYRAM – eğitim yapılamaz/g, "").replace(/Resmî tatil: [^;]*/g, "").replace(/ikram planını gözden geçirin/g, "").replace(/^[;\s]+|[;\s]+$/g, "").replace(/;\s*;/g, ";");
      let tag = dayTag(cur);
      if (tag === "Ramazan" && /belge töreni/i.test(r.join(" "))) rest = rest ? rest + "; ikram planını gözden geçirin" : "ikram planını gözden geçirin";
      r[ni] = [tag, rest].filter(Boolean).join("; ");
    });
  }
  function applyShift() {
    if (!shiftPlan) return;
    if (editing) finishEdit();
    const { map, oldYear, newStart } = shiftPlan;
    const changed = [];
    data.sections.forEach(s => {
      if (s.id === "tarih") return;
      s.parts.forEach(p => {
        if (p.special) return;
        const before = JSON.stringify(p.blocks);
        p.blocks.forEach(b => {
          const st = blockStyle(b);
          if ("x" in b) b.x = shiftText(b.x, map, oldYear, st);
          if (b.items) b.items = b.items.map(i => typeof i === "string" ? shiftText(i, map, oldYear, st) : i);
          if (b.t === "tbl") { b.head = b.head.map(h => shiftText(h, map, oldYear, st)); b.rows = b.rows.map(r => r.map(c => shiftText(c, map, oldYear, st))); }
        });
        if (s.id === "program") retagProgram();
        if (JSON.stringify(p.blocks) !== before) changed.push(keyOf(s, p));
      });
    });
    const dateItem = checklistItems().find(i => /^Tarih/i.test(i.x));
    if (dateItem && !dateItem.done) { dateItem.done = true; const a = secById("acik"); if (a) changed.push(keyOf(a, a.parts[0])); }
    const natt = {};
    Object.keys(att || {}).forEach(k => { const n = map[k]; natt[n ? ymd(n) : k] = att[k]; });
    att = natt; store("bhc27_att", att);
    if (fb.ok) fb.root.child("attendance").set(att).catch(() => {});
    [...new Set(changed)].forEach(k => { dirty.add(k); queueWrite(k, true); });
    store(LS.dirty, [...dirty]); store(LS.data, data);
    addLog("Eğitim başlangıcını " + fmtLong(newStart) + " olarak değiştirdi");
    shiftPlan = null; yokDay = null;
    closeSheet(); renderNav(); render();
    toast("Tarihler güncellendi ✓ (" + changed.length + " sayfa)", 3500);
  }

  /* ---------- yoklama ve belge ---------- */
  const nkey = n => String(n).trim().toLocaleLowerCase("tr").replace(/[.#$\[\]\/]/g, "_").replace(/\s+/g, " ");
  function kursiyerNames() {
    const s = secById("kursiyer"); if (!s) return [];
    const t = s.parts[0].blocks.find(b => b.t === "tbl"); if (!t) return [];
    const hasNo = /^no$/i.test((t.head || [])[0] || "");
    const ci = hasNo ? 1 : 0;
    return (t.rows || []).map(r => String(r[ci] || "").trim()).filter(Boolean);
  }
  function classDays() {
    return programDates().filter(o => o.rows.some(r => r[2] && !/belge töreni/i.test(r[2]))).map(o => ymd(o.d));
  }
  const attTaken = () => Object.keys(att || {}).some(k => att[k] && Object.keys(att[k]).length);
  function belgeStats() {
    const days = classDays(), names = kursiyerNames();
    const D = days.length, M = Math.min(settings.minDays || Math.ceil(D * 0.7), D || 1);
    const rows = names.map(n => { const k = nkey(n); const c = days.filter(d => att[d] && att[d][k]).length; return { n, c, ok: c >= M }; });
    return { D, M, rows, eligible: rows.filter(r => r.ok).length, total: names.length };
  }
  function defaultYokDay(days) {
    const t = todayKey();
    if (days.includes(t)) return t;
    return days.find(d => d > t) || days[days.length - 1];
  }
  const shortDay = s => { const d = parseYmd(s); return d.getDate() + " " + AY_CAP[d.getMonth()].slice(0, 3) + " " + GUN_KISA[d.getDay()].replace(".", ""); };
  function renderYoklama() {
    const names = kursiyerNames(), days = classDays();
    if (!names.length) return `<p class="muted">Önce "Kursiyer listesi" sayfasına listeyi yükleyin (Ayarlar → Excel'den yükle).</p>`;
    if (!days.length) return `<p class="muted">Programda ders günü bulunamadı.</p>`;
    if (!yokDay || !days.includes(yokDay)) yokDay = defaultYokDay(days);
    const pres = att[yokDay] || {};
    const cnt = names.filter(n => pres[nkey(n)]).length;
    const fc = (f, l) => `<button type="button" class="chip ${yokFilter === f ? "active" : ""}" data-yfilter="${f}">${l}</button>`;
    return `<div class="parts">${days.map(d => { const c = names.filter(n => (att[d] || {})[nkey(n)]).length; return `<button type="button" class="chip ${d === yokDay ? "active" : ""}" data-yday="${d}">${shortDay(d)}${c ? ` · ${c}` : ""}</button>`; }).join("")}</div>
      <div class="yok-sticky">
        <div class="count-bar" id="yokCount" style="margin-top:0"><b>${cnt}/${names.length}</b> geldi · ${fmtLong(parseYmd(yokDay))}</div>
        <input type="search" id="yokQ" class="yok-search" placeholder="🔍 Ad veya soyad yazın…" value="${esc(yokQ)}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="done">
        <div class="parts" style="padding:6px 0 0">${fc("absent", "Gelmeyenler")}${fc("present", "Gelenler")}${fc("all", "Tümü")}</div>
      </div>
      <ul class="yok-list" id="yokList">${names.map((n, i) => { const k = nkey(n); return `<li data-f="${esc(fold(n))}" data-p="${pres[k] ? 1 : 0}"><label><input type="checkbox" data-yname="${esc(n)}" ${pres[k] ? "checked" : ""}><span>${i + 1}. ${esc(n)}</span></label></li>`; }).join("")}</ul>
      <p class="muted" id="yokNone" hidden>Eşleşen isim yok.</p>
      <div class="shift-row" style="margin-top:14px"><button type="button" class="tbtn" data-yall="1">Tümünü geldi işaretle</button><button type="button" class="tbtn" data-yall="0">Bu günü temizle</button></div>`;
  }
  function yokApplyFilter() {
    const q = fold(yokQ);
    let shown = 0;
    document.querySelectorAll("#yokList li").forEach(li => {
      const okQ = !q || li.dataset.f.split(" ").some(w => w.startsWith(q)) || li.dataset.f.includes(q);
      const okF = yokFilter === "all" || (yokFilter === "present" ? li.dataset.p === "1" : li.dataset.p !== "1");
      const show = okQ && (q ? true : okF);
      li.style.display = show ? "" : "none"; if (show) shown++;
    });
    const none = $("#yokNone"); if (none) none.hidden = shown > 0;
  }
  function setAtt(day, name, val) {
    if (!day) return;
    const k = nkey(name);
    att[day] = att[day] || {};
    if (val) att[day][k] = true; else delete att[day][k];
    store("bhc27_att", att);
    if (fb.ok) fb.root.child("attendance/" + day + "/" + k).set(val ? true : null).catch(err => toast("Kaydedilemedi: " + err.message));
    const names = kursiyerNames(); const cnt = names.filter(n => (att[day] || {})[nkey(n)]).length;
    const el = $("#yokCount"); if (el) el.innerHTML = `<b>${cnt}/${names.length}</b> geldi · ${fmtLong(parseYmd(day))}`;
    const box = document.querySelector(`input[data-yname="${CSS.escape(name)}"]`);
    if (box) { box.checked = !!val; box.closest("li").dataset.p = val ? 1 : 0; }
    const qi = $("#yokQ");
    if (val && qi && qi.value.trim()) { toast("✓ " + name + " geldi", 1500); qi.value = ""; yokQ = ""; qi.focus(); }
    yokApplyFilter();
    if (!loggedYok.has(day)) { loggedYok.add(day); addLog("Yoklama aldı: " + fmtLong(parseYmd(day))); }
    renderProgress();
  }
  function yokAll(val) {
    const names = kursiyerNames(); if (!yokDay || !names.length) return;
    if (!val && !confirm("Bu günün yoklaması temizlensin mi?")) return;
    const obj = {}; if (val) names.forEach(n => { obj[nkey(n)] = true; });
    att[yokDay] = obj; store("bhc27_att", att);
    if (fb.ok) fb.root.child("attendance/" + yokDay).set(val ? obj : null).catch(() => {});
    addLog((val ? "Tümünü geldi işaretledi: " : "Yoklamayı temizledi: ") + fmtLong(parseYmd(yokDay)));
    render();
  }
  function renderBelge() {
    const B = belgeStats();
    if (!B.total) return `<p class="muted">Önce "Kursiyer listesi" sayfasına listeyi yükleyin.</p>`;
    const rows = belgeOnly ? B.rows.filter(r => r.ok) : B.rows;
    return `<div class="count-bar"><b>${B.eligible}</b> kursiyer belge almaya hak kazandı · toplam ${B.total}</div>
      <div class="shift-row" style="align-items:center"><span>Belge için en az</span><input type="number" id="minDays" min="1" max="${B.D}" value="${B.M}" style="width:72px"><span>/ ${B.D} gün katılım</span></div>
      <label class="cb" style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="belgeOnly" ${belgeOnly ? "checked" : ""}> Yalnız hak kazananları göster</label>
      ${attTaken() ? "" : `<p class="muted">Henüz yoklama alınmadı; "Yoklama" sayfasından gün gün işaretleyin.</p>`}
      <div class="tbl-wrap"><table><thead><tr><th>No</th><th>Ad Soyad</th><th>Katılım</th><th>Belge</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr class="${r.ok ? "" : "no-belge"}"><td>${i + 1}</td><td>${esc(r.n)}</td><td>${r.c}/${B.D}</td><td>${r.ok ? "✓ Hak kazandı" : "—"}</td></tr>`).join("")}
      </tbody></table></div>`;
  }
  function blocksOf(p) {
    if (p.special === "belge") {
      const B = belgeStats();
      return [{ t: "p", x: `Belge için en az ${B.M}/${B.D} gün katılım gerekir. ${B.eligible} kursiyer hak kazandı (toplam ${B.total}).` },
        { t: "tbl", head: ["No", "Ad Soyad", "Katılım", "Belge"], rows: B.rows.map((r, i) => [String(i + 1), r.n, r.c + "/" + B.D, r.ok ? "Hak kazandı" : "—"]) }];
    }
    if (p.special === "yoklama") {
      const days = classDays(), names = kursiyerNames();
      return [{ t: "p", x: `Yoklama çizelgesi · ${names.length} kursiyer · ${days.length} ders günü` },
        { t: "tbl", head: ["No", "Ad Soyad"].concat(days.map(d => { const x = parseYmd(d); return x.getDate() + "." + (x.getMonth() + 1); }), ["Toplam"]),
          rows: names.map((n, i) => { const k = nkey(n); const marks = days.map(d => (att[d] || {})[k] ? "✓" : ""); return [String(i + 1), n].concat(marks, [String(marks.filter(Boolean).length)]); }) }];
    }
    return p.blocks;
  }

  /* ---------- son değişiklikler (kişiye göre) ---------- */
  function renderLogGroups() {
    const groups = [];
    log.forEach(l => { let g = groups.find(x => x.who === l.who); if (!g) groups.push(g = { who: l.who, items: [] }); g.items.push(l); });
    return `<div class="logp-list">${groups.map(g => `<details class="logp" ${openLogs.has(g.who) ? "open" : ""}><summary data-logwho="${esc(g.who)}"><b>${esc(g.who)}</b><span class="muted"> · ${g.items.length} değişiklik · son ${timeAgo(g.items[0].at)}</span></summary>
      <ul class="log">${g.items.slice(0, 40).map(l => `<li>${esc(l.what)} <span class="when">${timeAgo(l.at)}</span></li>`).join("")}</ul></details>`).join("")}</div>`;
  }

  /* ---------- ek sekmeler ---------- */
  let remoteParts = {};
  function customMap() {
    const m = {};
    data.sections.forEach((s, i) => { if (s.custom) m[s.id] = { title: s.title, icon: s.icon || "📋", order: i, parts: s.parts.map(p => ({ id: p.id, title: p.title })) }; });
    return m;
  }
  function pushCustom() { if (fb.ok) fb.root.child("custom").set(customMap()).catch(err => toast("Kaydedilemedi: " + err.message)); }
  function createSection(title, icon, blocks) {
    const id = "x" + Date.now().toString(36);
    const sec = { id, icon: icon || "📋", title, custom: true, parts: [{ id: "main", title, blocks }] };
    data.sections.push(sec); store(LS.data, data);
    const k = keyOf(sec, sec.parts[0]);
    dirty.add(k); store(LS.dirty, [...dirty]);
    if (fb.ok) {
      fb.root.child("parts/" + k).set(blocks).then(() => { dirty.delete(k); store(LS.dirty, [...dirty]); }).catch(() => {});
      pushCustom();
    }
    addLog("Yeni sekme açtı: " + title);
    return sec;
  }
  function tabsSheet() {
    const list = data.sections.filter(s => s.custom);
    openSheet(`<h4>Sekmeler</h4><p>Eklediğiniz sekmeler herkeste görünür. Hazır bölümler burada listelenmez ve silinemez.</p>
      ${list.length ? list.map(s => `<div class="opt tab-row"><span>${s.icon} ${esc(s.title)}</span><button type="button" class="mini" data-act="tabRename" data-id="${s.id}" aria-label="Adını değiştir">✏️</button><button type="button" class="mini del" data-act="tabDel" data-id="${s.id}" aria-label="Sil">✕</button></div>`).join("") : `<p class="muted">Henüz eklenmiş sekme yok.</p>`}
      <button type="button" class="opt" data-act="tabNew">➕ Yeni sekme<small>Boş bir tabloyla başlar; başlıkları, satırları ve sütunları düzenleyebilirsiniz</small></button>
      <button type="button" class="opt" data-act="xlsx">📥 Excel'den yükle<small>Excel tablosunu yeni ya da mevcut sekmeye aktar</small></button>
      <div class="row"><button type="button" class="tbtn" data-close>Kapat</button></div>`);
  }
  function tabNew() {
    const name = (prompt("Yeni sekmenin adı:", "") || "").trim();
    if (!name) return;
    const sec = createSection(name, "📋", [
      { t: "p", x: "[Açıklama yazın]" },
      { t: "tbl", head: ["No", "Sütun 1", "Sütun 2"], rows: [["1", "", ""]] }
    ]);
    closeSheet(); go(sec.id); toast("Sekme açıldı. Düzenle ile içeriği doldurun.");
  }
  function tabRename(id) {
    const s = secById(id); if (!s) return;
    const name = (prompt("Sekmenin yeni adı:", s.title) || "").trim();
    if (!name || name === s.title) return;
    s.title = name; if (s.parts.length === 1) s.parts[0].title = name;
    store(LS.data, data); pushCustom();
    addLog("Sekme adını değiştirdi: " + name);
    renderNav(); tabsSheet(); if (view.sec === id) render();
  }
  function tabDel(id) {
    const s = secById(id); if (!s) return;
    if (!confirm(`"${s.title}" sekmesi ve içindeki her şey herkes için silinecek. Emin misiniz?`)) return;
    data.sections = data.sections.filter(x => x !== s);
    s.parts.forEach(p => { const k = keyOf(s, p); dirty.delete(k); if (fb.ok) fb.root.child("parts/" + k).remove().catch(() => {}); });
    store(LS.dirty, [...dirty]);
    delete done[id]; store(LS.done, done); if (fb.ok) fb.root.child("done/" + id).remove().catch(() => {});
    store(LS.data, data); pushCustom();
    addLog("Sekmeyi sildi: " + s.title);
    if (view.sec === id) view.sec = "program";
    renderNav(); render(); tabsSheet();
  }

  /* ---------- Excel'den yükleme ---------- */
  const imp = { wb: null, file: "", sheet: "", rows: [], headIdx: 0 };
  const NAME_WORDS = ["ad", "adı", "adi", "soyad", "soyadı", "soyadi", "isim", "ismi", "soyisim", "soyismi", "name", "surname"];
  const NOT_NAME = ["baba", "anne", "veli", "kullanıcı", "kullanici", "bostan", "parsel", "kurum", "firma", "dosya"];
  function isNameCol(h) {
    const w = String(h || "").toLocaleLowerCase("tr").split(/[^a-zçğıöşüâîû]+/).filter(Boolean);
    return w.some(x => NAME_WORDS.includes(x)) && !w.some(x => NOT_NAME.includes(x));
  }
  async function importRead(file) {
    toast("Excel okunuyor…", 4000);
    try {
      await Exporter.loadReader();
      const buf = await file.arrayBuffer();
      imp.wb = window.XLSX.read(buf, { type: "array" });
      imp.file = file.name.replace(/\.[^.]+$/, "");
      imp.sheet = imp.wb.SheetNames[0];
      $("#toast").classList.remove("show");
      importSheet();
    } catch (e) { console.error(e); toast("Dosya okunamadı: " + (e.message || e), 5000); }
  }
  function importSheet() {
    const ws = imp.wb.Sheets[imp.sheet];
    const all = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false, blankrows: false })
      .map(r => r.map(c => String(c == null ? "" : c).trim()));
    let hi = all.findIndex(r => r.filter(Boolean).length >= 2);
    if (hi < 0) hi = all.findIndex(r => r.some(Boolean));
    imp.headIdx = Math.max(hi, 0); imp.rows = all;
    const head = (all[imp.headIdx] || []).map((h, i) => h || ("Sütun " + (i + 1)));
    const body = all.slice(imp.headIdx + 1).filter(r => r.some(Boolean));
    const nameCols = head.map((h, i) => isNameCol(h) ? i : -1).filter(i => i >= 0);
    const customs = data.sections.filter(s => s.custom);
    const defName = nameCols.length ? "Kursiyerler" : imp.file;
    openSheet(`<h4>Excel'den yükle</h4><p>${esc(imp.file)} · ${body.length} satır bulundu.</p>
      ${imp.wb.SheetNames.length > 1 ? `<div class="lbl">Excel sayfası</div><select id="impSheet">${imp.wb.SheetNames.map(n => `<option ${n === imp.sheet ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>` : ""}
      <div class="lbl">Alınacak sütunlar</div>
      ${!nameCols.length ? `<p style="margin:4px 0">Ad-soyad sütunu bulunamadı; almak istediğiniz sütunları işaretleyin.</p>` : `<p style="margin:4px 0">Yalnız ad-soyad sütunları işaretli. Telefon, T.C. kimlik numarası gibi kişisel bilgileri eklemeyin; bu sayfa giriş gerektirmiyor.</p>`}
      ${head.map((h, i) => `<label class="cb"><input type="checkbox" class="impCol" value="${i}" ${nameCols.includes(i) ? "checked" : ""}> ${esc(h)} <span class="muted" style="font-size:12px">${esc((body[0] || [])[i] || "")}</span></label>`).join("")}
      ${nameCols.length > 1 ? `<label class="cb"><input type="checkbox" id="impMerge" checked> Ad ve soyadı tek "Ad Soyad" sütununda birleştir</label>` : ""}
      <label class="cb"><input type="checkbox" id="impNo" checked> Başa sıra numarası ekle</label>
      <div class="lbl">Nereye yüklensin?</div>
      <select id="impTarget">${secById("kursiyer") ? `<option value="kursiyer" ${nameCols.length ? "selected" : ""}>👥 Kursiyerler (liste yenilenir)</option>` : ""}<option value="__new" ${nameCols.length ? "" : "selected"}>Yeni sekme</option>${customs.map(s => `<option value="${s.id}">${esc(s.title)} (içeriği değişir)</option>`).join("")}</select>
      <label class="cb"><input type="checkbox" id="impSort" ${nameCols.length ? "checked" : ""}> Ada göre A→Z sırala ve toplamı göster</label>
      <div id="impNameWrap" ${nameCols.length && secById("kursiyer") ? "hidden" : ""}><div class="lbl">Yeni sekmenin adı</div><input type="text" id="impName" value="${esc(defName)}"></div>
      <div class="row"><button type="button" class="tbtn" data-close>Vazgeç</button><button type="button" class="tbtn primary" data-act="impRun">Yükle</button></div>`);
  }
  function importRun() {
    const cols = [...document.querySelectorAll(".impCol:checked")].map(x => +x.value);
    if (!cols.length) { toast("En az bir sütun seçin"); return; }
    const withNo = $("#impNo").checked;
    const target = $("#impTarget").value;
    const head0 = (imp.rows[imp.headIdx] || []).map((h, i) => h || ("Sütun " + (i + 1)));
    let body = imp.rows.slice(imp.headIdx + 1).map(r => cols.map(i => r[i] || "")).filter(r => r.some(Boolean));
    let heads = cols.map(i => head0[i]);
    const mergeEl = $("#impMerge");
    if (mergeEl && mergeEl.checked) {
      const nm = cols.map((c, k) => isNameCol(head0[c]) ? k : -1).filter(k => k >= 0);
      if (nm.length > 1) {
        body = body.map(r => { const name = nm.map(k => r[k]).filter(Boolean).join(" ").replace(/\s+/g, " ").trim(); return [name].concat(r.filter((_, k) => !nm.includes(k))); });
        heads = ["Ad Soyad"].concat(heads.filter((_, k) => !nm.includes(k)));
      }
    }
    const head = (withNo ? ["No"] : []).concat(heads);
    const rows = body.map((r, n) => (withNo ? [String(n + 1)] : []).concat(r));
    const when = new Date().toLocaleDateString("tr-TR");
    const sorted = $("#impSort").checked;
    const tbl = { t: "tbl", head, rows };
    if (sorted) { tbl.sort = true; tbl.count = target === "kursiyer" ? "kursiyer" : "kayıt"; tidyTable(tbl); }
    const blocks = [{ t: "p", x: `${imp.file} dosyasından ${tbl.rows.length} kayıt yüklendi (${when}).` }, tbl];
    let sec;
    if (target === "__new") {
      const name = ($("#impName").value || "").trim() || imp.file;
      sec = createSection(name, "👥", blocks);
    } else {
      sec = secById(target); if (!sec) return;
      const hasRows = sec.parts[0].blocks.some(b => b.t === "tbl" && (b.rows || []).length);
      if (hasRows && !confirm(`"${sec.title}" sekmesindeki mevcut liste bu tabloyla değiştirilecek. Devam edilsin mi?`)) return;
      sec.parts[0].blocks = blocks;
      const k = keyOf(sec, sec.parts[0]);
      dirty.add(k); store(LS.dirty, [...dirty]); store(LS.data, data);
      queueWrite(k, true);
      addLog(`${sec.title} sekmesine Excel'den ${rows.length} kayıt yükledi`);
    }
    closeSheet(); go(sec.id); toast(rows.length + " kayıt yüklendi ✓");
  }

  /* ---------- olaylar ---------- */
  document.addEventListener("click", e => {
    const t = e.target;
    const nav = t.closest("[data-nav]"); if (nav) { go(nav.dataset.nav); return; }
    const part = t.closest("[data-part]");
    if (part) { if (editing) finishEdit(); view.part = view.part || {}; view.part[curSec().id] = part.dataset.part; store(LS.view, view); render(); return; }
    if (t.closest("#editBtn")) { editing ? (finishEdit(), render()) : startEdit(); return; }
    const ex = t.closest("[data-exp]"); if (ex) { exportChooser(ex.dataset.exp); return; }
    const run = t.closest("[data-run]"); if (run) { runExport(run.dataset.run, run.dataset.scope); return; }
    const op = t.closest("button[data-op]"); if (op) { onOp(op); return; }
    const sh = t.closest("[data-shift]"); if (sh) { shiftPreview(sh.dataset.shift === "input" ? ($("#shiftDate") || {}).value : sh.dataset.shift); return; }
    if (t.closest("[data-act='shiftGo']")) { applyShift(); return; }
    const yd = t.closest("[data-yday]"); if (yd) { yokDay = yd.dataset.yday; render(); return; }
    const yf = t.closest("[data-yfilter]"); if (yf) { yokFilter = yf.dataset.yfilter; document.querySelectorAll("[data-yfilter]").forEach(b => b.classList.toggle("active", b === yf)); yokApplyFilter(); return; }
    const ya = t.closest("[data-yall]"); if (ya) { yokAll(ya.dataset.yall === "1"); return; }
    const lg = t.closest("[data-logwho]"); if (lg) { const k = lg.dataset.logwho; openLogs.has(k) ? openLogs.delete(k) : openLogs.add(k); return; }
    if (t.closest("[data-close]") || t === $("#sheetBack")) { closeSheet(); return; }
    if (t.closest("#menuBtn") || t.closest("#syncBtn") || t.closest("#navSettings")) { menu(); return; }
    if (t.closest("#speakBtn")) { speak(); return; }
    if (t.closest("#stopBtn")) { if ("speechSynthesis" in window) speechSynthesis.cancel(); return; }
    const act = t.closest("[data-act]");
    if (act) {
      const a = act.dataset.act;
      if (a === "name") askName(true);
      if (a === "saveName") {
        const v = ($("#nameIn").value || "").trim();
        if (!v) { toast("Lütfen adınızı yazın"); return; }
        me = v; localStorage.setItem(LS.me, me); closeSheet(); toast("Merhaba " + me); presenceStart();
      }
      if (a === "tabs") tabsSheet();
      if (a === "tabNew") tabNew();
      if (a === "tabRename") tabRename(act.dataset.id);
      if (a === "tabDel") tabDel(act.dataset.id);
      if (a === "xlsx") { closeSheet(); $("#xlsxFile").click(); }
      if (a === "impRun") importRun();
      if (a === "install" && installEvt) { closeSheet(); installEvt.prompt(); installEvt = null; }
      if (a === "backup") { closeSheet(); backup(); }
      if (a === "restore") { closeSheet(); $("#importFile").click(); }
      if (a === "reset") {
        if (!confirm("Tüm düzenlemeler silinip ilk taslağa dönülecek. Bu işlem herkes için geçerli. Emin misiniz?")) return;
        closeSheet(); restoreFrom({ data: clone(DEF), done: {} });
      }
    }
  });
  document.addEventListener("change", e => {
    if (e.target.id === "doneChk") { setDone(curSec().id, e.target.checked); return; }
    if (e.target.matches("input[data-op='chk']")) { onOp(e.target); return; }
    if (e.target.matches("input[data-yname]")) { setAtt(yokDay, e.target.dataset.yname, e.target.checked); return; }
    if (e.target.id === "minDays") { const v = Math.max(1, parseInt(e.target.value, 10) || 1); settings.minDays = v; store("bhc27_settings", settings); if (fb.ok) fb.root.child("settings/minDays").set(v).catch(() => {}); addLog("Belge için en az gün sayısını " + v + " yaptı"); render(); return; }
    if (e.target.id === "belgeOnly") { belgeOnly = e.target.checked; render(); return; }
    if (e.target.id === "xlsxFile") { const f = e.target.files[0]; e.target.value = ""; if (f) importRead(f); return; }
    if (e.target.id === "impSheet") { imp.sheet = e.target.value; importSheet(); return; }
    if (e.target.id === "impTarget") { const n = $("#impNameWrap"); if (n) n.hidden = e.target.value !== "__new"; return; }
    if (e.target.id === "importFile") {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const o = JSON.parse(r.result); if (confirm("Yedek yüklensin mi? Mevcut içerik herkes için değişecek.")) restoreFrom(o); } catch (err) { toast("Dosya okunamadı"); } };
      r.readAsText(f); e.target.value = "";
    }
  });
  document.addEventListener("input", e => {
    if (e.target.id === "yokQ") { yokQ = e.target.value; yokApplyFilter(); return; }
    onInput(e);
  });
  document.addEventListener("paste", e => {
    const el = e.target.closest && e.target.closest("[contenteditable]");
    if (!el) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, text);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !$("#sheetBack").hidden) closeSheet();
    if (e.key === "Enter" && e.target.id === "yokQ") {
      e.preventDefault();
      const vis = [...document.querySelectorAll("#yokList li")].filter(li => li.style.display !== "none" && li.dataset.p !== "1");
      if (vis.length === 1) { const cb = vis[0].querySelector("input"); setAtt(yokDay, cb.dataset.yname, true); }
      else if (vis.length > 1) toast(vis.length + " kişi eşleşti; birine dokunun");
      else e.target.blur();
    }
  });
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; });
  window.addEventListener("beforeunload", () => { Object.keys(writeTimers).forEach(flushWrite); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") { Object.keys(writeTimers).forEach(flushWrite); presenceAway(); }
    else presenceStart();
  });
  setInterval(() => {
    if (presDay && presDay !== todayKey()) presenceStart();
    if (view.sec === "durum" && !editing && $("#sheetBack").hidden) render();
  }, 60000);

  /* ---------- başlat ---------- */
  renderNav(); render();
  setSync("", "Bağlanıyor");
  fbInit();
  askName(false);
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
