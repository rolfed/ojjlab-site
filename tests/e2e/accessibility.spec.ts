import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { PAGES } from './fixtures/test-data'

test.describe('Accessibility — WCAG 2.2 AA', () => {
  for (const page of PAGES) {
    test(`${page.path} has no violations`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path)

      const results = await new AxeBuilder({ page: browserPage })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze()

      expect(results.violations).toEqual([])
    })

    test(`${page.path} has correct page title`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path)
      await expect(browserPage).toHaveTitle(new RegExp(page.title))
    })

    test(`${page.path} skip link navigates to main content`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path)

      // Tab to skip link and activate it
      await browserPage.keyboard.press('Tab')
      await browserPage.keyboard.press('Enter')

      // Focus should be on main content
      const main = browserPage.locator('#main-content')
      await expect(main).toBeFocused()
    })

    test(`${page.path} nav link is marked as current page`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path)

      const currentLink = browserPage
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: page.navLabel })

      await expect(currentLink).toHaveAttribute('aria-current', 'page')
    })
  }
})
