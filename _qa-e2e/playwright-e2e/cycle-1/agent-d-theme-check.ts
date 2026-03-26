/**
 * Agent D: Theme deep-check using CSS custom properties
 */
import puppeteer from "puppeteer-core";

const CHROME_PATH = "/home/ubuntu/.cache/ms-playwright/chromium-1208/chrome-linux/chrome";

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    userDataDir: "/tmp/agent-d-theme-profile"
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Login admin
  await page.goto("http://localhost:5173/admin/login", { waitUntil: "networkidle2", timeout: 15000 });
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

  const checkPages = [
    { url: "http://localhost:5173/admin/dashboard", name: "admin/dashboard" },
    { url: "http://localhost:5173/admin/agents", name: "admin/agents" },
    { url: "http://localhost:5173/admin/costs", name: "admin/costs" },
    { url: "http://localhost:5173/admin/settings", name: "admin/settings" },
    { url: "http://localhost:5173/admin/departments", name: "admin/departments" },
  ];

  console.log("=== Theme Deep Check ===\n");

  for (const p of checkPages) {
    await page.goto(p.url, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(2000);

    const theme = await page.evaluate(() => {
      // Find the element that actually sets the background
      const elements = [
        { name: "html", el: document.documentElement },
        { name: "body", el: document.body },
        { name: "#root", el: document.getElementById("root") },
      ];

      // Add first few children of root
      const root = document.getElementById("root");
      if (root?.firstElementChild) {
        elements.push({ name: "root>div1", el: root.firstElementChild as HTMLElement });
        if (root.firstElementChild.firstElementChild) {
          elements.push({ name: "root>div1>div1", el: root.firstElementChild.firstElementChild as HTMLElement });
        }
      }

      const bgInfo: Record<string, { bg: string, classes: string }> = {};
      for (const { name, el } of elements) {
        if (!el) continue;
        const computed = getComputedStyle(el);
        bgInfo[name] = {
          bg: computed.backgroundColor,
          classes: (typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className : '').substring(0, 120),
        };
      }

      // Check CSS custom properties on :root
      const rootStyle = getComputedStyle(document.documentElement);
      const customProps: Record<string, string> = {};
      const propsToCheck = [
        '--corthex-bg', '--corthex-surface', '--corthex-accent', '--corthex-text',
        '--color-bg', '--color-surface', '--bg-primary', '--theme-bg',
        '--corthex-bg-primary', '--corthex-bg-secondary'
      ];
      for (const prop of propsToCheck) {
        const val = rootStyle.getPropertyValue(prop).trim();
        if (val) customProps[prop] = val;
      }

      // Find any element with non-transparent background
      const allDivs = document.querySelectorAll("div");
      let firstDarkBg = "";
      let firstDarkBgClasses = "";
      for (let i = 0; i < Math.min(allDivs.length, 20); i++) {
        const bg = getComputedStyle(allDivs[i]).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          // Parse RGB
          const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            const [_, r, g, b] = match.map(Number);
            if (r < 50 && g < 50 && b < 80) { // Dark color
              firstDarkBg = bg;
              firstDarkBgClasses = (typeof allDivs[i].className === 'string' ? allDivs[i].className : '').substring(0, 120);
              break;
            }
          }
        }
      }

      // Check if any element has white/light background
      let hasWhiteBg = false;
      let whiteBgElement = "";
      for (let i = 0; i < Math.min(allDivs.length, 50); i++) {
        const bg = getComputedStyle(allDivs[i]).backgroundColor;
        if (bg) {
          const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            const [_, r, g, b] = match.map(Number);
            if (r > 230 && g > 230 && b > 230) {
              hasWhiteBg = true;
              whiteBgElement = `${allDivs[i].tagName}.${(typeof allDivs[i].className === 'string' ? allDivs[i].className : '').substring(0, 80)} bg=${bg}`;
              break;
            }
          }
        }
      }

      // Take a color sample: what's the actual bg at center of viewport?
      return {
        bgInfo,
        customProps,
        firstDarkBg,
        firstDarkBgClasses,
        hasWhiteBg,
        whiteBgElement,
      };
    });

    console.log(`${p.name}:`);
    console.log(`  Element backgrounds:`);
    for (const [name, info] of Object.entries(theme.bgInfo)) {
      console.log(`    ${name}: bg="${info.bg}" class="${info.classes.substring(0, 80)}"`);
    }
    console.log(`  CSS custom props: ${JSON.stringify(theme.customProps)}`);
    console.log(`  First dark bg: "${theme.firstDarkBg}" on "${theme.firstDarkBgClasses.substring(0, 80)}"`);
    console.log(`  White bg found: ${theme.hasWhiteBg} ${theme.whiteBgElement ? `(${theme.whiteBgElement.substring(0, 80)})` : ""}`);
    console.log();
  }

  // Also do app check
  await page.goto("http://localhost:5174/login", { waitUntil: "networkidle2", timeout: 15000 });
  await sleep(1000);
  if (page.url().includes("/login")) {
    const u = await page.$('input[name="username"], input[type="text"]');
    const p2 = await page.$('input[name="password"], input[type="password"]');
    if (u && p2) {
      await u.type("ceo"); await p2.type("HHS$jV4SlC^X71Ec");
      const b = await page.$('button[type="submit"]');
      if (b) await b.click();
      await sleep(3000);
    }
  }

  const appPages = [
    { url: "http://localhost:5174/hub", name: "app/hub" },
    { url: "http://localhost:5174/dashboard", name: "app/dashboard" },
    { url: "http://localhost:5174/agents", name: "app/agents" },
  ];

  for (const p of appPages) {
    await page.goto(p.url, { waitUntil: "networkidle2", timeout: 15000 });
    await sleep(2000);

    const theme = await page.evaluate(() => {
      const elements = [
        { name: "html", el: document.documentElement },
        { name: "body", el: document.body },
        { name: "#root", el: document.getElementById("root") },
      ];
      const root = document.getElementById("root");
      if (root?.firstElementChild) {
        elements.push({ name: "root>div1", el: root.firstElementChild as HTMLElement });
        if (root.firstElementChild.firstElementChild) {
          elements.push({ name: "root>div1>div1", el: root.firstElementChild.firstElementChild as HTMLElement });
        }
      }

      const bgInfo: Record<string, { bg: string, classes: string }> = {};
      for (const { name, el } of elements) {
        if (!el) continue;
        bgInfo[name] = {
          bg: getComputedStyle(el).backgroundColor,
          classes: (typeof (el as HTMLElement).className === 'string' ? (el as HTMLElement).className : '').substring(0, 120),
        };
      }

      const rootStyle = getComputedStyle(document.documentElement);
      const customProps: Record<string, string> = {};
      const propsToCheck = ['--corthex-bg', '--corthex-surface', '--corthex-accent', '--corthex-text'];
      for (const prop of propsToCheck) {
        const val = rootStyle.getPropertyValue(prop).trim();
        if (val) customProps[prop] = val;
      }

      const allDivs = document.querySelectorAll("div");
      let firstDarkBg = "";
      let firstDarkBgClasses = "";
      for (let i = 0; i < Math.min(allDivs.length, 20); i++) {
        const bg = getComputedStyle(allDivs[i]).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            const [_, r, g, b] = match.map(Number);
            if (r < 50 && g < 50 && b < 80) {
              firstDarkBg = bg;
              firstDarkBgClasses = (typeof allDivs[i].className === 'string' ? allDivs[i].className : '').substring(0, 120);
              break;
            }
          }
        }
      }

      let hasWhiteBg = false;
      for (let i = 0; i < Math.min(allDivs.length, 50); i++) {
        const bg = getComputedStyle(allDivs[i]).backgroundColor;
        if (bg) {
          const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (match) {
            const [_, r, g, b] = match.map(Number);
            if (r > 230 && g > 230 && b > 230) { hasWhiteBg = true; break; }
          }
        }
      }

      return { bgInfo, customProps, firstDarkBg, firstDarkBgClasses, hasWhiteBg };
    });

    console.log(`${p.name}:`);
    for (const [name, info] of Object.entries(theme.bgInfo)) {
      console.log(`  ${name}: bg="${info.bg}" class="${info.classes.substring(0, 80)}"`);
    }
    console.log(`  CSS props: ${JSON.stringify(theme.customProps)}`);
    console.log(`  Dark bg: "${theme.firstDarkBg}" on "${theme.firstDarkBgClasses.substring(0, 60)}"`);
    console.log(`  White bg: ${theme.hasWhiteBg}\n`);
  }

  await browser.close();
  console.log("Done!");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
