# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint across all .js/.jsx files
```

There is no test suite configured.

## Architecture

Single-component React 19 app bundled with Vite. All state is in-memory (no persistence) and lives entirely in `src/App.jsx`. No routing, no external state library, no backend.

### Todo shape

```js
{ id: number, text: string, completed: boolean, createdAt: Date }
```

`id` is `Date.now()` at creation time.

### State hooks

| Hook | Purpose |
|---|---|
| `todos` | Master array of todo objects |
| `inputValue` | Controlled value for the add-todo input |
| `searchQuery` | Real-time text filter applied to `todo.text` |
| `dateFilter` | Preset range key: `'all' \| 'today' \| 'week' \| 'month'` |
| `pickedDate` | Specific date string (`'YYYY-MM-DD'`) from the calendar picker; overrides `dateFilter` when set |
| `editingId` | `id` of the todo currently in edit mode, or `null` |
| `editValue` | Controlled value for the inline edit input |

### Filtering logic

`filteredTodos` is derived inline (no extra state). It chains two `.filter()` passes: first by date (`pickedDate` takes priority over `dateFilter` via `isWithinRange()`), then by `searchQuery` (case-insensitive substring match).

### Edit flow

Clicking **Edit** calls `handleEditStart(id, text)`, setting `editingId` and pre-filling `editValue`. The todo row swaps to an `<input>` with `autoFocus`. Enter/blur → `handleEditSave`; Escape or Cancel button → `handleEditCancel`. Save/Cancel buttons use `onMouseDown` with `e.preventDefault()` to stop the input's `onBlur` from firing before the click.

### Styles

`src/App.css` contains all styles (global reset + component). `src/index.css` is empty. Mobile breakpoints: ≤ 600px (edge-to-edge card, no shadow) and ≤ 380px (stacked add-form). The purple accent is `#6c63ff`; red destructive is `#e05c5c`.
