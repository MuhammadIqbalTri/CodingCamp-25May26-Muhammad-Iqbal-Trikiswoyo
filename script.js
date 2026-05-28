// ── THEME TOGGLE ──────────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Load saved preference
applyTheme(localStorage.getItem('theme') || 'light');

themeToggle.addEventListener('click', function () {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
});

// ── BALANCE ──────────────────────────────────────────────
const totalBalanceEl = document.getElementById('total-balance');
const editBalanceBtn = document.getElementById('edit-balance-btn');
const editBalanceInput = document.getElementById('edit-balance-input');
const confirmBalanceBtn = document.getElementById('confirm-balance-btn');
function formatRupiah(amount) {
    return 'Rp. ' + amount.toLocaleString('id-ID');
}

function updateBalance() {
    const base = parseFloat(localStorage.getItem('baseBalance') || '0');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const spent = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const total = base - spent;
    totalBalanceEl.textContent = formatRupiah(total);
    totalBalanceEl.style.color = total < 0 ? 'red' : 'green';
}

// Toggle edit input visibility
editBalanceBtn.addEventListener('click', function () {
    const isVisible = editBalanceInput.style.display === 'block';
    editBalanceInput.style.display = isVisible ? 'none' : 'block';
    confirmBalanceBtn.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) editBalanceInput.focus();
});

// Confirm new base balance
confirmBalanceBtn.addEventListener('click', function () {
    const val = parseFloat(editBalanceInput.value);
    if (isNaN(val)) return;
    localStorage.setItem('baseBalance', val);
    editBalanceInput.value = '';
    editBalanceInput.style.display = 'none';
    confirmBalanceBtn.style.display = 'none';
    updateBalance();
});

updateBalance();

// ── CUSTOM CATEGORIES ─────────────────────────────────────
const categorySelect = document.getElementById('category');
const customWrapper = document.getElementById('custom-category-wrapper');
const customInput = document.getElementById('custom-category-input');
const saveBtn = document.getElementById('save-custom-category');

// Load custom categories from localStorage and populate dropdown
function loadCustomCategories() {
    const saved = JSON.parse(localStorage.getItem('customCategories') || '[]');
    // Remove previously injected custom options (before the "+ Add" option)
    const addOption = categorySelect.querySelector('option[value="__add_custom__"]');
    categorySelect.querySelectorAll('option.custom-cat').forEach(o => o.remove());
    saved.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.toLowerCase();
        opt.textContent = cat;
        opt.classList.add('custom-cat');
        categorySelect.insertBefore(opt, addOption);
    });

    // Also populate budget category select with custom categories
    const budgetSelect = document.getElementById('budget-category-select');
    if (budgetSelect) {
        budgetSelect.querySelectorAll('option.custom-cat').forEach(o => o.remove());
        saved.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.toLowerCase();
            opt.textContent = cat;
            opt.classList.add('custom-cat');
            budgetSelect.appendChild(opt);
        });
    }
}

loadCustomCategories();

// Show/hide custom input when "+ Add Custom Category..." is selected
categorySelect.addEventListener('change', function () {
    if (this.value === '__add_custom__') {
        customWrapper.style.display = 'block';
        customInput.focus();
    } else {
        customWrapper.style.display = 'none';
    }
});

// Save new custom category
saveBtn.addEventListener('click', function () {
    const newCat = customInput.value.trim();
    if (!newCat) return;

    const saved = JSON.parse(localStorage.getItem('customCategories') || '[]');
    if (!saved.map(c => c.toLowerCase()).includes(newCat.toLowerCase())) {
        saved.push(newCat);
        localStorage.setItem('customCategories', JSON.stringify(saved));
    }

    loadCustomCategories();

    // Select the newly added category
    categorySelect.value = newCat.toLowerCase();
    customWrapper.style.display = 'none';
    customInput.value = '';
});

// ── ADD TRANSACTION ───────────────────────────────────────
const transactionForm = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('Amount');

transactionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;

    // Validation
    if (!name) { alert('Please enter an item name.'); return; }
    if (isNaN(amount) || amount <= 0) { alert('Please enter a valid amount.'); return; }
    if (!category || category === '__add_custom__') { alert('Please select a category.'); return; }

    // Check budget warning before saving
    checkBudgetWarning(category, amount);

    // Build transaction object
    const transaction = {
        id: Date.now(),
        name,
        amount,
        category
    };

    // Save to localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Update balance display
    updateBalance();
    renderTransactions();
    renderChart();
    renderBudgets();

    // Reset form
    itemNameInput.value = '';
    amountInput.value = '';
    categorySelect.value = 'food';
    customWrapper.style.display = 'none';
});

// ── SORT & FILTER STATE ───────────────────────────────────
let amountSort = 'none';       // 'none' | 'asc' | 'desc'
let activeCategories = new Set(); // empty = show all
let searchQuery = '';

// Toggle sort menu open/close
const sortToggleBtn = document.getElementById('sort-toggle-btn');
const sortMenu = document.getElementById('sort-menu');

sortToggleBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = sortMenu.classList.contains('open');
    if (isOpen) {
        sortMenu.classList.remove('open');
        sortMenu.style.display = 'none';
    } else {
        // Position above the button using fixed coords
        sortMenu.style.display = 'block';
        const rect = sortToggleBtn.getBoundingClientRect();
        const menuHeight = sortMenu.offsetHeight;
        sortMenu.style.top = (rect.top - menuHeight - 8) + 'px';
        sortMenu.style.left = (rect.right - sortMenu.offsetWidth) + 'px';
        sortMenu.classList.add('open');
    }
});

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    if (!sortMenu.contains(e.target) && e.target !== sortToggleBtn) {
        sortMenu.classList.remove('open');
        sortMenu.style.display = 'none';
    }
});

window.addEventListener('scroll', function () {
    if (sortMenu.classList.contains('open')) {
        const rect = sortToggleBtn.getBoundingClientRect();
        const menuHeight = sortMenu.offsetHeight;
        sortMenu.style.top = (rect.top - menuHeight - 8) + 'px';
        sortMenu.style.left = (rect.right - sortMenu.offsetWidth) + 'px';
    }
}, true);

// Amount sort radio change
document.querySelectorAll('input[name="amount-sort"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
        amountSort = this.value;
        renderTransactions();
    });
});

// Search input
document.getElementById('search-input').addEventListener('input', function () {
    searchQuery = this.value.toLowerCase();
    renderTransactions();
});

// Build category checkboxes from current transactions
function buildCategoryFilters() {
    // Remove stale categories from active filter
    const allTx = JSON.parse(localStorage.getItem('transactions') || '[]');
    const validCats = new Set(allTx.map(t => t.category));
    activeCategories.forEach(c => { if (!validCats.has(c)) activeCategories.delete(c); });

    const transactions = allTx;
    const categories = [...new Set(transactions.map(t => t.category))];
    const container = document.getElementById('category-filter-list');
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted)">No categories yet</span>';
        return;
    }

    categories.forEach(function (cat) {
        const label = document.createElement('label');
        label.classList.add('sort-section');
        label.style.flexDirection = 'row';
        label.style.marginBottom = '0';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = cat;
        cb.checked = activeCategories.size === 0 || activeCategories.has(cat);

        cb.addEventListener('change', function () {
            if (this.checked) {
                activeCategories.delete(cat);
                // If all are checked, reset to "show all"
                const allCats = [...document.querySelectorAll('#category-filter-list input[type=checkbox]')];
                if (allCats.every(c => c.checked)) activeCategories.clear();
            } else {
                // If unchecking, populate activeCategories with everything except this
                if (activeCategories.size === 0) {
                    categories.forEach(c => { if (c !== cat) activeCategories.add(c); });
                } else {
                    activeCategories.delete(cat);
                }
            }
            renderTransactions();
        });

        label.appendChild(cb);
        label.appendChild(document.createTextNode(cat));
        container.appendChild(label);
    });
}

// ── TRANSACTION LIST ──────────────────────────────────────
function renderTransactions() {
    const list = document.getElementById('transaction-list');
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    list.innerHTML = '';

    // Rebuild category filters to reflect current transaction categories
    buildCategoryFilters();

    // Apply category filter
    if (activeCategories.size > 0) {
        transactions = transactions.filter(t => activeCategories.has(t.category));
    }

    // Apply search filter
    if (searchQuery) {
        transactions = transactions.filter(t => t.name.toLowerCase().includes(searchQuery));
    }

    // Apply amount sort
    if (amountSort === 'asc') {
        transactions.sort((a, b) => a.amount - b.amount);
    } else if (amountSort === 'desc') {
        transactions.sort((a, b) => b.amount - a.amount);
    }

    if (transactions.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); text-align:center; margin-top:2vh;">No transactions yet.</p>';
        return;
    }

    transactions.forEach(function (t) {
        const item = document.createElement('div');
        item.classList.add('transaction-item');
        const budgets = getBudgets();
        const spent = getSpentByCategory();
        const isOverBudget = budgets[t.category] && spent[t.category] > budgets[t.category];
        item.innerHTML = `
            <div class="transaction-info">
                <div class="t-name">${t.name}</div>
                <div class="t-amount">${formatRupiah(t.amount)}</div>
                <span class="t-category" style="background-color:${getCategoryColor(t.category)}; color:#fff;">${t.category}${isOverBudget ? ' ⚠️' : ''}</span>
            </div>
            <button class="delete-btn" data-id="${t.id}">Delete</button>
        `;
        list.appendChild(item);
    });

    // Attach delete listeners
    list.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = parseInt(this.dataset.id);
            let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            transactions = transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            updateBalance();
            renderTransactions();
            renderChart();
            renderBudgets();
        });
    });
}

// ── PIE CHART ─────────────────────────────────────────────
let spendingChart = null;

const CATEGORY_COLORS = {
    food: '#2ecc71',
    transport: '#3498db',
    fun: '#e67e22'
};

function getCategoryColor(cat) {
    if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat];
    // Generate a consistent color for custom categories
    let hash = 0;
    for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${hash % 360}, 65%, 55%)`;
}

function renderChart() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const totals = {};
    transactions.forEach(function (t) {
        totals[t.category] = (totals[t.category] || 0) + 1;
    });

    const labels = Object.keys(totals);
    const data = Object.values(totals);
    const colors = labels.map(getCategoryColor);

    if (spendingChart) spendingChart.destroy();

    if (labels.length === 0) {
        document.getElementById('spending-chart').style.display = 'none';
        return;
    }

    document.getElementById('spending-chart').style.display = 'block';
    const ctx = document.getElementById('spending-chart').getContext('2d');
    spendingChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// ── BUDGET LIMITS ─────────────────────────────────────────
function getBudgets() {
    return JSON.parse(localStorage.getItem('categoryBudgets') || '{}');
}

function getSpentByCategory() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const spent = {};
    transactions.forEach(t => {
        spent[t.category] = (spent[t.category] || 0) + parseFloat(t.amount);
    });
    return spent;
}

function renderBudgets() {
    const budgets = getBudgets();
    const spent = getSpentByCategory();
    const list = document.getElementById('budget-list');
    list.innerHTML = '';

    if (Object.keys(budgets).length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">No budget limits set.</p>';
        return;
    }

    Object.entries(budgets).forEach(([cat, limit]) => {
        const spentAmt = spent[cat] || 0;
        const pct = Math.min((spentAmt / limit) * 100, 100);
        const isOver = spentAmt > limit;
        const barClass = pct >= 100 ? 'danger' : pct >= 75 ? 'warning' : '';

        const item = document.createElement('div');
        item.classList.add('budget-item');
        if (isOver) item.classList.add('over-budget');
        item.innerHTML = `
            <div class="budget-info">
                <span><strong>${cat}</strong> ${isOver ? '⚠️ Over budget' : ''}</span>
                <span style="font-size:0.85rem; color:var(--text-muted)">${formatRupiah(spentAmt)} / ${formatRupiah(limit)}</span>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${barClass}" style="width:${pct}%"></div>
                </div>
            </div>
            <button class="budget-delete-btn" data-cat="${cat}" title="Remove limit">✕</button>
        `;
        list.appendChild(item);
    });

    list.querySelectorAll('.budget-delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const budgets = getBudgets();
            delete budgets[this.dataset.cat];
            localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
            renderBudgets();
        });
    });
}

function checkBudgetWarning(category, amount) {
    const budgets = getBudgets();
    if (!budgets[category]) return;
    const spent = getSpentByCategory();
    const newTotal = (spent[category] || 0) + amount;
    if (newTotal > budgets[category]) {
        alert(`⚠️ Budget exceeded for "${category}"!\nLimit: ${formatRupiah(budgets[category])}\nTotal spent: ${formatRupiah(newTotal)}`);
    }
}

// Save budget limit
document.getElementById('budget-save-btn').addEventListener('click', function () {
    const cat = document.getElementById('budget-category-select').value;
    const val = parseFloat(document.getElementById('budget-amount-input').value);
    if (!cat || isNaN(val) || val <= 0) { alert('Please select a category and enter a valid amount.'); return; }
    const budgets = getBudgets();
    budgets[cat] = val;
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
    document.getElementById('budget-amount-input').value = '';
    renderBudgets();
});

// ── INIT ──────────────────────────────────────────────────
renderTransactions();
renderChart();
renderBudgets();

// Clear all transactions
document.getElementById('clear-all-btn').addEventListener('click', function () {
    if (!confirm('Clear all transactions? This cannot be undone.')) return;
    localStorage.removeItem('transactions');
    updateBalance();
    renderTransactions();
    renderChart();
    renderBudgets();
});
