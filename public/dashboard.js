const state = {
  user: null,
  settings: {},
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
  editAreaId: null,
  editItemId: null,
  editUserId: null,
  view: 'overview',
  tables: {
    levels: { page: 1, pageSize: 25, sortKey: 'item_name', sortDir: 'asc' },
    movements: { page: 1, pageSize: 50, sortKey: 'created_at', sortDir: 'desc' },
    users: { page: 1, pageSize: 25, sortKey: 'name', sortDir: 'asc' },
    audit: { page: 1, pageSize: 25, sortKey: 'created_at', sortDir: 'desc' },
  },
};

const modalState = {
  resolver: null,
  mode: 'confirm',
  validator: null,
};

const viewMeta = {
  overview: {
    title: 'Overview',
    subtitle: 'Snapshot of stock, risk, and movement activity.',
    searchPlaceholder: 'Search inventory records',
  },
  inventory: {
    title: 'Inventory',
    subtitle: 'Live quantity matrix across storage areas.',
    searchPlaceholder: 'Search product, SKU, category, area',
  },
  movements: {
    title: 'Movements',
    subtitle: 'Apply stock changes and monitor movement history.',
    searchPlaceholder: 'Search movement notes, references, items',
  },
  catalog: {
    title: 'Catalog',
    subtitle: 'Manage storage areas and products.',
    searchPlaceholder: 'Use filters inside this page',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Movement and inventory trend analysis.',
    searchPlaceholder: 'Use filters inside this page',
  },
  admin: {
    title: 'Admins',
    subtitle: 'Owner control panel for admin users.',
    searchPlaceholder: 'Search admin users',
  },
  trash: {
    title: 'Trash',
    subtitle: 'Review deleted records and restore them.',
    searchPlaceholder: 'Search deleted records',
  },
  audit: {
    title: 'Audit Log',
    subtitle: 'Owner-level write action log and traceability.',
    searchPlaceholder: 'Search audit actor, action, summary',
  },
  settings: {
    title: 'Settings',
    subtitle: 'System behavior and dashboard defaults.',
    searchPlaceholder: 'Use filters inside this page',
  },
  docs: {
    title: 'Docs',
    subtitle: 'Internal API endpoint reference.',
    searchPlaceholder: 'Search API endpoints in docs table',
  },
};

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

function openConfirmModal({ title, message, confirmLabel = 'Confirm', danger = true }) {
  const root = byId('app-modal');
  const titleEl = byId('app-modal-title');
  const messageEl = byId('app-modal-message');
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

function showAuth(isLoggedIn) {
  byId('login-panel').classList.toggle('hidden', isLoggedIn);
  byId('app-shell').classList.toggle('hidden', !isLoggedIn);
}

function setAuthBrandDefaults() {
  byId('auth-site-name').textContent = 'Inventory Management System';
  byId('auth-site-tagline').textContent = 'Track inventory, movements, controls, and admin actions in one place.';
}

function setView(view) {
  const allowedView = ensureAllowedView(view);
  state.view = allowedView;

  const meta = viewMeta[allowedView] || viewMeta.overview;
  byId('view-title').textContent = meta.title;
  byId('view-subtitle').textContent = meta.subtitle;
  byId('global-search').placeholder = meta.searchPlaceholder;

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
  const allowed = new Set(['overview', 'inventory', 'movements', 'catalog', 'analytics', 'docs']);
  if (canManageAdmin()) allowed.add('admin');
  if (canViewTrash()) allowed.add('trash');
  if (canViewAudit()) allowed.add('audit');
  if (canManageSettings()) allowed.add('settings');

  return allowed.has(view) ? view : 'overview';
}

function updateClock() {
  byId('time-badge').textContent = new Date().toLocaleString();
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

function applyPermissionsUI() {
  const writeEnabled = canWrite();
  const settingsEnabled = canManageSettings() && writeEnabled;
  const adminEnabled = canManageAdmin() && writeEnabled;

  toggleFormDisabled(byId('movement-form'), !writeEnabled);
  toggleFormDisabled(byId('area-form'), !writeEnabled);
  toggleFormDisabled(byId('item-form'), !writeEnabled);
  toggleFormDisabled(byId('settings-form'), !settingsEnabled);
  toggleFormDisabled(byId('user-form'), !adminEnabled);

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
    openBadge.textContent = 'Site Open';
    openBadge.classList.add('good');
  } else {
    openBadge.textContent = 'Site Closed';
    openBadge.classList.add('bad');
  }

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

  byId('area-form').addEventListener('submit', onSaveArea);
  byId('area-reset').addEventListener('click', resetAreaForm);

  byId('item-form').addEventListener('submit', onSaveItem);
  byId('item-reset').addEventListener('click', resetItemForm);

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

  byId('user-form').addEventListener('submit', onSaveUser);
  byId('user-reset').addEventListener('click', resetUserForm);

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
  byId('movements-date-from').addEventListener('change', loadMovements);
  byId('movements-date-to').addEventListener('change', loadMovements);
  byId('movements-page-size').addEventListener('change', () => {
    state.tables.movements.page = 1;
    state.tables.movements.pageSize = Number(byId('movements-page-size').value || 50);
    renderMovements();
  });

  byId('users-refresh').addEventListener('click', loadUsers);
  byId('users-search').addEventListener('input', debounce(() => {
    state.tables.users.page = 1;
    loadUsers();
  }, 250));
  byId('users-role-filter').addEventListener('change', loadUsers);
  byId('users-limit').addEventListener('change', loadUsers);

  byId('trash-refresh').addEventListener('click', loadTrash);
  byId('trash-search').addEventListener('input', debounce(loadTrash, 250));

  byId('audit-refresh').addEventListener('click', loadAudit);
  byId('audit-search').addEventListener('input', debounce(() => {
    state.tables.audit.page = 1;
    loadAudit();
  }, 250));
  byId('audit-entity-filter').addEventListener('change', loadAudit);
  byId('audit-date-from').addEventListener('change', loadAudit);
  byId('audit-date-to').addEventListener('change', loadAudit);
  byId('audit-limit').addEventListener('change', loadAudit);

  bindSortHandlers();
}

async function boot() {
  initModal();
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
    renderUsers();
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
  byId('auth-site-name').textContent = siteName;
  byId('auth-site-tagline').textContent = siteTagline;
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
  const dateFrom = byId('movements-date-from').value;
  const dateTo = byId('movements-date-to').value;

  if (search) params.set('search', search);
  if (type) params.set('movement_type', type);
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
  params.set('limit', '500');

  const payload = await api(`/api/inventory/movements?${params.toString()}`);
  state.movementsRows = payload.data || [];
  state.tables.movements.page = 1;
  renderMovements();
}

async function loadUsers() {
  if (!canManageAdmin()) {
    state.users = [];
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
  state.tables.users.page = 1;
  renderUsers();
}

async function loadTrash() {
  if (!canViewTrash()) {
    state.trash.items = [];
    state.trash.storage_areas = [];
    renderTrash();
    return;
  }

  const params = new URLSearchParams();
  const search = byId('trash-search').value.trim();
  if (search) params.set('search', search);
  params.set('limit', '300');

  const payload = await api(`/api/trash?${params.toString()}`);
  const data = payload.data || {};
  state.trash.items = data.items || [];
  state.trash.storage_areas = data.storage_areas || [];
  renderTrash();
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
  const dateFrom = byId('audit-date-from').value;
  const dateTo = byId('audit-date-to').value;
  const limit = byId('audit-limit').value;

  if (search) params.set('search', search);
  if (entity) params.set('entity_type', entity);
  if (dateFrom) params.set('date_from', dateFrom);
  if (dateTo) params.set('date_to', dateTo);
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
          <button class="btn ghost" data-area-edit="${area.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn danger" data-area-del="${area.id}" ${canWrite() ? '' : 'disabled'}>Trash</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-area-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const area = state.areas.find((row) => Number(row.id) === Number(button.dataset.areaEdit));
      if (!area) {
        return;
      }

      state.editAreaId = Number(area.id);
      byId('area-id').value = area.id;
      byId('area-code').value = area.code;
      byId('area-name').value = area.name;
      byId('area-description').value = area.description || '';
      byId('area-active').checked = Number(area.is_active) === 1;
      setView('catalog');
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
        confirmLabel: 'Move To Trash',
        danger: true,
      });
      if (!confirmed) {
        return;
      }

      try {
        await api(`/api/storage-areas/${areaId}`, { method: 'DELETE' });
        if (state.editAreaId === areaId) {
          resetAreaForm();
        }
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
          <button class="btn ghost" data-item-edit="${item.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn danger" data-item-del="${item.id}" ${canWrite() ? '' : 'disabled'}>Trash</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-item-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.items.find((row) => Number(row.id) === Number(button.dataset.itemEdit));
      if (!item) {
        return;
      }

      state.editItemId = Number(item.id);
      byId('item-id').value = item.id;
      byId('item-sku').value = item.sku;
      byId('item-name').value = item.name;
      byId('item-category').value = item.category || '';
      byId('item-unit').value = item.unit || 'unit';
      byId('item-reorder').value = item.reorder_level || 0;
      byId('item-notes').value = item.notes || '';
      byId('item-active').checked = Number(item.is_active) === 1;
      setView('catalog');
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
        confirmLabel: 'Move To Trash',
        danger: true,
      });
      if (!confirmed) {
        return;
      }

      try {
        await api(`/api/items/${itemId}`, { method: 'DELETE' });
        if (state.editItemId === itemId) {
          resetItemForm();
        }
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
      <td><button class="btn ghost" data-set-level="${row.item_id}:${row.storage_area_id}:${row.quantity}" ${canWrite() ? '' : 'disabled'}>Set</button></td>
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
    tbody.innerHTML = '<tr><td colspan="6">Owner access required.</td></tr>';
    byId('users-pager').innerHTML = '';
    return;
  }

  const tableState = state.tables.users;
  const source = applySorting(state.users, tableState.sortKey, tableState.sortDir);
  const page = paginate(source, tableState.page, tableState.pageSize);
  tableState.page = page.page;

  if (!page.rows.length) {
    tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
    renderPager('users-pager', 'users', page.totalRows, page.totalPages);
    return;
  }

  for (const user of page.rows) {
    const active = Number(user.is_active) === 1;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(String(user.role || '').toUpperCase())}</td>
      <td><span class="status-pill ${active ? 'in' : 'out'}">${active ? 'Active' : 'Inactive'}</span></td>
      <td>${escapeHtml(formatDate(user.created_at))}</td>
      <td>
        <div class="actions">
          <button class="btn ghost" data-user-edit="${user.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn ghost" data-user-toggle="${user.id}" ${canWrite() ? '' : 'disabled'}>${active ? 'Disable' : 'Enable'}</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-user-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const user = state.users.find((row) => Number(row.id) === Number(button.dataset.userEdit));
      if (!user) {
        return;
      }

      state.editUserId = Number(user.id);
      byId('user-id').value = user.id;
      byId('user-name').value = user.name;
      byId('user-email').value = user.email;
      byId('user-password').value = '';
      byId('user-role').value = user.role;
      byId('user-active').checked = Number(user.is_active) === 1;
      setView('admin');
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

function renderTrash() {
  const itemsBody = byId('trash-items-table');
  const areasBody = byId('trash-areas-table');
  itemsBody.innerHTML = '';
  areasBody.innerHTML = '';

  if (!canViewTrash()) {
    itemsBody.innerHTML = '<tr><td colspan="6">Manager or owner access required.</td></tr>';
    areasBody.innerHTML = '<tr><td colspan="5">Manager or owner access required.</td></tr>';
    return;
  }

  if (!state.trash.items.length) {
    itemsBody.innerHTML = '<tr><td colspan="6">No deleted items.</td></tr>';
  } else {
    for (const row of state.trash.items) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.sku)}</td>
        <td>${escapeHtml(row.category || '-')}</td>
        <td>${escapeHtml(row.deleted_by_name || row.deleted_by_email || '-')}</td>
        <td>${escapeHtml(formatDate(row.deleted_at))}</td>
        <td><button class="btn ghost" data-restore-item="${row.id}" ${canWrite() ? '' : 'disabled'}>Restore</button></td>
      `;
      itemsBody.appendChild(tr);
    }
  }

  if (!state.trash.storage_areas.length) {
    areasBody.innerHTML = '<tr><td colspan="5">No deleted storage areas.</td></tr>';
  } else {
    for (const row of state.trash.storage_areas) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(row.code)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.deleted_by_name || row.deleted_by_email || '-')}</td>
        <td>${escapeHtml(formatDate(row.deleted_at))}</td>
        <td><button class="btn ghost" data-restore-area="${row.id}" ${canWrite() ? '' : 'disabled'}>Restore</button></td>
      `;
      areasBody.appendChild(tr);
    }
  }

  itemsBody.querySelectorAll('[data-restore-item]').forEach((button) => {
    button.addEventListener('click', () => restoreFromTrash('items', Number(button.dataset.restoreItem)));
  });

  areasBody.querySelectorAll('[data-restore-area]').forEach((button) => {
    button.addEventListener('click', () => restoreFromTrash('storage_areas', Number(button.dataset.restoreArea)));
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

async function onSaveArea(event) {
  event.preventDefault();

  if (!canWrite()) {
    toast('You do not have write access right now.', true);
    return;
  }

  const body = {
    code: byId('area-code').value.trim(),
    name: byId('area-name').value.trim(),
    description: byId('area-description').value.trim(),
    is_active: byId('area-active').checked,
  };

  try {
    if (state.editAreaId) {
      await api(`/api/storage-areas/${state.editAreaId}`, { method: 'PATCH', body });
      toast('Storage area updated.');
    } else {
      await api('/api/storage-areas', { method: 'POST', body });
      toast('Storage area created.');
    }

    resetAreaForm();
    await reloadMasterData();
    if (canViewAudit()) {
      await loadAudit();
    }
  } catch (error) {
    toast(error.message, true);
  }
}

function resetAreaForm() {
  state.editAreaId = null;
  byId('area-form').reset();
  byId('area-id').value = '';
  byId('area-active').checked = true;
}

async function onSaveItem(event) {
  event.preventDefault();

  if (!canWrite()) {
    toast('You do not have write access right now.', true);
    return;
  }

  const body = {
    sku: byId('item-sku').value.trim(),
    name: byId('item-name').value.trim(),
    category: byId('item-category').value.trim(),
    unit: byId('item-unit').value.trim() || 'unit',
    reorder_level: Number(byId('item-reorder').value || 0),
    notes: byId('item-notes').value.trim(),
    is_active: byId('item-active').checked,
  };

  try {
    if (state.editItemId) {
      await api(`/api/items/${state.editItemId}`, { method: 'PATCH', body });
      toast('Item updated.');
    } else {
      await api('/api/items', { method: 'POST', body });
      toast('Item created.');
    }

    resetItemForm();
    await reloadMasterData();
    if (canViewAudit()) {
      await loadAudit();
    }
  } catch (error) {
    toast(error.message, true);
  }
}

function resetItemForm() {
  state.editItemId = null;
  byId('item-form').reset();
  byId('item-id').value = '';
  byId('item-unit').value = 'unit';
  byId('item-reorder').value = '0';
  byId('item-active').checked = true;
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

  const payload = {
    company_name: byId('set-company-name').value.trim(),
    site_name: byId('set-site-name').value.trim(),
    site_tagline: byId('set-site-tagline').value.trim(),
    timezone: byId('set-timezone').value.trim(),
    default_currency: byId('set-default-currency').value.trim(),
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
  };

  try {
    const response = await api('/api/settings', {
      method: 'PATCH',
      body: payload,
    });

    state.settings = response.data || state.settings;
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

async function onSaveUser(event) {
  event.preventDefault();

  if (!canManageAdmin()) {
    toast('Owner access required.', true);
    return;
  }

  if (!canWrite()) {
    toast('Write access is disabled.', true);
    return;
  }

  const payload = {
    name: byId('user-name').value.trim(),
    email: byId('user-email').value.trim(),
    password: byId('user-password').value,
    role: byId('user-role').value,
    is_active: byId('user-active').checked,
  };

  try {
    if (state.editUserId) {
      if (!payload.password) {
        delete payload.password;
      }
      await api(`/api/admin/users/${state.editUserId}`, { method: 'PATCH', body: payload });
      toast('User updated.');
    } else {
      if (!payload.password) {
        toast('Password is required for new users.', true);
        return;
      }
      await api('/api/admin/users', { method: 'POST', body: payload });
      toast('User created.');
    }

    resetUserForm();
    await loadUsers();
    if (canViewAudit()) {
      await loadAudit();
    }
  } catch (error) {
    toast(error.message, true);
  }
}

function resetUserForm() {
  state.editUserId = null;
  byId('user-form').reset();
  byId('user-id').value = '';
  byId('user-active').checked = true;
  byId('user-role').value = 'manager';
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

  if (view === 'catalog') {
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
