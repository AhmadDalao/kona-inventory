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
  editAreaId: null,
  editItemId: null,
  editUserId: null,
  view: 'overview',
  tables: {
    levels: { page: 1, pageSize: 25, sortKey: 'item_name', sortDir: 'asc' },
    movements: { page: 1, pageSize: 50, sortKey: 'created_at', sortDir: 'desc' },
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
  el.style.background = isError ? '#8f2d2d' : '#12263a';

  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 2800);
}

function showAuth(isLoggedIn) {
  byId('login-panel').classList.toggle('hidden', isLoggedIn);
  byId('app-shell').classList.toggle('hidden', !isLoggedIn);
}

function setView(view) {
  state.view = view;
  const titleMap = {
    overview: 'Overview',
    inventory: 'Inventory',
    movements: 'Movements',
    catalog: 'Catalog',
    analytics: 'Analytics',
    admin: 'Admin Controls',
    docs: 'API Documentation',
  };

  byId('view-title').textContent = titleMap[view] || 'Dashboard';

  document.querySelectorAll('.nav-btn[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  document.querySelectorAll('.view[data-view-panel]').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.viewPanel === view);
  });
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
  byId('admin-nav-btn').classList.toggle('hidden', !canManageAdmin() && !canManageSettings());

  if (!canManageAdmin()) {
    byId('admin-users-card').classList.add('hidden');
  } else {
    byId('admin-users-card').classList.remove('hidden');
  }

  if (!canManageAdmin() && !canManageSettings() && state.view === 'admin') {
    setView('overview');
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

  byId('user-form').addEventListener('submit', onSaveUser);
  byId('user-reset').addEventListener('click', resetUserForm);

  byId('levels-refresh').addEventListener('click', loadLevels);
  byId('levels-search').addEventListener('input', debounce(loadLevels, 250));
  byId('levels-area-filter').addEventListener('change', loadLevels);
  byId('levels-page-size').addEventListener('change', () => {
    state.tables.levels.page = 1;
    state.tables.levels.pageSize = Number(byId('levels-page-size').value || 25);
    renderLevels();
  });

  byId('movements-refresh').addEventListener('click', loadMovements);
  byId('movements-search').addEventListener('input', debounce(loadMovements, 300));
  byId('movements-type-filter').addEventListener('change', loadMovements);
  byId('movements-date-from').addEventListener('change', loadMovements);
  byId('movements-date-to').addEventListener('change', loadMovements);
  byId('movements-page-size').addEventListener('change', () => {
    state.tables.movements.page = 1;
    state.tables.movements.pageSize = Number(byId('movements-page-size').value || 50);
    renderMovements();
  });

  bindSortHandlers();
}

async function boot() {
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
    showAuth(false);
    setAuthBrandDefaults();
  }
}

function setAuthBrandDefaults() {
  byId('auth-site-name').textContent = 'Inventory Management System';
  byId('auth-site-tagline').textContent = 'Internal stock operations dashboard.';
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
    // ignore and force reset
  }

  state.user = null;
  showAuth(false);
  setAuthBrandDefaults();
  toast('Logged out.');
}

async function loadAll() {
  await loadMeta();
  await Promise.all([
    loadSummary(),
    loadAnalytics(),
    loadLevels(),
    loadMovements(),
    loadDocs(),
    loadUsers(),
  ]);
}

async function loadMeta() {
  const payload = await api('/api/meta/options');

  state.items = payload.items || [];
  state.areas = payload.storage_areas || [];
  state.settings = payload.settings || {};
  state.capabilities = payload.capabilities || {};

  const siteName = state.settings.site_name || 'Inventory Management System';
  const siteTagline = state.settings.site_tagline || 'Internal stock operations dashboard';

  byId('site-name').textContent = siteName;
  byId('site-tagline').textContent = siteTagline;
  byId('auth-site-name').textContent = siteName;
  byId('auth-site-tagline').textContent = siteTagline;

  byId('user-badge').textContent = `${state.user?.name || ''} (${String(state.user?.role || '').toUpperCase()})`;

  byId('site-open-badge').textContent = state.settings.site_open ? 'Site Open' : 'Site Closed';
  byId('site-open-badge').style.background = state.settings.site_open ? '#edfdf4' : '#fff0f0';
  byId('site-open-badge').style.borderColor = state.settings.site_open ? '#9dd5b8' : '#e5a3a3';
  byId('site-open-badge').style.color = state.settings.site_open ? '#256041' : '#8f2d2d';

  const pageSize = Number(state.settings.table_page_size || 25);
  state.tables.levels.pageSize = pageSize;
  state.tables.movements.pageSize = Math.max(20, pageSize);
  byId('levels-page-size').value = String(pageSize);
  byId('movements-page-size').value = String(Math.max(20, pageSize));

  hydrateSettingsForm();
  applyPermissionsUI();
  renderMovementOptions();
  renderAreaFilter();
  renderAreas();
  renderItems();
}

function hydrateSettingsForm() {
  byId('set-site-name').value = state.settings.site_name || '';
  byId('set-site-tagline').value = state.settings.site_tagline || '';
  byId('set-default-currency').value = state.settings.default_currency || 'USD';
  byId('set-low-stock-limit').value = Number(state.settings.dashboard_low_stock_limit || 25);
  byId('set-table-page-size').value = Number(state.settings.table_page_size || 25);
  byId('set-site-open').checked = !!state.settings.site_open;
  byId('set-read-only').checked = !!state.settings.read_only_mode;
  byId('set-allow-negative').checked = !!state.settings.allow_negative_stock;
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

  if (search) {
    params.set('search', search);
  }
  if (area) {
    params.set('storage_area_id', area);
  }

  const suffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await api(`/api/inventory/levels${suffix}`);
  state.levelsRows = payload.data || [];
  state.tables.levels.page = 1;
  renderLevels();
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

  const payload = await api('/api/admin/users');
  state.users = payload.data || [];
  renderUsers();
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
    ['Units in Stock', formatNumber(summary.total_quantity || 0)],
    ['Low Stock', summary.low_stock_items || 0],
    ['Movements Today', summary.movements_today || 0],
    ['Inbound Today', formatNumber(summary.inbound_today || 0)],
    ['Outbound Today', formatNumber(summary.outbound_today || 0)],
  ];

  byId('summary-grid').innerHTML = cards
    .map(([label, value]) => `<article class="kpi"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(String(value))}</div></article>`)
    .join('');
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
    const container = document.createElement('div');
    container.className = 'bar';
    container.innerHTML = `
      <div class="bar-head">
        <span>${escapeHtml(row.code)} - ${escapeHtml(row.name)}</span>
        <strong>${formatNumber(qty)}</strong>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width: ${width}%"></div></div>
    `;
    root.appendChild(container);
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

    const column = document.createElement('div');
    column.className = 'trend-col';
    column.title = `${row.day}: in ${formatNumber(inbound)} / out ${formatNumber(outbound)}`;
    column.innerHTML = `
      <div class="trend-stack">
        <div class="trend-in" style="height:${inHeight}px"></div>
        <div class="trend-out" style="height:${outHeight}px"></div>
      </div>
      <div class="trend-day">${escapeHtml(row.day.slice(5))}</div>
    `;
    root.appendChild(column);
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
    root.innerHTML = '<p class="hint">No category analytics yet.</p>';
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
    if (Number(item.is_active) !== 1) continue;
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.sku} - ${item.name}`;
    itemSelect.appendChild(option);
  }

  const areaHtml = ['<option value="">Select area</option>']
    .concat(state.areas.filter((area) => Number(area.is_active) === 1).map((area) => `<option value="${area.id}">${escapeHtml(area.code)} - ${escapeHtml(area.name)}</option>`))
    .join('');

  fromArea.innerHTML = areaHtml;
  toArea.innerHTML = areaHtml;

  updateMovementFields();
}

function renderAreaFilter() {
  const filter = byId('levels-area-filter');
  filter.innerHTML = '<option value="">All Areas</option>';

  for (const area of state.areas) {
    if (Number(area.is_active) !== 1) continue;
    const option = document.createElement('option');
    option.value = area.id;
    option.textContent = `${area.code} - ${area.name}`;
    filter.appendChild(option);
  }
}

function renderAreas() {
  const tbody = byId('areas-table');
  tbody.innerHTML = '';

  for (const area of state.areas) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(area.code)}</td>
      <td>${escapeHtml(area.name)}</td>
      <td><span class="status ${Number(area.is_active) ? 'on' : 'off'}">${Number(area.is_active) ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="actions">
          <button class="btn ghost" data-area-edit="${area.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn danger" data-area-del="${area.id}" ${canWrite() ? '' : 'disabled'}>Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-area-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const area = state.areas.find((row) => Number(row.id) === Number(button.dataset.areaEdit));
      if (!area) return;

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
      if (!canWrite()) return;
      const areaId = Number(button.dataset.areaDel);
      if (!confirm('Delete this storage area?')) return;

      try {
        await api(`/api/storage-areas/${areaId}`, { method: 'DELETE' });
        if (state.editAreaId === areaId) resetAreaForm();
        await reloadMasterData();
        toast('Storage area deleted.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

function renderItems() {
  const tbody = byId('items-table');
  tbody.innerHTML = '';

  for (const item of state.items) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(item.sku)}</td>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.category || '-')}</td>
      <td>${formatNumber(item.reorder_level)}</td>
      <td><span class="status ${Number(item.is_active) ? 'on' : 'off'}">${Number(item.is_active) ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="actions">
          <button class="btn ghost" data-item-edit="${item.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn danger" data-item-del="${item.id}" ${canWrite() ? '' : 'disabled'}>Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-item-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.items.find((row) => Number(row.id) === Number(button.dataset.itemEdit));
      if (!item) return;

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
      if (!canWrite()) return;
      const itemId = Number(button.dataset.itemDel);
      if (!confirm('Delete this item? Existing movement history may block deletion.')) return;

      try {
        await api(`/api/items/${itemId}`, { method: 'DELETE' });
        if (state.editItemId === itemId) resetItemForm();
        await reloadMasterData();
        toast('Item deleted.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

function renderLevels() {
  const tableState = state.tables.levels;
  const source = applySorting(state.levelsRows, tableState.sortKey, tableState.sortDir);
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
    const low = Number(row.reorder_level) > 0 && Number(row.total_item_quantity) <= Number(row.reorder_level);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(row.item_name)}</td>
      <td>${escapeHtml(row.sku)}</td>
      <td>${escapeHtml(row.category || '-')}</td>
      <td>${escapeHtml(row.storage_area_name)}</td>
      <td>${formatNumber(row.quantity)} ${escapeHtml(row.unit || '')}</td>
      <td class="${low ? 'low' : ''}">${formatNumber(row.total_item_quantity)} ${escapeHtml(row.unit || '')}</td>
      <td>${formatNumber(row.reorder_level)}</td>
      <td><button class="btn ghost" data-set-level="${row.item_id}:${row.storage_area_id}:${row.quantity}" ${canWrite() ? '' : 'disabled'}>Set</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-set-level]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!canWrite()) return;
      const [itemId, areaId, current] = button.dataset.setLevel.split(':');
      const answer = prompt(`Set absolute quantity (current ${current})`, current);
      if (answer === null) return;

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
      <td>${escapeHtml(row.movement_type)}</td>
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
    tbody.innerHTML = '<tr><td colspan="5">Owner access required.</td></tr>';
    return;
  }

  for (const user of state.users) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(String(user.role).toUpperCase())}</td>
      <td><span class="status ${Number(user.is_active) ? 'on' : 'off'}">${Number(user.is_active) ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="actions">
          <button class="btn ghost" data-user-edit="${user.id}" ${canWrite() ? '' : 'disabled'}>Edit</button>
          <button class="btn ghost" data-user-toggle="${user.id}" ${canWrite() ? '' : 'disabled'}>${Number(user.is_active) ? 'Disable' : 'Enable'}</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-user-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const user = state.users.find((row) => Number(row.id) === Number(button.dataset.userEdit));
      if (!user) return;

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
      if (!canWrite()) return;
      const userId = Number(button.dataset.userToggle);
      const user = state.users.find((row) => Number(row.id) === userId);
      if (!user) return;

      try {
        await api(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          body: {
            is_active: Number(user.is_active) !== 1,
          },
        });
        await loadUsers();
        toast('User status updated.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

function renderDocs() {
  const tbody = byId('api-docs-table');
  tbody.innerHTML = '';

  for (const endpoint of state.docsRows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(endpoint.method)}</strong></td>
      <td><code>${escapeHtml(endpoint.path)}</code></td>
      <td>${escapeHtml(endpoint.description || '')}</td>
    `;
    tbody.appendChild(tr);
  }

  if (!state.docsRows.length) {
    tbody.innerHTML = '<tr><td colspan="3">API docs unavailable.</td></tr>';
  }
}

function renderPager(containerId, tableKey, totalRows, totalPages) {
  const container = byId(containerId);
  const table = state.tables[tableKey];

  container.innerHTML = `
    <div>${totalRows} rows</div>
    <div class="controls">
      <button type="button" data-pager-prev="${tableKey}" ${table.page <= 1 ? 'disabled' : ''}>Prev</button>
      <span>Page ${table.page} / ${Math.max(totalPages, 1)}</span>
      <button type="button" data-pager-next="${tableKey}" ${table.page >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;

  const prev = container.querySelector(`[data-pager-prev="${tableKey}"]`);
  const next = container.querySelector(`[data-pager-next="${tableKey}"]`);

  if (prev) {
    prev.addEventListener('click', () => {
      table.page = Math.max(1, table.page - 1);
      tableKey === 'levels' ? renderLevels() : renderMovements();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      table.page = Math.min(Math.max(totalPages, 1), table.page + 1);
      tableKey === 'levels' ? renderLevels() : renderMovements();
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

  if (type === 'receive') {
    byId('move-from-wrap').classList.add('hidden');
    byId('move-quantity').min = '0.001';
  }

  if (type === 'issue') {
    byId('move-to-wrap').classList.add('hidden');
    byId('move-quantity').min = '0.001';
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

  const payload = {
    movement_type: byId('move-type').value,
    item_id: Number(byId('move-item').value),
    quantity: Number(byId('move-quantity').value),
    target_quantity: Number(byId('move-target').value),
    from_storage_area_id: Number(byId('move-from').value),
    to_storage_area_id: Number(byId('move-to').value),
    reference: byId('move-reference').value.trim(),
    note: byId('move-note').value.trim(),
  };

  if (!payload.item_id) {
    toast('Pick an item first.', true);
    return;
  }

  try {
    await api('/api/inventory/movements', { method: 'POST', body: payload });
    byId('movement-form').reset();
    updateMovementFields();
    await refreshOperationalData();
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

  const payload = {
    site_name: byId('set-site-name').value.trim(),
    site_tagline: byId('set-site-tagline').value.trim(),
    default_currency: byId('set-default-currency').value.trim(),
    dashboard_low_stock_limit: Number(byId('set-low-stock-limit').value || 25),
    table_page_size: Number(byId('set-table-page-size').value || 25),
    site_open: byId('set-site-open').checked,
    read_only_mode: byId('set-read-only').checked,
    allow_negative_stock: byId('set-allow-negative').checked,
  };

  try {
    const response = await api('/api/settings', {
      method: 'PATCH',
      body: payload,
    });

    state.settings = response.data || state.settings;
    applyPermissionsUI();
    hydrateSettingsForm();
    await Promise.all([loadSummary(), loadAnalytics()]);
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

function formatNumber(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatSigned(value) {
  const n = Number(value || 0);
  const abs = formatNumber(Math.abs(n));
  if (n > 0) return `+${abs}`;
  if (n < 0) return `-${abs}`;
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
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(), delay);
  };
}

boot();
