// walkthrough.mjs
// Playwright script to walk through menu.html and check accordion menu functionality
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173/menu.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let result = {
    pageLoaded: false,
    accordionFound: false,
    accordionOpens: false,
    error: null
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    result.pageLoaded = true;

    // Check for accordion menu trigger
    const accordionTrigger = await page.$('.overlay-accordion__trigger');
    result.accordionFound = !!accordionTrigger;

    if (accordionTrigger) {
      // Try to open the accordion
      await accordionTrigger.click();
      await page.waitForTimeout(500);
      // Check if panel is visible
      const panel = await page.$('.overlay-accordion__panel');
      const isVisible = panel && await panel.evaluate(el => {
        return window.getComputedStyle(el).display !== 'none' && el.offsetHeight > 0;
      });
      result.accordionOpens = !!isVisible;
    }
  } catch (err) {
    result.error = err.message;
  } finally {
    await browser.close();
    // Print result in a way Copilot understands
    if (!result.pageLoaded) {
      console.log('FAIL: Page did not load');
    } else if (!result.accordionFound) {
      console.log('FAIL: Accordion menu trigger not found');
    } else if (!result.accordionOpens) {
      console.log('FAIL: Accordion menu did not open (still broken)');
    } else {
      console.log('PASS: Accordion menu opened successfully');
    }
    if (result.error) {
      console.log('ERROR:', result.error);
    }
  }
})();
