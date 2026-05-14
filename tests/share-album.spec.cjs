const { test, expect } = require('@playwright/test');

const collection = {
  'MEX-2': { qty: 3, rarity: 'blue', variants: { base: 1, blue: 2, red: 0, purple: 0, green: 0, black: 0 } },
  'FWC-3': { qty: 1, rarity: 'base', variants: { base: 1, blue: 0, red: 0, purple: 0, green: 0, black: 0 } },
};

const mockPublicShare = async (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.route('**/rest/v1/rpc/get_shared_collection', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{
      share_id: '00000000-0000-0000-0000-000000000001',
      collection_data: collection,
      collection_updated_at: '2026-05-14T04:55:00.000Z',
    }]),
  }));

  await page.goto('http://127.0.0.1:5174/share/test-share', { waitUntil: 'networkidle' });
  return errors;
};

test('read-only share viewers can browse album teams and sticker inventory', async ({ page }) => {
  const errors = await mockPublicShare(page);

  await page.getByRole('button', { name: 'Album' }).click();
  await expect(page.getByText('Open a team to view its stickers')).toBeVisible();
  await page.getByText('Mexico').first().click();
  await expect(page.locator('#sticker-MEX-2')).toBeVisible();
  await page.locator('#sticker-MEX-2').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Color inventory', { exact: true })).toBeVisible();
  await expect(page.getByText('owned in this collection')).toBeVisible();
  await expect(page.getByText('Unmark sticker')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Add .* MEX-2/ })).toHaveCount(0);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Progress' }).click();
  await expect(page.getByText('Team Completion')).toBeVisible();
  await page.getByTitle('Mexico: 1/20').click();
  await expect(page.getByText('Open a team to view its stickers')).toBeVisible();
  await expect(page.locator('#sticker-MEX-2')).toBeVisible();

  expect(errors).toEqual([]);
});

test('read-only share album works on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await mockPublicShare(page);

  await expect(page.getByRole('button', { name: 'Album' })).toBeVisible();
  await page.getByRole('button', { name: 'Album' }).click();
  await expect(page.getByText('Open a team to view its stickers')).toBeVisible();
  await page.getByText('Mexico').first().click();
  await expect(page.locator('#sticker-MEX-2')).toBeVisible();
  await page.locator('#sticker-MEX-2').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('owned in this collection')).toBeVisible();
  await expect(page.getByText('Unmark sticker')).toHaveCount(0);

  expect(errors).toEqual([]);
});
