# Requirements Document

## Introduction

This document describes the requirements for the **Expense & Budget Visualizer** — a mobile-friendly web app that helps users track their daily spending. It shows their total balance, a history of transactions, and a visual chart of spending by category. Built as a simple web page that works well on phones with no backend required.

## Requirements

### Functional Requirements

- [x] 1. The app shall display a total balance calculated as base balance minus total spent
- [x] 2. The user shall be able to manually set a base balance via an Edit Balance button
- [x] 3. The balance shall turn red when it goes negative
- [x] 4. The app shall provide a form with Item Name, Amount, and Category fields to add transactions
- [x] 5. The form shall validate that all fields are filled before submission
- [x] 6. The user shall be able to add custom categories that are saved and reloaded from localStorage
- [x] 7. The app shall display a scrollable list of all added transactions
- [x] 8. Each transaction shall show its name, amount, and a color-coded category badge
- [x] 9. The user shall be able to delete individual transactions
- [x] 10. The user shall be able to clear all transactions at once with a confirmation prompt
- [x] 11. The app shall display a pie chart showing distribution of transactions by category
- [x] 12. The chart shall update automatically when transactions are added or deleted
- [x] 13. The user shall be able to search transactions by item name
- [x] 14. The user shall be able to sort transactions by amount (low to high or high to low)
- [x] 15. The user shall be able to filter transactions by one or more categories simultaneously
- [x] 16. The user shall be able to set a spending limit per category
- [x] 17. The app shall show a progress bar per budget limit indicating how much has been spent
- [x] 18. The app shall alert the user when adding a transaction that exceeds a category budget
- [x] 19. The app shall support dark and light mode with the preference saved to localStorage
- [x] 20. The app shall be installable as a standalone PWA on mobile devices

### Non-Functional Requirements

- [x] 21. The app shall use only HTML, CSS, and Vanilla JavaScript (no frameworks)
- [x] 22. All data shall be stored client-side using the browser localStorage API
- [x] 23. The app shall work in modern browsers (Chrome, Firefox, Edge, Safari)
- [x] 24. The app shall be mobile-friendly and responsive
- [x] 25. The app shall have a clean, minimal interface with no complex setup required

## Glossary

- **Base Balance**: The manually set starting amount before any transactions are subtracted
- **Transaction**: A single spending entry with a name, amount, and category
- **Category**: A label grouping transactions (e.g. Food, Transport, Fun, or custom)
- **Budget Limit**: A maximum spending cap set by the user for a specific category
- **PWA**: Progressive Web App — a web app installable on a device like a native app
