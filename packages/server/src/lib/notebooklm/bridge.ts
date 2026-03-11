/**
 * NotebookLM Python Bridge
 *
 * TypeScript → child_process.spawn → notebooklm-bridge.py → notebooklm-py → Google NotebookLM
 * stdin JSON 전송, stdout JSON 수신
 */

import { spawn } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { NotebookLMRequest, NotebookLMResponse } from './types'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BRIDGE_SCRIPT = resolve(__dirname, '../../../scripts/notebooklm-bridge.py')
const BRIDGE_TIMEOUT_MS = 120_000 // 오디오 생성은 최대 2분

export async function callNotebookLM(request: NotebookLMRequest): Promise<NotebookLMResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python3', [BRIDGE_SCRIPT], {
      timeout: BRIDGE_TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    proc.on('error', (err) => {
      reject(new Error(`NotebookLM 브릿지 프로세스 실행 실패: ${err.message}`))
    })

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const parsed = JSON.parse(stdout) as NotebookLMResponse
          resolve(parsed)
        } catch {
          reject(new Error(`NotebookLM 브릿지 응답 JSON 파싱 실패: ${stdout.slice(0, 200)}`))
        }
      } else {
        reject(
          new Error(
            `NotebookLM 브릿지 실패 (exit code ${code}): ${stderr.slice(0, 500) || 'stderr 없음'}`,
          ),
        )
      }
    })

    // stdin으로 요청 전송
    proc.stdin.write(JSON.stringify(request))
    proc.stdin.end()
  })
}
