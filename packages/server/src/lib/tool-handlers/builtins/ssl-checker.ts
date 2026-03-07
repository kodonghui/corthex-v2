import type { ToolHandler } from '../types'
import { connect as tlsConnect } from 'node:tls'

function checkSsl(hostname: string, port: number): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.destroy()
      reject(new Error('SSL 연결 시간 초과 (10초)'))
    }, 10_000)

    const socket = tlsConnect(
      { host: hostname, port, servername: hostname, rejectUnauthorized: false },
      () => {
        clearTimeout(timeout)
        const cert = socket.getPeerCertificate()
        const authorized = socket.authorized
        const protocol = socket.getProtocol()

        const validFrom = cert.valid_from ? new Date(cert.valid_from) : null
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null
        const now = new Date()
        const daysUntilExpiry = validTo ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : -1
        const isExpired = validTo ? validTo < now : true

        const result: Record<string, unknown> = {
          hostname,
          port,
          valid: authorized,
          issuer: cert.issuer ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(', ') : '',
          subject: cert.subject ? Object.entries(cert.subject).map(([k, v]) => `${k}=${v}`).join(', ') : '',
          validFrom: cert.valid_from || '',
          validTo: cert.valid_to || '',
          daysUntilExpiry,
          isExpired,
          protocol: protocol || '',
          serialNumber: cert.serialNumber || '',
          fingerprint: cert.fingerprint256 || cert.fingerprint || '',
        }

        let status: string
        if (isExpired) status = '만료됨'
        else if (daysUntilExpiry <= 30) status = `갱신 필요 (${daysUntilExpiry}일 남음)`
        else status = `정상 (${daysUntilExpiry}일 남음)`

        result.status = status

        socket.end()
        resolve(result)
      },
    )

    socket.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

export const sslChecker: ToolHandler = async (input) => {
  const action = String(input.action || 'check')
  const hostname = String(input.hostname || '')
  const port = Number(input.port || 443)

  if (action !== 'check') {
    return JSON.stringify({ success: false, message: `알 수 없는 action: ${action}. check를 사용하세요.` })
  }

  if (!hostname) return JSON.stringify({ success: false, message: '호스트명(hostname)을 입력하세요.' })

  try {
    const result = await checkSsl(hostname, port)
    return JSON.stringify({ success: true, ...result })
  } catch (err) {
    return JSON.stringify({
      success: false,
      hostname,
      port,
      message: `SSL 인증서 확인 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
    })
  }
}
