# Round 1 Review: 16-files
## Lens: Collaborative
## Issues Found:
1. **Missing upload error/validation state documentation**: The spec describes the upload button spinner state but does not document what happens when upload fails (file too large, disallowed MIME type, network error). The backend returns specific error codes (FILE_001, FILE_002, FILE_003). The source code handles this with `toast.error()`, but the spec should document expected toast messages for each failure mode. This is an API coverage gap.
2. **Active filter chip sizing inconsistency**: The active chip uses `bg-blue-600 text-white` without a border, while inactive chips have `border border-slate-600`. This creates a ~2px size difference between active and inactive states due to border presence. Should add `border border-blue-600` to the active chip or `border border-transparent` for consistent element sizing across states.
3. **Drag & drop section lacks event handling description**: The drag-drop overlay is specified visually but missing the actual event model -- `onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop` handlers aren't described. Also no mention of what happens with multi-file drops (spec only shows single file upload via the button handler).
4. **No mobile-specific action button visibility rule**: The spec mentions "always visible on mobile (remove `opacity-0 group-hover:opacity-100`)" but doesn't specify the breakpoint. Should use `sm:opacity-0 sm:group-hover:opacity-100` to make actions always visible below `sm` breakpoint and hover-reveal on desktop.

## Resolution:
- Issue 1: Will add upload error states section to the spec.
- Issue 2: Will add `border border-blue-600` to active chip class.
- Issue 3: Accepted as minor -- drag-drop is labeled "Enhancement" and event handling is implementation detail.
- Issue 4: Will update action button classes with responsive opacity.

## Score: 8/10
## Verdict: PASS
