# 42-onboarding — Round 3 (Forensic)

## Final Score: 9/10 — PASS

## Verification
- [x] No visual terms leaked (shadow reference removed in R1)
- [x] 5 steps match STEPS constant: 환영, 조직 템플릿, API 키, 직원 초대, 완료
- [x] ONBOARDING_PROVIDERS: only openai, google_ai
- [x] Template types verified: OrgTemplate, TemplateDepartment, TemplateAgent, ApplyResult
- [x] Employee invite API: POST /admin/employees returns {employee, initialPassword}
- [x] Completion: PATCH /admin/companies/:id with settings.onboardingCompleted=true
- [x] Org template: GET /admin/org-templates, POST /admin/org-templates/:id/apply
- [x] No invented features
- [x] All Korean text matches code strings
