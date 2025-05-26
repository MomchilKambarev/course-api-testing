import { expect, test as setup } from "@playwright/test";

setup("Authentication", async ({ page }) => {
  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText("Sign in").click();
  await page.getByRole("textbox", { name: "Email" }).fill("m_copy@abv.bg");
  await page.getByRole("textbox", { name: "Password" }).fill("test1234");
  await page.getByRole("button").click();
  await expect(page.getByText("chill")).toBeVisible();

  await page.context().storageState({ path: "./auth/login.json" });
});
