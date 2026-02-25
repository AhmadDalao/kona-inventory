const state = {
  user: null,
  areas: [],
  items: [],
  editAreaId: null,
  editItemId: null,
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
  const payload = await response.json().catch(() => ({}));

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
  el.style.background = isError ? '#8f2d2d' : '#101d2c';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), 2600);
}

function showAuth(isLoggedIn) {
  byId('login-panel').classList.toggle('hidden', isLoggedIn);
  byId('app-panel').classList.toggle('hidden', !isLoggedIn);
  byId('logout-btn').classList.toggle('hidden', !isLoggedIn);
}

async function boot() {
  wireEvents();
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
  }
}

function wireEvents() {
  byId('login-form').addEventListener('submit', onLogin);
  byId('logout-btn').addEventListener('click', onLogout);
  byId('area-form').addEventListener('submit', onSaveArea);
  byId('area-reset').addEventListener('click', resetAreaForm);
  byId('item-form').addEventListener('submit', onSaveItem);
  byId('item-reset').addEventListener('click', resetItemForm);
  byId('movement-form').addEventListener('submit', onApplyMovement);
  byId('move-type').addEventListener('change', updateMovementFields);
  byId('levels-refresh').addEventListener('click', loadInventoryLevels);
  byId('levels-search').addEventListener('input', debounce(loadInventoryLevels, 250));
  byId('levels-area-filter').addEventListener('change', loadInventoryLevels);
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
    // ignore logout errors and force reset
  }

  state.user = null;
  showAuth(false);
  toast('Logged out.');
}

async function loadAll() {
  await Promise.all([
    loadMeta(),
    loadDashboardSummary(),
    loadInventoryLevels(),
    loadMovements(),
  ]);
}

async function loadMeta() {
  const payload = await api('/api/meta/options');
  state.items = payload.items || [];
  state.areas = payload.storage_areas || [];
  renderAreas();
  renderItems();
  renderMovementOptions();
  renderAreaFilter();
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
        <button class="btn ghost" data-area-edit="${area.id}">Edit</button>
        <button class="btn danger" data-area-del="${area.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-area-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const area = state.areas.find((x) => Number(x.id) === Number(btn.dataset.areaEdit));
      if (!area) return;
      state.editAreaId = Number(area.id);
      byId('area-id').value = area.id;
      byId('area-code').value = area.code;
      byId('area-name').value = area.name;
      byId('area-description').value = area.description || '';
      byId('area-active').checked = Number(area.is_active) === 1;
    });
  });

  tbody.querySelectorAll('[data-area-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const areaId = Number(btn.dataset.areaDel);
      if (!confirm('Delete this storage area?')) return;

      try {
        await api(`/api/storage-areas/${areaId}`, { method: 'DELETE' });
        if (state.editAreaId === areaId) resetAreaForm();
        await loadAll();
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
      <td>${formatNumber(item.reorder_level)}</td>
      <td><span class="status ${Number(item.is_active) ? 'on' : 'off'}">${Number(item.is_active) ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="btn ghost" data-item-edit="${item.id}">Edit</button>
        <button class="btn danger" data-item-del="${item.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-item-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = state.items.find((x) => Number(x.id) === Number(btn.dataset.itemEdit));
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
    });
  });

  tbody.querySelectorAll('[data-item-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const itemId = Number(btn.dataset.itemDel);
      if (!confirm('Delete this item? Movement history can block this.')) return;

      try {
        await api(`/api/items/${itemId}`, { method: 'DELETE' });
        if (state.editItemId === itemId) resetItemForm();
        await loadAll();
        toast('Item deleted.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

function renderMovementOptions() {
  const itemSelect = byId('move-item');
  const fromArea = byId('move-from');
  const toArea = byId('move-to');

  itemSelect.innerHTML = '<option value="">Select item</option>';
  for (const item of state.items) {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.sku} - ${item.name}`;
    itemSelect.appendChild(option);
  }

  const areaHtml = ['<option value="">Select area</option>']
    .concat(state.areas.map((area) => `<option value="${area.id}">${escapeHtml(area.code)} - ${escapeHtml(area.name)}</option>`))
    .join('');

  fromArea.innerHTML = areaHtml;
  toArea.innerHTML = areaHtml;

  updateMovementFields();
}

function renderAreaFilter() {
  const filter = byId('levels-area-filter');
  filter.innerHTML = '<option value="">All Areas</option>';
  for (const area of state.areas) {
    const option = document.createElement('option');
    option.value = area.id;
    option.textContent = `${area.code} - ${area.name}`;
    filter.appendChild(option);
  }
}

function updateMovementFields() {
  const type = byId('move-type').value;

  const fromWrap = byId('move-from-wrap');
  const toWrap = byId('move-to-wrap');
  const qtyWrap = byId('move-qty-wrap');
  const targetWrap = byId('move-target-wrap');

  fromWrap.classList.remove('hidden');
  toWrap.classList.remove('hidden');
  qtyWrap.classList.remove('hidden');
  targetWrap.classList.add('hidden');

  if (type === 'receive') {
    fromWrap.classList.add('hidden');
    byId('move-quantity').min = '0.001';
  }

  if (type === 'issue') {
    toWrap.classList.add('hidden');
    byId('move-quantity').min = '0.001';
  }

  if (type === 'adjust') {
    fromWrap.classList.add('hidden');
    byId('move-quantity').removeAttribute('min');
  }

  if (type === 'set') {
    fromWrap.classList.add('hidden');
    qtyWrap.classList.add('hidden');
    targetWrap.classList.remove('hidden');
  }
}

async function onSaveArea(event) {
  event.preventDefault();

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
    await loadAll();
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
    await loadAll();
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

async function onApplyMovement(event) {
  event.preventDefault();

  const type = byId('move-type').value;
  const payload = {
    movement_type: type,
    item_id: Number(byId('move-item').value),
    quantity: Number(byId('move-quantity').value),
    from_storage_area_id: Number(byId('move-from').value),
    to_storage_area_id: Number(byId('move-to').value),
    target_quantity: Number(byId('move-target').value),
    reference: byId('move-reference').value.trim(),
    note: byId('move-note').value.trim(),
  };

  if (!payload.item_id) {
    toast('Pick an item.', true);
    return;
  }

  try {
    await api('/api/inventory/movements', { method: 'POST', body: payload });
    byId('movement-form').reset();
    updateMovementFields();
    await Promise.all([loadDashboardSummary(), loadInventoryLevels(), loadMovements()]);
    toast('Movement applied.');
  } catch (error) {
    toast(error.message, true);
  }
}

async function loadDashboardSummary() {
  const payload = await api('/api/dashboard/summary');
  renderSummary(payload.summary || {});
  renderLowStock(payload.low_stock || []);
}

function renderSummary(summary) {
  const grid = byId('summary-grid');
  const cards = [
    ['Total Items', summary.total_items || 0],
    ['Storage Areas', summary.total_storage_areas || 0],
    ['Units In Stock', formatNumber(summary.total_quantity || 0)],
    ['Low Stock Items', summary.low_stock_items || 0],
    ['Movements Today', summary.movements_today || 0],
  ];

  grid.innerHTML = cards
    .map(([label, value]) => `<article class="summary-card"><div class="label">${escapeHtml(label)}</div><div class="value">${escapeHtml(String(value))}</div></article>`)
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

async function loadInventoryLevels() {
  const params = new URLSearchParams();
  const search = byId('levels-search').value.trim();
  const area = byId('levels-area-filter').value;

  if (search) params.set('search', search);
  if (area) params.set('storage_area_id', area);

  const payload = await api(`/api/inventory/levels${params.toString() ? `?${params.toString()}` : ''}`);
  renderLevels(payload.data || []);
}

function renderLevels(rows) {
  const tbody = byId('levels-table');
  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7">No inventory rows found.</td></tr>';
    return;
  }

  for (const row of rows) {
    const lowClass = Number(row.total_item_quantity) <= Number(row.reorder_level) && Number(row.reorder_level) > 0 ? 'low' : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(row.item_name)}</td>
      <td>${escapeHtml(row.sku)}</td>
      <td>${escapeHtml(row.storage_area_name)}</td>
      <td>${formatNumber(row.quantity)} ${escapeHtml(row.unit || '')}</td>
      <td class="${lowClass}">${formatNumber(row.total_item_quantity)} ${escapeHtml(row.unit || '')}</td>
      <td>${formatNumber(row.reorder_level)}</td>
      <td><button class="btn ghost" data-set="${row.item_id}:${row.storage_area_id}:${row.quantity}">Set</button></td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll('[data-set]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const [itemId, areaId, current] = btn.dataset.set.split(':');
      const answer = prompt(`Set absolute quantity (current ${current})`, current);
      if (answer === null) return;
      const target = Number(answer);
      if (!Number.isFinite(target) || target < 0) {
        toast('Quantity must be 0 or more.', true);
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
            note: 'Manual absolute set from dashboard',
          },
        });

        await Promise.all([loadDashboardSummary(), loadInventoryLevels(), loadMovements()]);
        toast('Quantity updated.');
      } catch (error) {
        toast(error.message, true);
      }
    });
  });
}

async function loadMovements() {
  const payload = await api('/api/inventory/movements?limit=200');
  renderMovements(payload.data || []);
}

function renderMovements(rows) {
  const tbody = byId('movements-table');
  tbody.innerHTML = '';

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="8">No movement history yet.</td></tr>';
    return;
  }

  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(formatDate(row.created_at))}</td>
      <td>${escapeHtml(row.movement_type)}</td>
      <td>${escapeHtml(row.item_sku)} - ${escapeHtml(row.item_name)}</td>
      <td>${formatSigned(row.quantity)}</td>
      <td>${escapeHtml(row.from_storage_area_name || '-')}</td>
      <td>${escapeHtml(row.to_storage_area_name || '-')}</td>
      <td>${escapeHtml(row.actor_name || '-')}</td>
      <td>${escapeHtml(row.note || '')}</td>
    `;
    tbody.appendChild(tr);
  }
}

function formatSigned(value) {
  const number = Number(value || 0);
  if (number > 0) return `+${formatNumber(number)}`;
  return `${formatNumber(number)}`;
}

function formatNumber(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return '0';
  return number.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function debounce(fn, wait) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(), wait);
  };
}

boot();
