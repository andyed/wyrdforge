import { test } from '@playwright/test';
import { readFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXAMPLES_DIR = resolve(__dirname, '../examples');
const SCREENSHOTS_DIR = resolve(__dirname, '../screenshots');

const CHARACTER_FILES = [
  'chad-thunderslug.wyrdforge.json',
  'moonbeam-mcgee.wyrdforge.json',
  'byte-nakamura.wyrdforge.json',
  'dj-stakeout.wyrdforge.json',
];

async function seedCharacters(page: any) {
  // Build the full characters map from example files
  const characters: Record<string, any> = {};
  let lastId = '';
  for (const file of CHARACTER_FILES) {
    const json = await readFile(resolve(EXAMPLES_DIR, file), 'utf-8');
    const char = JSON.parse(json);
    characters[char.id] = char;
    lastId = char.id;
  }

  // Inject into localStorage before navigation
  const envelope = {
    version: 1,
    data: { characters, activeCharacterId: lastId },
    savedAt: new Date().toISOString(),
  };

  await page.addInitScript((envStr: string) => {
    localStorage.setItem('dnd2024-characters', envStr);
  }, JSON.stringify(envelope));

  await page.goto('/wyrdforge/');
  await page.waitForTimeout(500);
}

test.describe('WyrdForge Screenshots', () => {
  test('01-landing-page', async ({ page }) => {
    await seedCharacters(page);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-landing-page.png`, fullPage: true });
  });

  test('02-character-sheet', async ({ page }) => {
    await seedCharacters(page);
    await page.getByRole('button', { name: 'Play' }).click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-character-sheet.png`, fullPage: true });
  });

  test('03-play-mode', async ({ page }) => {
    await seedCharacters(page);
    // Navigate directly via the nav bar Play button
    await page.getByRole('button', { name: 'Play' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-play-mode.png` });
  });

  test('04-play-mode-roll', async ({ page }) => {
    await seedCharacters(page);
    await page.getByRole('button', { name: 'Play' }).click();
    await page.waitForTimeout(500);
    await page.getByText('Athletics').first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-play-mode-roll.png` });
  });

  test('05-character-builder', async ({ page }) => {
    await seedCharacters(page);
    await page.getByRole('button', { name: '+ New Character' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-character-builder.png`, fullPage: true });
  });

  test('06-homebrew', async ({ page }) => {
    await seedCharacters(page);
    await page.getByRole('button', { name: 'Homebrew' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-homebrew.png`, fullPage: true });
  });
});
