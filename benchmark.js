import puppeteer from 'puppeteer';
import { createObjectCsvWriter } from 'csv-writer';

// config
const cycles = 500;
const stableTime = 300;
const checkInterval = 10;
const testUrl = 'http://localhost:8080';
const fileName = 'benchmark-results.csv';

/**
 * Helper to wait until the DOM is stable for `stableTime` ms.
 */
async function waitForDomStability(page) {
  let lastHTML = null;
  let stableStartTime = null;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  while (true) {
    const currentHTML = await page.content();
    if (currentHTML === lastHTML) {
      if (!stableStartTime) {
        stableStartTime = Date.now();
      } else if (Date.now() - stableStartTime >= stableTime) {
        // DOM has been unchanged for stableTime
        return; // end loop
      }
    } else {
      lastHTML = currentHTML;
      stableStartTime = null;
    }
    await sleep(checkInterval);
  }
}

(async () => {
  // Prepare CSV writer
  const csvWriter = createObjectCsvWriter({
    path: fileName,
    header: [
      { id: 'run', title: 'Run' },
      { id: 'domContentLoaded', title: 'DOMContentLoaded (ms)' },
      { id: 'loadEvent', title: 'Load (ms)' },
      { id: 'domStable', title: 'DOM Stable (ms)' },
    ],
  });

  const results = [];
  const browser = await puppeteer.launch({ headless: true });

  for (let i = 1; i <= cycles; i++) {
    const page = await browser.newPage();

    // Create a DevTools session and set CPU throttling (optional)
    const client = await page.target().createCDPSession();
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    // Measure real-wall-clock time for DOM stability
    const epochStart = Date.now();

    // Navigate and wait for network idle
    await page.goto(testUrl, { waitUntil: 'networkidle2' });

    // --- Use Navigation Timing Level 2 (PerformanceNavigationTiming) ---
    const navigationEntries = JSON.parse(
      await page.evaluate(() => JSON.stringify(performance.getEntriesByType('navigation')))
    );

    let domContentLoaded = 0;
    let loadEvent = 0;
    if (navigationEntries && navigationEntries.length > 0) {
      const navEntry = navigationEntries[0];
      // times are relative to navEntry.startTime (which is 0 or close to 0)
      domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
      loadEvent = navEntry.loadEventEnd - navEntry.startTime;
    }

    // Wait for DOM to be stable (some async updates might occur)
    await waitForDomStability(page);
    const domStable = Date.now() - epochStart;

    await page.close();

    // Log and store results
    console.log(`Run #${i}: DCL=${domContentLoaded}ms, Load=${loadEvent}ms, Stable=${domStable}ms`);
    results.push({
      run: i,
      domContentLoaded,
      loadEvent,
      domStable,
    });
  }

  await browser.close();

  // Write results to CSV
  await csvWriter.writeRecords(results);
  console.log(`All done! Results saved to ${fileName}`);
})();
