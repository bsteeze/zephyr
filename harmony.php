<?php
/**
 * Harmony of the Year
 * Standalone PHP + JavaScript prototype.
 * No database required. Saved groups use browser localStorage.
 */
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090b12">
  <title>Harmony of the Year</title>
  <link rel="stylesheet" href="harmony.css?v=20260717-observatory3">
</head>
<body>
<div class="app-shell">
  <header class="topbar">
    <div>
      <p class="eyebrow">Music × Calendar × Zodiac</p>
      <h1>Harmony of the Year</h1>
      <p class="subtitle">Turn birthdays into intervals, chords, and a playable solar harmony.</p>
    </div>
    <div class="header-actions">
      <button class="btn ghost" id="resetBtn" type="button">Reset</button>
      <button class="btn" id="playBtn" type="button">▶ Hold to ring</button>
    </div>
  </header>

  <main class="dashboard-grid">
    <section class="panel wheel-panel">
      <div class="panel-heading">
        <div>
          <p class="kicker">Celestial harmony instrument · engraved SVG v3</p>
          <h2 id="groupTitle">Family Chord</h2>
        </div>
        <div class="segmented" aria-label="Pitch mode">
          <button class="segment active" type="button" data-mode="continuous">Solar</button>
          <button class="segment" type="button" data-mode="snap">12-tone</button>
        </div>
      </div>

      <div class="wheel-toolbar" aria-label="Wheel display controls">
        <label class="layer-toggle"><input type="checkbox" data-layer="stars" checked><span>Stars</span></label>
        <label class="layer-toggle"><input type="checkbox" data-layer="zodiac" checked><span>Engraved signs</span></label>
        <label class="layer-toggle"><input type="checkbox" data-layer="months" checked><span>Months</span></label>
        <label class="layer-toggle"><input type="checkbox" data-layer="elements" checked><span>Elements</span></label>
        <label class="layer-toggle"><input type="checkbox" data-layer="notes" checked><span>Notes</span></label>
        <label class="layer-toggle"><input type="checkbox" data-layer="aspects" checked><span>Aspects</span></label>
        <label class="opacity-control"><span>Astro glow</span><input id="astroOpacity" type="range" min="20" max="100" value="82"><output id="astroOpacityValue">82%</output></label>
      </div>

      <div class="wheel-wrap">
        <svg id="wheel" viewBox="0 0 760 760" role="img" aria-label="Layered celestial birthday harmony wheel"></svg>
        <div class="wheel-center">
          <span class="center-label">ROOT</span>
          <strong id="rootDateLabel">May 15</strong>
          <span id="rootNoteLabel">C4 · 261.63 Hz</span>
        </div>
      </div>

      <div class="legend-row">
        <span><i class="legend-dot root"></i>Root</span>
        <span><i class="legend-dot consonant"></i>Consonant</span>
        <span><i class="legend-dot tension"></i>Tension</span>
      </div>
    </section>

    <aside class="panel controls-panel">
      <div class="panel-heading compact">
        <div>
          <p class="kicker">People / notes</p>
          <h2>Build the chord</h2>
        </div>
        <button class="icon-btn" id="addPersonBtn" type="button" title="Add person">＋</button>
      </div>

      <label class="field-label" for="titleInput">Group name</label>
      <input class="text-input" id="titleInput" value="Family Chord" maxlength="60">

      <div id="peopleList" class="people-list"></div>

      <div class="control-actions">
        <button class="btn secondary" id="saveBtn" type="button">Save in browser</button>
        <button class="btn ghost" id="shareBtn" type="button">Copy summary</button>
      </div>
    </aside>

    <section class="panel analysis-panel">
      <div class="panel-heading compact">
        <div>
          <p class="kicker">Interpretation</p>
          <h2 id="chordName">Solar cluster</h2>
        </div>
        <span class="quality-badge" id="qualityBadge">Complex</span>
      </div>
      <p class="analysis-lead" id="analysisLead"></p>
      <div class="metric-grid">
        <article class="metric-card">
          <span>Spread</span>
          <strong id="spreadMetric">—</strong>
          <small>largest pitch span</small>
        </article>
        <article class="metric-card">
          <span>Closest pair</span>
          <strong id="closestMetric">—</strong>
          <small>strongest unison effect</small>
        </article>
        <article class="metric-card">
          <span>Tension</span>
          <strong id="tensionMetric">—</strong>
          <small>interval roughness</small>
        </article>
      </div>
      <div id="intervalTable" class="interval-table"></div>
    </section>

    <section class="panel theory-panel">
      <div class="panel-heading compact">
        <div>
          <p class="kicker">How it works</p>
          <h2>One year = one octave</h2>
        </div>
      </div>
      <div class="formula-block">
        <code>cents = day difference ÷ 365.2422 × 1200</code>
        <code>frequency = root Hz × 2^(cents ÷ 1200)</code>
      </div>
      <p>Each date occupies an exact point in the solar year. The root date is assigned C4. Other dates become continuous pitches, or can be snapped to the nearest equal-tempered note.</p>
      <p class="disclaimer">This is an artistic and mathematical model, not a scientific claim that birthdays determine personality.</p>
    </section>
  </main>
</div>

<template id="personTemplate">
  <article class="person-card">
    <div class="person-head">
      <span class="person-index"></span>
      <button class="remove-person" type="button" title="Remove">×</button>
    </div>
    <input class="person-name" aria-label="Name" maxlength="30">
    <div class="person-fields">
      <label>
        <span>Birthday</span>
        <input class="person-date" type="date">
      </label>
      <label>
        <span>Role</span>
        <select class="person-role">
          <option value="member">Member</option>
          <option value="root">Root</option>
        </select>
      </label>
    </div>
    <div class="person-readout">
      <strong class="person-note">—</strong>
      <span class="person-sign">—</span>
      <span class="person-interval">—</span>
    </div>
  </article>
</template>

<script src="harmony.js?v=20260718-bells5"></script>
</body>
</html>
