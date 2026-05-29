# Implementation Plan: Expense & Budget Visualizer

## Overview

Implementation is split into 10 sequential tasks covering setup, core features, UI polish, and PWA support. Each task builds on the previous.

## Tasks

- [x] 1. Project setup — create index.html, css/style.css, js/script.js with folder structure and base HTML skeleton
- [x] 2. Total balance — implement updateBalance(), formatRupiah(), Edit Balance button with localStorage persistence, red color when negative
- [x] 3. Add transaction form — item name, amount, category fields with validation, save to localStorage transactions array, reset form on submit
- [x] 4. Custom categories — add custom category input, save to customCategories in localStorage, reload into dropdown on page load
- [x] 5. Transaction list — implement renderTransactions(), display name/amount/category badge, delete button per item, clear all button with confirmation
- [x] 6. Pie chart — integrate Chart.js, implement renderChart() counting transactions per category, assign consistent colors, auto-update on changes
- [x] 7. Search, sort and filter — search input by name, sort by amount radio buttons, category filter checkboxes, sort menu opening upward with fixed positioning
- [x] 8. Budget limits — budget section with set limit form, renderBudgets() with progress bars and color states, checkBudgetWarning() alert before saving transaction
- [x] 9. Dark and light mode — CSS variables for theming, data-theme attribute toggle, emoji-only button, save preference to localStorage
- [x] 10. Visual polish and PWA — Inter font, card shadows, responsive balance with clamp(), fade-in animation, manifest.json, sw.js service worker, iOS meta tags

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2] },
    { "wave": 3, "tasks": [3] },
    { "wave": 4, "tasks": [4, 5, 6, 8] },
    { "wave": 5, "tasks": [7] },
    { "wave": 6, "tasks": [9] },
    { "wave": 7, "tasks": [10] }
  ]
}
```

## Notes

- All state is stored in localStorage — no backend, no build step required
- Service worker (sw.js) must remain at the project root to control the full page scope
- Chart.js loaded via CDN; script.js loaded after Chart.js to ensure dependency is available
- Sort and filter state (amountSort, activeCategories, searchQuery) is held in JS variables and not persisted — resets on page reload by design
