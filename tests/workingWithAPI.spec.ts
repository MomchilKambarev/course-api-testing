import { test, expect } from "@playwright/test"
import tags from "../test-data/tags.json";

test.beforeEach(async ({ page }) => {
  await page.route("*/**/api/tags", async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags),
    });
  });

  await page.goto("https://conduit.bondaracademy.com/");
});

test("has title", async ({ page }) => {
  await page.route("*/**/api/articles*", async (route) => {
    const response = await route.fetch();
    const responseBody = await response.json();
    responseBody.articles[0].title = "This is a MOCK test title";
    responseBody.articles[0].description = "This is a MOCK description";

    await route.fulfill({
      body: JSON.stringify(responseBody),
    });
  });

  await page.getByText("Global Feed").click();
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  await expect(page.locator("app-article-preview h1").first()).toHaveText(
    "This is a MOCK test title"
  );
  await expect(page.locator("app-article-preview p").first()).toHaveText(
    "This is a MOCK description"
  );
});

test("Perform API request", async ({ page, request }) => {
  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: {
          email: "m_copy@abv.bg",
          password: "test1234",
        },
      },
    }
  );
  const responseBody = await response.json();
  const token = responseBody.user.token;
  console.log(responseBody);

  let randomNum = Math.floor(Math.random() * 100);

  const articleCall = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        article: {
          title: `New test article ${randomNum}`,
          description: "description of test article",
          body: "Something interesting going on in here",
          tagList: [],
        },
      },
      headers: { Authorization: `Token ${token}` },
    }
  );

  expect(articleCall.status()).toBe(201);

  await page.getByText("Global Feed").click();
  await page
    .locator("app-article-list h1", { hasText: `New test article` })
    .first()
    .click();
  await page.getByRole("button", { name: " Delete Article " }).first().click();

  await expect(page.locator("app-article-preview p").first()).not.toHaveText(
    "This is a MOCK description"
  );
});

test("Delete article", async ({ page, request }) => {
  let randomNum = Math.floor(Math.random() * 100);

  await page.getByText("New Article").click();
  await page
    .getByPlaceholder("Article Title")
    .fill(`Playwright is awesome${randomNum}`);
  await page.getByPlaceholder("What's this article about?").fill("Description");
  await page
    .getByPlaceholder("Write your article (in markdown)")
    .fill("Article's content here");
  await page.getByRole("button", { name: "Publish Article" }).click();

  const createArticle = await page.waitForResponse(
    "https://conduit-api.bondaracademy.com/api/articles/"
  );
  const articleResponse = await createArticle.json();
  const articleId = await articleResponse.article.slug;

  await page.locator(".navbar-brand", { hasText: "conduit" }).click();
  await page.getByText("Global Feed").click();

  await expect(
    page.locator("app-article-list app-article-preview h1").first()
  ).toHaveText(`Playwright is awesome${randomNum}`);

  const response = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: {
          email: "m_copy@abv.bg",
          password: "test1234",
        },
      },
    }
  );
  const responseBody = await response.json();
  const token = responseBody.user.token;
  console.log(responseBody);

  const deleteResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${articleId}`,
    {
      headers: { Authorization: `Token ${token}` },
    }
  );

  expect(deleteResponse.status()).toBe(204);
});