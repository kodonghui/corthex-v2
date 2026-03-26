/**
 * Agent D: Deep verification of flagged pages
 * Checks console errors, actual error messages, theme detection on html element
 */
import puppeteer from "puppeteer-core";

const CHROME_PATH = "/home/ubuntu/.cache/ms-playwright/chromium-1208/chrome-linux/chrome";
const ADMIN_URL = "http://localhost:5173";
const APP_URL = "http://localhost:5174";

const FLAGGED_ADMIN = ["companies", "users", "departments", "report-lines", "memory-management", "monitoring"];
const FLAGGED_APP = ["n8n-workflows", "trading"];

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    userDataDir: "/tmp/agent-d-verify-profile"
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Collect console errors
  const consoleErrors: Record<string, string[]> = {};
  page.on("console", msg => {
    if (msg.type() === "error") {
      const currentUrl = page.url();
      const route = currentUrl.replace(ADMIN_URL, "").replace(APP_URL, "").replace("/admin/", "").replace("/", "");
      if (!consoleErrors[route]) consoleErrors[route] = [];
      consoleErrors[route].push(msg.text().substring(0, 200));
    }
  });

  // Login admin
  await page.goto(`${ADMIN_URL}/admin/login`, { waitUntil: "networkidle2", timeout: 15000 });
  await sleep(1000);
  if (page.url().includes("/login")) {
    const u = await page.$('input[name="username"], input[type="text"]');
    const p = await page.$('input[name="password"], input[type="password"]');
    if (u && p) {
      await u.type("admin"); await p.type("admin1234");
      const b = await page.$('button[type="submit"]');
      if (b) await b.click();
      await sleep(3000);
    }
  }

  console.log("=== ADMIN: Detailed Verification ===\n");

  for (const route of FLAGGED_ADMIN) {
    consoleErrors[route] = [];
    await page.goto(`${ADMIN_URL}/admin/${route}`, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(2000);

    const detail = await page.evaluate((r: string) => {
      // Check for actual visible error text
      const bodyText = document.body.textContent || "";
      const hasErrorText = bodyText.includes("Something went wrong") ||
                          bodyText.includes("Error:") ||
                          bodyText.includes("Cannot read") ||
                          bodyText.includes("is not defined") ||
                          bodyText.includes("404") ||
                          bodyText.includes("Not Found");

      // Check ErrorBoundary
      const errorBoundary = document.querySelector("[class*='ErrorBoundary'], [class*='error-boundary']");
      const hasErrorBoundary = !!errorBoundary;

      // Check for elements with "error" in class that might be false positive
      const errorClasses = Array.from(document.querySelectorAll("[class*='error']")).map(el => ({
        tag: el.tagName,
        className: (typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className : '').substring(0, 100),
        text: el.textContent?.substring(0, 50)?.trim()
      })).slice(0, 5);

      // Main content check
      const main = document.querySelector("main");
      const mainText = main?.textContent?.trim()?.substring(0, 200) || "";
      const mainChildCount = main?.children?.length || 0;

      // Theme: check html element + body + wrapper divs
      const html = document.documentElement;
      const htmlClasses = html.className || "";
      const htmlBg = getComputedStyle(html).backgroundColor;
      const bodyBg = getComputedStyle(document.body).backgroundColor;

      // Check the first significant wrapper
      const wrapper = document.querySelector("#root") || document.querySelector("[id*='app']") || document.body.firstElementChild;
      const wrapperBg = wrapper ? getComputedStyle(wrapper).backgroundColor : "n/a";
      const wrapperClasses = (wrapper as HTMLElement)?.className?.substring(0, 100) || "";

      return {
        hasErrorText,
        hasErrorBoundary,
        errorClasses,
        mainText,
        mainChildCount,
        htmlClasses,
        htmlBg,
        bodyBg,
        wrapperBg,
        wrapperClasses,
        url: window.location.href,
        title: document.title
      };
    }, route);

    const errs = consoleErrors[route] || [];
    const realConsoleErrors = errs.filter(e =>
      !e.includes("favicon") &&
      !e.includes("manifest") &&
      !e.includes("DevTools") &&
      !e.includes("Download the React")
    );

    console.log(`\n/admin/${route}:`);
    console.log(`  URL: ${detail.url}`);
    console.log(`  Main content: ${detail.mainChildCount} children, "${detail.mainText.substring(0, 80)}..."`);
    console.log(`  Error text visible: ${detail.hasErrorText}`);
    console.log(`  ErrorBoundary: ${detail.hasErrorBoundary}`);
    console.log(`  Error classes: ${JSON.stringify(detail.errorClasses)}`);
    console.log(`  Console errors: ${realConsoleErrors.length} (${realConsoleErrors.join(" | ").substring(0, 200)})`);
    console.log(`  Theme: html="${detail.htmlClasses}" htmlBg=${detail.htmlBg} bodyBg=${detail.bodyBg} wrapperBg=${detail.wrapperBg}`);
    console.log(`  Wrapper classes: ${detail.wrapperClasses}`);
  }

  // Login app
  await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle2", timeout: 15000 });
  await sleep(1000);
  if (page.url().includes("/login")) {
    const u = await page.$('input[name="username"], input[type="text"]');
    const p = await page.$('input[name="password"], input[type="password"]');
    if (u && p) {
      await u.type("ceo"); await p.type("HHS$jV4SlC^X71Ec");
      const b = await page.$('button[type="submit"]');
      if (b) await b.click();
      await sleep(3000);
    }
  }

  console.log("\n=== APP: Detailed Verification ===\n");

  for (const route of FLAGGED_APP) {
    consoleErrors[route] = [];
    await page.goto(`${APP_URL}/${route}`, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(2000);

    const detail = await page.evaluate((r: string) => {
      const bodyText = document.body.textContent || "";
      const hasErrorText = bodyText.includes("Something went wrong") ||
                          bodyText.includes("Error:") ||
                          bodyText.includes("Cannot read") ||
                          bodyText.includes("is not defined") ||
                          bodyText.includes("404") ||
                          bodyText.includes("Not Found");

      const errorBoundary = document.querySelector("[class*='ErrorBoundary'], [class*='error-boundary']");
      const errorClasses = Array.from(document.querySelectorAll("[class*='error']")).map(el => ({
        tag: el.tagName,
        className: (typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className : '').substring(0, 100),
        text: el.textContent?.substring(0, 50)?.trim()
      })).slice(0, 5);

      const main = document.querySelector("main");
      const mainText = main?.textContent?.trim()?.substring(0, 200) || "";
      const mainChildCount = main?.children?.length || 0;

      const html = document.documentElement;
      const htmlClasses = html.className || "";
      const htmlBg = getComputedStyle(html).backgroundColor;
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const wrapper = document.querySelector("#root") || document.body.firstElementChild;
      const wrapperBg = wrapper ? getComputedStyle(wrapper).backgroundColor : "n/a";
      const wrapperClasses = (wrapper as HTMLElement)?.className?.substring(0, 100) || "";

      return {
        hasErrorText,
        errorClasses,
        mainText,
        mainChildCount,
        htmlClasses,
        htmlBg,
        bodyBg,
        wrapperBg,
        wrapperClasses,
        url: window.location.href,
        title: document.title
      };
    }, route);

    const errs = consoleErrors[route] || [];
    const realConsoleErrors = errs.filter(e =>
      !e.includes("favicon") &&
      !e.includes("manifest") &&
      !e.includes("DevTools") &&
      !e.includes("Download the React")
    );

    console.log(`\n/${route}:`);
    console.log(`  URL: ${detail.url}`);
    console.log(`  Main content: ${detail.mainChildCount} children, "${detail.mainText.substring(0, 80)}..."`);
    console.log(`  Error text visible: ${detail.hasErrorText}`);
    console.log(`  Error classes: ${JSON.stringify(detail.errorClasses)}`);
    console.log(`  Console errors: ${realConsoleErrors.length} (${realConsoleErrors.join(" | ").substring(0, 200)})`);
    console.log(`  Theme: html="${detail.htmlClasses}" htmlBg=${detail.htmlBg} bodyBg=${detail.bodyBg} wrapperBg=${detail.wrapperBg}`);
  }

  // === Additional theme check on 5 admin pages ===
  console.log("\n=== THEME DEEP CHECK (Admin) ===");
  const themePages = ["dashboard", "agents", "costs", "settings", "tools"];
  for (const route of themePages) {
    await page.goto(`${ADMIN_URL}/admin/${route}`, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(1500);

    const theme = await page.evaluate(() => {
      const html = document.documentElement;
      const htmlClasses = html.className;
      const root = document.getElementById("root");
      const rootClasses = root?.className || "";

      // Find the actual dark background element
      let darkBgFound = false;
      let darkBgElement = "";
      const checkEls = [html, document.body, root, root?.firstElementChild].filter(Boolean);
      for (const el of checkEls) {
        if (!el) continue;
        const bg = getComputedStyle(el).backgroundColor;
        const cls = (el as HTMLElement).className || "";
        if (bg.includes("2, 6, 23") || bg.includes("15, 23, 42") || bg.includes("30, 41, 59") ||
            bg.includes("3, 7, 18") || bg.includes("9, 9, 11") || bg.includes("10, 10, 10") ||
            cls.includes("slate-950") || cls.includes("bg-slate") || cls.includes("dark")) {
          darkBgFound = true;
          darkBgElement = `${(el as HTMLElement).tagName}.${cls.substring(0, 80)}`;
          break;
        }
      }

      // Check for Tailwind dark classes anywhere
      const allDarkElements = document.querySelectorAll("[class*='bg-slate-9'], [class*='bg-slate-8'], [class*='bg-gray-9'], [class*='dark:']");

      return {
        htmlClasses,
        rootClasses: rootClasses.substring(0, 100),
        darkBgFound,
        darkBgElement,
        darkElementCount: allDarkElements.length
      };
    });

    console.log(`  /admin/${route}: darkBg=${theme.darkBgFound} (${theme.darkBgElement}) darkEls=${theme.darkElementCount} html="${theme.htmlClasses}" root="${theme.rootClasses}"`);
  }

  // === Additional theme check on 5 app pages ===
  console.log("\n=== THEME DEEP CHECK (App) ===");
  await page.goto(`${APP_URL}/hub`, { waitUntil: "networkidle2", timeout: 15000 });
  await sleep(1000);

  const appThemePages = ["hub", "dashboard", "agents", "costs", "settings"];
  for (const route of appThemePages) {
    await page.goto(`${APP_URL}/${route}`, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(1500);

    const theme = await page.evaluate(() => {
      const html = document.documentElement;
      const htmlClasses = html.className;
      const root = document.getElementById("root");
      const rootClasses = root?.className || "";

      let darkBgFound = false;
      let darkBgElement = "";
      const checkEls = [html, document.body, root, root?.firstElementChild].filter(Boolean);
      for (const el of checkEls) {
        if (!el) continue;
        const bg = getComputedStyle(el).backgroundColor;
        const cls = (el as HTMLElement).className || "";
        if (bg.includes("2, 6, 23") || bg.includes("15, 23, 42") || bg.includes("30, 41, 59") ||
            bg.includes("3, 7, 18") || bg.includes("9, 9, 11") || bg.includes("10, 10, 10") ||
            cls.includes("slate-950") || cls.includes("bg-slate") || cls.includes("dark")) {
          darkBgFound = true;
          darkBgElement = `${(el as HTMLElement).tagName}.${cls.substring(0, 80)}`;
          break;
        }
      }

      const allDarkElements = document.querySelectorAll("[class*='bg-slate-9'], [class*='bg-slate-8'], [class*='bg-gray-9'], [class*='dark:']");

      return {
        htmlClasses,
        rootClasses: rootClasses.substring(0, 100),
        darkBgFound,
        darkBgElement,
        darkElementCount: allDarkElements.length
      };
    });

    console.log(`  /${route}: darkBg=${theme.darkBgFound} (${theme.darkBgElement}) darkEls=${theme.darkElementCount} html="${theme.htmlClasses}" root="${theme.rootClasses}"`);
  }

  await browser.close();
  console.log("\nVerification complete!");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
