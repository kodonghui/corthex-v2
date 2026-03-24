import { useState, useEffect, useCallback } from 'react'
import { OfficeCanvas } from './OfficeCanvas'
import { MobileAgentList } from './MobileAgentList'
import { useOfficeSocket } from '../hooks/useOfficeSocket'

const MOBILE_BREAKPOINT = 768

type ResponsiveOfficeProps = {
  companyId?: string
  token?: string
}

export function ResponsiveOffice({ companyId, token }: ResponsiveOfficeProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const { agents, connected, reconnect } = useOfficeSocket({
    companyId: companyId || '',
    token: token || '',
  })

  const handleRefresh = useCallback(() => {
    reconnect()
  }, [reconnect])

  if (isMobile) {
    return (
      <MobileAgentList
        agents={agents}
        connected={connected}
        onRefresh={handleRefresh}
      />
    )
  }

  return <OfficeCanvas companyId={companyId} token={token} />
}

export { MOBILE_BREAKPOINT }
