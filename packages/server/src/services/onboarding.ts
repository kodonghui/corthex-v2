import { db } from '../db'
import { companies, orgTemplates } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { applyTemplate, type TemplateApplySummary, type TenantActor } from './organization'

/**
 * Apply the default builtin template during registration.
 * Returns TemplateApplySummary on success, null if no default template found.
 */
export async function applyDefaultTemplate(
  tenant: TenantActor,
): Promise<TemplateApplySummary | null> {
  // Find the first builtin template (prefer name containing '기본')
  const builtinTemplates = await db
    .select({ id: orgTemplates.id, name: orgTemplates.name })
    .from(orgTemplates)
    .where(
      and(
        eq(orgTemplates.isBuiltin, true),
        eq(orgTemplates.isActive, true),
        isNull(orgTemplates.companyId),
      ),
    )

  if (builtinTemplates.length === 0) {
    return null
  }

  // Prefer template with '기본' in name, fallback to first builtin
  const defaultTemplate =
    builtinTemplates.find((t) => t.name.includes('기본')) || builtinTemplates[0]

  const result = await applyTemplate(tenant, defaultTemplate.id)
  if ('error' in result) {
    console.error('[onboarding] applyDefaultTemplate failed:', result.error)
    return null
  }

  return result.data
}

/**
 * Get onboarding status for a company.
 */
export async function getOnboardingStatus(companyId: string): Promise<{
  completed: boolean
  selectedTemplateId: string | null
}> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  const settings = (company?.settings ?? {}) as Record<string, unknown>
  return {
    completed: !!settings.onboardingCompleted,
    selectedTemplateId: (settings.selectedTemplateId as string) || null,
  }
}

/**
 * Apply a template during onboarding and record the selection.
 */
export async function selectOnboardingTemplate(
  tenant: TenantActor,
  templateId: string,
): Promise<{ data: TemplateApplySummary } | { error: { status: number; message: string; code: string } }> {
  const result = await applyTemplate(tenant, templateId)
  if ('error' in result) {
    return result
  }

  // Record template selection in company settings
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, tenant.companyId))
    .limit(1)

  const currentSettings = (company?.settings ?? {}) as Record<string, unknown>
  await db
    .update(companies)
    .set({
      settings: { ...currentSettings, selectedTemplateId: templateId },
      updatedAt: new Date(),
    })
    .where(eq(companies.id, tenant.companyId))

  return result
}

/**
 * Mark onboarding as completed.
 */
export async function completeOnboarding(companyId: string): Promise<void> {
  const [company] = await db
    .select({ settings: companies.settings })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  const currentSettings = (company?.settings ?? {}) as Record<string, unknown>
  await db
    .update(companies)
    .set({
      settings: { ...currentSettings, onboardingCompleted: true },
      updatedAt: new Date(),
    })
    .where(eq(companies.id, companyId))
}
