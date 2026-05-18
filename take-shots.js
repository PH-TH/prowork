const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const shots = [
    { tab: 'Overview', file: 'near18-overview.png' },
    { tab: 'Learning Calendar', file: 'near18-learning-calendar.png' },
    { tab: 'Skill Progress', file: 'near18-skill-progress.png' },
    { tab: 'Practice Lab', file: 'near18-practice-lab.png' },
    { tab: 'Session History', file: 'near18-session-history.png' },
    { tab: 'AI Course Builder', file: 'near18-ai-course-builder.png' },
  ];

  const outDir = 'C:/Users/pitsa/Documents/Codex';
  for (const s of shots) {
    await page.getByRole('button', { name: new RegExp(`^${s.tab}$`, 'i') }).click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(outDir, s.file), fullPage: true });
  }

  await browser.close();
})();
