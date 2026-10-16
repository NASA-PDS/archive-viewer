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

// Compare with rendered MUI components so library/theme changes catch style drift.
test('HTML disclosure matches the actual MUI divider, typography, and hover behavior', async ({ page, context, baseURL }) => {
    const readStyle = (locator, keys, pseudo = null) => locator.evaluate(async (element, { keys, pseudo }) => {
        getComputedStyle(element, pseudo).backgroundColor;
        await Promise.allSettled(element.getAnimations({ subtree: true }).map(animation => animation.finished));
        const style = getComputedStyle(element, pseudo);
        return Object.fromEntries(keys.map(key => [key, style[key]]));
    }, { keys, pseudo });
    const typography = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'];
    const transition = ['transitionProperty', 'transitionDuration', 'transitionDelay', 'transitionTimingFunction'];
    const divider = ['borderBottomWidth', 'borderBottomStyle', 'borderBottomColor'];

    await context.addCookies([{ name: 'SBNTHEME', value: 'dark', url: baseURL }]);
    await page.goto('/search/Targets/asteroid');
    const referenceButton = page.locator('.MuiListItemButton-root').first();
    await expect(referenceButton).toBeVisible();
    const expectedTypography = await readStyle(referenceButton.locator('.MuiTypography-root').first(), typography);
    const expectedTransition = await readStyle(referenceButton, transition);
    const buttonHeight = (await referenceButton.boundingBox()).height;
    const gutters = await referenceButton.locator('..').evaluate(element => {
        const style = getComputedStyle(element);
        return parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    });
    await referenceButton.hover();
    const expectedHover = await readStyle(referenceButton, ['backgroundColor']);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await referenceButton.focus();
    await expect(referenceButton).toHaveClass(/Mui-focusVisible/);
    const expectedFocus = await readStyle(referenceButton, ['backgroundColor']);

    await page.goto(`/${targetLid}/data`);
    const referenceCell = page.locator('.MuiTableCell-root').first();
    await expect(referenceCell).toBeVisible();
    const expectedDivider = await readStyle(referenceCell, divider);

    await page.goto(`/${targetLid}`);
    const details = page.locator('.custom details');
    const summary = details.locator('summary');
    await expect(summary).toBeVisible();
    expect(await readStyle(summary, typography)).toEqual(expectedTypography);
    expect(await readStyle(summary, divider)).toEqual(expectedDivider);
    expect(await readStyle(summary, transition, '::before')).toEqual(expectedTransition);
    expect((await summary.boundingBox()).height).toBeCloseTo(buttonHeight + gutters + parseFloat(expectedDivider.borderBottomWidth), 1);
    expect(await summary.evaluate(element => getComputedStyle(element).display)).toBe('list-item');
    expect(await summary.evaluate(element => getComputedStyle(element).listStyleType)).not.toBe('none');
    await summary.hover();
    await expect.poll(() => readStyle(summary, ['backgroundColor'], '::before')).toEqual(expectedHover);

    await expect(details.locator('table')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Instrument documentation', exact: true })).toBeVisible();
    const bounds = await summary.boundingBox();
    await page.mouse.click(bounds.x + bounds.width - 10, bounds.y + bounds.height / 2);
    await expect(details.locator('table')).toBeVisible();
    await expect(details.getByText('Legacy introduction.', { exact: true })).toBeVisible();
    await expect(details.getByText('Legacy bottom note.', { exact: true })).toBeVisible();
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await summary.focus();
    expect(await summary.evaluate(element => element.matches(':focus-visible'))).toBe(true);
    await expect.poll(() => readStyle(summary, ['backgroundColor'], '::before')).toEqual(expectedFocus);
    await summary.press('Enter');
    await expect(details.locator('table')).toBeHidden();
    await summary.press('Space');
    await expect(details.locator('table')).toBeVisible();
});
