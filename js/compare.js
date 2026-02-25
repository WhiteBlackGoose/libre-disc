import { initI18n, t, onLocaleChange } from './i18n.js';
import { renderLayout } from './layout.js';
import { getPersonality, DISC_COLORS } from './personalities.js';
import { TYPE_ICONS } from './icons.js';
import {
  decodeResult, encodeResult, extractCode, determineType, loadResult,
  encodeProfiles, decodeProfiles, renderMultiAxisSliders,
  drawMultiDiamond, drawMultiAxesPlot, drawMultiDiscWheel, preloadIcons
} from './shared.js';

const PROFILE_COLORS = ['#ffffff','#9966ff','#ff6b9d','#4ecdc4','#ffe66d','#ff8a5c','#a8e6cf','#ff4757'];
const STORAGE_KEY = 'disc_teams';

let teamName = '';
let profileInputs = [{ name: '', code: '' }, { name: '', code: '' }];
let iconImages = {};
let activeTeamId = null; // id of team currently being viewed/edited

// --- localStorage helpers ---

function loadTeams() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function saveTeams(teams) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
}

function saveCurrentTeam(profiles) {
  const teams = loadTeams();
  const encoded = encodeProfiles(profiles.map(p => ({ name: p.name, code: extractCode(p.code) || p.code })));
  // Deduplicate: find existing team with same encoded profiles
  const existing = teams.find(t => t.encoded === encoded);
  if (existing) {
    activeTeamId = existing.id;
  } else if (activeTeamId) {
    // Profiles changed from the original team — fork into a new team
    const orig = teams.find(t => t.id === activeTeamId);
    if (orig && orig.encoded !== encoded) {
      activeTeamId = null;
    }
  }
  const entry = {
    id: activeTeamId || Date.now().toString(36),
    name: teamName || t('team_untitled'),
    profiles: profiles.map(p => ({ name: p.name, code: extractCode(p.code) || p.code })),
    encoded,
    updatedAt: Date.now()
  };
  const idx = teams.findIndex(t => t.id === entry.id);
  if (idx >= 0) teams[idx] = entry; else teams.unshift(entry);
  saveTeams(teams);
  activeTeamId = entry.id;
  return entry;
}

function deleteTeam(id) {
  saveTeams(loadTeams().filter(t => t.id !== id));
}

// --- init ---

async function init() {
  await initI18n();
  iconImages = await preloadIcons(TYPE_ICONS);
  onLocaleChange(() => renderPage());

  const params = new URLSearchParams(window.location.search);
  const pParam = params.get('p');
  const aParam = params.get('a');
  const bParam = params.get('b');
  const nameParam = params.get('n');

  if (pParam) {
    const decoded = decodeProfiles(pParam);
    if (decoded.length >= 2) {
      profileInputs = decoded;
      teamName = nameParam || '';
      renderPage();
      runComparison(true); // auto-save from URL
      return;
    }
  } else if (aParam && bParam) {
    profileInputs = [{ name: '', code: aParam }, { name: '', code: bParam }];
    renderPage();
    runComparison(true);
    return;
  }

  renderPage();
}

// --- page rendering ---

function renderPage() {
  renderLayout('compare');
  const content = document.getElementById('content');
  if (!content) return;

  const teams = loadTeams();
  const savedTeamsHtml = teams.length > 0 ? `
    <div class="card saved-teams-card">
      <h3>${t('team_saved_teams')}</h3>
      <div class="saved-teams-list">
        ${teams.map(team => {
          const memberSummary = team.profiles.map(p => p.name || '?').join(', ');
          const date = new Date(team.updatedAt).toLocaleDateString();
          return `<div class="saved-team-row">
            <a href="compare.html?p=${team.encoded}&n=${encodeURIComponent(team.name)}" class="saved-team-link">
              <strong>${team.name}</strong>
              <span class="saved-team-meta">${memberSummary} · ${date}</span>
            </a>
            <button class="btn btn-sm btn-danger delete-team" data-id="${team.id}" title="${t('team_delete')}">✕</button>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';

  content.innerHTML = `
    <div class="compare-header">
      <h1>${t('compare_title')}</h1>
      <p>${t('compare_subtitle')}</p>
    </div>
    ${savedTeamsHtml}
    <div class="card" style="margin:1.5rem 0;padding:1.5rem">
      <h3>${t('team_new_team')}</h3>
      <div class="team-name-row">
        <input type="text" class="input" id="team-name-input" placeholder="${t('team_name_placeholder')}" value="${teamName}">
      </div>
      <div id="profiles-input" class="profiles-input"></div>
      <div class="compare-actions">
        <button class="btn btn-secondary" id="add-profile">${t('compare_add')}</button>
        <button class="btn btn-secondary" id="load-saved">${t('compare_load')}</button>
        <button class="btn btn-primary" id="compare-btn">${t('compare_btn')}</button>
      </div>
    </div>
    <div id="compare-results"></div>`;

  renderProfileInputs();

  // Team name
  document.getElementById('team-name-input').addEventListener('input', e => { teamName = e.target.value; });

  // Delete saved teams
  content.querySelectorAll('.delete-team').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      deleteTeam(btn.dataset.id);
      renderPage();
    });
  });

  document.getElementById('add-profile').addEventListener('click', () => {
    profileInputs.push({ name: '', code: '' });
    renderProfileInputs();
  });

  document.getElementById('load-saved').addEventListener('click', () => {
    const scores = loadResult();
    if (scores) {
      const code = encodeResult(scores);
      if (profileInputs.length > 0 && !profileInputs[0].code) {
        profileInputs[0].code = code;
      } else {
        profileInputs.push({ name: '', code });
      }
      renderProfileInputs();
    } else {
      alert(t('compare_no_saved'));
    }
  });

  document.getElementById('compare-btn').addEventListener('click', () => runComparison(false));
}

function renderProfileInputs() {
  const container = document.getElementById('profiles-input');
  if (!container) return;
  container.innerHTML = profileInputs.map((p, i) => `
    <div class="profile-input-row">
      <span class="profile-color" style="background:${PROFILE_COLORS[i % PROFILE_COLORS.length]}"></span>
      <input type="text" class="input profile-name" placeholder="${t('compare_name')}" value="${p.name || ''}" data-idx="${i}" data-field="name">
      <input type="text" class="input profile-code" placeholder="${t('compare_code')}" value="${p.code || ''}" data-idx="${i}" data-field="code">
      ${profileInputs.length > 2 ? `<button class="btn btn-sm btn-danger remove-profile" data-idx="${i}">✕</button>` : ''}
    </div>`).join('');

  container.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      const idx = parseInt(inp.dataset.idx);
      profileInputs[idx][inp.dataset.field] = inp.value;
    });
  });
  container.querySelectorAll('.remove-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      profileInputs.splice(parseInt(btn.dataset.idx), 1);
      renderProfileInputs();
    });
  });
}

// --- comparison ---

function runComparison(autoSave) {
  // Sync input values
  document.querySelectorAll('#profiles-input input').forEach(inp => {
    const idx = parseInt(inp.dataset.idx);
    if (profileInputs[idx]) profileInputs[idx][inp.dataset.field] = inp.value;
  });
  const nameInp = document.getElementById('team-name-input');
  if (nameInp) teamName = nameInp.value;

  const profiles = profileInputs
    .map((p, i) => {
      const rawCode = extractCode(p.code);
      const scores = decodeResult(rawCode);
      if (!scores) return null;
      return {
        name: p.name || `Profile ${i + 1}`,
        code: rawCode,
        scores,
        type: determineType(scores),
        color: PROFILE_COLORS[i % PROFILE_COLORS.length]
      };
    })
    .filter(Boolean);

  if (profiles.length < 2) {
    if (!autoSave) alert(t('compare_need_two'));
    return;
  }

  // Update URL
  const validInputs = profileInputs.filter(p => extractCode(p.code) && decodeResult(extractCode(p.code)));
  const encoded = encodeProfiles(validInputs.map(p => ({ name: p.name, code: extractCode(p.code) })));
  const urlParams = new URLSearchParams({ p: encoded });
  if (teamName) urlParams.set('n', teamName);
  history.replaceState(null, '', window.location.pathname + '?' + urlParams.toString());

  // Save team
  saveCurrentTeam(validInputs);

  renderResults(profiles);
}

async function renderResults(profiles) {
  const container = document.getElementById('compare-results');
  if (!container) return;

  // Legend
  const legend = profiles.map(p => {
    const personality = getPersonality(p.type);
    const resultsLink = `results.html?r=${encodeResult(p.scores)}`;
    return `<div class="compare-legend-item">
      <span class="legend-dot" style="background:${p.color}"></span>
      <strong>${p.name}</strong> — <span style="color:${personality.color}">${p.type}</span> ${personality.name || ''}
      <a href="${resultsLink}" class="btn-link" style="margin-left:0.5rem;font-size:0.75rem;color:var(--color-i);text-decoration:none;">→ ${t('compare_view_results') || 'View Results'}</a>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="card"><div class="compare-legend">${legend}</div></div>

    <div class="card">
      <h3>${t('compare_scores')}</h3>
      <div id="compare-bars"></div>
    </div>

    <div class="card">
      <h3>${t('compare_dimensions')}</h3>
      <div id="compare-axes"></div>
    </div>

    <div class="results-grid">
      <div class="card">
        <h3>${t('compare_overlay')}</h3>
        <canvas id="compare-diamond"></canvas>
      </div>
      <div class="card">
        <h3>${t('compare_quadrant')}</h3>
        <canvas id="compare-quadrant"></canvas>
      </div>
    </div>

    <div class="card wheel-section">
      <h3>${t('compare_wheel')}</h3>
      <div class="wheel-container"><canvas id="compare-wheel"></canvas></div>
    </div>

    <div class="card">
      <h3>${t('compare_insights')}</h3>
      <div id="compare-insights"></div>
    </div>

    <div class="card share-section">
      <h3>${t('compare_share')}</h3>
      <div class="share-code">
        <code id="compare-url" style="font-size:0.75rem;word-break:break-all">${window.location.href}</code>
        <button class="btn btn-secondary btn-sm" id="copy-compare">${t('btn_copy_link')}</button>
      </div>
    </div>`;

  // Score bars
  const barsEl = document.getElementById('compare-bars');
  for (const dim of ['D', 'I', 'S', 'C']) {
    const bars = profiles.map(p =>
      `<div class="compare-bar-row">
        <span class="compare-bar-name" style="color:${p.color}">${p.name}</span>
        <div class="score-bar-track"><div class="score-bar-fill" style="width:${p.scores[dim]}%;background:${p.color}">${p.scores[dim]}%</div></div>
      </div>`
    ).join('');
    barsEl.innerHTML += `<div class="compare-dim-group">
      <h4 style="color:${DISC_COLORS[dim]}">${t('dim.' + dim)}</h4>
      ${bars}
    </div>`;
  }

  // Axes
  renderMultiAxisSliders(document.getElementById('compare-axes'), profiles);

  // Charts
  drawMultiDiamond(document.getElementById('compare-diamond'), profiles);
  drawMultiAxesPlot(document.getElementById('compare-quadrant'), profiles);
  await drawMultiDiscWheel(document.getElementById('compare-wheel'), profiles, iconImages);

  // Insights (pairwise for first two profiles)
  renderInsights(profiles);

  // Copy
  document.getElementById('copy-compare').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('copy-compare');
      const orig = btn.textContent;
      btn.textContent = t('btn_copied');
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  });
}

function traitWords(text) {
  const stop = new Set(['a','an','the','and','or','of','to','in','for','with','can','may','is','be','too','not','their','them','they','when','what','how','but','feel','seem','over','very','most','more','less','than']);
  return text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
}

function traitSimilar(a, b) {
  const wa = traitWords(a), wb = traitWords(b);
  // Check for shared word stems (first 4 chars)
  const stemsA = new Set(wa.map(w => w.slice(0, 4)));
  const stemsB = new Set(wb.map(w => w.slice(0, 4)));
  const shared = [...stemsA].filter(s => stemsB.has(s));
  return shared.length >= 2 || (shared.length >= 1 && Math.min(stemsA.size, stemsB.size) <= 2);
}

function clusterTraits(traitMap) {
  const entries = Object.entries(traitMap);
  const clusters = []; // { label, names: Set }
  for (const [text, names] of entries) {
    let merged = false;
    for (const cluster of clusters) {
      if (traitSimilar(cluster.label, text)) {
        names.forEach(n => cluster.names.add(n));
        merged = true;
        break;
      }
    }
    if (!merged) {
      clusters.push({ label: text, names: new Set(names) });
    }
  }
  return clusters
    .filter(c => c.names.size >= 2)
    .map(c => [c.label, [...c.names]])
    .sort((a, b) => b[1].length - a[1].length);
}

function renderInsights(profiles) {
  const container = document.getElementById('compare-insights');
  if (profiles.length < 2) return;

  // Gather all strengths/challenges across profiles
  const strengthMap = {};  // strength text -> [profile names]
  const challengeMap = {}; // challenge text -> [profile names]

  profiles.forEach(p => {
    const personality = getPersonality(p.type);
    (personality.strengths || []).forEach(s => {
      if (!strengthMap[s]) strengthMap[s] = [];
      strengthMap[s].push(p.name);
    });
    (personality.challenges || []).forEach(c => {
      if (!challengeMap[c]) challengeMap[c] = [];
      challengeMap[c].push(p.name);
    });
  });

  // Cluster similar traits, then find shared ones
  const collectiveStrengths = clusterTraits(strengthMap);
  const collectiveRisks = clusterTraits(challengeMap);

  // Amortized: challenges offset by another's strengths (fuzzy)
  const amortized = [];
  const challengeEntries = Object.entries(challengeMap);
  const strengthEntries = Object.entries(strengthMap);
  for (const [challenge, holders] of challengeEntries) {
    const offsetters = new Set();
    for (const [strength, sNames] of strengthEntries) {
      if (traitSimilar(challenge, strength)) {
        sNames.forEach(n => { if (!holders.includes(n)) offsetters.add(n); });
      }
    }
    if (offsetters.size > 0) {
      amortized.push({ challenge, holders, offsetters: [...offsetters] });
    }
  }

  const sharedByText = (names) => t('team_shared_by').replace('{names}', names.join(', '));

  const strengthsHtml = collectiveStrengths.length > 0
    ? collectiveStrengths.map(([s, names]) =>
      `<div class="team-trait-item team-strength"><span class="team-trait-text">✦ ${s}</span><span class="team-trait-meta">${sharedByText(names)}</span></div>`
    ).join('')
    : `<p style="opacity:0.5">${t('team_collective_strengths_desc')}</p>`;

  const risksHtml = collectiveRisks.length > 0
    ? collectiveRisks.map(([c, names]) =>
      `<div class="team-trait-item team-risk"><span class="team-trait-text">△ ${c}</span><span class="team-trait-meta">${sharedByText(names)}</span></div>`
    ).join('')
    : `<p style="opacity:0.5">${t('team_collective_risks_desc')}</p>`;

  const amortizedHtml = amortized.length > 0
    ? amortized.map(a =>
      `<div class="team-trait-item team-amortized"><span class="team-trait-text">↬ ${a.challenge}</span><span class="team-trait-meta">${a.holders.join(', ')} → offset by ${a.offsetters.join(', ')}</span></div>`
    ).join('')
    : '';

  container.innerHTML = `
    <div class="team-insights-grid">
      <div class="team-insight-block">
        <h4>${t('team_collective_strengths')}</h4>
        <p class="team-insight-desc">${t('team_collective_strengths_desc')}</p>
        <div class="team-trait-list">${strengthsHtml}</div>
      </div>
      <div class="team-insight-block">
        <h4>${t('team_collective_risks')}</h4>
        <p class="team-insight-desc">${t('team_collective_risks_desc')}</p>
        <div class="team-trait-list">${risksHtml}</div>
      </div>
    </div>
    ${amortized.length > 0 ? `
    <div class="team-insight-block" style="margin-top:1rem">
      <h4>${t('team_amortized')}</h4>
      <p class="team-insight-desc">${t('team_amortized_desc')}</p>
      <div class="team-trait-list">${amortizedHtml}</div>
    </div>` : ''}`;
}

init();
