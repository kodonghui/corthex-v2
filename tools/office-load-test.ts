#!/usr/bin/env bun
/**
 * Story 29.7: Office WebSocket Load Test
 *
 * Simulates N concurrent WebSocket connections to the office channel.
 * Measures: connection time, message latency, memory usage.
 *
 * Usage: bun tools/office-load-test.ts [connections=50] [duration_seconds=60] [base_url=ws://localhost:3000]
 */

const NUM_CONNECTIONS = parseInt(process.argv[2] || '50', 10)
const DURATION_SECONDS = parseInt(process.argv[3] || '60', 10)
const BASE_URL = process.argv[4] || 'ws://localhost:3000'
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-load-token'

type ConnStats = {
  id: number
  connectTime: number
  messagesReceived: number
  latencies: number[]
  error?: string
}

const stats: ConnStats[] = []
const sockets: WebSocket[] = []

async function connectOne(id: number): Promise<ConnStats> {
  const stat: ConnStats = { id, connectTime: 0, messagesReceived: 0, latencies: [] }
  const start = performance.now()

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`${BASE_URL}/ws?token=${TEST_TOKEN}`)
      sockets.push(ws)

      const timeout = setTimeout(() => {
        stat.error = 'Connection timeout (10s)'
        ws.close()
        resolve(stat)
      }, 10_000)

      ws.onopen = () => {
        stat.connectTime = performance.now() - start
        clearTimeout(timeout)
        ws.send(JSON.stringify({ type: 'subscribe', channel: 'office' }))
      }

      ws.onmessage = (e) => {
        stat.messagesReceived++
        try {
          const msg = JSON.parse(e.data)
          if (msg.type === 'data' && msg.data?.type === 'office_state') {
            stat.latencies.push(performance.now())
          }
        } catch {
          // ignore
        }
      }

      ws.onerror = () => {
        stat.error = stat.error || 'WebSocket error'
      }

      ws.onclose = (e) => {
        if (!stat.connectTime) {
          stat.connectTime = performance.now() - start
          stat.error = `Closed before connect: ${e.code} ${e.reason}`
          clearTimeout(timeout)
          resolve(stat)
        }
      }

      // Resolve after connection
      const checkInterval = setInterval(() => {
        if (stat.connectTime > 0 && !stat.error) {
          clearInterval(checkInterval)
          resolve(stat)
        }
      }, 100)
    } catch (err) {
      stat.error = String(err)
      resolve(stat)
    }
  })
}

async function main() {
  console.log(`\n📊 Office WebSocket Load Test`)
  console.log(`   Connections: ${NUM_CONNECTIONS}`)
  console.log(`   Duration:    ${DURATION_SECONDS}s`)
  console.log(`   Target:      ${BASE_URL}`)
  console.log()

  // Connect all
  const connectStart = performance.now()
  console.log(`⏳ Opening ${NUM_CONNECTIONS} connections...`)

  const connectPromises = Array.from({ length: NUM_CONNECTIONS }, (_, i) => connectOne(i))
  const results = await Promise.all(connectPromises)
  stats.push(...results)

  const connectElapsed = performance.now() - connectStart
  const connected = results.filter((s) => !s.error)
  const failed = results.filter((s) => s.error)

  console.log(`✅ Connected: ${connected.length}/${NUM_CONNECTIONS} (${Math.round(connectElapsed)}ms total)`)
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`)
    for (const f of failed.slice(0, 5)) {
      console.log(`   #${f.id}: ${f.error}`)
    }
  }

  // Wait for duration
  console.log(`\n⏳ Running for ${DURATION_SECONDS}s...`)

  // Send periodic pings
  const pingInterval = setInterval(() => {
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }
  }, 10_000)

  await new Promise((resolve) => setTimeout(resolve, DURATION_SECONDS * 1000))
  clearInterval(pingInterval)

  // Collect results
  const memUsage = process.memoryUsage()
  const totalMessages = stats.reduce((sum, s) => sum + s.messagesReceived, 0)
  const avgConnectTime =
    connected.length > 0
      ? connected.reduce((sum, s) => sum + s.connectTime, 0) / connected.length
      : 0

  console.log(`\n📊 Results:`)
  console.log(`   Connections: ${connected.length} succeeded, ${failed.length} failed`)
  console.log(`   Avg connect time: ${avgConnectTime.toFixed(1)}ms`)
  console.log(`   Total messages received: ${totalMessages}`)
  console.log(`   Avg messages/connection: ${connected.length > 0 ? (totalMessages / connected.length).toFixed(1) : 0}`)
  console.log(`   Memory: RSS=${(memUsage.rss / 1024 / 1024).toFixed(1)}MB, Heap=${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`)

  // Cleanup
  console.log(`\n🧹 Closing connections...`)
  for (const ws of sockets) {
    try {
      ws.close()
    } catch {
      // ignore
    }
  }

  console.log('✅ Load test complete\n')
  process.exit(0)
}

main().catch(console.error)
