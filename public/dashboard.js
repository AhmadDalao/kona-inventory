const state = {
  user: null,
  settings: {},
  uiTexts: {},
  capabilities: {},
  areas: [],
  items: [],
  users: [],
  summary: {},
  analytics: {},
  levelsRows: [],
  movementsRows: [],
  docsRows: [],
  trash: {
    items: [],
    storage_areas: [],
  },
  auditRows: [],
  adminActivityRows: [],
  view: 'overview',
  tables: {
    levels: { page: 1, pageSize: 25, sortKey: 'item_name', sortDir: 'asc' },
    movements: { page: 1, pageSize: 50, sortKey: 'created_at', sortDir: 'desc' },
    users: { page: 1, pageSize: 10, sortKey: 'name', sortDir: 'asc' },
    audit: { page: 1, pageSize: 25, sortKey: 'created_at', sortDir: 'desc' },
    adminActivity: { page: 1, pageSize: 25, sortKey: 'created_at', sortDir: 'desc' },
  },
};

const modalState = {
  resolver: null,
  mode: 'confirm',
  validator: null,
};

const editorModalState = {
  resolver: null,
  fields: [],
  validator: null,
};

const viewMeta = {
  overview: {
    title: 'Overview',
    titleKey: 'view.overview.title',
    subtitle: 'Snapshot of stock, risk, and movement activity.',
    subtitleKey: 'view.overview.subtitle',
    searchPlaceholder: 'Search inventory records',
    searchKey: 'view.overview.search',
  },
  inventory: {
    title: 'Inventory',
    titleKey: 'view.inventory.title',
    subtitle: 'Live quantity matrix across storage areas.',
    subtitleKey: 'view.inventory.subtitle',
    searchPlaceholder: 'Search product, SKU, category, area',
    searchKey: 'view.inventory.search',
  },
  movements: {
    title: 'Movements',
    titleKey: 'view.movements.title',
    subtitle: 'Apply stock changes and monitor movement history.',
    subtitleKey: 'view.movements.subtitle',
    searchPlaceholder: 'Search movement notes, references, items',
    searchKey: 'view.movements.search',
  },
  areas: {
    title: 'Storage Areas',
    titleKey: 'view.areas.title',
    subtitle: 'Define, update, and manage warehouse zones.',
    subtitleKey: 'view.areas.subtitle',
    searchPlaceholder: 'Use filters inside this page',
    searchKey: 'view.areas.search',
  },
  items: {
    title: 'Item Catalog',
    titleKey: 'view.items.title',
    subtitle: 'Manage product SKUs, categories, units, and reorder levels.',
    subtitleKey: 'view.items.subtitle',
    searchPlaceholder: 'Use filters inside this page',
    searchKey: 'view.items.search',
  },
  analytics: {
    title: 'Analytics',
    titleKey: 'view.analytics.title',
    subtitle: 'Movement and inventory trend analysis.',
    subtitleKey: 'view.analytics.subtitle',
    searchPlaceholder: 'Use filters inside this page',
    searchKey: 'view.analytics.search',
  },
  admin: {
    title: 'Admins',
    titleKey: 'view.admin.title',
    subtitle: 'Manage admin accounts.',
    subtitleKey: 'view.admin.subtitle',
    searchPlaceholder: 'Search admin users',
    searchKey: 'view.admin.search',
  },
  trash: {
    title: 'Trash',
    titleKey: 'view.trash.title',
    subtitle: 'Review deleted records and restore them.',
    subtitleKey: 'view.trash.subtitle',
    searchPlaceholder: 'Search deleted records',
    searchKey: 'view.trash.search',
  },
  audit: {
    title: 'Audit Log',
    titleKey: 'view.audit.title',
    subtitle: 'Owner-level write action log and traceability.',
    subtitleKey: 'view.audit.subtitle',
    searchPlaceholder: 'Search audit actor, action, summary',
    searchKey: 'view.audit.search',
  },
  settings: {
    title: 'Settings',
    titleKey: 'view.settings.title',
    subtitle: 'System behavior and dashboard defaults.',
    subtitleKey: 'view.settings.subtitle',
    searchPlaceholder: 'Use filters inside this page',
    searchKey: 'view.settings.search',
  },
  docs: {
    title: 'Docs',
    titleKey: 'view.docs.title',
    subtitle: 'Internal API endpoint reference.',
    subtitleKey: 'view.docs.subtitle',
    searchPlaceholder: 'Search API endpoints in docs table',
    searchKey: 'view.docs.search',
  },
};

const DEFAULT_UI_TEXTS = {
  'page.title': 'Inventory Management System',
  'login.title': 'Inventory Management System',
  'login.subtitle': 'Track inventory, movements, controls, and admin actions in one place.',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.signin': 'Sign In',
  'login.hint': 'Use your company credentials.',
  'nav.main_menu': 'Main Menu',
  'nav.control': 'Control',
  'nav.overview': 'Overview',
  'nav.inventory': 'Inventory',
  'nav.movements': 'Movements',
  'nav.areas': 'Storage Areas',
  'nav.items': 'Items',
  'nav.analytics': 'Analytics',
  'nav.admin': 'Admins',
  'nav.trash': 'Trash',
  'nav.audit': 'Audit Log',
  'nav.settings': 'Settings',
  'nav.docs': 'Docs',
  'actions.logout': 'Logout',
  'topbar.search_placeholder': 'Search current view',
  'topbar.refresh': 'Refresh',
  'topbar.api': 'API',
  'badge.read_only_on': 'Read-only mode is ON',
  'badge.site_open': 'Site Open',
  'badge.site_closed': 'Site Closed',
  'settings.texts': 'Text & Labels',
  'settings.texts_sub': 'Edit dashboard titles and labels.',
  'settings.texts_search': 'Search labels...',
  'settings.texts_collapse': 'Collapse',
  'settings.texts_expand': 'Expand',
  'settings.texts_page': 'Page',
  'settings.texts_login': 'Login',
  'settings.texts_navigation': 'Navigation',
  'settings.texts_topbar': 'Top Bar',
  'settings.texts_badges': 'Badges',
  'settings.texts_views': 'Views',
  'view.overview.title': 'Overview',
  'view.overview.subtitle': 'Snapshot of stock, risk, and movement activity.',
  'view.overview.search': 'Search inventory records',
  'view.inventory.title': 'Inventory',
  'view.inventory.subtitle': 'Live quantity matrix across storage areas.',
  'view.inventory.search': 'Search product, SKU, category, area',
  'view.movements.title': 'Movements',
  'view.movements.subtitle': 'Apply stock changes and monitor movement history.',
  'view.movements.search': 'Search movement notes, references, items',
  'view.areas.title': 'Storage Areas',
  'view.areas.subtitle': 'Define, update, and manage warehouse zones.',
  'view.areas.search': 'Use filters inside this page',
  'view.items.title': 'Item Catalog',
  'view.items.subtitle': 'Manage product SKUs, categories, units, and reorder levels.',
  'view.items.search': 'Use filters inside this page',
  'view.analytics.title': 'Analytics',
  'view.analytics.subtitle': 'Movement and inventory trend analysis.',
  'view.analytics.search': 'Use filters inside this page',
  'view.admin.title': 'Admins',
  'view.admin.subtitle': 'Manage admin accounts.',
  'view.admin.search': 'Search admin users',
  'view.trash.title': 'Trash',
  'view.trash.subtitle': 'Review deleted records and restore them.',
  'view.trash.search': 'Search deleted records',
  'view.audit.title': 'Audit Log',
  'view.audit.subtitle': 'Owner-level write action log and traceability.',
  'view.audit.search': 'Search audit actor, action, summary',
  'view.settings.title': 'Settings',
  'view.settings.subtitle': 'System behavior and dashboard defaults.',
  'view.settings.search': 'Use filters inside this page',
  'view.docs.title': 'Docs',
  'view.docs.subtitle': 'Internal API endpoint reference.',
  'view.docs.search': 'Search API endpoints in docs table',
};

const UI_TEXT_EDITOR_GROUPS = [
  {
    titleKey: 'settings.texts_page',
    fallback: 'Page',
    fields: [
      { key: 'page.title', label: 'Page Title' },
    ],
  },
  {
    titleKey: 'settings.texts_login',
    fallback: 'Login',
    fields: [
      { key: 'login.title', label: 'Login Title' },
      { key: 'login.subtitle', label: 'Login Subtitle' },
      { key: 'login.email', label: 'Login Email' },
      { key: 'login.password', label: 'Login Password' },
      { key: 'login.signin', label: 'Login Sign In' },
      { key: 'login.hint', label: 'Login Hint' },
    ],
  },
  {
    titleKey: 'settings.texts_navigation',
    fallback: 'Navigation',
    fields: [
      { key: 'nav.main_menu', label: 'Nav Main Menu' },
      { key: 'nav.control', label: 'Nav Control' },
      { key: 'nav.overview', label: 'Nav Overview' },
      { key: 'nav.inventory', label: 'Nav Inventory' },
      { key: 'nav.movements', label: 'Nav Movements' },
      { key: 'nav.areas', label: 'Nav Storage Areas' },
      { key: 'nav.items', label: 'Nav Items' },
      { key: 'nav.analytics', label: 'Nav Analytics' },
      { key: 'nav.admin', label: 'Nav Admins' },
      { key: 'nav.trash', label: 'Nav Trash' },
      { key: 'nav.audit', label: 'Nav Audit Log' },
      { key: 'nav.settings', label: 'Nav Settings' },
      { key: 'nav.docs', label: 'Nav Docs' },
      { key: 'actions.logout', label: 'Logout Button' },
    ],
  },
  {
    titleKey: 'settings.texts_topbar',
    fallback: 'Top Bar',
    fields: [
      { key: 'topbar.search_placeholder', label: 'Topbar Search Placeholder' },
      { key: 'topbar.refresh', label: 'Topbar Refresh' },
      { key: 'topbar.api', label: 'Topbar API' },
    ],
  },
  {
    titleKey: 'settings.texts_badges',
    fallback: 'Badges',
    fields: [
      { key: 'badge.read_only_on', label: 'Read-only Badge' },
      { key: 'badge.site_open', label: 'Site Open Badge' },
      { key: 'badge.site_closed', label: 'Site Closed Badge' },
    ],
  },
  {
    titleKey: 'settings.texts_views',
    fallback: 'Views',
    fields: [
      { key: 'view.overview.title', label: 'Overview Title' },
      { key: 'view.overview.subtitle', label: 'Overview Subtitle' },
      { key: 'view.inventory.title', label: 'Inventory Title' },
      { key: 'view.inventory.subtitle', label: 'Inventory Subtitle' },
      { key: 'view.movements.title', label: 'Movements Title' },
      { key: 'view.movements.subtitle', label: 'Movements Subtitle' },
      { key: 'view.areas.title', label: 'Areas Title' },
      { key: 'view.areas.subtitle', label: 'Areas Subtitle' },
      { key: 'view.items.title', label: 'Items Title' },
      { key: 'view.items.subtitle', label: 'Items Subtitle' },
      { key: 'view.analytics.title', label: 'Analytics Title' },
      { key: 'view.analytics.subtitle', label: 'Analytics Subtitle' },
      { key: 'view.admin.title', label: 'Admin Title' },
      { key: 'view.admin.subtitle', label: 'Admin Subtitle' },
      { key: 'view.trash.title', label: 'Trash Title' },
      { key: 'view.trash.subtitle', label: 'Trash Subtitle' },
      { key: 'view.audit.title', label: 'Audit Title' },
      { key: 'view.audit.subtitle', label: 'Audit Subtitle' },
      { key: 'view.settings.title', label: 'Settings Title' },
      { key: 'view.settings.subtitle', label: 'Settings Subtitle' },
      { key: 'view.docs.title', label: 'Docs Title' },
      { key: 'view.docs.subtitle', label: 'Docs Subtitle' },
    ],
  },
];

const THEME_PALETTES = {
  'material-indigo': {
    primary: '#5B3DF5',
    primary2: '#4332C6',
    iconPrimary: '#4332C6',
    iconMuted: '#667085',
    iconAccent: '#248DFF',
  },
  'material-cyan': {
    primary: '#0E7490',
    primary2: '#155E75',
    iconPrimary: '#155E75',
    iconMuted: '#667085',
    iconAccent: '#06B6D4',
  },
  'material-emerald': {
    primary: '#047857',
    primary2: '#065F46',
    iconPrimary: '#065F46',
    iconMuted: '#667085',
    iconAccent: '#10B981',
  },
  'material-rose': {
    primary: '#BE123C',
    primary2: '#9F1239',
    iconPrimary: '#9F1239',
    iconMuted: '#667085',
    iconAccent: '#F43F5E',
  },
};

const byId = (id) => document.getElementById(id);

const DEFAULT_ITEM_UNITS = ['unit', 'pcs', 'box', 'pack', 'set', 'roll', 'kg', 'g', 'l', 'ml'];

function normalizeUnitToken(value) {
  const text = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!text) {
    return '';
  }
  if (text.length > 24) {
    return '';
  }
  if (!/^[a-z0-9][a-z0-9 ._/-]*$/i.test(text)) {
    return '';
  }
  return text;
}

function normalizeItemUnits(source, includeDefaults = true) {
  const seeds = includeDefaults ? [...DEFAULT_ITEM_UNITS] : [];
  let incoming = [];

  if (Array.isArray(source)) {
    incoming = source;
  } else if (typeof source === 'string') {
    const raw = source.trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          incoming = parsed;
        } else {
          incoming = raw.split(/[\n,]+/);
        }
      } catch {
        incoming = raw.split(/[\n,]+/);
      }
    }
  }

  const output = [];
  const seen = new Set();
  for (const candidate of [...seeds, ...incoming]) {
    const normalized = normalizeUnitToken(candidate);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    output.push(normalized);
  }

  return output.length ? output : [...DEFAULT_ITEM_UNITS];
}

function resolveConfiguredItemUnits() {
  const fromSettings = normalizeItemUnits(state.settings.item_units, false);
  const fromItems = (state.items || []).map((item) => item?.unit ?? '');
  return normalizeItemUnits([...fromSettings, ...fromItems], false);
}

function normalizeUiTexts(source) {
  const normalized = { ...DEFAULT_UI_TEXTS };
  let incoming = {};

  if (source && typeof source === 'object' && !Array.isArray(source)) {
    incoming = source;
  } else if (typeof source === 'string' && source.trim() !== '') {
    try {
      const parsed = JSON.parse(source);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        incoming = parsed;
      }
    } catch {
      incoming = {};
    }
  }

  for (const key of Object.keys(normalized)) {
    if (typeof incoming[key] === 'string') {
      normalized[key] = incoming[key];
    }
  }

  return normalized;
}

function uiText(key, fallback = '') {
  const current = state.uiTexts?.[key];
  if (typeof current === 'string' && current.trim() !== '') {
    return current.trim();
  }
  if (typeof fallback === 'string' && fallback.trim() !== '') {
    return fallback;
  }
  const defaultValue = DEFAULT_UI_TEXTS[key];
  return typeof defaultValue === 'string' ? defaultValue : '';
}

function setElementText(id, value) {
  const el = byId(id);
  if (el) {
    el.textContent = value;
  }
}

function setElementPlaceholder(id, value) {
  const el = byId(id);
  if (el) {
    el.placeholder = value;
  }
}

function renderUiTextEditor() {
  const container = byId('ui-text-groups');
  if (!container) {
    return;
  }

  container.innerHTML = UI_TEXT_EDITOR_GROUPS.map((group) => {
    const title = uiText(group.titleKey, group.fallback);
    const fields = (group.fields || []).map((field) => `
      <div class="text-item" data-text-key="${escapeHtml(String(field.key || '').toLowerCase())}">
        <label>
          <span class="text-label">${escapeHtml(field.label || field.key || '')}</span>
          <span class="text-key">${escapeHtml(field.key || '')}</span>
        </label>
        <input type="text" data-ui-text="${escapeHtml(field.key || '')}" />
      </div>
    `).join('');

    return `
      <details class="text-group" open>
        <summary>${escapeHtml(title)}</summary>
        <div class="text-grid">${fields}</div>
      </details>
    `;
  }).join('');

  hydrateUiTextInputs();
}

function hydrateUiTextInputs() {
  document.querySelectorAll('[data-ui-text]').forEach((input) => {
    const key = input.dataset.uiText;
    if (!key) {
      return;
    }
    input.value = state.uiTexts?.[key] ?? DEFAULT_UI_TEXTS[key] ?? '';
  });
}

function collectUiTextInputs() {
  const next = normalizeUiTexts(state.settings.ui_texts);
  document.querySelectorAll('[data-ui-text]').forEach((input) => {
    const key = input.dataset.uiText;
    if (!key || !Object.prototype.hasOwnProperty.call(DEFAULT_UI_TEXTS, key)) {
      return;
    }
    next[key] = String(input.value || '').trim();
  });
  return next;
}

function syncUiTextCollapseState() {
  const card = byId('ui-text-card');
  const toggle = byId('ui-text-toggle');
  const label = byId('ui-text-toggle-label');
  if (!card || !toggle || !label) {
    return;
  }

  const collapsed = card.classList.contains('collapsed');
  toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  label.textContent = collapsed
    ? (toggle.dataset.expandText || 'Expand')
    : (toggle.dataset.collapseText || 'Collapse');
}

function applyUiTextSearch(term) {
  const normalized = String(term || '').trim().toLowerCase();
  document.querySelectorAll('.text-item').forEach((item) => {
    const key = String(item.dataset.textKey || '').toLowerCase();
    const label = String(item.querySelector('.text-label')?.textContent || '').toLowerCase();
    const matched = !normalized || key.includes(normalized) || label.includes(normalized);
    item.classList.toggle('hidden', !matched);
  });

  document.querySelectorAll('.text-group').forEach((group) => {
    const hasVisible = Array.from(group.querySelectorAll('.text-item'))
      .some((item) => !item.classList.contains('hidden'));
    group.style.display = hasVisible ? '' : 'none';
  });
}

function applyUiTexts() {
  state.uiTexts = normalizeUiTexts(state.settings.ui_texts);

  document.title = uiText('page.title', state.settings.site_name || 'Inventory Management System');
  setElementText('auth-site-name', uiText('login.title', state.settings.site_name || 'Inventory Management System'));
  setElementText('auth-site-tagline', uiText('login.subtitle', state.settings.site_tagline || 'Track inventory, movements, controls, and admin actions in one place.'));
  setElementText('login-email-label', uiText('login.email', 'Email'));
  setElementText('login-password-label', uiText('login.password', 'Password'));
  setElementText('login-submit-label', uiText('login.signin', 'Sign In'));
  setElementText('login-hint-text', uiText('login.hint', 'Use your company credentials.'));

  setElementText('nav-main-menu-label', uiText('nav.main_menu', 'Main Menu'));
  setElementText('nav-control-label', uiText('nav.control', 'Control'));
  setElementText('nav-overview-label', uiText('nav.overview', 'Overview'));
  setElementText('nav-inventory-label', uiText('nav.inventory', 'Inventory'));
  setElementText('nav-movements-label', uiText('nav.movements', 'Movements'));
  setElementText('nav-areas-label', uiText('nav.areas', 'Storage Areas'));
  setElementText('nav-items-label', uiText('nav.items', 'Items'));
  setElementText('nav-analytics-label', uiText('nav.analytics', 'Analytics'));
  setElementText('nav-admin-label', uiText('nav.admin', 'Admins'));
  setElementText('nav-trash-label', uiText('nav.trash', 'Trash'));
  setElementText('nav-audit-label', uiText('nav.audit', 'Audit Log'));
  setElementText('nav-settings-label', uiText('nav.settings', 'Settings'));
  setElementText('nav-docs-label', uiText('nav.docs', 'Docs'));
  setElementText('logout-label', uiText('actions.logout', 'Logout'));

  setElementText('head-refresh-label', uiText('topbar.refresh', 'Refresh'));
  setElementText('head-api-label', uiText('topbar.api', 'API'));
  setElementText('read-only-badge', uiText('badge.read_only_on', 'Read-only mode is ON'));

  setElementText('ui-texts-title', uiText('settings.texts', 'Text & Labels'));
  setElementText('ui-texts-subtitle', uiText('settings.texts_sub', 'Edit dashboard titles and labels.'));
  setElementPlaceholder('ui-text-search', uiText('settings.texts_search', 'Search labels...'));

  const toggle = byId('ui-text-toggle');
  if (toggle) {
    toggle.dataset.collapseText = uiText('settings.texts_collapse', 'Collapse');
    toggle.dataset.expandText = uiText('settings.texts_expand', 'Expand');
  }

  renderUiTextEditor();
  syncUiTextCollapseState();

  const activeMeta = viewMeta[state.view] || viewMeta.overview;
  setElementText('view-title', uiText(activeMeta.titleKey, activeMeta.title));
  setElementText('view-subtitle', uiText(activeMeta.subtitleKey, activeMeta.subtitle));
  setElementPlaceholder(
    'global-search',
    uiText(activeMeta.searchKey, uiText('topbar.search_placeholder', activeMeta.searchPlaceholder))
  );
}

function initUiTextEditor() {
  const search = byId('ui-text-search');
  const toggle = byId('ui-text-toggle');
  const card = byId('ui-text-card');
  if (!search || !toggle || !card) {
    return;
  }

  search.addEventListener('input', () => applyUiTextSearch(search.value));

  const storageKey = 'inventory.uiTextCollapsed';
  const saved = localStorage.getItem(storageKey);
  if (saved === '1') {
    card.classList.add('collapsed');
  } else if (saved === '0') {
    card.classList.remove('collapsed');
  } else {
    card.classList.add('collapsed');
    localStorage.setItem(storageKey, '1');
  }
  syncUiTextCollapseState();

  toggle.addEventListener('click', () => {
    card.classList.toggle('collapsed');
    localStorage.setItem(storageKey, card.classList.contains('collapsed') ? '1' : '0');
    syncUiTextCollapseState();
  });
}

async function api(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  if (options.body !== undefined) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(path, config);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : {};

  if (response.status === 401) {
    showAuth(false);
    throw new Error(payload.error || 'Authentication required.');
  }

  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  return payload;
}

function toast(message, isError = false) {
  const el = byId('toast');
  el.textContent = message;
  el.classList.remove('hidden');
  el.style.background = isError ? '#b42318' : '#111827';

  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 3200);
}

function initModal() {
  const root = byId('app-modal');
  const close = byId('app-modal-close');
  const cancel = byId('app-modal-cancel');
  const confirm = byId('app-modal-confirm');
  const input = byId('app-modal-input');

  if (!root || !close || !cancel || !confirm || !input) {
    return;
  }

  close.addEventListener('click', () => closeModal(false));
  cancel.addEventListener('click', () => closeModal(modalState.mode === 'input' ? null : false));
  confirm.addEventListener('click', () => submitModal());
  root.addEventListener('click', (event) => {
    if (event.target === root) {
      closeModal(modalState.mode === 'input' ? null : false);
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !root.classList.contains('hidden')) {
      closeModal(modalState.mode === 'input' ? null : false);
    }
  });
}

function openConfirmModal({ title, message, warning = '', confirmLabel = 'Confirm', danger = true }) {
  const root = byId('app-modal');
  const titleEl = byId('app-modal-title');
  const messageEl = byId('app-modal-message');
  const warningEl = byId('app-modal-warning');
  const inputWrap = byId('app-modal-input-wrap');
  const errorEl = byId('app-modal-error');
  const confirm = byId('app-modal-confirm');

  if (!root || !titleEl || !messageEl || !inputWrap || !errorEl || !confirm) {
    return Promise.resolve(window.confirm(message || title || 'Are you sure?'));
  }

  modalState.mode = 'confirm';
  modalState.validator = null;

  titleEl.textContent = title || 'Confirm Action';
  messageEl.textContent = message || '';
  if (warningEl) {
    warningEl.textContent = warning || '';
    warningEl.classList.toggle('hidden', !warning);
  }
  inputWrap.classList.add('hidden');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
  confirm.textContent = confirmLabel;
  confirm.classList.remove('primary', 'danger');
  confirm.classList.add(danger ? 'danger' : 'primary');

  root.classList.remove('hidden');
  document.body.classList.add('modal-open');

  return new Promise((resolve) => {
    modalState.resolver = resolve;
  });
}

function openInputModal({
  title,
  message,
  label = 'Value',
  inputType = 'text',
  initialValue = '',
  confirmLabel = 'Save',
  validator = null,
}) {
  const root = byId('app-modal');
  const titleEl = byId('app-modal-title');
  const messageEl = byId('app-modal-message');
  const warningEl = byId('app-modal-warning');
  const inputWrap = byId('app-modal-input-wrap');
  const inputLabel = byId('app-modal-input-label');
  const input = byId('app-modal-input');
  const errorEl = byId('app-modal-error');
  const confirm = byId('app-modal-confirm');

  if (!root || !titleEl || !messageEl || !inputWrap || !inputLabel || !input || !errorEl || !confirm) {
    return Promise.resolve(window.prompt(message || title || label, String(initialValue)));
  }

  modalState.mode = 'input';
  modalState.validator = validator;

  titleEl.textContent = title || 'Input Required';
  messageEl.textContent = message || '';
  if (warningEl) {
    warningEl.textContent = '';
    warningEl.classList.add('hidden');
  }
  inputLabel.textContent = label;
  input.type = inputType;
  input.value = String(initialValue ?? '');
  inputWrap.classList.remove('hidden');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
  confirm.textContent = confirmLabel;
  confirm.classList.remove('danger');
  confirm.classList.add('primary');

  root.classList.remove('hidden');
  document.body.classList.add('modal-open');
  setTimeout(() => {
    input.focus();
    input.select();
  }, 0);

  return new Promise((resolve) => {
    modalState.resolver = resolve;
  });
}

function submitModal() {
  const errorEl = byId('app-modal-error');
  const input = byId('app-modal-input');

  if (modalState.mode === 'confirm') {
    closeModal(true);
    return;
  }

  const value = input ? input.value : '';
  const validation = typeof modalState.validator === 'function'
    ? modalState.validator(value)
    : null;

  if (validation) {
    if (errorEl) {
      errorEl.textContent = validation;
      errorEl.classList.remove('hidden');
    }
    return;
  }

  closeModal(value);
}

function closeModal(result) {
  const root = byId('app-modal');
  const warningEl = byId('app-modal-warning');
  const errorEl = byId('app-modal-error');
  const inputWrap = byId('app-modal-input-wrap');
  const input = byId('app-modal-input');

  if (root) {
    root.classList.add('hidden');
  }
  document.body.classList.remove('modal-open');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (warningEl) {
    warningEl.textContent = '';
    warningEl.classList.add('hidden');
  }
  if (inputWrap) {
    inputWrap.classList.add('hidden');
  }
  if (input) {
    input.value = '';
    input.type = 'text';
  }

  const resolver = modalState.resolver;
  modalState.resolver = null;
  modalState.mode = 'confirm';
  modalState.validator = null;

  if (typeof resolver === 'function') {
    resolver(result);
  }
}

function initEditorModal() {
  const root = byId('editor-modal');
  const close = byId('editor-modal-close');
  const cancel = byId('editor-modal-cancel');
  const confirm = byId('editor-modal-confirm');
  const form = byId('editor-modal-form');

  if (!root || !close || !cancel || !confirm || !form) {
    return;
  }

  close.addEventListener('click', () => closeEditorModal(null));
  cancel.addEventListener('click', () => closeEditorModal(null));
  confirm.addEventListener('click', () => submitEditorModal());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitEditorModal();
  });
  root.addEventListener('click', (event) => {
    if (event.target === root) {
      closeEditorModal(null);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !root.classList.contains('hidden')) {
      closeEditorModal(null);
    }
  });
}

function renderEditorField(field) {
  const name = String(field.name || '').trim();
  if (!name) {
    return '';
  }

  const id = `editor-field-${name}`;
  const label = escapeHtml(field.label || name);
  const required = field.required ? ' required' : '';
  const placeholder = field.placeholder ? ` placeholder="${escapeHtml(field.placeholder)}"` : '';
  const value = field.value ?? '';

  if (field.type === 'checkbox') {
    return `
      <label class="inline-check field-span-2">
        <input id="${id}" name="${escapeHtml(name)}" type="checkbox" ${value ? 'checked' : ''} />
        ${label}
      </label>
    `;
  }

  if (field.type === 'select') {
    const options = (field.options || []).map((option) => {
      const optionValue = String(option.value ?? '');
      const selected = String(value) === optionValue ? ' selected' : '';
      return `<option value="${escapeHtml(optionValue)}"${selected}>${escapeHtml(option.label ?? optionValue)}</option>`;
    }).join('');
    return `
      <label>
        ${label}
        <select id="${id}" name="${escapeHtml(name)}"${required}>${options}</select>
      </label>
    `;
  }

  const type = field.type || 'text';
  const min = field.min !== undefined ? ` min="${escapeHtml(String(field.min))}"` : '';
  const max = field.max !== undefined ? ` max="${escapeHtml(String(field.max))}"` : '';
  const step = field.step !== undefined ? ` step="${escapeHtml(String(field.step))}"` : '';
  return `
    <label>
      ${label}
      <input id="${id}" name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(String(value))}"${placeholder}${required}${min}${max}${step} />
    </label>
  `;
}

function openEditorModal({
  title,
  message = '',
  fields = [],
  submitLabel = 'Save',
  validator = null,
  onReady = null,
}) {
  const root = byId('editor-modal');
  const titleEl = byId('editor-modal-title');
  const messageEl = byId('editor-modal-message');
  const formEl = byId('editor-modal-form');
  const errorEl = byId('editor-modal-error');
  const confirm = byId('editor-modal-confirm');

  if (!root || !titleEl || !messageEl || !formEl || !errorEl || !confirm) {
    return Promise.resolve(null);
  }

  editorModalState.fields = Array.isArray(fields) ? fields : [];
  editorModalState.validator = typeof validator === 'function' ? validator : null;

  titleEl.textContent = title || 'Edit Record';
  messageEl.textContent = message || '';
  formEl.innerHTML = editorModalState.fields.map(renderEditorField).join('');
  errorEl.textContent = '';
  errorEl.classList.add('hidden');
  confirm.textContent = submitLabel || 'Save';
  confirm.disabled = false;

  root.classList.remove('hidden');
  document.body.classList.add('modal-open');

  setTimeout(() => {
    const firstInput = formEl.querySelector('input, select, textarea');
    if (firstInput) {
      firstInput.focus();
      if (firstInput.tagName === 'INPUT' && firstInput.type !== 'checkbox') {
        firstInput.select();
      }
    }
    if (typeof onReady === 'function') {
      onReady(formEl);
    }
  }, 0);

  return new Promise((resolve) => {
    editorModalState.resolver = resolve;
  });
}

function closeEditorModal(result) {
  const root = byId('editor-modal');
  const formEl = byId('editor-modal-form');
  const errorEl = byId('editor-modal-error');
  const confirm = byId('editor-modal-confirm');

  if (root) {
    root.classList.add('hidden');
  }
  if (formEl) {
    formEl.innerHTML = '';
  }
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  if (confirm) {
    confirm.disabled = false;
  }
  document.body.classList.remove('modal-open');

  const resolver = editorModalState.resolver;
  editorModalState.resolver = null;
  editorModalState.fields = [];
  editorModalState.validator = null;

  if (typeof resolver === 'function') {
    resolver(result);
  }
}

function readEditorModalValues() {
  const formEl = byId('editor-modal-form');
  const values = {};
  for (const field of editorModalState.fields) {
    const name = String(field.name || '').trim();
    if (!name || !formEl) {
      continue;
    }
    const node = formEl.querySelector(`[name="${name.replace(/"/g, '\\"')}"]`);
    if (!node) {
      continue;
    }
    if (field.type === 'checkbox') {
      values[name] = !!node.checked;
    } else {
      values[name] = String(node.value ?? '');
    }
  }
  return values;
}

function submitEditorModal() {
  const errorEl = byId('editor-modal-error');
  const confirm = byId('editor-modal-confirm');
  const values = readEditorModalValues();

  const validation = typeof editorModalState.validator === 'function'
    ? editorModalState.validator(values)
    : null;

  if (validation) {
    if (errorEl) {
      errorEl.textContent = validation;
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (confirm) {
    confirm.disabled = true;
  }
  closeEditorModal(values);
}

function showAuth(isLoggedIn) {
  byId('login-panel').classList.toggle('hidden', isLoggedIn);
  byId('app-shell').classList.toggle('hidden', !isLoggedIn);
}

function setAuthBrandDefaults() {
  state.settings = {
    ...(state.settings || {}),
    site_name: state.settings.site_name || 'Inventory Management System',
    site_tagline: state.settings.site_tagline || 'Track inventory, movements, controls, and admin actions in one place.',
  };
  applyUiTexts();
}

function setView(view) {
  const allowedView = ensureAllowedView(view);
  state.view = allowedView;

  const meta = viewMeta[allowedView] || viewMeta.overview;
  byId('view-title').textContent = uiText(meta.titleKey, meta.title);
  byId('view-subtitle').textContent = uiText(meta.subtitleKey, meta.subtitle);
  byId('global-search').placeholder = uiText(meta.searchKey, meta.searchPlaceholder);

  document.querySelectorAll('.nav-btn[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === allowedView);
  });

  document.querySelectorAll('.view[data-view-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.viewPanel === allowedView);
  });

  syncGlobalSearch(allowedView);
  refreshViewData(allowedView).catch((error) => toast(error.message, true));
}

function ensureAllowedView(view) {
  const legacyView = view === 'catalog' ? 'areas' : view;
  const allowed = new Set(['overview', 'inventory', 'movements', 'areas', 'items', 'analytics', 'docs']);
  if (canManageAdmin()) allowed.add('admin');
  if (canViewTrash()) allowed.add('trash');
  if (canViewAudit()) allowed.add('audit');
  if (canManageSettings()) allowed.add('settings');

  return allowed.has(legacyView) ? legacyView : 'overview';
}

function updateClock() {
  byId('time-badge').textContent = new Date().toLocaleString();
}

function formatDateRangeLabel(rangeKey, startYmd = '', endYmd = '') {
  const labels = {
    today: 'Today',
    this_month: 'This Month',
    last_month: 'Last Month',
    custom: 'Custom',
    all: 'All Time',
  };

  if (rangeKey !== 'custom') {
    return labels[rangeKey] || 'All Time';
  }

  const startText = startYmd ? formatYmd(startYmd) : '';
  const endText = endYmd ? formatYmd(endYmd) : '';
  if (startText && endText) {
    return startText === endText ? startText : `${startText} - ${endText}`;
  }
  if (startText) {
    return `From ${startText}`;
  }
  if (endText) {
    return `Until ${endText}`;
  }

  return labels.custom;
}

function buildDateRangeBounds(rangeKey, customStart = '', customEnd = '') {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const toYmd = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let start = '';
  let end = '';

  if (rangeKey === 'today') {
    start = toYmd(today);
    end = toYmd(today);
  } else if (rangeKey === 'this_month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    start = toYmd(monthStart);
    end = toYmd(monthEnd);
  } else if (rangeKey === 'last_month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    start = toYmd(monthStart);
    end = toYmd(monthEnd);
  } else if (rangeKey === 'custom') {
    const validYmd = /^\d{4}-\d{2}-\d{2}$/;
    start = validYmd.test(customStart) ? customStart : '';
    end = validYmd.test(customEnd) ? customEnd : '';
  }

  return {
    start,
    end,
    label: formatDateRangeLabel(rangeKey, start, end),
  };
}

function applyRangeUI(prefix) {
  const rangeEl = byId(`${prefix}-range-filter`);
  const startWrap = byId(`${prefix}-custom-start-wrap`);
  const endWrap = byId(`${prefix}-custom-end-wrap`);
  const startInput = byId(`${prefix}-date-from`);
  const endInput = byId(`${prefix}-date-to`);
  const labelEl = byId(`${prefix}-range-label`);

  if (!rangeEl) {
    return { start: '', end: '', label: 'All Time' };
  }

  const range = String(rangeEl.value || 'all');
  const isCustom = range === 'custom';
  if (startWrap) {
    startWrap.classList.toggle('hidden', !isCustom);
  }
  if (endWrap) {
    endWrap.classList.toggle('hidden', !isCustom);
  }

  const startValue = startInput ? String(startInput.value || '') : '';
  const endValue = endInput ? String(endInput.value || '') : '';
  const bounds = buildDateRangeBounds(range, startValue, endValue);
  if (labelEl) {
    labelEl.textContent = `Period: ${bounds.label}`;
  }

  return bounds;
}

function extractYmd(value) {
  const raw = String(value || '');
  const match = raw.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
}

function isDateWithinBounds(value, startYmd, endYmd) {
  const ymd = extractYmd(value);
  if (!ymd) {
    return false;
  }
  if (startYmd && ymd < startYmd) {
    return false;
  }
  if (endYmd && ymd > endYmd) {
    return false;
  }
  return true;
}

function canWrite() {
  if (!state.capabilities.can_write_inventory) {
    return false;
  }

  if (state.settings.read_only_mode && String(state.user?.role || '').toLowerCase() !== 'owner') {
    return false;
  }

  return true;
}

function canManageAdmin() {
  return !!state.capabilities.can_manage_admin;
}

function canManageSettings() {
  return !!state.capabilities.can_manage_settings;
}

function canViewTrash() {
  return !!state.capabilities.can_view_trash;
}

function canViewAudit() {
  return !!state.capabilities.can_view_audit;
}

function isOwner() {
  return String(state.user?.role || '').toLowerCase() === 'owner';
}

function canPurgeTrash() {
  return canWrite() && isOwner();
}

function applyPermissionsUI() {
  const writeEnabled = canWrite();
  const settingsEnabled = canManageSettings() && writeEnabled;
  const adminEnabled = canManageAdmin() && writeEnabled;

  toggleFormDisabled(byId('movement-form'), !writeEnabled);
  toggleFormDisabled(byId('settings-form'), !settingsEnabled);

  const areasAdd = byId('areas-add-btn');
  const itemsAdd = byId('items-add-btn');
  const usersAdd = byId('users-add-btn');
  if (areasAdd) areasAdd.disabled = !writeEnabled;
  if (itemsAdd) itemsAdd.disabled = !writeEnabled;
  if (usersAdd) usersAdd.disabled = !adminEnabled;

  byId('read-only-badge').classList.toggle('hidden', !state.settings.read_only_mode);

  byId('nav-admin').classList.toggle('hidden', !canManageAdmin());
  byId('nav-settings').classList.toggle('hidden', !canManageSettings());
  byId('nav-trash').classList.toggle('hidden', !canViewTrash());
  byId('nav-audit').classList.toggle('hidden', !canViewAudit());

  byId('admin-users-card').classList.toggle('hidden', !canManageAdmin());

  const role = String(state.user?.role || '').toUpperCase();
  byId('user-badge').textContent = `${state.user?.name || '-'} (${role || 'USER'})`;

  const openBadge = byId('site-open-badge');
  openBadge.classList.remove('good', 'bad', 'warn');
  if (state.settings.site_open) {
    openBadge.textContent = uiText('badge.site_open', 'Site Open');
    openBadge.classList.add('good');
  } else {
    openBadge.textContent = uiText('badge.site_closed', 'Site Closed');
    openBadge.classList.add('bad');
  }
  syncSiteControlPreview();

  const safeView = ensureAllowedView(state.view);
  if (safeView !== state.view) {
    setView(safeView);
  }
}

function toggleFormDisabled(form, disabled) {
  if (!form) {
    return;
  }

  for (const element of form.querySelectorAll('input, select, button, textarea')) {
    element.disabled = disabled;
  }
}

function bindSortHandlers() {
  document.querySelectorAll('[data-view-panel="inventory"] th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      toggleSort('levels', th.dataset.sort, 'asc');
      renderLevels();
    });
  });

  document.querySelectorAll('[data-view-panel="movements"] th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const defaultDir = th.dataset.sort === 'created_at' ? 'desc' : 'asc';
      toggleSort('movements', th.dataset.sort, defaultDir);
      renderMovements();
    });
  });
}

function toggleSort(tableKey, sortKey, defaultDir = 'asc') {
  const table = state.tables[tableKey];
  if (!table) {
    return;
  }

  if (table.sortKey === sortKey) {
    table.sortDir = table.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    table.sortKey = sortKey;
    table.sortDir = defaultDir;
  }

  table.page = 1;
}

function wireEvents() {
  byId('login-form').addEventListener('submit', onLogin);
  byId('logout-btn').addEventListener('click', onLogout);

  byId('sidebar-toggle').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-collapsed');
  });

  byId('head-refresh').addEventListener('click', async () => {
    try {
      await refreshViewData(state.view, true);
      toast('Refreshed.');
    } catch (error) {
      toast(error.message, true);
    }
  });

  byId('global-search').addEventListener('input', debounce(applyGlobalSearch, 250));

  document.querySelectorAll('.nav-btn[data-view]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  byId('areas-add-btn').addEventListener('click', () => {
    openAreaEditor().catch((error) => toast(error.message, true));
  });

  byId('items-add-btn').addEventListener('click', () => {
    openItemEditor().catch((error) => toast(error.message, true));
  });

  byId('movement-form').addEventListener('submit', onApplyMovement);
  byId('move-type').addEventListener('change', updateMovementFields);

  byId('settings-form').addEventListener('submit', onSaveSettings);
  ['set-theme-mode', 'set-theme-palette', 'set-dashboard-style', 'set-brand-primary', 'set-icon-primary', 'set-icon-muted', 'set-icon-accent']
    .forEach((id) => {
      const input = byId(id);
      if (!input) {
        return;
      }

      input.addEventListener('change', () => {
        state.settings.theme_mode = byId('set-theme-mode').value;
        state.settings.theme_palette = byId('set-theme-palette').value;
        state.settings.dashboard_style = byId('set-dashboard-style').value;
        state.settings.brand_primary = byId('set-brand-primary').value.trim();
        state.settings.icon_primary = byId('set-icon-primary').value.trim();
        state.settings.icon_muted = byId('set-icon-muted').value.trim();
        state.settings.icon_accent = byId('set-icon-accent').value.trim();
        applyThemeSettings();
      });
    });

  ['set-site-open', 'set-read-only'].forEach((id) => {
    const input = byId(id);
    if (!input) {
      return;
    }

    input.addEventListener('change', syncSiteControlPreview);
  });

  byId('users-add-btn').addEventListener('click', () => {
    openUserEditor().catch((error) => toast(error.message, true));
  });

  byId('levels-refresh').addEventListener('click', loadLevels);
  byId('levels-search').addEventListener('input', debounce(() => {
    state.tables.levels.page = 1;
    loadLevels();
  }, 250));
  byId('levels-area-filter').addEventListener('change', () => {
    state.tables.levels.page = 1;
    loadLevels();
  });
  byId('levels-status-filter').addEventListener('change', () => {
    state.tables.levels.page = 1;
    renderLevels();
  });
  byId('levels-page-size').addEventListener('change', () => {
    state.tables.levels.page = 1;
    state.tables.levels.pageSize = Number(byId('levels-page-size').value || 25);
    renderLevels();
  });

  byId('movements-refresh').addEventListener('click', loadMovements);
  byId('movements-search').addEventListener('input', debounce(() => {
    state.tables.movements.page = 1;
    loadMovements();
  }, 300));
  byId('movements-type-filter').addEventListener('change', loadMovements);
  byId('movements-range-filter').addEventListener('change', () => {
    state.tables.movements.page = 1;
    applyRangeUI('movements');
    loadMovements();
  });
  byId('movements-date-from').addEventListener('change', () => {
    applyRangeUI('movements');
    loadMovements();
  });
  byId('movements-date-to').addEventListener('change', () => {
    applyRangeUI('movements');
    loadMovements();
  });
  byId('movements-page-size').addEventListener('change', () => {
    state.tables.movements.page = 1;
    state.tables.movements.pageSize = Number(byId('movements-page-size').value || 50);
    renderMovements();
  });

  const runUsersSearch = () => {
    state.tables.users.page = 1;
    state.tables.users.pageSize = Number(byId('users-limit').value || 10);
    loadUsers();
  };

  byId('users-refresh').addEventListener('click', loadUsers);
  byId('users-search').addEventListener('input', debounce(runUsersSearch, 250));
  byId('users-search').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runUsersSearch();
    }
  });
  byId('users-search-btn').addEventListener('click', runUsersSearch);
  byId('users-clear-btn').addEventListener('click', () => {
    byId('users-search').value = '';
    byId('users-role-filter').value = '';
    runUsersSearch();
  });
  byId('users-role-filter').addEventListener('change', runUsersSearch);
  byId('users-limit').addEventListener('change', runUsersSearch);

  byId('admin-activity-refresh').addEventListener('click', loadAdminActivity);
  byId('admin-activity-user-filter').addEventListener('change', () => {
    state.tables.adminActivity.page = 1;
    loadAdminActivity();
  });
  byId('admin-activity-action-filter').addEventListener('change', () => {
    state.tables.adminActivity.page = 1;
    loadAdminActivity();
  });
  byId('admin-activity-range-filter').addEventListener('change', () => {
    state.tables.adminActivity.page = 1;
    applyRangeUI('admin-activity');
    loadAdminActivity();
  });
  byId('admin-activity-date-from').addEventListener('change', () => {
    applyRangeUI('admin-activity');
    loadAdminActivity();
  });
  byId('admin-activity-date-to').addEventListener('change', () => {
    applyRangeUI('admin-activity');
    loadAdminActivity();
  });
  byId('admin-activity-limit').addEventListener('change', () => {
    state.tables.adminActivity.page = 1;
    loadAdminActivity();
  });

  byId('trash-refresh').addEventListener('click', loadTrash);
  byId('trash-search').addEventListener('input', debounce(loadTrash, 250));
  byId('trash-entity-filter').addEventListener('change', renderTrash);
  byId('trash-deleted-by-filter').addEventListener('change', renderTrash);
  byId('trash-range-filter').addEventListener('change', () => {
    applyRangeUI('trash');
    renderTrash();
  });
  byId('trash-date-from').addEventListener('change', () => {
    applyRangeUI('trash');
    renderTrash();
  });
  byId('trash-date-to').addEventListener('change', () => {
    applyRangeUI('trash');
    renderTrash();
  });

  byId('audit-refresh').addEventListener('click', loadAudit);
  byId('audit-search').addEventListener('input', debounce(() => {
    state.tables.audit.page = 1;
    loadAudit();
  }, 250));
  byId('audit-entity-filter').addEventListener('change', loadAudit);
  byId('audit-action-filter').addEventListener('change', loadAudit);
  byId('audit-range-filter').addEventListener('change', () => {
    state.tables.audit.page = 1;
    applyRangeUI('audit');
    loadAudit();
  });
  byId('audit-date-from').addEventListener('change', () => {
    applyRangeUI('audit');
    loadAudit();
  });
  byId('audit-date-to').addEventListener('change', () => {
    applyRangeUI('audit');
    loadAudit();
  });
  byId('audit-limit').addEventListener('change', loadAudit);

  applyRangeUI('admin-activity');
  applyRangeUI('trash');
  applyRangeUI('movements');
  applyRangeUI('audit');

  bindSortHandlers();
}

async function boot() {
  initModal();
  initEditorModal();
  initUiTextEditor();
  wireEvents();
  updateClock();
  setInterval(updateClock, 1000);
  await checkSession();
}

async function checkSession() {
  try {
    const payload = await api('/api/auth/me');
    state.user = payload.user;
    showAuth(true);
    await loadAll();
  } catch {
    state.user = null;
    showAuth(false);
    setAuthBrandDefaults();
  }
}

async function onLogin(event) {
  event.preventDefault();

  const email = byId('login-email').value.trim();
  const password = byId('login-password').value;

  try {
    await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    byId('login-form').reset();
    await checkSession();
    toast('Logged in.');
  } catch (error) {
    toast(error.message, true);
  }
}

async function onLogout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
  } catch {
    // ignore
  }

  state.user = null;
  showAuth(false);
  setAuthBrandDefaults();
  toast('Logged out.');
}

async function loadAll() {
  await loadMeta();

  const jobs = [
    loadSummary(),
    loadAnalytics(),
    loadLevels(),
    loadMovements(),
    loadDocs(),
  ];

  if (canManageAdmin()) {
    jobs.push(loadUsers());
  } else {
    state.users = [];
    state.adminActivityRows = [];
    renderUsers();
    renderAdminActivity();
  }

  if (canViewTrash()) {
    jobs.push(loadTrash());
  } else {
    state.trash.items = [];
    state.trash.storage_areas = [];
    renderTrash();
  }

  if (canViewAudit()) {
    jobs.push(loadAudit());
  } else {
    state.auditRows = [];
    renderAudit();
  }

  await Promise.all(jobs);
  setView(ensureAllowedView(state.view));
}

async function loadMeta() {
  const payload = await api('/api/meta/options');

  state.items = payload.items || [];
  state.areas = payload.storage_areas || [];
  state.settings = payload.settings || {};
  state.capabilities = payload.capabilities || {};

  const siteName = state.settings.site_name || state.settings.company_name || 'Inventory Management System';
  const siteTagline = state.settings.site_tagline || 'Track inventory, movements, controls, and admin actions in one place.';

  byId('site-name').textContent = siteName;
  byId('site-tagline').textContent = siteTagline;
  applyUiTexts();
  applyThemeSettings();

  const pageSize = Number(state.settings.table_page_size || 25);
  state.tables.levels.pageSize = pageSize;
  state.tables.movements.pageSize = Math.max(20, pageSize);
  byId('levels-page-size').value = String(pageSize);
  byId('movements-page-size').value = String(Math.max(20, pageSize));

  hydrateSettingsForm();
  renderMovementOptions();
  renderAreaFilter();
  renderAreas();
  renderItems();
  applyPermissionsUI();
}

function hydrateSettingsForm() {
  byId('set-company-name').value = state.settings.company_name || state.settings.site_name || '';
  byId('set-site-name').value = state.settings.site_name || '';
  byId('set-site-tagline').value = state.settings.site_tagline || '';
  byId('set-timezone').value = state.settings.timezone || 'America/New_York';
  byId('set-default-currency').value = state.settings.default_currency || 'USD';
  if (byId('set-item-units')) {
    byId('set-item-units').value = normalizeItemUnits(state.settings.item_units, false).join(', ');
  }
  byId('set-low-stock-limit').value = Number(state.settings.dashboard_low_stock_limit || 25);
  byId('set-table-page-size').value = Number(state.settings.table_page_size || 25);
  byId('set-theme-mode').value = state.settings.theme_mode || 'light';
  byId('set-theme-palette').value = state.settings.theme_palette || 'material-indigo';
  byId('set-dashboard-style').value = state.settings.dashboard_style || 'kona';
  byId('set-brand-primary').value = state.settings.brand_primary || '';
  byId('set-icon-primary').value = state.settings.icon_primary || '';
  byId('set-icon-muted').value = state.settings.icon_muted || '';
  byId('set-icon-accent').value = state.settings.icon_accent || '';
  byId('set-site-open').checked = !!state.settings.site_open;
  byId('set-read-only').checked = !!state.settings.read_only_mode;
  byId('set-allow-negative').checked = !!state.settings.allow_negative_stock;
  byId('set-notify-email').checked = !!state.settings.notify_email;
  byId('set-notify-inapp').checked = !!state.settings.notify_inapp;
  byId('set-notify-whatsapp').checked = !!state.settings.notify_whatsapp;
  hydrateUiTextInputs();
  syncSiteControlPreview();
  syncThemePreview();
}

function applyThemeSettings() {
  const paletteKey = String(state.settings.theme_palette || 'material-indigo');
  const palette = THEME_PALETTES[paletteKey] || THEME_PALETTES['material-indigo'];

  const brandPrimary = normalizeHexColor(state.settings.brand_primary, palette.primary);
  const iconPrimary = normalizeHexColor(state.settings.icon_primary, palette.iconPrimary);
  const iconMuted = normalizeHexColor(state.settings.icon_muted, palette.iconMuted);
  const iconAccent = normalizeHexColor(state.settings.icon_accent, palette.iconAccent);
  const primary2 = darkenHex(brandPrimary, 0.2) || palette.primary2;

  document.documentElement.style.setProperty('--primary', brandPrimary);
  document.documentElement.style.setProperty('--primary-2', primary2);
  document.documentElement.style.setProperty('--icon-primary', iconPrimary);
  document.documentElement.style.setProperty('--icon-muted', iconMuted);
  document.documentElement.style.setProperty('--icon-accent', iconAccent);

  const mode = String(state.settings.theme_mode || 'light');
  document.body.classList.remove('theme-dark', 'theme-slate');
  if (mode === 'dark') {
    document.body.classList.add('theme-dark');
  } else if (mode === 'slate') {
    document.body.classList.add('theme-slate');
  }

  document.body.dataset.dashboardStyle = String(state.settings.dashboard_style || 'kona');
  syncThemePreview();
}

function syncThemePreview() {
  const paletteKey = String(state.settings.theme_palette || 'material-indigo');
  const palette = THEME_PALETTES[paletteKey] || THEME_PALETTES['material-indigo'];

  const primary = normalizeHexColor(state.settings.brand_primary, palette.primary);
  const iconPrimary = normalizeHexColor(state.settings.icon_primary, palette.iconPrimary);
  const iconMuted = normalizeHexColor(state.settings.icon_muted, palette.iconMuted);
  const iconAccent = normalizeHexColor(state.settings.icon_accent, palette.iconAccent);

  const dotPrimary = byId('preview-primary');
  const dotIconPrimary = byId('preview-icon-primary');
  const dotIconMuted = byId('preview-icon-muted');
  const dotIconAccent = byId('preview-icon-accent');

  if (dotPrimary) dotPrimary.style.background = primary;
  if (dotIconPrimary) dotIconPrimary.style.background = iconPrimary;
  if (dotIconMuted) dotIconMuted.style.background = iconMuted;
  if (dotIconAccent) dotIconAccent.style.background = iconAccent;
}

function syncSiteControlPreview() {
  const siteOpenToggle = byId('set-site-open');
  const readOnlyToggle = byId('set-read-only');
  const siteBadge = byId('settings-site-open-badge');
  const readOnlyBadge = byId('settings-read-only-badge');

  if (siteOpenToggle && siteBadge) {
    siteBadge.classList.remove('good', 'bad', 'warn');
    if (siteOpenToggle.checked) {
      siteBadge.textContent = uiText('badge.site_open', 'Site Open');
      siteBadge.classList.add('good');
    } else {
      siteBadge.textContent = uiText('badge.site_closed', 'Site Closed');
      siteBadge.classList.add('bad');
    }
  }

  if (readOnlyToggle && readOnlyBadge) {
    readOnlyBadge.classList.remove('good', 'bad', 'warn');
    if (readOnlyToggle.checked) {
      readOnlyBadge.textContent = uiText('badge.read_only_on', 'Read-only mode is ON');
      readOnlyBadge.classList.add('warn');
    } else {
      readOnlyBadge.textContent = 'Read-only mode is OFF';
      readOnlyBadge.classList.add('good');
    }
  }
}

async function loadSummary() {
  const payload = await api('/api/dashboard/summary');
  state.summary = payload.summary || {};
  renderSummary(payload.summary || {});
  renderLowStock(payload.low_stock || []);
}

async function loadAnalytics() {
  const payload = await api('/api/dashboard/analytics?days=14');
  state.analytics = payload || {};
  renderStockByArea(payload.stock_by_area || []);
  renderTrend(payload.movement_trend || []);
  renderTopMoved(payload.top_moved_items || []);
  renderCategoryMix(payload.category_mix || []);
  renderStorageUtilization(payload.stock_by_area || []);
}

async function loadLevels() {
  const params = new URLSearchParams();
  const search = byId('levels-search').value.trim();
  const area = byId('levels-area-filter').value;

  if (search) params.set('search', search);
  if (area) params.set('storage_area_id', area);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await api(`/api/inventory/levels${suffix}`);
  state.levelsRows = payload.data || [];
  state.tables.levels.page = 1;
  renderLevels();
  renderInventoryHealth();
}

async function loadMovements() {
  const params = new URLSearchParams();
  const search = byId('movements-search').value.trim();
  const type = byId('movements-type-filter').value;
  const bounds = applyRangeUI('movements');

  if (search) params.set('search', search);
  if (type) params.set('movement_type', type);
  if (bounds.start) params.set('date_from', bounds.start);
  if (bounds.end) params.set('date_to', bounds.end);
  params.set('limit', '500');

  const payload = await api(`/api/inventory/movements?${params.toString()}`);
  state.movementsRows = payload.data || [];
  state.tables.movements.page = 1;
  renderMovements();
}

async function loadUsers() {
  if (!canManageAdmin()) {
    state.users = [];
    populateAdminActivityUserFilter();
    renderUsers();
    return;
  }

  const params = new URLSearchParams();
  const search = byId('users-search').value.trim();
  const role = byId('users-role-filter').value;
  const limit = byId('users-limit').value;

  if (search) params.set('search', search);
  if (role) params.set('role', role);
  if (limit) params.set('limit', limit);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await api(`/api/admin/users${suffix}`);
  state.users = payload.data || [];
  state.tables.users.pageSize = Math.max(1, Number(limit || state.tables.users.pageSize || 10));
  populateAdminActivityUserFilter();
  state.tables.users.page = 1;
  renderUsers();

  if (state.view === 'admin' && canViewAudit()) {
    await loadAdminActivity();
  }
}

function populateAdminActivityUserFilter() {
  const select = byId('admin-activity-user-filter');
  if (!select) {
    return;
  }

  const selected = String(select.value || '');
  const users = Array.isArray(state.users) ? state.users : [];
  const options = ['<option value="">All Admins</option>']
    .concat(users.map((user) => `<option value="${escapeHtml(user.id)}">${escapeHtml(`${user.name || '-'} (${user.email || '-'})`)}</option>`));

  select.innerHTML = options.join('');
  if (selected && users.some((user) => String(user.id) === selected)) {
    select.value = selected;
  }
}

async function loadAdminActivity() {
  if (!canManageAdmin() || !canViewAudit()) {
    state.adminActivityRows = [];
    renderAdminActivity();
    return;
  }

  const params = new URLSearchParams();
  const actorId = byId('admin-activity-user-filter').value;
  const actionScope = byId('admin-activity-action-filter').value;
  const bounds = applyRangeUI('admin-activity');
  const limit = byId('admin-activity-limit').value;

  if (actorId) params.set('actor_user_id', actorId);
  if (actionScope) params.set('action_scope', actionScope);
  if (bounds.start) params.set('date_from', bounds.start);
  if (bounds.end) params.set('date_to', bounds.end);
  if (limit) params.set('limit', limit);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await api(`/api/audit-logs${suffix}`);
  state.adminActivityRows = payload.data || [];
  state.tables.adminActivity.page = 1;
  renderAdminActivity();
}

async function loadTrash() {
  if (!canViewTrash()) {
    state.trash.items = [];
    state.trash.storage_areas = [];
    populateTrashDeletedByFilter();
    renderTrash();
    return;
  }

  const params = new URLSearchParams();
  const search = byId('trash-search').value.trim();
  if (search) params.set('search', search);
  params.set('limit', '500');

  const payload = await api(`/api/trash?${params.toString()}`);
  const data = payload.data || {};
  state.trash.items = data.items || [];
  state.trash.storage_areas = data.storage_areas || [];
  populateTrashDeletedByFilter();
  applyRangeUI('trash');
  renderTrash();
}

function trashActorToken(row) {
  return String(row.deleted_by_email || row.deleted_by_name || '').trim().toLowerCase();
}

function trashActorLabel(row) {
  const name = String(row.deleted_by_name || '').trim();
  const email = String(row.deleted_by_email || '').trim();
  if (name && email) {
    return `${name} (${email})`;
  }
  return name || email || 'Unknown user';
}

function populateTrashDeletedByFilter() {
  const select = byId('trash-deleted-by-filter');
  if (!select) {
    return;
  }

  const selected = String(select.value || '');
  const allRows = [...state.trash.items, ...state.trash.storage_areas];
  const actorsByToken = new Map();

  for (const row of allRows) {
    const token = trashActorToken(row);
    if (!token || actorsByToken.has(token)) {
      continue;
    }
    actorsByToken.set(token, trashActorLabel(row));
  }

  const options = ['<option value="">All Users</option>']
    .concat(
      [...actorsByToken.entries()]
        .sort((left, right) => left[1].localeCompare(right[1], undefined, { sensitivity: 'base' }))
        .map(([token, label]) => `<option value="${escapeHtml(token)}">${escapeHtml(label)}</option>`)
    );

  select.innerHTML = options.join('');
  if (selected && actorsByToken.has(selected)) {
    select.value = selected;
  }
}

async function loadAudit() {
  if (!canViewAudit()) {
    state.auditRows = [];
    renderAudit();
    return;
  }

  const params = new URLSearchParams();
  const search = byId('audit-search').value.trim();
  const entity = byId('audit-entity-filter').value;
  const actionScope = byId('audit-action-filter').value;
  const bounds = applyRangeUI('audit');
  const limit = byId('audit-limit').value;

  if (search) params.set('search', search);
  if (entity) params.set('entity_type', entity);
  if (actionScope) params.set('action_scope', actionScope);
  if (bounds.start) params.set('date_from', bounds.start);
  if (bounds.end) params.set('date_to', bounds.end);
  if (limit) params.set('limit', limit);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await api(`/api/audit-logs${suffix}`);
  state.auditRows = payload.data || [];
  state.tables.audit.page = 1;
  renderAudit();
}

async function loadDocs() {
  const payload = await api('/api/docs');
  state.docsRows = payload.endpoints || [];
  renderDocs();
}

function renderSummary(summary) {
  const cards = [
    ['Total Items', summary.total_items || 0],
    ['Storage Areas', summary.total_storage_areas || 0],
    ['Units In Stock', formatNumber(summary.total_quantity || 0)],
    ['Low Stock', summary.low_stock_items || 0],
    ['Movements Today', summary.movements_today || 0],
    ['Inbound Today', formatNumber(summary.inbound_today || 0)],
    ['Outbound Today', formatNumber(summary.outbound_today || 0)],
    ['Currency', state.settings.default_currency || 'USD'],
  ];

  byId('summary-grid').innerHTML = cards
    .map(([label, value]) => `
      <article class="kpi">
        <div class="label">${escapeHtml(label)}</div>
        <div class="value">${escapeHtml(String(value))}</div>
      </article>
    `)
    .join('');
}

function renderInventoryHealth() {
  const root = byId('inventory-health');
  root.innerHTML = '';

  const byItem = new Map();
  for (const row of state.levelsRows) {
    const itemId = Number(row.item_id);
    if (!byItem.has(itemId)) {
      byItem.set(itemId, {
        total: Number(row.total_item_quantity || 0),
        reorder: Number(row.reorder_level || 0),
      });
    }
  }

  const totals = {
    in: 0,
    low: 0,
    out: 0,
  };

  for (const info of byItem.values()) {
    if (info.total <= 0) {
      totals.out += 1;
    } else if (info.reorder > 0 && info.total <= info.reorder) {
      totals.low += 1;
    } else {
      totals.in += 1;
    }
  }

  const count = totals.in + totals.low + totals.out;
  if (count === 0) {
    root.innerHTML = '<p class="hint">No inventory records yet.</p>';
    return;
  }

  const widthIn = Math.max(0, Math.round((totals.in / count) * 100));
  const widthLow = Math.max(0, Math.round((totals.low / count) * 100));
  const widthOut = Math.max(0, 100 - widthIn - widthLow);

  root.innerHTML = `
    <div class="health-track">
      <div class="health-segment in" style="width:${widthIn}%"></div>
      <div class="health-segment low" style="width:${widthLow}%"></div>
      <div class="health-segment out" style="width:${widthOut}%"></div>
    </div>
    <div class="health-legend">
      <span class="health-chip in">In stock: ${formatNumber(totals.in)}</span>
      <span class="health-chip low">Low stock: ${formatNumber(totals.low)}</span>
      <span class="health-chip out">Out of stock: ${formatNumber(totals.out)}</span>
    </div>
  `;
}

function renderLowStock(rows) {
  const tbody = byId('low-stock-table');
  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4">No low stock alerts.</td></tr>';
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.sku)}</td>
      <td class="low">${formatNumber(row.total_quantity)} ${escapeHtml(row.unit || '')}</td>
      <td>${formatNumber(row.reorder_level)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderStockByArea(rows) {
  const root = byId('stock-by-area');
  root.innerHTML = '';

  if (!rows.length) {
    root.innerHTML = '<p class="hint">No storage data yet.</p>';
    return;
  }

  const max = Math.max(...rows.map((row) => Number(row.total_quantity || 0)), 1);

  for (const row of rows) {
    const qty = Number(row.total_quantity || 0);
    const width = Math.max(2, Math.round((qty / max) * 100));
    const block = document.createElement('div');
    block.className = 'bar';
    block.innerHTML = `
      <div class="bar-head">
        <span>${escapeHtml(row.code)} - ${escapeHtml(row.name)}</span>
        <strong>${formatNumber(qty)}</strong>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
    `;
    root.appendChild(block);
  }
}

function renderTrend(rows) {
  const root = byId('movement-trend-bars');
  root.innerHTML = '';

  if (!rows.length) {
    root.innerHTML = '<p class="hint">No movement trend yet.</p>';
    return;
  }

  const max = Math.max(
    ...rows.map((row) => Number(row.inbound_quantity || 0) + Number(row.outbound_quantity || 0)),
    1
  );

  for (const row of rows) {
    const inbound = Number(row.inbound_quantity || 0);
    const outbound = Number(row.outbound_quantity || 0);
    const total = inbound + outbound;
    const scale = total / max;
    const inHeight = Math.max(2, Math.round(120 * scale * (inbound / (total || 1))));
    const outHeight = Math.max(2, Math.round(120 * scale * (outbound / (total || 1))));

    const col = document.createElement('div');
    col.className = 'trend-col';
    col.title = `${row.day}: in ${formatNumber(inbound)} / out ${formatNumber(outbound)}`;
    col.innerHTML = `
      <div class="trend-stack">
        <div class="trend-in" style="height:${inHeight}px"></div>
        <div class="trend-out" style="height:${outHeight}px"></div>
      </div>
      <div class="trend-day">${escapeHtml(row.day.slice(5))}</div>
    `;
    root.appendChild(col);
  }
}

function renderTopMoved(rows) {
  const tbody = byId('top-moved-table');
  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4">No movement history yet.</td></tr>';
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.sku)}</td>
      <td>${formatNumber(row.movement_count)}</td>
      <td>${formatNumber(row.total_moved)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderCategoryMix(rows) {
  const root = byId('category-mix-bars');
  root.innerHTML = '';

  if (!rows.length) {
    root.innerHTML = '<p class="hint">No category data.</p>';
    return;
  }

  const max = Math.max(...rows.map((row) => Number(row.total_quantity || 0)), 1);

  for (const row of rows) {
    const qty = Number(row.total_quantity || 0);
    const width = Math.max(2, Math.round((qty / max) * 100));
    const block = document.createElement('div');
    block.className = 'bar';
    block.innerHTML = `
      <div class="bar-head">
        <span>${escapeHtml(row.category)}</span>
        <span>${formatNumber(row.item_count)} items / ${formatNumber(qty)} qty</span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
    `;
    root.appendChild(block);
  }
}

function renderStorageUtilization(rows) {
  const tbody = byId('storage-utilization-table');
  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="3">No utilization data.</td></tr>';
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(row.code)} - ${escapeHtml(row.name)}</td>
      <td>${formatNumber(row.total_quantity)}</td>
      <td>${formatNumber(row.active_slots)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderMovementOptions() {
  const itemSelect = byId('move-item');
  const fromArea = byId('move-from');
  const toArea = byId('move-to');

  itemSelect.innerHTML = '<option value="">Select item</option>';
  for (const item of state.items) {
    if (Number(item.is_active) !== 1) {
      continue;
    }

    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.sku} - ${item.name}`;
    itemSelect.appendChild(option);
  }

  const areaHtml = ['<option value="">Select area</option>']
    .concat(
      state.areas
        .filter((area) => Number(area.is_active) === 1)
        .map((area) => `<option value="${area.id}">${escapeHtml(area.code)} - ${escapeHtml(area.name)}</option>`)
    )
    .join('');

  fromArea.innerHTML = areaHtml;
  toArea.innerHTML = areaHtml;

  updateMovementFields();
}

function renderAreaFilter() {
  const filter = byId('levels-area-filter');
  filter.innerHTML = '<option value="">All Areas</option>';

  for (const area of state.areas) {
    if (Number(area.is_active) !== 1) {
      continue;
    }

    const option = document.createElement('option');
    option.value = area.id;
    option.textContent = `${area.code} - ${area.name}`;
    filter.appendChild(option);
  }
}

function renderAreas() {
  const tbody = byId('areas-table');
  tbody.innerHTML = '';

  if (!state.areas.length) {
    tbody.innerHTML = '<tr><td colspan="4">No storage areas found.</td></tr>';
    return;
  }

  for (const area of state.areas) {
    const active = Number(area.is_active) === 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(area.code)}</td>
      <td>${escapeHtml(area.name)}</td>
      <td><span class="status-pill ${active ? 'in' : 'out'}">${active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="actions">
          <button class="btn ghost table-btn action-edit" data-area-edit="${area.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn danger table-btn action-delete" data-area-del="${area.id}" ${canWrite() ? '' : 'disabled'}>Trash</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-area-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!canWrite()) {
        return;
      }
      const area = state.areas.find((row) => Number(row.id) === Number(button.dataset.areaEdit));
      if (!area) {
        return;
      }
      openAreaEditor(area).catch((error) => toast(error.message, true));
    });
  });

  tbody.querySelectorAll('[data-area-del]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!canWrite()) {
        return;
      }

      const areaId = Number(button.dataset.areaDel);
      const confirmed = await openConfirmModal({
        title: 'Move Storage Area To Trash?',
        message: 'This hides the storage area from active operations. You can restore it later from Trash.',
        warning: 'Warning: stock in this area is hidden from active workflows until this area is restored.',
        confirmLabel: 'Move To Trash',
        danger: true,
      });
      if (!confirmed) {
        return;
      }

      try {
        await api(`/api/storage-areas/${areaId}`, { method: 'DELETE' });
        await reloadMasterData();
        if (canViewTrash()) {
          await loadTrash();
        }
        if (canViewAudit()) {
          await loadAudit();
        }
        toast('Storage area moved to trash.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

function renderItems() {
  const tbody = byId('items-table');
  tbody.innerHTML = '';

  if (!state.items.length) {
    tbody.innerHTML = '<tr><td colspan="6">No items found.</td></tr>';
    return;
  }

  for (const item of state.items) {
    const active = Number(item.is_active) === 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(item.sku)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category || '-')}</td>
      <td>${formatNumber(item.reorder_level)}</td>
      <td><span class="status-pill ${active ? 'in' : 'out'}">${active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="actions">
          <button class="btn ghost table-btn action-edit" data-item-edit="${item.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn danger table-btn action-delete" data-item-del="${item.id}" ${canWrite() ? '' : 'disabled'}>Trash</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-item-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!canWrite()) {
        return;
      }
      const item = state.items.find((row) => Number(row.id) === Number(button.dataset.itemEdit));
      if (!item) {
        return;
      }
      openItemEditor(item).catch((error) => toast(error.message, true));
    });
  });

  tbody.querySelectorAll('[data-item-del]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!canWrite()) {
        return;
      }

      const itemId = Number(button.dataset.itemDel);
      const confirmed = await openConfirmModal({
        title: 'Move Item To Trash?',
        message: 'This removes the item from active inventory screens. You can restore it from Trash.',
        warning: 'Warning: this item will no longer be available in movement forms until restored.',
        confirmLabel: 'Move To Trash',
        danger: true,
      });
      if (!confirmed) {
        return;
      }

      try {
        await api(`/api/items/${itemId}`, { method: 'DELETE' });
        await reloadMasterData();
        if (canViewTrash()) {
          await loadTrash();
        }
        if (canViewAudit()) {
          await loadAudit();
        }
        toast('Item moved to trash.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

function statusForInventoryRow(row) {
  const total = Number(row.total_item_quantity || 0);
  const reorder = Number(row.reorder_level || 0);

  if (total <= 0) {
    return { key: 'out', label: 'Out of stock' };
  }

  if (reorder > 0 && total <= reorder) {
    return { key: 'low', label: 'Low stock' };
  }

  return { key: 'in', label: 'In stock' };
}

function renderLevels() {
  const tableState = state.tables.levels;
  const sortRows = applySorting(state.levelsRows, tableState.sortKey, tableState.sortDir);
  const statusFilter = byId('levels-status-filter').value;
  const source = statusFilter
    ? sortRows.filter((row) => statusForInventoryRow(row).key === statusFilter)
    : sortRows;

  const page = paginate(source, tableState.page, tableState.pageSize);
  tableState.page = page.page;

  const tbody = byId('levels-table');
  tbody.innerHTML = '';

  if (!page.rows.length) {
    tbody.innerHTML = '<tr><td colspan="8">No inventory rows found.</td></tr>';
    renderPager('levels-pager', 'levels', page.totalRows, page.totalPages);
    return;
  }

  for (const row of page.rows) {
    const status = statusForInventoryRow(row);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="product-cell">
          <span class="avatar-dot">${escapeHtml(String(row.item_name || '?').slice(0, 1).toUpperCase())}</span>
          <div>
            <strong>${escapeHtml(row.item_name)}</strong>
            <p class="hint">${escapeHtml(row.unit || 'unit')}</p>
          </div>
        </div>
      </td>
      <td>${escapeHtml(row.category || '-')}</td>
      <td>${escapeHtml(row.sku)}</td>
      <td>${escapeHtml(row.storage_area_name)}</td>
      <td>${formatNumber(row.quantity)}</td>
      <td class="${status.key === 'low' ? 'low' : ''}">${formatNumber(row.total_item_quantity)}</td>
      <td><span class="status-pill ${status.key}">${status.label}</span></td>
      <td><button class="btn ghost table-btn action-set" data-set-level="${row.item_id}:${row.storage_area_id}:${row.quantity}" ${canWrite() ? '' : 'disabled'}>Set</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-set-level]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!canWrite()) {
        return;
      }

      const [itemId, areaId, current] = button.dataset.setLevel.split(':');
      const answer = await openInputModal({
        title: 'Set Absolute Quantity',
        message: `Current quantity: ${current}`,
        label: 'Target quantity',
        inputType: 'number',
        initialValue: current,
        confirmLabel: 'Set Quantity',
        validator: (raw) => {
          const value = Number(raw);
          if (!Number.isFinite(value) || value < 0) {
            return 'Quantity must be 0 or greater.';
          }
          return null;
        },
      });
      if (answer === null) {
        return;
      }

      const target = Number(answer);
      if (!Number.isFinite(target) || target < 0) {
        toast('Quantity must be 0 or greater.', true);
        return;
      }

      try {
        await api('/api/inventory/movements', {
          method: 'POST',
          body: {
            movement_type: 'set',
            item_id: Number(itemId),
            storage_area_id: Number(areaId),
            target_quantity: target,
            note: 'Manual set from inventory table',
          },
        });

        await refreshOperationalData();
        if (canViewAudit()) {
          await loadAudit();
        }
        toast('Quantity updated.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });

  renderPager('levels-pager', 'levels', page.totalRows, page.totalPages);
}

function renderMovements() {
  const tableState = state.tables.movements;
  const source = applySorting(state.movementsRows, tableState.sortKey, tableState.sortDir);
  const page = paginate(source, tableState.page, tableState.pageSize);
  tableState.page = page.page;

  const tbody = byId('movements-table');
  tbody.innerHTML = '';

  if (!page.rows.length) {
    tbody.innerHTML = '<tr><td colspan="9">No movement history found for this filter.</td></tr>';
    renderPager('movements-pager', 'movements', page.totalRows, page.totalPages);
    return;
  }

  for (const row of page.rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td><span class="type-pill">${escapeHtml(row.movement_type)}</span></td>
      <td>${escapeHtml(row.item_sku)} - ${escapeHtml(row.item_name)}</td>
      <td>${formatSigned(row.quantity)}</td>
      <td>${escapeHtml(row.from_storage_area_name || '-')}</td>
      <td>${escapeHtml(row.to_storage_area_name || '-')}</td>
      <td>${escapeHtml(row.actor_name || '-')}</td>
      <td>${escapeHtml(row.reference || '-')}</td>
      <td>${escapeHtml(row.note || '')}</td>
    `;
    tbody.appendChild(tr);
  }

  renderPager('movements-pager', 'movements', page.totalRows, page.totalPages);
}

function renderUsers() {
  const tbody = byId('users-table');
  tbody.innerHTML = '';

  if (!canManageAdmin()) {
    tbody.innerHTML = '<tr><td colspan="8">Owner access required.</td></tr>';
    byId('users-pager').innerHTML = '';
    return;
  }

  const tableState = state.tables.users;
  const source = applySorting(state.users, tableState.sortKey, tableState.sortDir);
  const page = paginate(source, tableState.page, tableState.pageSize);
  tableState.page = page.page;

  if (!page.rows.length) {
    tbody.innerHTML = '<tr><td colspan="8">No users found.</td></tr>';
    renderPager('users-pager', 'users', page.totalRows, page.totalPages);
    return;
  }

  for (const user of page.rows) {
    const active = Number(user.is_active) === 1;
    const email = String(user.email || '');
    const username = email.includes('@') ? email.split('@')[0] : String(user.name || '').toLowerCase().replace(/\s+/g, '.');
    const role = String(user.role || '').toLowerCase();
    const roleLabel = role || 'viewer';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(String(user.id || '-'))}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(username)}</td>
      <td>${escapeHtml(email)}</td>
      <td><span class="role-pill">${escapeHtml(roleLabel)}</span></td>
      <td><span class="status-pill ${active ? 'in' : 'out'}">${active ? 'Active' : 'Inactive'}</span></td>
      <td>${escapeHtml(formatDate(user.created_at))}</td>
      <td>
        <div class="actions">
          <button class="btn ghost table-btn action-edit" data-user-edit="${user.id}" ${canWrite() ? '' : 'disabled'}>Manage</button>
          <button class="btn ghost table-btn action-toggle" data-user-toggle="${user.id}" ${canWrite() ? '' : 'disabled'}>${active ? 'Disable' : 'Enable'}</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-user-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!canManageAdmin() || !canWrite()) {
        return;
      }
      const user = state.users.find((row) => Number(row.id) === Number(button.dataset.userEdit));
      if (!user) {
        return;
      }
      openUserEditor(user).catch((error) => toast(error.message, true));
    });
  });

  tbody.querySelectorAll('[data-user-toggle]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!canWrite()) {
        return;
      }

      const userId = Number(button.dataset.userToggle);
      const user = state.users.find((row) => Number(row.id) === userId);
      if (!user) {
        return;
      }

      try {
        await api(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          body: {
            is_active: Number(user.is_active) !== 1,
          },
        });

        await loadUsers();
        if (canViewAudit()) {
          await loadAudit();
        }
        toast('User status updated.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });

  renderPager('users-pager', 'users', page.totalRows, page.totalPages);
}

function renderAdminActivity() {
  const tbody = byId('admin-activity-table');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '';

  if (!canManageAdmin() || !canViewAudit()) {
    tbody.innerHTML = '<tr><td colspan="6">Owner access required.</td></tr>';
    byId('admin-activity-pager').innerHTML = '';
    return;
  }

  const tableState = state.tables.adminActivity;
  const source = applySorting(state.adminActivityRows, tableState.sortKey, tableState.sortDir);
  const page = paginate(source, tableState.page, tableState.pageSize);
  tableState.page = page.page;

  if (!page.rows.length) {
    tbody.innerHTML = '<tr><td colspan="6">No activity logs for this filter.</td></tr>';
    renderPager('admin-activity-pager', 'adminActivity', page.totalRows, page.totalPages);
    return;
  }

  for (const row of page.rows) {
    const statusClass = Number(row.status_code) >= 400 ? 'bad' : 'good';
    const entity = row.entity_id ? `${row.entity_type}:${row.entity_id}` : (row.entity_type || '-');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td>${escapeHtml(row.actor_name || '-')}${row.actor_email ? `<br><span class="hint">${escapeHtml(row.actor_email)}</span>` : ''}</td>
      <td><span class="type-pill">${escapeHtml(row.action || '-')}</span></td>
      <td>${escapeHtml(entity)}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(String(row.status_code || '-'))}</span></td>
      <td>${escapeHtml(row.summary || '-')}</td>
    `;
    tbody.appendChild(tr);
  }

  renderPager('admin-activity-pager', 'adminActivity', page.totalRows, page.totalPages);
}

function renderTrash() {
  const itemsBody = byId('trash-items-table');
  const areasBody = byId('trash-areas-table');
  const itemsCount = byId('trash-items-count');
  const areasCount = byId('trash-areas-count');
  itemsBody.innerHTML = '';
  areasBody.innerHTML = '';

  if (!canViewTrash()) {
    itemsBody.innerHTML = '<tr><td colspan="6">Manager or owner access required.</td></tr>';
    areasBody.innerHTML = '<tr><td colspan="5">Manager or owner access required.</td></tr>';
    if (itemsCount) {
      itemsCount.textContent = 'Deleted Items: 0';
    }
    if (areasCount) {
      areasCount.textContent = 'Deleted Areas: 0';
    }
    return;
  }

  const entityFilter = String(byId('trash-entity-filter')?.value || '');
  const actorFilter = String(byId('trash-deleted-by-filter')?.value || '').trim().toLowerCase();
  const bounds = applyRangeUI('trash');

  const applyTrashFilters = (rows) => rows.filter((row) => {
    if (actorFilter && trashActorToken(row) !== actorFilter) {
      return false;
    }
    if ((bounds.start || bounds.end) && !isDateWithinBounds(row.deleted_at, bounds.start, bounds.end)) {
      return false;
    }
    return true;
  });

  const itemsRows = entityFilter === 'storage_areas' ? [] : applyTrashFilters(state.trash.items);
  const areaRows = entityFilter === 'items' ? [] : applyTrashFilters(state.trash.storage_areas);

  if (itemsCount) {
    itemsCount.textContent = `Deleted Items: ${formatNumber(itemsRows.length)}`;
  }
  if (areasCount) {
    areasCount.textContent = `Deleted Areas: ${formatNumber(areaRows.length)}`;
  }

  if (!itemsRows.length) {
    const message = entityFilter === 'storage_areas'
      ? 'Hidden by entity filter.'
      : 'No deleted items for this filter.';
    itemsBody.innerHTML = `<tr><td colspan="6">${escapeHtml(message)}</td></tr>`;
  } else {
    for (const row of itemsRows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.sku)}</td>
        <td>${escapeHtml(row.category || '-')}</td>
        <td>${escapeHtml(row.deleted_by_name || row.deleted_by_email || '-')}</td>
        <td>${escapeHtml(formatDate(row.deleted_at))}</td>
        <td>
          <div class="actions">
            <button class="btn ghost table-btn action-restore" data-restore-item="${row.id}" ${canWrite() ? '' : 'disabled'}>Restore</button>
            <button class="btn danger table-btn action-delete" data-delete-item="${row.id}" ${canPurgeTrash() ? '' : 'disabled'} title="${canPurgeTrash() ? 'Permanently delete' : 'Owner only'}">Delete</button>
          </div>
        </td>
      `;
      itemsBody.appendChild(tr);
    }
  }

  if (!areaRows.length) {
    const message = entityFilter === 'items'
      ? 'Hidden by entity filter.'
      : 'No deleted storage areas for this filter.';
    areasBody.innerHTML = `<tr><td colspan="5">${escapeHtml(message)}</td></tr>`;
  } else {
    for (const row of areaRows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(row.code)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.deleted_by_name || row.deleted_by_email || '-')}</td>
        <td>${escapeHtml(formatDate(row.deleted_at))}</td>
        <td>
          <div class="actions">
            <button class="btn ghost table-btn action-restore" data-restore-area="${row.id}" ${canWrite() ? '' : 'disabled'}>Restore</button>
            <button class="btn danger table-btn action-delete" data-delete-area="${row.id}" ${canPurgeTrash() ? '' : 'disabled'} title="${canPurgeTrash() ? 'Permanently delete' : 'Owner only'}">Delete</button>
          </div>
        </td>
      `;
      areasBody.appendChild(tr);
    }
  }

  itemsBody.querySelectorAll('[data-restore-item]').forEach((button) => {
    button.addEventListener('click', () => restoreFromTrash('items', Number(button.dataset.restoreItem)));
  });
  itemsBody.querySelectorAll('[data-delete-item]').forEach((button) => {
    button.addEventListener('click', () => permanentlyDeleteFromTrash('items', Number(button.dataset.deleteItem)));
  });

  areasBody.querySelectorAll('[data-restore-area]').forEach((button) => {
    button.addEventListener('click', () => restoreFromTrash('storage_areas', Number(button.dataset.restoreArea)));
  });
  areasBody.querySelectorAll('[data-delete-area]').forEach((button) => {
    button.addEventListener('click', () => permanentlyDeleteFromTrash('storage_areas', Number(button.dataset.deleteArea)));
  });
}

async function restoreFromTrash(entity, id) {
  if (!canWrite()) {
    return;
  }

  const label = entity === 'items' ? 'item' : 'storage area';
  const confirmed = await openConfirmModal({
    title: `Restore ${label === 'item' ? 'Item' : 'Storage Area'}?`,
    message: `This will move the ${label} back into active records.`,
    confirmLabel: 'Restore',
    danger: false,
  });
  if (!confirmed) {
    return;
  }

  try {
    await api(`/api/trash/${entity}/${id}/restore`, { method: 'POST' });
    await reloadMasterData();
    await loadTrash();
    if (canViewAudit()) {
      await loadAudit();
    }
    toast('Record restored.');
  } catch (error) {
    toast(error.message, true);
  }
}

async function permanentlyDeleteFromTrash(entity, id) {
  if (!canPurgeTrash()) {
    toast('Only owner can permanently delete records from trash.', true);
    return;
  }

  const label = entity === 'items' ? 'item' : 'storage area';
  const confirmed = await openConfirmModal({
    title: `Permanently Delete ${label === 'item' ? 'Item' : 'Storage Area'}?`,
    message: `This will permanently delete the ${label} from trash.`,
    warning: 'Warning: this cannot be undone.',
    confirmLabel: 'Delete Permanently',
    danger: true,
  });

  if (!confirmed) {
    return;
  }

  try {
    await api(`/api/trash/${entity}/${id}`, { method: 'DELETE' });
    await reloadMasterData();
    await loadTrash();
    if (canViewAudit()) {
      await loadAudit();
    }
    toast('Record permanently deleted.');
  } catch (error) {
    toast(error.message, true);
  }
}

function renderAudit() {
  const tbody = byId('audit-table');
  tbody.innerHTML = '';

  if (!canViewAudit()) {
    tbody.innerHTML = '<tr><td colspan="8">Owner access required.</td></tr>';
    byId('audit-pager').innerHTML = '';
    return;
  }

  const tableState = state.tables.audit;
  const source = applySorting(state.auditRows, tableState.sortKey, tableState.sortDir);
  const page = paginate(source, tableState.page, tableState.pageSize);
  tableState.page = page.page;

  if (!page.rows.length) {
    tbody.innerHTML = '<tr><td colspan="8">No audit records for this filter.</td></tr>';
    renderPager('audit-pager', 'audit', page.totalRows, page.totalPages);
    return;
  }

  for (const row of page.rows) {
    const statusClass = Number(row.status_code) >= 400 ? 'bad' : 'good';
    const entity = row.entity_id ? `${row.entity_type}:${row.entity_id}` : row.entity_type;

    let metaHtml = '-';
    if (row.metadata && typeof row.metadata === 'object') {
      const json = escapeHtml(JSON.stringify(row.metadata, null, 2));
      metaHtml = `<details class="meta-details"><summary>View</summary><pre>${json}</pre></details>`;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td>${escapeHtml(row.actor_name || '-')}${row.actor_email ? `<br><span class="hint">${escapeHtml(row.actor_email)}</span>` : ''}</td>
      <td>${escapeHtml(String(row.actor_role || '').toUpperCase() || '-')}</td>
      <td><code>${escapeHtml(row.action || '-')}</code></td>
      <td>${escapeHtml(entity || '-')}</td>
      <td><span class="badge ${statusClass}">${escapeHtml(String(row.status_code || '-'))}</span></td>
      <td>${escapeHtml(row.summary || '-')}</td>
      <td>${metaHtml}</td>
    `;
    tbody.appendChild(tr);
  }

  renderPager('audit-pager', 'audit', page.totalRows, page.totalPages);
}

function renderDocs() {
  const tbody = byId('api-docs-table');
  tbody.innerHTML = '';

  if (!state.docsRows.length) {
    tbody.innerHTML = '<tr><td colspan="3">API docs unavailable.</td></tr>';
    return;
  }

  for (const endpoint of state.docsRows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(endpoint.method)}</strong></td>
      <td><code>${escapeHtml(endpoint.path)}</code></td>
      <td>${escapeHtml(endpoint.description || '')}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderPager(containerId, tableKey, totalRows, totalPages) {
  const container = byId(containerId);
  const table = state.tables[tableKey];
  if (!container || !table) {
    return;
  }

  container.innerHTML = `
    <div>${totalRows} rows</div>
    <div class="controls">
      <button type="button" data-pager-prev="${tableKey}" ${table.page <= 1 ? 'disabled' : ''}>Prev</button>
      <span>Page ${table.page} / ${Math.max(totalPages, 1)}</span>
      <button type="button" data-pager-next="${tableKey}" ${table.page >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;

  const rerender = {
    levels: renderLevels,
    movements: renderMovements,
    users: renderUsers,
    adminActivity: renderAdminActivity,
    audit: renderAudit,
  }[tableKey];

  const prev = container.querySelector(`[data-pager-prev="${tableKey}"]`);
  const next = container.querySelector(`[data-pager-next="${tableKey}"]`);

  if (prev) {
    prev.addEventListener('click', () => {
      table.page = Math.max(1, table.page - 1);
      if (rerender) {
        rerender();
      }
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      table.page = Math.min(Math.max(totalPages, 1), table.page + 1);
      if (rerender) {
        rerender();
      }
    });
  }
}

function applySorting(rows, sortKey, sortDir) {
  const list = [...rows];

  list.sort((a, b) => {
    const left = a?.[sortKey];
    const right = b?.[sortKey];

    const leftNum = Number(left);
    const rightNum = Number(right);
    if (Number.isFinite(leftNum) && Number.isFinite(rightNum) && `${left}` !== '' && `${right}` !== '') {
      return leftNum - rightNum;
    }

    const leftDate = Date.parse(String(left || ''));
    const rightDate = Date.parse(String(right || ''));
    if (Number.isFinite(leftDate) && Number.isFinite(rightDate)) {
      return leftDate - rightDate;
    }

    return String(left || '').localeCompare(String(right || ''), undefined, { sensitivity: 'base' });
  });

  if (sortDir === 'desc') {
    list.reverse();
  }

  return list;
}

function paginate(rows, page, size) {
  const pageSize = Math.max(1, Number(size || 25));
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalRows,
  };
}

function updateMovementFields() {
  const type = byId('move-type').value;

  byId('move-from-wrap').classList.remove('hidden');
  byId('move-to-wrap').classList.remove('hidden');
  byId('move-qty-wrap').classList.remove('hidden');
  byId('move-target-wrap').classList.add('hidden');

  byId('move-quantity').min = '0.001';

  if (type === 'receive') {
    byId('move-from-wrap').classList.add('hidden');
  }

  if (type === 'issue') {
    byId('move-to-wrap').classList.add('hidden');
  }

  if (type === 'adjust') {
    byId('move-from-wrap').classList.add('hidden');
    byId('move-quantity').removeAttribute('min');
  }

  if (type === 'set') {
    byId('move-from-wrap').classList.add('hidden');
    byId('move-qty-wrap').classList.add('hidden');
    byId('move-target-wrap').classList.remove('hidden');
  }
}

async function onApplyMovement(event) {
  event.preventDefault();

  if (!canWrite()) {
    toast('You do not have write access right now.', true);
    return;
  }

  const type = byId('move-type').value;
  const itemId = Number(byId('move-item').value);
  const quantity = Number(byId('move-quantity').value);
  const target = Number(byId('move-target').value);
  const fromAreaId = Number(byId('move-from').value);
  const toAreaId = Number(byId('move-to').value);

  if (!itemId) {
    toast('Pick an item first.', true);
    return;
  }

  const payload = {
    movement_type: type,
    item_id: itemId,
    quantity,
    target_quantity: target,
    from_storage_area_id: fromAreaId,
    to_storage_area_id: toAreaId,
    storage_area_id: toAreaId,
    reference: byId('move-reference').value.trim(),
    note: byId('move-note').value.trim(),
  };

  if (type === 'receive' && !toAreaId) {
    toast('Select destination area.', true);
    return;
  }

  if (type === 'issue' && !fromAreaId) {
    toast('Select source area.', true);
    return;
  }

  if (type === 'transfer' && (!fromAreaId || !toAreaId)) {
    toast('Select both source and destination areas.', true);
    return;
  }

  if (type === 'adjust' && !toAreaId) {
    toast('Select area for adjustment.', true);
    return;
  }

  if (type === 'set') {
    if (!toAreaId) {
      toast('Select area for absolute set.', true);
      return;
    }
    if (!Number.isFinite(target) || target < 0) {
      toast('Target quantity must be 0 or greater.', true);
      return;
    }
  } else if (!Number.isFinite(quantity) || (type !== 'adjust' && quantity <= 0) || (type === 'adjust' && quantity === 0)) {
    toast(type === 'adjust' ? 'Adjustment quantity cannot be 0.' : 'Quantity must be greater than 0.', true);
    return;
  }

  try {
    await api('/api/inventory/movements', {
      method: 'POST',
      body: payload,
    });

    byId('movement-form').reset();
    updateMovementFields();
    await refreshOperationalData();
    if (canViewAudit()) {
      await loadAudit();
    }
    toast('Movement applied.');
  } catch (error) {
    toast(error.message, true);
  }
}

async function openAreaEditor(area = null) {
  if (!canWrite()) {
    toast('You do not have write access right now.', true);
    return;
  }

  const values = await openEditorModal({
    title: area ? 'Edit Storage Area' : 'Add Storage Area',
    message: area
      ? 'Update zone details, then save changes.'
      : 'Create a new zone for inventory operations.',
    submitLabel: area ? 'Save Changes' : 'Create Area',
    fields: [
      { name: 'code', label: 'Code', value: area?.code || '', required: true, placeholder: 'MAIN' },
      { name: 'name', label: 'Name', value: area?.name || '', required: true, placeholder: 'Main Warehouse' },
      { name: 'description', label: 'Description', value: area?.description || '', placeholder: 'Optional notes' },
      { name: 'is_active', label: 'Active', type: 'checkbox', value: area ? Number(area.is_active) === 1 : true },
    ],
    validator: (formValues) => {
      if (!String(formValues.code || '').trim()) {
        return 'Code is required.';
      }
      if (!String(formValues.name || '').trim()) {
        return 'Name is required.';
      }
      return null;
    },
  });

  if (!values) {
    return;
  }

  const body = {
    code: String(values.code || '').trim(),
    name: String(values.name || '').trim(),
    description: String(values.description || '').trim(),
    is_active: !!values.is_active,
  };

  try {
    if (area?.id) {
      await api(`/api/storage-areas/${area.id}`, { method: 'PATCH', body });
      toast('Storage area updated.');
    } else {
      await api('/api/storage-areas', { method: 'POST', body });
      toast('Storage area created.');
    }

    await reloadMasterData();
    if (canViewAudit()) {
      await loadAudit();
    }
  } catch (error) {
    toast(error.message, true);
  }
}

async function openItemEditor(item = null) {
  if (!canWrite()) {
    toast('You do not have write access right now.', true);
    return;
  }

  const configuredUnits = resolveConfiguredItemUnits();
  const currentUnit = normalizeUnitToken(item?.unit || '');
  const unitOptions = [...configuredUnits];
  if (currentUnit && !unitOptions.includes(currentUnit)) {
    unitOptions.unshift(currentUnit);
  }
  const unitSelectValue = currentUnit || unitOptions[0] || 'unit';

  const values = await openEditorModal({
    title: item ? 'Edit Item' : 'Add Item',
    message: item
      ? 'Update SKU details and reorder rules.'
      : 'Add a new SKU to the inventory catalog.',
    submitLabel: item ? 'Save Changes' : 'Create Item',
    fields: [
      { name: 'sku', label: 'SKU', value: item?.sku || '', required: true, placeholder: 'SKU-001' },
      { name: 'name', label: 'Name', value: item?.name || '', required: true, placeholder: 'Product name' },
      { name: 'category', label: 'Category', value: item?.category || '', placeholder: 'Packaging' },
      {
        name: 'unit',
        label: 'Unit',
        type: 'select',
        value: unitSelectValue,
        options: [
          ...unitOptions.map((unit) => ({ value: unit, label: unit })),
          { value: '__custom__', label: 'Custom...' },
        ],
      },
      {
        name: 'custom_unit',
        label: 'Custom Unit (optional)',
        value: '',
        placeholder: 'Type a new unit when using Custom...',
      },
      {
        name: 'reorder_level',
        label: 'Reorder Level',
        type: 'number',
        value: Number(item?.reorder_level || 0),
        min: 0,
        step: 1,
      },
      { name: 'notes', label: 'Notes', value: item?.notes || '', placeholder: 'Optional notes' },
      { name: 'is_active', label: 'Active', type: 'checkbox', value: item ? Number(item.is_active) === 1 : true },
    ],
    onReady: (formEl) => {
      const unitSelect = formEl.querySelector('[name="unit"]');
      const customInput = formEl.querySelector('[name="custom_unit"]');
      const customWrap = customInput ? customInput.closest('label') : null;
      if (!unitSelect || !customInput || !customWrap) {
        return;
      }

      const sync = () => {
        const isCustom = String(unitSelect.value || '') === '__custom__';
        customWrap.classList.toggle('hidden', !isCustom);
        if (!isCustom) {
          customInput.value = '';
        }
      };

      unitSelect.addEventListener('change', sync);
      sync();
    },
    validator: (formValues) => {
      if (!String(formValues.sku || '').trim()) {
        return 'SKU is required.';
      }
      if (!String(formValues.name || '').trim()) {
        return 'Name is required.';
      }
      const selectedRaw = String(formValues.unit || '').trim();
      const customUnit = normalizeUnitToken(formValues.custom_unit || '');
      if (!selectedRaw) {
        return 'Unit is required.';
      }
      if (selectedRaw === '__custom__' && !customUnit) {
        return 'Custom unit is required.';
      }
      const selectedUnit = selectedRaw === '__custom__'
        ? customUnit
        : normalizeUnitToken(selectedRaw);
      if (!selectedUnit) {
        return 'Unit value is invalid.';
      }
      const reorder = Number(formValues.reorder_level || 0);
      if (!Number.isFinite(reorder) || reorder < 0) {
        return 'Reorder level must be 0 or greater.';
      }
      return null;
    },
  });

  if (!values) {
    return;
  }

  const selectedRaw = String(values.unit || '').trim();
  const customUnit = normalizeUnitToken(values.custom_unit || '');
  const resolvedUnit = selectedRaw === '__custom__'
    ? customUnit
    : normalizeUnitToken(selectedRaw);

  const body = {
    sku: String(values.sku || '').trim(),
    name: String(values.name || '').trim(),
    category: String(values.category || '').trim(),
    unit: resolvedUnit || 'unit',
    reorder_level: Number(values.reorder_level || 0),
    notes: String(values.notes || '').trim(),
    is_active: !!values.is_active,
  };

  try {
    if (item?.id) {
      await api(`/api/items/${item.id}`, { method: 'PATCH', body });
      toast('Item updated.');
    } else {
      await api('/api/items', { method: 'POST', body });
      toast('Item created.');
    }

    await ensureItemUnitPreset(body.unit);
    await reloadMasterData();
    if (canViewAudit()) {
      await loadAudit();
    }
  } catch (error) {
    toast(error.message, true);
  }
}

async function ensureItemUnitPreset(unitValue) {
  const normalized = normalizeUnitToken(unitValue);
  if (!normalized || !canManageSettings()) {
    return;
  }

  const current = normalizeItemUnits(state.settings.item_units, false);
  if (current.includes(normalized)) {
    return;
  }

  const next = normalizeItemUnits([...current, normalized], false);

  try {
    const response = await api('/api/settings', {
      method: 'PATCH',
      body: { item_units: next },
    });
    state.settings = response.data || state.settings;
    hydrateSettingsForm();
  } catch {
    state.settings.item_units = next;
    if (byId('set-item-units')) {
      byId('set-item-units').value = next.join(', ');
    }
  }
}

async function onSaveSettings(event) {
  event.preventDefault();

  if (!canManageSettings()) {
    toast('You do not have permission to manage settings.', true);
    return;
  }

  if (!canWrite()) {
    toast('Write access is disabled right now.', true);
    return;
  }

  const rawItemUnits = byId('set-item-units') ? byId('set-item-units').value : '';
  const unitPresets = normalizeItemUnits(rawItemUnits, false);

  const payload = {
    company_name: byId('set-company-name').value.trim(),
    site_name: byId('set-site-name').value.trim(),
    site_tagline: byId('set-site-tagline').value.trim(),
    timezone: byId('set-timezone').value.trim(),
    default_currency: byId('set-default-currency').value.trim(),
    item_units: unitPresets.length ? unitPresets : [...DEFAULT_ITEM_UNITS],
    dashboard_low_stock_limit: Number(byId('set-low-stock-limit').value || 25),
    table_page_size: Number(byId('set-table-page-size').value || 25),
    theme_mode: byId('set-theme-mode').value,
    theme_palette: byId('set-theme-palette').value,
    dashboard_style: byId('set-dashboard-style').value,
    brand_primary: byId('set-brand-primary').value.trim(),
    icon_primary: byId('set-icon-primary').value.trim(),
    icon_muted: byId('set-icon-muted').value.trim(),
    icon_accent: byId('set-icon-accent').value.trim(),
    site_open: byId('set-site-open').checked,
    read_only_mode: byId('set-read-only').checked,
    allow_negative_stock: byId('set-allow-negative').checked,
    notify_email: byId('set-notify-email').checked,
    notify_inapp: byId('set-notify-inapp').checked,
    notify_whatsapp: byId('set-notify-whatsapp').checked,
    ui_texts: collectUiTextInputs(),
  };

  try {
    const response = await api('/api/settings', {
      method: 'PATCH',
      body: payload,
    });

    state.settings = response.data || state.settings;
    byId('site-name').textContent = state.settings.site_name || state.settings.company_name || 'Inventory Management System';
    byId('site-tagline').textContent = state.settings.site_tagline || 'Track inventory, movements, controls, and admin actions in one place.';
    applyUiTexts();
    hydrateSettingsForm();
    applyThemeSettings();
    applyPermissionsUI();
    await Promise.all([loadSummary(), loadAnalytics()]);
    if (canViewAudit()) {
      await loadAudit();
    }
    toast('Settings updated.');
  } catch (error) {
    toast(error.message, true);
  }
}

async function openUserEditor(user = null) {
  if (!canManageAdmin()) {
    toast('Owner access required.', true);
    return;
  }

  if (!canWrite()) {
    toast('Write access is disabled.', true);
    return;
  }

  const values = await openEditorModal({
    title: user ? 'Edit Admin User' : 'Add Admin User',
    message: user
      ? 'Change role, status, or credentials.'
      : 'Create a user for your internal team.',
    submitLabel: user ? 'Save Changes' : 'Create User',
    fields: [
      { name: 'name', label: 'Name', value: user?.name || '', required: true, placeholder: 'Team member name' },
      { name: 'email', label: 'Email', value: user?.email || '', required: true, placeholder: 'name@company.com' },
      {
        name: 'password',
        label: user ? 'Password (optional)' : 'Password',
        type: 'password',
        value: '',
        required: !user,
        placeholder: user ? 'Leave blank to keep current password' : 'Set initial password',
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        value: user?.role || 'manager',
        options: [
          { value: 'owner', label: 'Owner' },
          { value: 'manager', label: 'Manager' },
          { value: 'viewer', label: 'Viewer' },
        ],
      },
      { name: 'is_active', label: 'Active', type: 'checkbox', value: user ? Number(user.is_active) === 1 : true },
    ],
    validator: (formValues) => {
      const name = String(formValues.name || '').trim();
      const email = String(formValues.email || '').trim();
      const password = String(formValues.password || '');
      const role = String(formValues.role || 'manager').toLowerCase();

      if (!name) {
        return 'Name is required.';
      }
      if (!email) {
        return 'Email is required.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return 'Email format is invalid.';
      }
      if (!['owner', 'manager', 'viewer'].includes(role)) {
        return 'Role must be owner, manager, or viewer.';
      }
      if (!user && !password) {
        return 'Password is required for new users.';
      }

      return null;
    },
  });

  if (!values) {
    return;
  }

  const payload = {
    name: String(values.name || '').trim(),
    email: String(values.email || '').trim(),
    password: String(values.password || ''),
    role: String(values.role || 'manager').toLowerCase(),
    is_active: !!values.is_active,
  };

  try {
    if (user?.id) {
      if (!payload.password) {
        delete payload.password;
      }
      await api(`/api/admin/users/${user.id}`, { method: 'PATCH', body: payload });
      toast('User updated.');
    } else {
      if (!payload.password) {
        toast('Password is required for new users.', true);
        return;
      }
      await api('/api/admin/users', { method: 'POST', body: payload });
      toast('User created.');
    }

    await loadUsers();
    if (canViewAudit()) {
      await loadAudit();
    }
  } catch (error) {
    toast(error.message, true);
  }
}

async function reloadMasterData() {
  await loadMeta();
  await refreshOperationalData();
}

async function refreshOperationalData() {
  await Promise.all([loadSummary(), loadAnalytics(), loadLevels(), loadMovements()]);
}

function normalizeHexColor(value, fallback) {
  const raw = String(value || '').trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(raw)) {
    return raw;
  }

  return String(fallback || '#5B3DF5').toUpperCase();
}

function darkenHex(hex, ratio = 0.15) {
  const safe = normalizeHexColor(hex, '#5B3DF5');
  const amount = Math.max(0, Math.min(1, Number(ratio)));

  const r = parseInt(safe.slice(1, 3), 16);
  const g = parseInt(safe.slice(3, 5), 16);
  const b = parseInt(safe.slice(5, 7), 16);
  if (![r, g, b].every(Number.isFinite)) {
    return null;
  }

  const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r * (1 - amount))}${toHex(g * (1 - amount))}${toHex(b * (1 - amount))}`;
}

async function refreshViewData(view, force = false) {
  if (!state.user) {
    return;
  }

  if (force) {
    await loadMeta();
  }

  if (view === 'overview') {
    await Promise.all([loadSummary(), loadAnalytics(), loadLevels()]);
    return;
  }

  if (view === 'inventory') {
    await loadLevels();
    return;
  }

  if (view === 'movements') {
    await loadMovements();
    return;
  }

  if (view === 'areas' || view === 'items') {
    await loadMeta();
    return;
  }

  if (view === 'analytics') {
    await loadAnalytics();
    return;
  }

  if (view === 'admin' && canManageAdmin()) {
    await loadUsers();
    return;
  }

  if (view === 'trash' && canViewTrash()) {
    await loadTrash();
    return;
  }

  if (view === 'audit' && canViewAudit()) {
    await loadAudit();
    return;
  }

  if (view === 'settings') {
    await loadMeta();
    return;
  }

  if (view === 'docs') {
    await loadDocs();
  }
}

function syncGlobalSearch(view) {
  const input = byId('global-search');
  const map = {
    overview: byId('levels-search').value,
    inventory: byId('levels-search').value,
    movements: byId('movements-search').value,
    admin: byId('users-search').value,
    trash: byId('trash-search').value,
    audit: byId('audit-search').value,
  };

  input.value = map[view] || '';
}

function applyGlobalSearch() {
  const value = byId('global-search').value.trim();

  if (state.view === 'overview' || state.view === 'inventory') {
    byId('levels-search').value = value;
    loadLevels().catch((error) => toast(error.message, true));
    return;
  }

  if (state.view === 'movements') {
    byId('movements-search').value = value;
    loadMovements().catch((error) => toast(error.message, true));
    return;
  }

  if (state.view === 'admin') {
    byId('users-search').value = value;
    loadUsers().catch((error) => toast(error.message, true));
    return;
  }

  if (state.view === 'trash') {
    byId('trash-search').value = value;
    loadTrash().catch((error) => toast(error.message, true));
    return;
  }

  if (state.view === 'audit') {
    byId('audit-search').value = value;
    loadAudit().catch((error) => toast(error.message, true));
  }
}

function formatNumber(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) {
    return '0';
  }
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatYmd(value) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!parts) {
    return value || '-';
  }

  const date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatSigned(value) {
  const n = Number(value || 0);
  const abs = formatNumber(Math.abs(n));
  if (n > 0) {
    return `+${abs}`;
  }
  if (n < 0) {
    return `-${abs}`;
  }
  return '0';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

boot();
