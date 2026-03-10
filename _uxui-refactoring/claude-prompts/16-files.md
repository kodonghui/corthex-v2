# 16. Files (파일 관리) — Claude Design Spec

## Page Overview
The Files page is a simple file management interface where users can upload, browse, download, and delete files. Route: `/files`. File: `packages/app/src/pages/files.tsx`.

---

## Layout Structure

```
+------------------------------------------------------------------+
| HEADER: "파일 관리" + Upload Button                               |
+------------------------------------------------------------------+
| Search + Filter Chips                                             |
+------------------------------------------------------------------+
| File List (card-based rows)                                       |
+------------------------------------------------------------------+
```

### Root Container
```html
<div className="h-full overflow-y-auto bg-slate-900">
  <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4">
    ...
  </div>
</div>
```

---

## Design System Tokens

Same as 15-knowledge. Dark theme with `bg-slate-900` primary, `bg-slate-800` elevated, `text-slate-50` primary text, `border-slate-700` borders.

---

## Component Specifications

### 1. Header
```html
<div className="flex items-center justify-between">
  <h1 className="text-xl font-semibold text-slate-50">파일 관리</h1>
  <div>
    <input ref={fileInputRef} type="file" hidden onChange={handleUpload} />
    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={isUploading}
      className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      <UploadIcon className="w-4 h-4" />
      {isUploading ? '업로드 중...' : '파일 업로드'}
    </button>
  </div>
</div>
```

#### Upload Progress State
When uploading, show inline spinner inside button:
```html
<button disabled className="... disabled:opacity-50">
  <LoaderIcon className="w-4 h-4 animate-spin" />
  업로드 중...
</button>
```

---

### 2. Search + Filter Chips
```html
<div className="space-y-3">
  <!-- Search -->
  <div className="relative max-w-xs">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
    <input
      className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition-colors"
      placeholder="파일명 검색..."
    />
  </div>
  <!-- Filter Chips -->
  <div className="flex gap-2 flex-wrap">
    <!-- Active chip -->
    <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-blue-600 text-white transition-colors">
      전체
    </button>
    <!-- Inactive chip -->
    <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-slate-200 transition-colors">
      이미지
    </button>
    <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-slate-200 transition-colors">
      문서
    </button>
    <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-800 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-slate-200 transition-colors">
      기타
    </button>
  </div>
</div>
```

---

### 3. File List Items

Each file is a horizontal card row:

```html
<div className="space-y-1.5">
  <!-- File Row -->
  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 hover:border-slate-600 transition-colors group">
    <!-- File Type Icon -->
    <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
      <FileIcon className="w-5 h-5 text-slate-400" />
      <!-- OR for images: ImageIcon, for PDF: FileTextIcon, etc -->
    </div>

    <!-- File Info -->
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-100 truncate">marketing-report-2026.pdf</p>
      <p className="text-xs text-slate-500">2.4MB · 2026-03-09</p>
    </div>

    <!-- Actions -->
    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <a
        href="/api/workspace/files/{id}/download"
        download
        className="p-2 rounded-lg hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
        title="다운로드"
      >
        <DownloadIcon className="w-4 h-4" />
      </a>
      <!-- Only show delete if user owns the file -->
      <button
        className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
        title="삭제"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
```

#### File Type Icon Mapping (replace emoji with Lucide icons)
| MIME | Icon | Color |
|------|------|-------|
| `image/*` | `ImageIcon` | `text-blue-400` |
| `application/pdf` | `FileTextIcon` | `text-red-400` |
| `*spreadsheet*` / `*excel*` | `TableIcon` | `text-emerald-400` |
| `*presentation*` / `*powerpoint*` | `PresentationIcon` | `text-orange-400` |
| `*word*` | `FileTextIcon` | `text-blue-400` |
| `application/json` | `BracesIcon` | `text-amber-400` |
| `application/zip` | `FolderArchiveIcon` | `text-purple-400` |
| `text/*` | `FileTypeIcon` | `text-slate-400` |
| default | `FileIcon` | `text-slate-400` |

#### File Row Interaction
- Hover: background shifts to `bg-slate-700/50`, border to `border-slate-600`, action buttons fade in
- Actions are always visible on mobile (remove `opacity-0 group-hover:opacity-100`)

---

### 4. Storage Summary (optional header stat)
```html
<div className="flex items-center gap-4 px-1">
  <span className="text-xs text-slate-500">{files.length}개 파일</span>
  <span className="text-xs text-slate-500">·</span>
  <span className="text-xs text-slate-500">총 {totalSize}</span>
</div>
```

---

## States

### Loading State
```html
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="h-16 bg-slate-800/50 border border-slate-700 rounded-xl animate-pulse" />
  ))}
</div>
```

### Empty State — No Files
```html
<div className="flex flex-col items-center justify-center py-20 text-center">
  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
    <FolderOpenIcon className="w-8 h-8 text-slate-600" />
  </div>
  <h3 className="text-base font-medium text-slate-300 mb-2">파일이 없습니다</h3>
  <p className="text-sm text-slate-500 mb-4">파일을 업로드하면 여기에 표시됩니다</p>
  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
    파일 업로드
  </button>
</div>
```

### Empty State — No Search Results
```html
<div className="flex flex-col items-center justify-center py-16 text-center">
  <SearchXIcon className="w-10 h-10 text-slate-600 mb-4" />
  <h3 className="text-base font-medium text-slate-300 mb-2">검색 결과가 없습니다</h3>
  <p className="text-sm text-slate-500">필터를 변경하거나 검색어를 수정해보세요</p>
</div>
```

---

## Modals

### Delete Confirmation Dialog
```html
<ConfirmDialog
  title="파일을 삭제하시겠습니까?"
  description={`"${file.filename}" 파일이 삭제됩니다.`}
  confirmText="삭제"
  variant="danger"
/>
```

Dialog styling:
```html
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="fixed inset-0 bg-black/60" /> <!-- backdrop -->
  <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
    <h3 className="text-lg font-semibold text-slate-50 mb-2">파일을 삭제하시겠습니까?</h3>
    <p className="text-sm text-slate-400 mb-6">"report.pdf" 파일이 삭제됩니다.</p>
    <div className="flex justify-end gap-2">
      <button className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 rounded-lg transition-colors">취소</button>
      <button className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">삭제</button>
    </div>
  </div>
</div>
```

---

## Drag & Drop Upload Zone (Enhancement)

When dragging files over the page:
```html
<div className="fixed inset-0 z-40 bg-blue-500/10 border-2 border-dashed border-blue-500/50 flex items-center justify-center">
  <div className="text-center">
    <UploadCloudIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
    <p className="text-lg font-medium text-blue-300">파일을 여기에 놓으세요</p>
    <p className="text-sm text-blue-400/70">최대 50MB</p>
  </div>
</div>
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/workspace/files` | Upload file (multipart/form-data) |
| GET | `/workspace/files` | List files |
| GET | `/workspace/files/:id/download` | Download file |
| DELETE | `/workspace/files/:id` | Soft delete file |

### Constraints
- Max file size: 50MB
- Allowed MIME types: image/*, text/*, PDF, MS Office, JSON, ZIP
- Only the uploader can delete their own files

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| `>= sm` | `p-6` padding, search `max-w-xs` |
| `< sm` | `p-4` padding, full-width search |

File rows stay the same at all breakpoints — single-column card list works on mobile.

---

## Accessibility
- Upload button: `aria-label="파일 업로드"`
- Download link: `aria-label="다운로드: {filename}"`
- Delete button: `aria-label="삭제: {filename}"`
- Hidden file input properly triggered by button
- Focus management: after upload completes, focus returns to upload button
