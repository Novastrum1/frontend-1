import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function mockTestnetServices(page: Page) {
  await page.route("**/api/aggregator/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const readiness = {
      network: "testnet", mainnetEnabled: false, custody: "none", submitsTransactions: false,
      checkedAt: Date.now(), networkVerified: true, ledger: 123,
      deployment: { status: "verified", code: null },
      liquidity: { status: "empty", pools: 0, fundedPools: 0, code: null },
      aggregator: { status: "not-deployed" }, quotesAvailable: false,
      swapPreparationAvailable: false, blockers: ["NO_POOLS", "AGGREGATOR_NOT_DEPLOYED"],
    };
    const body = path.endsWith("/readiness") ? readiness : path.endsWith("/tokens") ? { tokens: [] } :
      { error: { code: "NOT_CONFIGURED", message: "Endpoint unavailable in this fixture." } };
    await route.fulfill({ status: path.endsWith("/readiness") || path.endsWith("/tokens") ? 200 : 503,
      contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.route("https://horizon-testnet.stellar.org/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        core_latest_ledger: 123,
        history_latest_ledger: 123,
        network_passphrase: "Test SDF Network ; September 2015",
      }),
    });
  });
}

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );
  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await mockTestnetServices(page);
});

test("navigates from the landing page into the application", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Trade Beyond");
  await page.getByRole("link", { name: /launch app/i }).first().click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("keeps Mainnet disabled and Testnet restrictions visible", async ({ page }) => {
  await page.goto("/app/settings");
  await expect(page.getByText("Testnet only", { exact: true })).toBeVisible();
  await expect(page.locator(".setting-card").filter({ hasText: "Network" }).getByText("Stellar Testnet", { exact: true })).toBeVisible();
  await expect(page.getByText("Mainnet is intentionally disabled.")).toBeVisible();
});

test("navigates to swaps and blocks unverified contract writes", async ({ page }) => {
  await page.goto("/app");
  await page.getByRole("link", { name: /advanced swap/i }).click();
  await expect(page).toHaveURL(/\/app\/swap$/);
  await expect(page.getByRole("alert").filter({ hasText: "Write actions disabled" })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("no deployed aggregator yet");
  await expect(page.getByText("Stellar Testnet verified", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Prepare swap", exact: true })).toHaveCount(0);
});

test("landing and application routes have no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expectNoSeriousViolations(page);
});
