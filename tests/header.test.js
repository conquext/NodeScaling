const Page = require("../helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => await page.close());

test("the header has the correct text", async () => {
  await page.waitFor("a.brand-logo");
  const text = await page.getContentsOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("click login starts oauth flow", async () => {
  await page.click(".right a");
  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows log out button", async () => {
  // real user id from db
  //   const id = "5e343ea9496fd67e9612ff90";
  await page.login();
  const text = await page.getContentsOf('a[href="/auth/logout"]');
  expect(text).toEqual("Logout");
}, 90000);
