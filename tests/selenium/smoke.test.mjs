import assert from "node:assert/strict";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const headless = process.env.SELENIUM_HEADLESS !== "false";

const options = new chrome.Options();
if (headless) {
  options.addArguments("--headless=new");
}
options.addArguments("--window-size=1366,900");

const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .build();

try {
  await driver.get(baseUrl);
  await driver.wait(
    until.titleMatches(/Portal de Servicios Escolares/i),
    15000,
  );

  const heroTitle = await driver.findElement(By.css("h1")).getText();
  assert.ok(
    heroTitle.length > 0,
    "No se encontro el titulo principal en la portada",
  );

  const pagosLinks = await driver.findElements(By.css('a[href*="pagos"]'));
  assert.ok(
    pagosLinks.length > 0,
    "No se encontro enlace a pagos en la portada",
  );

  console.log("Selenium smoke test: OK");
} finally {
  await driver.quit();
}
