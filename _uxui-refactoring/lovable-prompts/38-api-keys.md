# 38. API Keys (공개 API 키 관리) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

This is the **Public API Keys** management page in the Admin app. Administrators create and manage API keys that allow **external systems** to call the CORTHEX API. These are company-level API keys for integrations — not user-level credentials or Claude OAuth tokens (those are on the Credentials page).

Each API key has a name, scopes (read/write/execute), optional expiration date, and a rate limit. The key value is shown exactly **once** at creation time and can never be retrieved again — a critical security pattern.

### Data Displayed — In Detail

**Page header:**
- Title: "공개 API 키 관리"
- Subtitle: "외부 시스템에서 CORTHEX API를 호출하기 위한 키를 관리합니다"
- **"+ 새 API 키" button** to create a new key

**API keys table:**

Table columns:
- **이름 (Name)**: User-defined key name (e.g. "대시보드 연동")
- **키 접두사 (Key Prefix)**: First 16 characters of the key + "..." in monospace (e.g. "cxk_live_a3f7b2...")  — this is the only visible portion of the key after creation
- **스코프 (Scopes)**: Permission badges showing "read", "write", and/or "execute"
- **Rate Limit**: Requests per minute (e.g. "60/min")
- **마지막 사용 (Last Used)**: Timestamp of last API call using this key, formatted in Korean locale. "-" if never used.
- **만료일 (Expires At)**: Expiration date in Korean locale. "-" if no expiration.
- **상태 (Status)**: "활성" (active) badge or "비활성" (inactive) badge with distinct visual treatment
- **작업 (Actions)**: For active keys only:
  - "로테이션" (rotate) — generates a new key while deactivating the old one
  - "삭제" (delete) — deactivates the key

**Loading state**: "로딩 중..." text
**Empty state**: "아직 API 키가 없습니다" heading with "새 API 키를 생성하여 외부 시스템과 연동하세요" subtitle

**Create modal (opens when clicking "+ 새 API 키"):**
- Title: "새 API 키 생성"
- Fields:
  - **이름** (name, required): Text input, placeholder "예: 대시보드 연동"
  - **스코프** (scopes, at least one required): Checkboxes for "read", "write", "execute". "read" is checked by default.
  - **만료일** (optional): Datetime picker
  - **Rate Limit** (요청/분): Number input, default 60, range 1–10000
- Cancel and Create buttons. Create disabled if name empty or no scopes selected.

**Key display modal (appears after creation or rotation — ONE-TIME ONLY):**
- Title: "API 키가 생성되었습니다"
- **Critical warning banner**: "이 키는 다시 표시되지 않습니다. 반드시 안전한 곳에 저장하세요."
- **Key display area**: The full raw key in monospace with a "복사" (copy) button. After copying, button changes to "복사됨!" briefly.
- The raw key text is user-selectable for manual copying.
- "닫기" (close) button at the bottom. This modal cannot be dismissed by clicking outside — only via the close button, preventing accidental dismissal before the key is copied.

**Delete confirmation modal:**
- Title: "API 키 삭제"
- Warning: "이 API 키를 삭제하면 해당 키를 사용하는 모든 외부 연동이 중단됩니다. 계속하시겠습니까?"
- Cancel and Delete buttons.

**Rotation confirmation modal:**
- Title: "API 키 로테이션"
- Warning: "기존 키가 즉시 비활성화되고 새 키가 발급됩니다. 외부 시스템에서 새 키로 교체해야 합니다. 계속하시겠습니까?"
- Cancel and "로테이션" button.
- After successful rotation, the key display modal appears with the new key.

### User Actions

1. **Create a new API key** with name, scopes, optional expiration, and rate limit
2. **Copy the raw key** immediately after creation (one-time opportunity)
3. **Rotate a key** — deactivates the old key and generates a new one with the same settings (name, scopes, expiration, rate limit)
4. **Delete (deactivate) a key** — soft delete, the key becomes inactive
5. **View key list** with usage stats (last used, status)

### UX Considerations

- **Company selection prerequisite**: A company must be selected. Without it, show "회사를 먼저 선택해 주세요".
- **One-time key display is critical**: The raw API key is shown only once — after creation or rotation. The warning banner must be unmissable. This is the single most important UX element on this page.
- **Copy-to-clipboard convenience**: The copy button next to the raw key provides instant feedback ("복사됨!"), but the key text should also be manually selectable as a fallback.
- **Rotation preserves settings**: When rotating, the new key inherits the old key's name, scopes, expiration, and rate limit. The admin only needs to update the key value in their external system.
- **Soft delete for safety**: Deleting a key deactivates it rather than hard-deleting, preserving audit trail. Inactive keys remain visible in the table but have no action buttons.
- **Rate limit as protection**: The rate limit setting prevents abuse of the API key. Default of 60/min is reasonable for most integrations.
- **Scope clarity**: The three scopes (read/write/execute) are straightforward permissions. At least one must be selected.
- **Destructive action warnings**: Both deletion and rotation have confirmation modals with clear explanations of impact.
- **Audit logging**: All key operations (create, delete, rotate) are audit-logged on the backend — but this is not visible on this page.
- **Korean language**: All text in Korean.

### What NOT to Include on This Page

- No raw key retrieval after initial display — this is by design (security)
- No key editing (name/scopes/rate limit change) — create a new key or rotate instead
- No API usage analytics or logs — that would be on a monitoring page
- No webhook configuration
- No IP allowlisting per key
- No key-level access logs
- No Claude OAuth tokens or employee credentials — those are on the Credentials page
