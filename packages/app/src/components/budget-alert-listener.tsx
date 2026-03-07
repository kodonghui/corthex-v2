import { useBudgetAlerts } from '../hooks/use-budget-alerts'
import { BudgetExceededModal } from './budget-exceeded-modal'

export function BudgetAlertListener() {
  const { exceededModal, dismissModal } = useBudgetAlerts()

  if (!exceededModal) return null

  return <BudgetExceededModal data={exceededModal} onConfirm={dismissModal} />
}
