/* Synapse Econs: optional sign-up and usage tracking.
   Dormant until assets/config.js sets an endpoint. Nothing is sent unless the
   student has signed up and ticked the consent box. */
(function () {
  'use strict';
  var CFG = window.SYNAPSE_TRACK || {};
  var EP = CFG.endpoint || '';
  var PK = 'synapse-econs-profile-v1', SK = 'synapse-econs-skip-v1', QK = 'synapse-econs-queue-v1';
  var CONSENT_VERSION = 1, SKIP_DAYS = 7, QUEUE_MAX = 200;

  function get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function uid() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    var s = '', i; for (i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    return s.slice(0, 8) + '-' + s.slice(8, 12) + '-' + s.slice(12, 16) + '-' + s.slice(16, 20) + '-' + s.slice(20);
  }
  function page() { var p = location.pathname.split('/').pop().replace('.html', ''); return !p || p === 'index' ? 'home' : p; }

  var profile = get(PK);

  /* ---------- sending: queue, then best-effort POST ---------- */
  var flushing = false;
  function flush() {
    if (!EP || flushing) return;
    var q = get(QK) || [];
    if (!q.length) return;
    flushing = true;
    var item = q[0];
    var done = function (ok) {
      flushing = false;
      if (!ok) return;
      var cur = get(QK) || []; cur.shift(); set(QK, cur);
      if (cur.length) flush();
    };
    try {
      fetch(EP, { method: 'POST', mode: 'no-cors', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(item) })
        .then(function () { done(true); }, function () { done(false); });
    } catch (e) { flushing = false; }
  }
  function send(event, data, withProfile) {
    if (!EP || !profile) return;
    var item = { app: 'synapse-econs', v: 1, uid: profile.uid, event: event, ts: new Date().toISOString(), page: page(), data: data || {} };
    if (withProfile) item.profile = withProfile;
    var q = get(QK) || [];
    q.push(item);
    if (q.length > QUEUE_MAX) q = q.slice(q.length - QUEUE_MAX);
    set(QK, q);
    flush();
  }
  window.synTrack = function (event, data) { try { send(event, data); } catch (e) {} };
  window.addEventListener('online', flush);

  if (!EP) return; /* dormant: no form, no nav link, no sending */

  /* ---------- styles ---------- */
  var css = '' +
    '#syn-ov{position:fixed;inset:0;z-index:1000;background:rgba(8,14,22,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,Catamaran,system-ui,sans-serif}' +
    '#syn-card{--c-bg:#fff;--c-ink:#15302e;--c-mut:#5b6b68;--c-line:#dad8cc;--c-acc:#1e5a55;--c-on:#fff;--c-bad:#b03a33;' +
    'background:var(--c-bg);color:var(--c-ink);border-radius:14px;max-width:440px;width:100%;max-height:92vh;overflow:auto;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.4)}' +
    '@media (prefers-color-scheme:dark){#syn-card{--c-bg:#17221f;--c-ink:#e6eeea;--c-mut:#98a9a4;--c-line:#2a3834;--c-acc:#7fc3b8;--c-on:#0c1311;--c-bad:#ee8a80}}' +
    '#syn-card h2{font:800 22px/1.2 Catamaran,Inter,system-ui,sans-serif;margin:0 0 6px}' +
    '#syn-card p{margin:0 0 12px;font-size:14px;line-height:1.5;color:var(--c-mut)}' +
    '#syn-card label.f{display:block;font-size:13px;font-weight:600;margin:10px 0 4px}' +
    '#syn-card input[type=text],#syn-card input[type=email],#syn-card select{width:100%;box-sizing:border-box;font:16px Inter,system-ui,sans-serif;padding:10px 12px;border-radius:10px;border:1px solid var(--c-line);background:transparent;color:var(--c-ink)}' +
    '#syn-card .consent{display:flex;gap:10px;align-items:flex-start;margin:14px 0 4px;font-size:13px;line-height:1.5;color:var(--c-ink)}' +
    '#syn-card .consent input{margin-top:3px;width:18px;height:18px;flex:none;accent-color:var(--c-acc)}' +
    '#syn-card .small{font-size:12px;color:var(--c-mut);margin:10px 0 0}' +
    '#syn-card .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}' +
    '#syn-card button{font:600 15px Catamaran,Inter,system-ui,sans-serif;padding:10px 18px;border-radius:10px;border:1px solid var(--c-line);background:transparent;color:var(--c-ink);cursor:pointer}' +
    '#syn-card button.p{background:var(--c-acc);border-color:var(--c-acc);color:var(--c-on)}' +
    '#syn-card button.d{border-color:transparent;color:var(--c-bad);margin-left:auto}' +
    '#syn-card button:focus-visible,#syn-card input:focus-visible,#syn-card select:focus-visible{outline:3px solid var(--c-acc);outline-offset:2px}' +
    '#syn-err{color:var(--c-bad);font-size:13px;min-height:1em;margin:8px 0 0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- modal ---------- */
  var overlay = null, lastFocus = null;
  function close() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey, true);
    overlay.remove(); overlay = null;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }
  function onKey(e) {
    if (!overlay) return;
    if (e.key === 'Escape') { e.preventDefault(); skip(); return; }
    if (e.key !== 'Tab') return;
    var f = overlay.querySelectorAll('input,select,button,a[href]');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function skip() { if (!profile) set(SK, Date.now()); close(); }

  function open(mode) {
    if (overlay) return;
    lastFocus = document.activeElement;
    var edit = mode === 'edit' && profile;
    overlay = document.createElement('div'); overlay.id = 'syn-ov';
    overlay.innerHTML =
      '<form id="syn-card" role="dialog" aria-modal="true" aria-labelledby="syn-h" novalidate>' +
      '<h2 id="syn-h">' + (edit ? 'Your details' : 'Welcome to Synapse Econs') + '</h2>' +
      '<p>' + (edit ? 'You can update or delete the details we hold about you.' :
        'Sign up so your teacher can see how the labs are being used. It takes 30 seconds, and the labs work without it.') + '</p>' +
      '<label class="f" for="syn-name">Name</label><input id="syn-name" type="text" autocomplete="name" maxlength="80" required>' +
      '<label class="f" for="syn-school">School</label><input id="syn-school" type="text" autocomplete="organization" maxlength="80" required>' +
      '<label class="f" for="syn-level">Level</label><select id="syn-level" required><option value="">Choose…</option><option>JC1</option><option>JC2</option><option>Other</option></select>' +
      '<label class="f" for="syn-email">Email</label><input id="syn-email" type="email" autocomplete="email" maxlength="120" required>' +
      '<label class="consent"><input id="syn-ok" type="checkbox"><span>I agree that Synapse Econs may collect my name, school, level and email, and record which labs I use and my scores, so my teacher can see how the app is used and help me. This is kept private and is never shared or sold. I am 13 or older, or my parent or guardian has agreed.</span></label>' +
      '<p class="small">You can see, change or delete your details any time from the last link in the menu bar (it shows your first name)' + (CFG.contact ? ' or by emailing ' + CFG.contact.replace(/[<>&"]/g, '') : '') + '.</p>' +
      '<div id="syn-err" role="alert"></div>' +
      '<div class="row"><button type="submit" class="p">' + (edit ? 'Save' : 'Sign up') + '</button>' +
      '<button type="button" id="syn-skip">' + (edit ? 'Close' : 'Skip for now') + '</button>' +
      (edit ? '<button type="button" class="d" id="syn-del">Delete my details</button>' : '') + '</div></form>';
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey, true);
    var $ = function (id) { return overlay.querySelector('#' + id); };
    if (edit) { $('syn-name').value = profile.name; $('syn-school').value = profile.school; $('syn-level').value = profile.level; $('syn-email').value = profile.email; $('syn-ok').checked = true; }
    $('syn-skip').onclick = skip;
    if (edit) $('syn-del').onclick = function () {
      if (!window.confirm('Delete your details? Your lab progress on this device stays.')) return;
      var id = profile.uid;
      profile = { uid: id }; send('withdraw', {}); profile = null;
      del(PK); set(SK, Date.now()); label(); close();
    };
    overlay.querySelector('form').onsubmit = function (ev) {
      ev.preventDefault();
      var v = { name: $('syn-name').value.trim(), school: $('syn-school').value.trim(), level: $('syn-level').value, email: $('syn-email').value.trim() };
      var err = '';
      if (!v.name) err = 'Please enter your name.';
      else if (!v.school) err = 'Please enter your school.';
      else if (!v.level) err = 'Please choose your level.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) err = 'Please enter a valid email address.';
      else if (!$('syn-ok').checked) err = 'Please tick the box to agree, or choose Skip for now.';
      if (err) { $('syn-err').textContent = err; return; }
      profile = { uid: (profile && profile.uid) || uid(), name: v.name, school: v.school, level: v.level, email: v.email, consent_at: new Date().toISOString(), consent_v: CONSENT_VERSION };
      set(PK, profile); del(SK);
      send('signup', {}, { name: v.name, school: v.school, level: v.level, email: v.email, consent_at: profile.consent_at, consent_v: CONSENT_VERSION });
      send('view', {});
      label(); close();
    };
    setTimeout(function () { var f = $('syn-name'); if (f) f.focus(); }, 0);
  }

  /* ---------- nav link ---------- */
  var navLink = null;
  function label() { if (navLink) navLink.textContent = profile && profile.name ? 'Hi, ' + profile.name.split(' ')[0].slice(0, 12) : 'Sign up'; }
  function init() {
    var links = document.querySelector('.nav-links');
    if (links) {
      navLink = document.createElement('a'); navLink.href = '#'; navLink.id = 'syn-nav';
      navLink.onclick = function (e) { e.preventDefault(); open(profile ? 'edit' : 'new'); };
      links.appendChild(navLink); label();
    }
    if (profile) { send('view', {}); flush(); }
    else {
      var s = get(SK);
      if (!s || Date.now() - s > SKIP_DAYS * 864e5) setTimeout(function () { open('new'); }, 500);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
