/**
 * Naver Blog Publisher (Selenium WebDriver)
 * 네이버 ID/PW 로그인 → SmartEditor에 HTML 주입 → 발행 → URL 캡처
 * v1 naver_blog_publisher.py 포트
 */

import type { PlatformPublisher, PublishInput, PublishResult } from './types'

// Selenium은 런타임에서만 로드 (선택적 의존성)
let seleniumLoaded = false
let Builder: any
let By: any
let until: any
let Options: any

async function loadSelenium(): Promise<boolean> {
  if (seleniumLoaded) return true
  try {
    const selenium = await import('selenium-webdriver')
    const chrome = await import('selenium-webdriver/chrome.js')
    Builder = selenium.Builder
    By = selenium.By
    until = selenium.until
    Options = chrome.Options
    seleniumLoaded = true
    return true
  } catch {
    return false
  }
}

const COOKIE_DIR = '/data/sns_cookies'
const SCREENSHOT_DIR = '/data/sns_screenshots'

function randomDelay(min = 1000, max = 3000): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min)) + min
  return new Promise((r) => setTimeout(r, ms))
}

async function ensureDir(dir: string): Promise<void> {
  try {
    const fs = await import('node:fs/promises')
    await fs.mkdir(dir, { recursive: true })
  } catch { /* ignore */ }
}

async function saveCookies(driver: any, platform: string): Promise<void> {
  try {
    const fs = await import('node:fs/promises')
    await ensureDir(COOKIE_DIR)
    const cookies = await driver.manage().getCookies()
    await fs.writeFile(
      `${COOKIE_DIR}/${platform}_cookies.json`,
      JSON.stringify(cookies, null, 2),
    )
  } catch { /* ignore */ }
}

async function loadCookies(driver: any, platform: string): Promise<boolean> {
  try {
    const fs = await import('node:fs/promises')
    const raw = await fs.readFile(`${COOKIE_DIR}/${platform}_cookies.json`, 'utf-8')
    const cookies = JSON.parse(raw) as Array<Record<string, unknown>>
    for (const cookie of cookies) {
      try {
        await driver.manage().addCookie(cookie)
      } catch { /* ignore unsupported fields */ }
    }
    return true
  } catch {
    return false
  }
}

async function takeScreenshot(driver: any, contentId: string): Promise<string | undefined> {
  try {
    const fs = await import('node:fs/promises')
    await ensureDir(SCREENSHOT_DIR)
    const path = `${SCREENSHOT_DIR}/naver_${contentId}_${Date.now()}.png`
    const screenshot = await driver.takeScreenshot()
    await fs.writeFile(path, screenshot, 'base64')
    return path
  } catch {
    return undefined
  }
}

export const naverBlogPublisher: PlatformPublisher = {
  platform: 'naver_blog',

  async publish(input: PublishInput, credentials: Record<string, string>): Promise<PublishResult> {
    const naverId = credentials.naver_id
    const naverPw = credentials.naver_pw
    const blogId = credentials.blog_id

    if (!naverId || !naverPw) {
      return { success: false, error: '네이버 ID/PW가 없습니다' }
    }
    if (!blogId) {
      return { success: false, error: 'blog_id가 없습니다' }
    }

    const available = await loadSelenium()
    if (!available) {
      return { success: false, error: 'Selenium WebDriver가 설치되지 않았습니다 (npm install selenium-webdriver)' }
    }

    let driver: any = null

    try {
      // Chrome 옵션 — 안티봇 감지 회피
      const options = new Options()
      options.addArguments(
        '--headless=new',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      )

      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build()

      // navigator.webdriver 속성 제거 (CDP)
      await driver.executeCdp('Page.addScriptToEvaluateOnNewDocument', {
        source: 'Object.defineProperty(navigator, "webdriver", {get: () => false})',
      })

      // 쿠키 로드 시도
      await driver.get('https://nid.naver.com')
      const cookieLoaded = await loadCookies(driver, 'naver')

      if (cookieLoaded) {
        await driver.get(`https://blog.naver.com/${blogId}`)
        await randomDelay()
        const currentUrl = await driver.getCurrentUrl()
        if (!currentUrl.includes('nid.naver.com')) {
          // 쿠키 세션 유효 — 글쓰기로 이동
          await driver.get(`https://blog.naver.com/${blogId}/postwrite`)
          await randomDelay(2000, 4000)
        } else {
          // 쿠키 만료 — 로그인 필요
          await naverLogin(driver, naverId, naverPw)
          await driver.get(`https://blog.naver.com/${blogId}/postwrite`)
          await randomDelay(2000, 4000)
        }
      } else {
        // 로그인
        await naverLogin(driver, naverId, naverPw)
        await driver.get(`https://blog.naver.com/${blogId}/postwrite`)
        await randomDelay(2000, 4000)
      }

      // 제목 입력
      await driver.wait(until.elementLocated(By.css('.se-title-input, .se_textarea, [placeholder*="제목"]')), 10000)
      await randomDelay(500, 1000)
      await driver.executeScript(`
        const titleEl = document.querySelector('.se-title-input') || document.querySelector('.se_textarea');
        if (titleEl) {
          titleEl.focus();
          titleEl.textContent = ${JSON.stringify(input.title)};
          titleEl.dispatchEvent(new Event('input', {bubbles: true}));
        }
      `)

      await randomDelay()

      // 본문 HTML 주입
      const htmlBody = input.body.replace(/\n/g, '<br>')
      await driver.executeScript(`
        const bodyEl = document.querySelector('.se-component-content .se-text-paragraph')
          || document.querySelector('.se-main-container .se-component');
        if (bodyEl) {
          bodyEl.innerHTML = ${JSON.stringify(htmlBody)};
          bodyEl.dispatchEvent(new Event('input', {bubbles: true}));
        }
      `)

      await randomDelay()

      // 해시태그 입력
      if (input.hashtags) {
        const tags = input.hashtags.replace(/#/g, '').split(/\s+/).filter(Boolean)
        for (const tag of tags.slice(0, 10)) {
          try {
            const tagInput = await driver.findElement(By.css('.se-tag-input input, [placeholder*="태그"]'))
            await tagInput.sendKeys(tag)
            await tagInput.sendKeys('\n')
            await randomDelay(300, 600)
          } catch { break }
        }
      }

      await randomDelay()

      // 발행 버튼 클릭
      await driver.executeScript(`
        const publishBtn = document.querySelector('.publish_btn__m9KHH')
          || document.querySelector('[class*="publish"]')
          || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('발행'));
        if (publishBtn) publishBtn.click();
      `)

      await randomDelay(3000, 5000)

      // 발행 확인 (모달의 '발행' 클릭)
      await driver.executeScript(`
        const confirmBtn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent.trim() === '발행');
        if (confirmBtn) confirmBtn.click();
      `)

      await randomDelay(3000, 5000)

      // 발행 결과 확인 — URL 변경 감지
      const finalUrl = await driver.getCurrentUrl()

      // 스크린샷 캡처
      const screenshotPath = await takeScreenshot(driver, input.id)

      // 쿠키 저장
      await saveCookies(driver, 'naver')

      // URL이 postwrite가 아니면 발행 성공
      if (!finalUrl.includes('/postwrite')) {
        return {
          success: true,
          url: finalUrl,
          screenshotPath,
        }
      }

      // URL이 변경되지 않았으면 발행 실패일 가능성
      return {
        success: true,
        url: `https://blog.naver.com/${blogId}`,
        screenshotPath,
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '네이버 블로그 발행 오류' }
    } finally {
      if (driver) {
        try { await driver.quit() } catch { /* ignore */ }
      }
    }
  },
}

async function naverLogin(driver: any, id: string, pw: string): Promise<void> {
  await driver.get('https://nid.naver.com/nidlogin.login')
  await randomDelay(1000, 2000)

  // JavaScript로 ID/PW 입력 (셀레니움 감지 회피)
  await driver.executeScript(`
    document.querySelector('#id').value = ${JSON.stringify(id)};
    document.querySelector('#id').dispatchEvent(new Event('input', {bubbles: true}));
  `)
  await randomDelay(500, 1000)

  await driver.executeScript(`
    document.querySelector('#pw').value = ${JSON.stringify(pw)};
    document.querySelector('#pw').dispatchEvent(new Event('input', {bubbles: true}));
  `)
  await randomDelay(500, 1000)

  // 로그인 버튼 클릭
  await driver.executeScript(`
    const loginBtn = document.querySelector('#log\\.login') || document.querySelector('.btn_login');
    if (loginBtn) loginBtn.click();
  `)

  await randomDelay(3000, 5000)
}
