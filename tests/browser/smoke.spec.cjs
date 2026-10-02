const { test: base, expect } = require('@playwright/test')
const { targetLid, bundleLid, collectionLid } = require('./solr-fixture.cjs')

// Attach observers before the first navigation. Report errors with every test,
// including hydration failures and failed local assets/API requests.
const test = base.extend({
    page: async ({ page, baseURL }, use) => {
        const failures = []
        page.on('pageerror', error => failures.push(`Uncaught: ${error.message}`))
        page.on('console', message => {
            if (message.type() === 'error') failures.push(`Console: ${message.text()}`)
        })
        page.on('response', response => {
            if (response.status() >= 400) failures.push(`HTTP ${response.status()}: ${response.url()}`)
        })
        page.on('requestfailed', request => {
            if (request.failure()?.errorText !== 'net::ERR_ABORTED') {
                failures.push(`Request failed: ${request.url()} (${request.failure()?.errorText})`)
            }
        })
        await page.route('**/*', route => {
            const url = new URL(route.request().url())
            if (url.origin === baseURL) return route.continue()
            // These third-party widgets/fonts are independent of our library
            // upgrades. Stub only their exact paths; unexpected traffic fails.
            const externalAssets = new Set([
                'https://www.google.com/recaptcha/api.js',
                'https://fonts.googleapis.com/css',
                'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
                'https://pds.nasa.gov/pds-app-bar/pds-app-bar.js',
                'https://pds.nasa.gov/pds-app-bar/pds-app-bar.css',
                'https://sbn.psi.edu/sbn-bar/sbn-bar.js',
            ])
            if (externalAssets.has(`${url.origin}${url.pathname}`)) {
                return route.fulfill({ status: 200, contentType: route.request().resourceType() === 'stylesheet' ? 'text/css' : 'application/javascript', body: '' })
            }
            failures.push(`Unexpected external request: ${url.href}`)
            return route.abort()
        })
        await use(page)
        expect(failures, 'Browser errors, hydration errors, or failed requests').toEqual([])
    },
})

test('home page renders images and navigates through a featured target link', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Archive Navigator', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'View product' })).toBeDisabled()
    for (const name of ['PDS Logo', 'SBN Logo', 'PSI Logo']) {
        const image = page.getByRole('img', { name, exact: true })
        await expect(image).toBeVisible()
        await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true)
    }
    await page.getByRole('button', { name: 'Bennu', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(targetLid))
    await expect(page.getByRole('heading', { name: 'Bennu Information Page' })).toBeVisible()
    await expect(page.getByText('Supplemental Bennu description.', { exact: true })).toBeVisible()
})

test('LID form supports keyboard submission, versioned identifiers, and reload', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('textbox', { name: 'LID', exact: true }).fill(` ${targetLid}::1.0 `)
    await expect(page.getByRole('button', { name: 'View product' })).toBeEnabled()
    await page.getByRole('textbox', { name: 'LID', exact: true }).press('Enter')
    await expect(page.getByRole('heading', { name: 'Bennu Information Page' })).toBeVisible()
    await expect(page).toHaveTitle('Bennu - NASA Planetary Data System')
    expect(decodeURIComponent(new URL(page.url()).pathname)).toBe(`/${targetLid}::1.0`)
    await page.reload()
    await expect(page.getByText('Supplemental Bennu description.', { exact: true })).toBeVisible()
})

test('derived data tab, expandable table, collection detail, and bundle navigation work', async ({ page }) => {
    await page.goto(`/${targetLid}`)
    await page.getByRole('tab', { name: 'Derived Data', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Derived Bennu Data', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Bennu Sample Bundle', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'expand row', exact: true }).click()
    await expect(page.getByText('Data in this bundle', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Bennu Sample Collection', exact: true }).click()
    await expect(page.getByRole('heading', { name: /Bennu Sample Collection/ })).toBeVisible()
    expect(new URL(page.url()).pathname).toBe(`/${collectionLid}`)
    await page.getByRole('link', { name: 'Bundle', exact: true }).click()
    await expect(page.getByRole('heading', { name: /Bennu Sample Bundle/ })).toBeVisible()
    expect(new URL(page.url()).pathname).toBe(`/${bundleLid}`)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Bennu Sample Collection', exact: true })).toBeVisible()
})

test('tag search fetches through the real browser proxy and links to its result', async ({ page }) => {
    const proxyResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/proxy/web/web-targets-alias')
    await page.goto('/search/Targets/asteroid')
    expect((await proxyResponse).status()).toBe(200)
    await expect(page.getByRole('heading', { name: 'Targets tagged with asteroid', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Bennu', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Bennu Information Page' })).toBeVisible()
})

test('light and dark theme cookies survive server rendering and hydration', async ({ page, context, baseURL }) => {
    await page.goto('/search/Targets/asteroid')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(18, 24, 29)')
    await context.addCookies([{ name: 'SBNTHEME', value: 'light', url: baseURL }])
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Targets tagged with asteroid' })).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})
