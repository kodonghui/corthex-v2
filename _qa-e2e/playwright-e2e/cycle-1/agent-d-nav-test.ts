/**
 * Agent D: Full Navigation Sweep Test
 * Uses Puppeteer to test all sidebar links in admin and app
 */
import puppeteer, { type Browser, type Page } from "puppeteer-core";

const CHROME_PATH = "/home/ubuntu/.cache/ms-playwright/chromium-1208/chrome-linux/chrome";
const SCREENSHOT_DIR = "/home/ubuntu/corthex-v2/_qa-e2e/playwright-e2e/cycle-1/screenshots";

const ADMIN_URL = "http://localhost:5173";
const APP_URL = "http://localhost:5174";

// Admin sidebar pages to test
const ADMIN_PAGES = [
  "dashboard", "companies", "employees", "users", "departments", "agents",
  "tools", "costs", "credentials", "report-lines", "soul-templates",
  "monitoring", "nexus", "sketchvibe", "org-templates", "template-market",
  "agent-marketplace", "api-keys", "n8n-editor", "marketing-settings",
  "memory-management", "settings"
];

// App sidebar pages to test
const APP_PAGES = [
  "hub", "dashboard", "chat", "agents", "departments", "organization",
  "tiers", "nexus", "agora", "memories", "messenger", "knowledge",
  "files", "classified", "reports", "jobs", "n8n-workflows",
  "marketing-pipeline", "marketing-approval", "activity-log", "ops-log",
  "notifications", "costs", "performance", "sns", "trading", "settings"
];

interface PageResult {
  page: string;
  loaded: boolean;
  hasContent: boolean;
  hasError: boolean;
  errorMsg?: string;
  loadTimeMs: number;
  isDarkBg: boolean;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPage(page: Page, baseUrl: string, route: string): Promise<PageResult> {
  const url = `${baseUrl}/admin/${route}`;
  const adjustedUrl = baseUrl === APP_URL ? `${baseUrl}/${route}` : url;

  const start = Date.now();
  try {
    await page.goto(adjustedUrl, { waitUntil: "networkidle2", timeout: 15000 });
  } catch (e: any) {
    // Try domcontentloaded as fallback
    try {
      await page.goto(adjustedUrl, { waitUntil: "domcontentloaded", timeout: 10000 });
    } catch (e2: any) {
      return {
        page: route,
        loaded: false,
        hasContent: false,
        hasError: true,
        errorMsg: e2.message?.substring(0, 100),
        loadTimeMs: Date.now() - start,
        isDarkBg: false
      };
    }
  }
  const loadTimeMs = Date.now() - start;

  await sleep(2000); // Wait for render

  // Check for content
  const result = await page.evaluate(() => {
    const main = document.querySelector("main") || document.querySelector("[role='main']") || document.body;
    const text = main?.textContent?.trim() || "";
    const hasContent = text.length > 10;

    // Check for error indicators
    const hasError = !!document.querySelector("[class*='error']") ||
                     text.includes("Error") && text.includes("Something went wrong") ||
                     text.includes("Cannot read") ||
                     text.includes("undefined is not");

    // Check dark background
    const bgColor = getComputedStyle(document.body).backgroundColor;
    const bodyClasses = document.body.className + " " + (document.documentElement.className || "");
    const isDarkBg = bodyClasses.includes("dark") ||
                     bgColor.includes("rgb(2,") || bgColor.includes("rgb(15,") ||
                     bgColor.includes("rgb(0,") || bgColor.includes("rgb(3,") ||
                     bgColor.includes("rgb(30,") || bgColor.includes("rgb(17,") ||
                     bgColor.includes("rgb(9,") || bgColor.includes("rgb(10,") ||
                     bgColor.includes("rgb(20,");

    // Check for console errors in page
    const errorElements = document.querySelectorAll("[class*='ErrorBoundary'], [class*='error-boundary']");

    return { hasContent, hasError: hasError || errorElements.length > 0, isDarkBg, textLen: text.length, bgColor };
  });

  // Take screenshot
  try {
    const prefix = baseUrl === ADMIN_URL ? "admin" : "app";
    await page.screenshot({
      path: `${SCREENSHOT_DIR}/${prefix}-${route}.png`,
      fullPage: false
    });
  } catch {}

  return {
    page: route,
    loaded: true,
    hasContent: result.hasContent,
    hasError: result.hasError,
    loadTimeMs,
    isDarkBg: result.isDarkBg
  };
}

async function loginAdmin(page: Page) {
  await page.goto(`${ADMIN_URL}/admin/login`, { waitUntil: "networkidle2", timeout: 15000 });
  await sleep(1000);

  // Check if already logged in (redirected to dashboard)
  if (page.url().includes("/admin/dashboard") || page.url().endsWith("/admin/")) {
    console.log("Admin: Already logged in");
    return true;
  }

  // Try to login
  try {
    const usernameInput = await page.$('input[name="username"], input[type="text"], input[placeholder*="user" i]');
    const passwordInput = await page.$('input[name="password"], input[type="password"]');

    if (usernameInput && passwordInput) {
      await usernameInput.type("admin");
      await passwordInput.type("admin1234");

      const submitBtn = await page.$('button[type="submit"], button:not([type])');
      if (submitBtn) await submitBtn.click();

      await sleep(3000);
      console.log(`Admin: Logged in, now at ${page.url()}`);
      return true;
    }
  } catch (e: any) {
    console.log(`Admin login attempt: ${e.message}`);
  }

  // Might be already authenticated
  console.log(`Admin: Current URL after login attempt: ${page.url()}`);
  return true;
}

async function loginApp(page: Page) {
  await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle2", timeout: 15000 });
  await sleep(1000);

  if (!page.url().includes("/login")) {
    console.log("App: Already logged in");
    return true;
  }

  try {
    const usernameInput = await page.$('input[name="username"], input[type="text"], input[placeholder*="user" i]');
    const passwordInput = await page.$('input[name="password"], input[type="password"]');

    if (usernameInput && passwordInput) {
      await usernameInput.type("ceo");
      await passwordInput.type("HHS$jV4SlC^X71Ec");

      const submitBtn = await page.$('button[type="submit"], button:not([type])');
      if (submitBtn) await submitBtn.click();

      await sleep(3000);
      console.log(`App: Logged in, now at ${page.url()}`);
      return true;
    }
  } catch (e: any) {
    console.log(`App login attempt: ${e.message}`);
  }

  console.log(`App: Current URL after login attempt: ${page.url()}`);
  return true;
}

async function main() {
  console.log("=== Agent D: Full Navigation Sweep ===\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--headless"
    ],
    userDataDir: "/tmp/agent-d-chrome-profile"
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // ===== ADMIN SWEEP =====
  console.log("--- Admin Sidebar Sweep ---");
  await loginAdmin(page);

  const adminResults: PageResult[] = [];
  for (const route of ADMIN_PAGES) {
    const result = await testPage(page, ADMIN_URL, route);
    adminResults.push(result);
    const status = result.loaded ? (result.hasContent ? "OK" : "EMPTY") : "FAIL";
    const errFlag = result.hasError ? " [ERROR]" : "";
    console.log(`  [${status}${errFlag}] /admin/${route} (${result.loadTimeMs}ms)`);
  }

  // ===== APP SWEEP =====
  console.log("\n--- App Sidebar Sweep ---");
  await loginApp(page);

  const appResults: PageResult[] = [];
  for (const route of APP_PAGES) {
    const result = await testPage(page, APP_URL, route);
    appResults.push(result);
    const status = result.loaded ? (result.hasContent ? "OK" : "EMPTY") : "FAIL";
    const errFlag = result.hasError ? " [ERROR]" : "";
    console.log(`  [${status}${errFlag}] /${route} (${result.loadTimeMs}ms)`);
  }

  // ===== SESSION PERSISTENCE =====
  console.log("\n--- Session Persistence Test ---");
  let sessionOk = true;
  const rapidPages = [...ADMIN_PAGES.slice(0, 5), ...APP_PAGES.slice(0, 5)];

  // Test admin session
  for (const route of ADMIN_PAGES.slice(0, 5)) {
    await page.goto(`${ADMIN_URL}/admin/${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await sleep(500);
    if (page.url().includes("/login")) {
      sessionOk = false;
      console.log(`  Session LOST at admin/${route}`);
      break;
    }
  }

  // Test app session
  await page.goto(`${APP_URL}/hub`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await sleep(1000);
  for (const route of APP_PAGES.slice(0, 5)) {
    await page.goto(`${APP_URL}/${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await sleep(500);
    if (page.url().includes("/login")) {
      sessionOk = false;
      console.log(`  Session LOST at app/${route}`);
      break;
    }
  }

  console.log(`  Session persistence: ${sessionOk ? "PASS" : "FAIL"}`);

  // ===== THEME CONSISTENCY =====
  console.log("\n--- Theme Consistency Check ---");
  const themePages = ["dashboard", "agents", "departments", "settings", "costs"];
  let themeConsistent = true;
  const themeIssues: string[] = [];

  for (const route of themePages) {
    await page.goto(`${ADMIN_URL}/admin/${route}`, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(1500);

    const themeCheck = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      const bgColor = getComputedStyle(body).backgroundColor;
      const classes = (html.className || "") + " " + (body.className || "");

      // Check for white background (bad)
      const isWhiteBg = bgColor === "rgb(255, 255, 255)" || bgColor === "rgba(0, 0, 0, 0)";

      // Check for dark class
      const hasDark = classes.includes("dark");

      // Check for accent colors (cyan/gold)
      const allElements = document.querySelectorAll("*");
      let hasCyanAccent = false;
      let hasGoldAccent = false;
      for (let i = 0; i < Math.min(allElements.length, 500); i++) {
        const color = getComputedStyle(allElements[i]).color;
        const bg = getComputedStyle(allElements[i]).backgroundColor;
        if (color.includes("34, 211, 238") || color.includes("6, 182, 212") || bg.includes("34, 211, 238") || bg.includes("6, 182, 212")) hasCyanAccent = true;
        if (color.includes("251, 191, 36") || color.includes("245, 158, 11") || bg.includes("251, 191, 36") || bg.includes("245, 158, 11")) hasGoldAccent = true;
      }

      return { bgColor, isWhiteBg, hasDark, hasCyanAccent, hasGoldAccent };
    });

    if (themeCheck.isWhiteBg) {
      themeConsistent = false;
      themeIssues.push(`${route}: White background detected (${themeCheck.bgColor})`);
    }
    console.log(`  /admin/${route}: bg=${themeCheck.bgColor} dark=${themeCheck.hasDark} cyan=${themeCheck.hasCyanAccent}`);
  }

  console.log(`  Theme consistency: ${themeConsistent ? "PASS" : "FAIL"}`);
  if (themeIssues.length > 0) {
    themeIssues.forEach(i => console.log(`  ISSUE: ${i}`));
  }

  // ===== SUMMARY =====
  const adminLoaded = adminResults.filter(r => r.loaded && r.hasContent).length;
  const adminTotal = ADMIN_PAGES.length;
  const appLoaded = appResults.filter(r => r.loaded && r.hasContent).length;
  const appTotal = APP_PAGES.length;

  const adminErrors = adminResults.filter(r => r.hasError || !r.loaded);
  const appErrors = appResults.filter(r => r.hasError || !r.loaded);
  const adminEmpty = adminResults.filter(r => r.loaded && !r.hasContent);
  const appEmpty = appResults.filter(r => r.loaded && !r.hasContent);

  console.log("\n=== SUMMARY ===");
  console.log(`Admin pages loaded: ${adminLoaded}/${adminTotal}`);
  console.log(`App pages loaded: ${appLoaded}/${appTotal}`);
  console.log(`Session persistence: ${sessionOk ? "PASS" : "FAIL"}`);
  console.log(`Theme consistency: ${themeConsistent ? "PASS" : "FAIL"}`);

  if (adminErrors.length > 0) {
    console.log(`\nAdmin ERRORS: ${adminErrors.map(r => r.page).join(", ")}`);
  }
  if (appErrors.length > 0) {
    console.log(`App ERRORS: ${appErrors.map(r => r.page).join(", ")}`);
  }
  if (adminEmpty.length > 0) {
    console.log(`Admin EMPTY: ${adminEmpty.map(r => r.page).join(", ")}`);
  }
  if (appEmpty.length > 0) {
    console.log(`App EMPTY: ${appEmpty.map(r => r.page).join(", ")}`);
  }

  // Write JSON results
  const output = {
    adminResults,
    appResults,
    sessionPersistence: sessionOk,
    themeConsistency: themeConsistent,
    themeIssues,
    summary: {
      adminLoaded: `${adminLoaded}/${adminTotal}`,
      appLoaded: `${appLoaded}/${appTotal}`,
      adminErrors: adminErrors.map(r => r.page),
      appErrors: appErrors.map(r => r.page),
      adminEmpty: adminEmpty.map(r => r.page),
      appEmpty: appEmpty.map(r => r.page)
    }
  };

  await Bun.write(`${SCREENSHOT_DIR}/../agent-d-results.json`, JSON.stringify(output, null, 2));

  await browser.close();
  console.log("\nDone!");
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
