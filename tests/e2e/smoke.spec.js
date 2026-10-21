import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const topicPath = '/levels/general/topics/family'
const flashcardPath = `${topicPath}/study/flashcards`

test('loads the public home shell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: /Từ vựng thực tế cho mỗi ngày/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Vocabulary/ })).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('supports direct and legacy nested routes', async ({ page }) => {
  await page.goto('/levels/a2/topics')
  await expect(page).toHaveURL(/\/levels\/general\/topics$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Hôm nay bạn muốn nói về điều gì?' })).toBeVisible()
  await page.getByRole('link', { name: /Mở chủ đề/ }).first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('pronounces a term without flipping the card', async ({ page }) => {
  await page.addInitScript(() => {
    window.__spoken = []
    window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
      constructor(text) { this.text = text }
    }
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: () => window.__spoken.push('cancel'),
        getVoices: () => [{ lang: 'en-US', name: 'English' }],
        speak: (utterance) => window.__spoken.push(utterance.text),
      },
    })
  })
  await page.goto(flashcardPath)
  await page.getByRole('button', { name: /Pronounce parent/ }).click()
  expect(await page.evaluate(() => window.__spoken)).toEqual(['cancel', 'parent'])
  await expect(page.locator('.flashcard')).not.toHaveClass(/is-flipped/)
})

test('supports visible and keyboard previous/next navigation', async ({ page }) => {
  await page.goto(flashcardPath)
  const previous = page.getByRole('button', { name: 'Thẻ trước' })
  await expect(previous).toBeDisabled()
  await expect(page.locator('.flashcard')).toContainText('parent')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.flashcard')).toContainText('father')
  await expect(previous).toBeEnabled()
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('.flashcard')).toContainText('parent')
  await page.keyboard.press('Space')
  await expect(page.locator('.flashcard')).toHaveClass(/is-flipped/)
})

test('studies a flashcard and persists review progress', async ({ page }) => {
  await page.goto(flashcardPath)
  await page.getByRole('button', { name: 'Cần ôn' }).click()
  await page.reload()
  await page.goto('/levels/general/review')
  await expect(page.getByRole('heading', { level: 1, name: 'Ôn tập' })).toBeVisible()
  await expect(page.locator('.flashcard')).toContainText('parent')
})

test('removes a learned card from a multi-item review session immediately', async ({ page }) => {
  await page.goto(flashcardPath)
  await page.getByRole('button', { name: 'Cần ôn' }).click()
  await page.getByRole('button', { name: 'Thẻ tiếp theo' }).click()
  await page.getByRole('button', { name: 'Cần ôn' }).click()
  await page.goto('/levels/general/review')
  await expect(page.locator('.flashcard')).toContainText('parent')
  await page.getByRole('button', { name: 'Đã học' }).click()
  await expect(page.locator('.flashcard')).toContainText('father')
  await expect(page.locator('.flashcard')).not.toContainText('parent')
  await expect(page.getByText('001 / 001')).toBeVisible()
  await page.reload()
  await expect(page.locator('.flashcard')).toContainText('father')
  await expect(page.locator('.flashcard')).not.toContainText('parent')
})

test('does not run the global Space shortcut while a control has focus', async ({ page }) => {
  await page.goto(flashcardPath)
  const learned = page.getByRole('button', { name: 'Đã học' })
  await learned.focus()
  await page.keyboard.press('Space')
  await expect(learned).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.flashcard')).toContainText('parent')
  await expect(page.locator('.flashcard')).not.toHaveClass(/is-flipped/)
})

test('renders every topic word directly without a view-all action', async ({ page }) => {
  await page.goto(topicPath)
  const section = page.getByRole('heading', { name: 'Từ trong chủ đề' }).locator('..').locator('..')
  await expect(section.getByRole('listitem')).toHaveCount(36)
  await expect(section.getByRole('link', { name: /Xem tất cả/i })).toHaveCount(0)
})

test('supports vocabulary search and has no horizontal overflow', async ({ page }) => {
  await page.goto('/vocabulary?level=general&q=firefighter')
  await expect(page.getByText('1 kết quả')).toBeVisible()
  await expect(page.getByText('firefighter', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
})

test('shows explicit feedback in multiple choice and writing', async ({ page }) => {
  await page.goto(`${topicPath}/study/multiple-choice`)
  await page.getByRole('button', { name: 'Bố hoặc mẹ' }).click()
  await expect(page.getByRole('status')).toContainText('Chính xác')
  await page.goto(`${topicPath}/study/writing`)
  await page.getByLabel('Từ tiếng Anh').fill('  PARENT ')
  await page.getByRole('button', { name: 'Kiểm tra' }).click()
  await expect(page.getByRole('status')).toContainText('Chính xác')
})

test('operates a matching round with the keyboard', async ({ page }) => {
  const definitionsByTerm = new Map([
    ['parent', 'Bố hoặc mẹ'], ['father', 'Bố'], ['mother', 'Mẹ'],
    ['child', 'Con cái (số ít)'], ['children', 'Con cái (số nhiều)'], ['son', 'Con trai'],
  ])
  await page.goto(`${topicPath}/study/matching`)
  const terms = page.getByRole('group', { name: 'Từ tiếng Anh' })
  const definitions = page.getByRole('group', { name: 'Nghĩa tiếng Việt' })
  await expect(terms.getByRole('button')).toHaveCount(6)
  const availableTerms = terms.locator('button:not([disabled])')
  while (await availableTerms.count()) {
    const termButton = availableTerms.first()
    const term = (await termButton.textContent()).trim()
    const definition = definitionsByTerm.get(term)
    expect(definition, `missing matching fixture for ${term}`).toBeTruthy()
    await termButton.focus()
    await page.keyboard.press('Enter')
    await definitions.getByRole('button', { name: definition, exact: true }).focus()
    await page.keyboard.press('Enter')
  }
  await expect(page.getByRole('button', { name: /Vòng tiếp theo/ })).toBeVisible()
})

test('downloads a filtered UTF-8 CSV', async ({ page }) => {
  await page.goto('/vocabulary?level=general&topic=family&q=parent')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Tải CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('general-family.csv')
  const content = await (await download.createReadStream()).toArray()
  expect(Buffer.concat(content).toString('utf8')).toContain('parent,Bố hoặc mẹ')
})

test('keeps the study workspace usable at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto(flashcardPath)
  await expect(page.getByRole('navigation', { name: 'Chế độ học' }).getByRole('link')).toHaveCount(4)
  await expect(page.getByRole('button', { name: /Pronounce parent/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Thẻ trước' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Thẻ tiếp theo' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false)
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
  await page.goto(flashcardPath)
  await page.getByRole('button', { name: 'Đã học' }).click()
  await page.goto(topicPath)
  const trigger = page.getByRole('button', { name: 'Đặt lại chủ đề' })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Giữ nguyên' }).click()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole('button', { name: 'Đặt lại chủ đề', exact: true }).last().click()
  await expect(page.getByText('0/36 · 0%')).toBeVisible()
})

test('has no axe findings on representative learning surfaces', async ({ page }) => {
  const routes = ['/levels/general/topics', topicPath, flashcardPath, '/vocabulary?level=general', '/levels/general/progress']
  for (const route of routes) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, route).toEqual([])
  }
})

test('moves focus to the main heading on direct and asynchronous routes', async ({ page }) => {
  for (const route of [topicPath, flashcardPath, '/levels/general/progress', '/not-a-route']) {
    await page.goto(route)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toBeFocused()
  }
})

test('shows catalog recovery UI on every catalog-dependent route', async ({ page }) => {
  await page.route(/\.(csv|tsv)(?:\?|$)/, (route) => route.abort())
  const routes = [topicPath, flashcardPath, '/levels/general/review', '/vocabulary?level=general', '/levels/general/progress']
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('.empty-state h1')).toBeVisible()
    await expect(page.locator('.empty-state button')).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations, route).toEqual([])
  }
})
