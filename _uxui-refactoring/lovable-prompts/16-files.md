# 16. Files (파일 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Files** page in the CEO app. It provides a simple file management interface where users can upload, view, download, and delete files associated with their company. This is separate from the Knowledge Base — while the Knowledge Base stores structured documents and agent-injected knowledge, the Files page handles general-purpose file uploads (images, PDFs, Office documents, text files, JSON, ZIP archives). Files are stored for the company's general use.

### Data Displayed — In Detail

**File list (main content):**
- A list of all active files for the current company, ordered by most recently uploaded first
- Each file entry shows:
  - **Filename** (파일명): Original filename as uploaded (max 255 chars)
  - **File type indicator**: Visual indicator based on MIME type category:
    - Images (image/*) — e.g. PNG, JPG, GIF, SVG
    - Documents (application/pdf, Word, Excel, PowerPoint)
    - Text files (text/*)
    - Data files (application/json)
    - Archives (application/zip)
  - **File size** (크기): Human-readable size (e.g. "2.4 MB", "150 KB")
  - **Upload date** (업로드 날짜): When the file was uploaded, shown as relative time or date
  - **Uploader**: Who uploaded the file (resolved from userId)
- Maximum 50 files displayed (current backend limit)

**Upload area:**
- A prominent upload zone where users can select files
- Supported file types: Images (all types), text files, PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), JSON, ZIP
- Maximum file size: 50MB per file
- Single file upload at a time (one POST per file)

**File actions (per file):**
- **Download** (다운로드): Downloads the original file with proper Content-Type and filename
- **Delete** (삭제): Soft-deletes the file. Only the original uploader can delete their own files

### User Actions

1. **View all files** — see the complete list of uploaded files for the company
2. **Upload a new file** — select a file from the device, see upload feedback
3. **Download a file** — click to download any file in the list
4. **Delete a file** — remove a file (only your own uploads). Confirmation required before deletion

### UX Considerations

- **Simple and focused**: This page is intentionally simple. It's a flat file list — no folders, no hierarchy, no complex filtering. Keep it clean.
- **Upload feedback**: Show clear progress during upload. After success, the new file should appear at the top of the list immediately. If the file type is not allowed or exceeds 50MB, show a clear error message explaining the restriction.
- **Delete permission**: Only the person who uploaded a file can delete it. If another user views the file, the delete option should not be visible or should be disabled with an explanation.
- **File type icons**: Each file should have a visual indicator of its type (image, document, spreadsheet, etc.) so users can quickly scan the list.
- **Empty state**: When no files have been uploaded yet, show a welcoming empty state with a clear "파일 업로드" call-to-action.
- **Image preview**: For image files, showing a preview can help users identify them quickly.
- **File size display**: Always show human-readable file sizes (KB, MB), not raw byte counts.
- **Delete confirmation**: Since deletion is soft (recoverable on the backend), keep the confirmation simple — but still confirm to prevent accidental clicks.
- **50-file limit visibility**: If there are more files, the current backend returns only 50. Consider showing a note if the list is at capacity.
- **Mobile layout**: File list should be fully functional on mobile. Upload should work with the device's file picker.
- **Korean language**: All labels, buttons, error messages, and placeholder text must be in Korean.
- **Loading state**: Show a loading indicator while the file list is being fetched.
- **Error handling**: Handle network errors during upload gracefully with retry-friendly messaging.

### What NOT to Include on This Page

- No folder structure — this is a flat file list
- No file editing or content viewing (except image previews)
- No knowledge document features — that's the Knowledge Base page
- No file sharing or permissions management
- No file search or filtering (the list is simple and small)
- No bulk upload or batch operations
- No file versioning
