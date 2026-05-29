# Design Document

## Overview

The Expense & Budget Visualizer is a single-page client-side web app. All logic runs in the browser with no server. Data is persisted via localStorage. The UI is divided into sections: balance display, add transaction form, budget limits, and a data section with transaction list and pie chart side by side.

## Architecture

The app follows a simple render-on-change pattern:
- All state lives in localStorage
- Every user action (add, delete, edit) writes to localStorage then calls the relevant render functions
- Render functions read from localStorage and rebuild the DOM

```
User Action
    │
    ▼
Write to localStorage
    │
    ▼
updateBalance() + renderTransactions() + renderChart() + renderBudgets()
    │
    ▼
DOM updated
```

**File structure:**
```
├── index.html          # Entry point, all HTML structure
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (cache-first, offline support)
├── css/
│   └── style.css       # All styles, CSS variables for theming
└── js/
    └── script.js       # All JavaScript logic
```

## Components and Interfaces

### Balance Component
- Element: `#total-balance` (h3)
- `updateBalance()` — reads `baseBalance` and `transactions` from localStorage, computes total, updates text and color
- Edit Balance: toggle input `#edit-balance-input`, save to `baseBalance` key

### Add Transaction Form
- Element: `#transaction-form`
- On submit: validates inputs, calls `checkBudgetWarning()`, pushes to `transactions` array, calls all render functions
- Custom category: `#custom-category-wrapper` shown when `__add_custom__` selected, saved to `customCategories`

### Transaction List
- Element: `#transaction-list`
- `renderTransactions()` — reads transactions, applies category filter (`activeCategories` Set), search filter (`searchQuery` string), amount sort, then builds DOM
- Delete: filters out by `id`, writes back, re-renders all

### Budget Limits
- Element: `#budget-list`
- `renderBudgets()` — reads `categoryBudgets` object, computes spent per category via `getSpentByCategory()`, renders progress bars
- `checkBudgetWarning(category, amount)` — alerts if new total would exceed limit

### Pie Chart
- Element: `#spending-chart` (canvas)
- `renderChart()` — counts transactions per category, passes to Chart.js pie chart
- Chart instance stored in `spendingChart`, destroyed before each re-render

### Theme Toggle
- Element: `#theme-toggle`
- `applyTheme(theme)` — sets `data-theme` on body, updates emoji, saves to localStorage

## Data Models

### localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `transactions` | `Transaction[]` | All saved transactions |
| `baseBalance` | `number` | Manually set starting balance |
| `customCategories` | `string[]` | User-defined category names |
| `categoryBudgets` | `Record<string, number>` | Budget limit per category |
| `theme` | `'light' \| 'dark'` | UI theme preference |

### Transaction
```json
{
  "id": 1748500000000,
  "name": "Cilok",
  "amount": 15000,
  "category": "food"
}
```

## Correctness Properties

### Property 1: Balance Accuracy
Balance must always equal `baseBalance - sum(transactions.amount)`. Any add or delete must trigger `updateBalance()`.

**Validates: Requirements 1, 2, 3**

### Property 2: Cascade on Delete
Deleting a transaction must immediately update balance, chart, and budget progress in the same operation.

**Validates: Requirements 9, 10**

### Property 3: Filter Isolation
Category filter must not show transactions from deselected categories. Search and sort must apply on top of the filtered set.

**Validates: Requirements 13, 14, 15**

### Property 4: Budget Warning Timing
`checkBudgetWarning()` must be called before the transaction is saved to localStorage, not after.

**Validates: Requirements 17, 18**

### Property 5: Category Persistence
Custom categories must survive page reloads — loaded from `customCategories` in localStorage on every page init.

**Validates: Requirements 6**

## Error Handling

- Empty item name: `alert('Please enter an item name.')`
- Invalid or zero amount: `alert('Please enter a valid amount.')`
- Category set to `__add_custom__`: `alert('Please select a category.')`
- Invalid budget amount: `alert('Please select a category and enter a valid amount.')`
- Missing DOM elements: guarded by null checks where applicable

## Testing Strategy

Manual testing performed in browser:
- Add transactions across all categories and verify balance updates
- Delete transactions and verify balance, chart, and budget recalculate
- Set budget limits and verify progress bars and warnings trigger correctly
- Test search, sort, and filter in combination
- Test dark/light mode toggle and persistence on refresh
- Test PWA install prompt on mobile Chrome
- Test offline functionality after first load
