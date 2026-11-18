import { test, expect } from '@playwright/test';
test('catalog controls, combined filters, empty state and reset', async ({ page },info) => {
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('7 of 7 tapes');
  await expect(page.locator('.record:visible')).toHaveCount(7);
  await page.getByLabel('Search the catalog').fill('tze231');
  await expect(page.locator('.record:visible')).toHaveCount(1);
  await expect(page.locator('.record:visible h3')).toHaveText('TZe-231');
  await page.getByRole('button',{name:'Reset filters'}).click();
  await page.getByLabel('Tape width',{exact:true}).selectOption('9');
  await page.getByLabel('Background color').selectOption('Clear');
  await expect(page.locator('.record:visible h3')).toHaveText('TZe-121');
  await page.getByLabel('Search the catalog').fill('not-a-tape');
  await expect(page.getByRole('heading',{name:'No matching tapes in this catalog.'})).toBeVisible();
  await page.getByRole('button',{name:'Show all tapes'}).click();
  await expect(page.locator('.record:visible')).toHaveCount(7);
  await page.getByRole('button',{name:'View 12 mm →'}).click();
  await expect(page.locator('.record:visible')).toHaveCount(3);
  await expect(page.getByLabel('Search the catalog')).toBeFocused();
  await page.getByRole('button',{name:'Reset filters'}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({path:`test-results/${info.project.name}.png`,fullPage:true});
});
test('navigation, guide disclosure and contact links',async({page})=>{
  await page.goto('/');
  await page.getByRole('link',{name:'Field guide',exact:true}).click();
  await expect(page).toHaveURL(/guide\.html$/);
  await page.getByText('Too much blank space around the text',{exact:true}).click();
  await expect(page.getByText(/Review the Half, Narrow and Chain Print/)).toBeVisible();
  for(const path of ['about.html','sources.html','privacy.html','disclosure.html','contact.html']){
    await page.goto('/'+path);
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await expect(page.getByRole('link',{name:'Open a correction on GitHub →'})).toHaveAttribute('href',/github\.com\/evanvenzor\/tapeshelf-reference\/issues\/new/);
});
test('keyboard focus, no tracking and no-JavaScript content',async({page,browser})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  expect(await page.evaluate(()=>({cookies:document.cookie,local:localStorage.length,session:sessionStorage.length}))).toEqual({cookies:'',local:0,session:0});
  const context=await browser.newContext({javaScriptEnabled:false});
  const plain=await context.newPage();await plain.goto('http://127.0.0.1:4173/');
  await expect(plain.locator('.record')).toHaveCount(7);
  await expect(plain.getByText(/All seven records are shown below/)).toBeVisible();
  await context.close();
});
