import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('loads the public home shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /Từ vựng thực tế cho mỗi ngày/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /A2 Vocabulary/ })).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('supports a direct nested route', async ({ page }) => {
  await page.goto('/levels/a2/topics')
  await expect(page.getByRole('heading', { level: 1, name: 'Hôm nay bạn muốn nói về điều gì?' })).toBeVisible()
  await page.getByRole('link', { name: /Mở chủ đề/ }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('studies a flashcard and persists review progress', async ({ page }) => {
  await page.goto('/levels/a2/topics/food-and-drinks/study/flashcards')
  await expect(page.getByRole('button', { name: /champagne/ })).toBeVisible()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: /rượu sâm banh/ })).toBeVisible()
  await page.getByRole('button', { name: 'Chưa thuộc' }).click()
  await page.reload()
  await page.goto('/levels/a2/review')
  await expect(page.getByRole('heading', { level: 1, name: 'Ôn tập' })).toBeVisible()
  await expect(page.getByRole('button', { name: /champagne/ })).toBeVisible()
})

test('removes a learned card from a multi-item review session immediately', async ({ page }) => {
  await page.goto('/levels/a2/topics/food-and-drinks/study/flashcards')
  const classificationButtons = page.locator('.flashcard-controls .button-row').first().getByRole('button')
  await classificationButtons.first().click()
  await page.locator('.flashcard-controls .button-row').nth(1).getByRole('button').nth(1).click()
  await classificationButtons.first().click()

  await page.goto('/levels/a2/review')
  await expect(page.getByRole('button', { name: /champagne/ })).toBeVisible()
  await page.locator('.flashcard-controls .button-row').first().getByRole('button').nth(1).click()

  await expect(page.getByRole('button', { name: /dessert/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /champagne/ })).toHaveCount(0)
  await expect(page.getByText('001 / 001')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('button', { name: /dessert/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /champagne/ })).toHaveCount(0)
  await expect(page.getByText('001 / 001')).toBeVisible()
})

test('does not run global Space shortcut while a classification button has focus', async ({ page }) => {
  await page.goto('/levels/a2/topics/food-and-drinks/study/flashcards')
  const learned = page.locator('.flashcard-controls .button-row').first().getByRole('button').nth(1)
  await learned.focus()
  await page.keyboard.press('Space')

  await expect(learned).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: /champagne/ })).toBeVisible()
  await expect(page.locator('.flashcard')).not.toHaveClass(/is-flipped/)
})

test('supports vocabulary search and has no horizontal overflow', async ({ page }) => {
  await page.goto('/vocabulary?level=a2&q=champagne')
  await expect(page.getByText('1 kết quả')).toBeVisible()
  await expect(page.getByText('champagne', { exact: true })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('shows explicit feedback in multiple choice and writing', async ({ page }) => {
  await page.goto('/levels/a2/topics/food-and-drinks/study/multiple-choice')
  await page.getByRole('button', { name: 'rượu sâm banh' }).click()
  await expect(page.getByRole('status')).toContainText('Chính xác')

  await page.goto('/levels/a2/topics/food-and-drinks/study/writing')
  await page.getByLabel('Từ tiếng Anh').fill('  CHAMPAGNE ')
  await page.getByRole('button', { name: 'Kiểm tra' }).click()
  await expect(page.getByRole('status')).toContainText('Chính xác')
})

test('completes a matching round with keyboard-operable buttons', async ({ page }) => {
  const definitionsByTerm = new Map([
    ['champagne', 'rượu sâm banh'], ['dessert', 'món tráng miệng'],
    ['garlic', 'tỏi'], ['knife', 'dao'],
    ['lemon', 'quả chanh'], ['lemonade', 'nước chanh'],
    ['pear', 'quả lê'], ['recipe', 'công thức nấu ăn'],
    ['soda', 'nước có ga'], ['soft drink', 'nước ngọt, nước có ga'],
  ])
  await page.goto('/levels/a2/topics/food-and-drinks/study/matching')
  await expect(page.getByRole('group', { name: 'Từ tiếng Anh' }).getByRole('button')).toHaveCount(5)
  for (let round = 0; round < 2; round += 1) {
    const terms = page.getByRole('group', { name: 'Từ tiếng Anh' }).last()
    const definitions = page.getByRole('group', { name: 'Nghĩa tiếng Việt' }).last()
    const availableTerms = terms.locator('button:not([disabled])')
    while (await availableTerms.count()) {
      const termButton = availableTerms.first()
      const term = (await termButton.textContent()).trim()
      const definition = definitionsByTerm.get(term)
      const selectedTerm = terms.getByRole('button', { name: term, exact: true })
      expect(definition, `missing matching fixture for ${term}`).toBeTruthy()
      await termButton.focus()
      await page.keyboard.press('Enter')
      await definitions.getByRole('button', { name: definition, exact: true }).focus()
      await page.keyboard.press('Enter')
      await expect(selectedTerm).toBeHidden()
    }
    const nextRound = page.getByRole('button', { name: 'Vòng tiếp theo' })
    if (await nextRound.isVisible()) {
      await nextRound.click()
      await expect(nextRound).toBeHidden()
      await expect(page.getByText('002 / 002')).toBeVisible()
      await expect(page.getByRole('group', { name: 'Từ tiếng Anh' }).last().getByRole('button')).toHaveCount(5)
    }
  }
  await expect(page.getByRole('heading', { name: 'Hoàn thành phiên học' })).toBeVisible()
})

test('downloads a filtered UTF-8 CSV', async ({ page }) => {
  await page.goto('/vocabulary?level=a2&topic=food-and-drinks&q=champagne')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tải CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('a2-food-and-drinks.csv')
  const content = await (await download.createReadStream()).toArray()
  expect(Buffer.concat(content).toString('utf8')).toContain('champagne,rượu sâm banh')
})

test('keeps the study workspace usable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/levels/a2/topics/food-and-drinks/study/flashcards')
  await expect(page.getByRole('navigation', { name: 'Chế độ học' }).getByRole('link')).toHaveCount(4)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})

test('opens the mobile menu into focus and restores focus on Escape', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'))
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Mở menu' })
  await trigger.click()
  await expect(page.getByRole('navigation', { name: 'Điều hướng trên thiết bị di động' }).getByRole('link', { name: 'Chủ đề' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Mở menu' })).toBeFocused()
})

test('requires confirmation before resetting topic progress', async ({ page }) => {
  await page.goto('/levels/a2/topics/food-and-drinks/study/flashcards')
  await page.getByRole('button', { name: 'Đã học' }).click()
  await page.goto('/levels/a2/topics/food-and-drinks')
  const trigger = page.getByRole('button', { name: 'Đặt lại chủ đề' })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Giữ nguyên' }).click()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole('button', { name: 'Đặt lại chủ đề', exact: true }).last().click()
  await expect(page.getByText('0/10 · 0%')).toBeVisible()
})

test('has no axe findings on representative learning surfaces', async ({ page }) => {
  const routes = [
    '/levels/a2/topics',
    '/levels/a2/topics/food-and-drinks',
    '/levels/a2/topics/food-and-drinks/study/flashcards',
    '/vocabulary?level=a2',
    '/levels/a2/progress',
  ]
  for (const route of routes) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, route).toEqual([])
  }
})

test('moves focus to the main heading on direct and asynchronous routes', async ({ page }) => {
  const routes = [
    '/levels/a2/topics/food-and-drinks',
    '/levels/a2/topics/food-and-drinks/study/flashcards',
    '/levels/a2/progress',
    '/not-a-route',
  ]

  for (const route of routes) {
    await page.goto(route)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toBeFocused()
  }
})

test('shows catalog recovery UI on every catalog-dependent route', async ({ page }) => {
  await page.route(/\.(csv|tsv)(?:\?|$)/, (route) => route.abort())
  const routes = [
    '/levels/a2/topics/food-and-drinks',
    '/levels/a2/topics/food-and-drinks/study/flashcards',
    '/levels/a2/review',
    '/vocabulary?level=a2',
    '/levels/a2/progress',
  ]

  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('.empty-state h1')).toBeVisible()
    await expect(page.locator('.empty-state button')).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, route).toEqual([])
  }
})
