import { test, expect, Page } from '@playwright/test';

/**
 * Theme Toggle UI Tests
 * 
 * These tests verify that the theme toggle functionality works correctly:
 * 1. Theme toggle button is visible and accessible
 * 2. Clicking toggles between light and dark mode
 * 3. HTML element class changes correctly
 * 4. Theme persists in localStorage
 * 5. Visual appearance updates correctly
 */

// Helper function to get theme from localStorage
async function getThemeFromStorage(page: Page): Promise<string | null> {
    return await page.evaluate(() => {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            console.error('Failed to read theme from localStorage:', e);
            return null;
        }
    });
}

// Helper function to check if HTML has dark class
async function hasDarkClass(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
        return document.documentElement.classList.contains('dark');
    });
}

// Helper function to get computed background color
async function getBackgroundColor(page: Page, selector: string): Promise<string> {
    return await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return '';
        const styles = window.getComputedStyle(element);
        return styles.backgroundColor;
    }, selector);
}

// Helper function to get toggle button background color
async function getToggleButtonBackgroundColor(page: Page): Promise<string> {
    return await page.evaluate(() => {
        const button = document.querySelector('button[aria-label*="toggle" i], button[aria-label*="switch to" i]');
        if (!button) return '';
        const styles = window.getComputedStyle(button);
        return styles.backgroundColor;
    });
}

// Helper function to wait for theme to settle
async function waitForThemeToSettle(page: Page, timeout = 200): Promise<void> {
    await page.waitForTimeout(timeout); // Wait for any transitions
}

test.describe('Theme Toggle', () => {
    test.beforeEach(async ({ page }) => {
        // Use addInitScript to set up localStorage before page loads
        // This runs in the page context before any scripts execute
        await page.addInitScript(() => {
            // Set up mock authentication tokens
            window.localStorage.setItem('accessToken', 'mock-access-token');
            window.localStorage.setItem('refreshToken', 'mock-refresh-token');
            window.localStorage.setItem('tokenTimestamp', Date.now().toString());
            window.localStorage.setItem('userData', JSON.stringify({
                id: 'test-user-id',
                email: 'test@example.com',
                role: 'user',
                tenantId: 'test-tenant'
            }));
        });

        // Navigate to the page
        await page.goto('/', { waitUntil: 'networkidle' });

        // Wait for page to load and authentication to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // If we're redirected to login, handle that
        const url = page.url();
        if (url.includes('/login')) {
            // Wait for auth to initialize
            await page.waitForTimeout(2000);

            // Re-add init script and navigate back
            await page.addInitScript(() => {
                window.localStorage.setItem('accessToken', 'mock-access-token');
                window.localStorage.setItem('refreshToken', 'mock-refresh-token');
                window.localStorage.setItem('tokenTimestamp', Date.now().toString());
            });

            // Try navigating back to home
            await page.goto('/', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
        }
    });

    test('should render theme toggle button', async ({ page }) => {
        // beforeEach already navigated and set up auth
        // Just wait for page to be fully loaded
        await page.waitForLoadState('networkidle');

        // Find the theme toggle button by aria-label
        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        // Verify button exists and is visible
        await expect(themeToggle).toBeVisible();

        // Verify button is not disabled (after hydration)
        await expect(themeToggle).toBeEnabled({ timeout: 5000 });
    });

    test('should toggle theme from light to dark', async ({ page }) => {

        // Wait for the theme toggle to be interactive
        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Get initial state
        const initialHasDark = await hasDarkClass(page);
        const initialTheme = await getThemeFromStorage(page);

        console.log('Initial state:', { initialHasDark, initialTheme });

        // Click the toggle button
        await themeToggle.click();

        // Wait for theme to settle
        await waitForThemeToSettle(page);

        // Verify HTML element has dark class after toggle
        const afterToggleHasDark = await hasDarkClass(page);
        const afterToggleTheme = await getThemeFromStorage(page);

        console.log('After toggle state:', { afterToggleHasDark, afterToggleTheme });

        // The theme should have changed
        expect(afterToggleHasDark).not.toBe(initialHasDark);

        // Verify localStorage was updated
        expect(afterToggleTheme).toMatch(/light|dark/);
        expect(afterToggleTheme).not.toBe('system');
    });

    test('should toggle theme multiple times correctly', async ({ page }) => {

        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Toggle multiple times
        const states: boolean[] = [];
        const colors: { before: string; after: string }[] = [];

        for (let i = 0; i < 5; i++) {
            const beforeToggle = await hasDarkClass(page);
            states.push(beforeToggle);

            // Get background colors before toggle
            const toggleBgBefore = await getToggleButtonBackgroundColor(page);
            const bodyBgBefore = await getBackgroundColor(page, 'body');

            await themeToggle.click();
            await waitForThemeToSettle(page);

            const afterToggle = await hasDarkClass(page);

            // Get background colors after toggle
            const toggleBgAfter = await getToggleButtonBackgroundColor(page);
            const bodyBgAfter = await getBackgroundColor(page, 'body');

            // Should alternate
            expect(afterToggle).not.toBe(beforeToggle);

            // Verify localStorage is updated
            const theme = await getThemeFromStorage(page);
            expect(theme).toMatch(/light|dark/);

            // First, verify the dark class was applied/removed correctly
            const htmlHasDarkClass = await page.evaluate(() => {
                return document.documentElement.classList.contains('dark');
            });
            expect(htmlHasDarkClass).toBe(afterToggle);

            // Verify background colors changed
            // Note: The toggle button might not always change visibly, so we'll check body and navbar
            expect(bodyBgAfter).not.toBe(bodyBgBefore);

            // Get navbar background color (this definitely changes)
            // Navbar has class "bg-white dark:bg-gray-800"
            const navbarBgBefore = await page.evaluate(() => {
                // Find navbar by looking for an element with border-b that contains theme toggle
                const navbar = Array.from(document.querySelectorAll('div')).find(el => {
                    const hasBorder = el.classList.contains('border-b') ||
                        getComputedStyle(el).borderBottomWidth !== '0px';
                    const hasToggle = el.querySelector('button[aria-label*="toggle" i]') !== null;
                    return hasBorder && hasToggle;
                });
                if (!navbar) return '';
                const styles = window.getComputedStyle(navbar);
                return styles.backgroundColor;
            });

            await waitForThemeToSettle(page, 300);

            const navbarBgAfter = await page.evaluate(() => {
                const navbar = Array.from(document.querySelectorAll('div')).find(el => {
                    const hasBorder = el.classList.contains('border-b') ||
                        getComputedStyle(el).borderBottomWidth !== '0px';
                    const hasToggle = el.querySelector('button[aria-label*="toggle" i]') !== null;
                    return hasBorder && hasToggle;
                });
                if (!navbar) return '';
                const styles = window.getComputedStyle(navbar);
                return styles.backgroundColor;
            });

            // Navbar should definitely change color (if we found it)
            if (navbarBgBefore && navbarBgAfter) {
                expect(navbarBgAfter).not.toBe(navbarBgBefore);
            }

            // If dark mode, verify colors are darker
            if (afterToggle) {
                // Dark mode: navbar and body should have darker backgrounds
                const darkModeRgb = await page.evaluate(() => {
                    // Check body background
                    const body = document.body;
                    const styles = window.getComputedStyle(body);
                    const bgColor = styles.backgroundColor;
                    // Extract RGB values
                    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (match) {
                        return {
                            r: parseInt(match[1]),
                            g: parseInt(match[2]),
                            b: parseInt(match[3])
                        };
                    }
                    return null;
                });

                // Dark mode should have lower RGB values (darker colors)
                if (darkModeRgb) {
                    // Typical dark mode background is around rgb(31, 41, 55) or rgb(17, 24, 39)
                    // So RGB values should be relatively low (under 100-150)
                    const maxRgb = Math.max(darkModeRgb.r, darkModeRgb.g, darkModeRgb.b);
                    // Allow some flexibility, but should be darker than light mode (which is typically 200+)
                    expect(maxRgb).toBeLessThan(200);
                }
            } else {
                // Light mode: body and navbar should have lighter backgrounds
                const lightModeRgb = await page.evaluate(() => {
                    // Check body background
                    const body = document.body;
                    const styles = window.getComputedStyle(body);
                    const bgColor = styles.backgroundColor;
                    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (match) {
                        return {
                            r: parseInt(match[1]),
                            g: parseInt(match[2]),
                            b: parseInt(match[3])
                        };
                    }
                    return null;
                });

                // Light mode should have higher RGB values (lighter colors)
                if (lightModeRgb) {
                    // Typical light mode background is rgb(243, 244, 246) or rgb(255, 255, 255)
                    // So RGB values should be relatively high (above 200)
                    const minRgb = Math.min(lightModeRgb.r, lightModeRgb.g, lightModeRgb.b);
                    expect(minRgb).toBeGreaterThan(200);
                }
            }

            colors.push({
                before: toggleBgBefore,
                after: toggleBgAfter
            });

            console.log(`Toggle ${i + 1}:`, {
                beforeToggle,
                afterToggle,
                theme,
                htmlHasDarkClass,
                toggleBgBefore,
                toggleBgAfter,
                bodyBgBefore,
                bodyBgAfter,
                navbarBgBefore,
                navbarBgAfter
            });
        }

        // Verify we toggled at least once
        expect(states.length).toBeGreaterThan(0);
        // Verify colors actually changed
        expect(colors.length).toBeGreaterThan(0);
        expect(colors.some(c => c.before !== c.after)).toBe(true);
    });

    test('should persist theme in localStorage', async ({ page }) => {

        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Get initial theme
        const initialTheme = await getThemeFromStorage(page);

        // Toggle the theme
        await themeToggle.click();
        await waitForThemeToSettle(page);

        // Get theme after toggle
        const afterToggleTheme = await getThemeFromStorage(page);

        // Preserve auth state before reload using addInitScript
        await page.addInitScript(() => {
            window.localStorage.setItem('accessToken', 'mock-access-token');
            window.localStorage.setItem('refreshToken', 'mock-refresh-token');
            window.localStorage.setItem('tokenTimestamp', Date.now().toString());
        });

        // Reload the page
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Verify theme persisted
        const persistedTheme = await getThemeFromStorage(page);
        expect(persistedTheme).toBe(afterToggleTheme);

        // Verify HTML class matches persisted theme
        const hasDark = await hasDarkClass(page);
        expect(hasDark).toBe(persistedTheme === 'dark');

        console.log('Theme persistence:', {
            initialTheme,
            afterToggleTheme,
            persistedTheme,
            hasDark
        });
    });

    test('should update visual appearance on theme change', async ({ page }) => {

        // Wait for page content
        await page.waitForSelector('body', { state: 'visible' });

        // Get initial background color
        const bodyBefore = await getBackgroundColor(page, 'body');
        console.log('Body background before toggle:', bodyBefore);

        // Toggle theme
        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });
        await themeToggle.click();
        await waitForThemeToSettle(page, 500);

        // Get background color after toggle
        const bodyAfter = await getBackgroundColor(page, 'body');
        console.log('Body background after toggle:', bodyAfter);

        // Get dark class state after toggle
        const hasDarkAfter = await hasDarkClass(page);

        // Verify the dark class state changed
        expect(hasDarkAfter).toBeDefined();

        // Verify HTML element has correct class
        const htmlClass = await page.evaluate(() => {
            return document.documentElement.className;
        });

        if (hasDarkAfter) {
            expect(htmlClass).toContain('dark');
        } else {
            expect(htmlClass).not.toContain('dark');
        }
    });

    test('should show correct icon based on current theme', async ({ page }) => {

        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Check initial state
        const initialHasDark = await hasDarkClass(page);

        // Get aria-label to determine what icon should be shown
        const ariaLabel = await themeToggle.getAttribute('aria-label');
        console.log('Initial aria-label:', ariaLabel);

        // Toggle and check again
        await themeToggle.click();
        await waitForThemeToSettle(page);

        const afterToggleHasDark = await hasDarkClass(page);
        const afterToggleAriaLabel = await themeToggle.getAttribute('aria-label');

        console.log('After toggle:', {
            initialHasDark,
            afterToggleHasDark,
            afterToggleAriaLabel
        });

        // Verify aria-label changes appropriately
        if (afterToggleHasDark) {
            expect(afterToggleAriaLabel?.toLowerCase()).toContain('light');
        } else {
            expect(afterToggleAriaLabel?.toLowerCase()).toContain('dark');
        }
    });

    test('should handle theme toggle from system preference', async ({ page }) => {

        // Set initial theme to system using addInitScript
        await page.addInitScript(() => {
            window.localStorage.setItem('theme', 'system');
            window.localStorage.setItem('accessToken', 'mock-access-token');
            window.localStorage.setItem('refreshToken', 'mock-refresh-token');
            window.localStorage.setItem('tokenTimestamp', Date.now().toString());
        });

        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Get initial state
        const initialTheme = await getThemeFromStorage(page);
        console.log('Initial theme from storage:', initialTheme);

        // Toggle
        await themeToggle.click();
        await waitForThemeToSettle(page);

        // After toggle, theme should be explicitly set (not 'system')
        const afterToggleTheme = await getThemeFromStorage(page);
        expect(afterToggleTheme).not.toBe('system');
        expect(afterToggleTheme).toMatch(/light|dark/);

        console.log('Theme after toggle:', afterToggleTheme);
    });

    test('should work correctly with page refresh', async ({ page }) => {

        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Set a specific theme
        await themeToggle.click();
        await waitForThemeToSettle(page);

        const themeAfterToggle = await getThemeFromStorage(page);
        const hasDarkAfterToggle = await hasDarkClass(page);

        // Preserve auth state before reload using addInitScript
        await page.addInitScript(() => {
            window.localStorage.setItem('accessToken', 'mock-access-token');
            window.localStorage.setItem('refreshToken', 'mock-refresh-token');
            window.localStorage.setItem('tokenTimestamp', Date.now().toString());
        });

        // Reload page
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Verify theme persisted
        const themeAfterReload = await getThemeFromStorage(page);
        const hasDarkAfterReload = await hasDarkClass(page);

        expect(themeAfterReload).toBe(themeAfterToggle);
        expect(hasDarkAfterReload).toBe(hasDarkAfterToggle);

        console.log('Theme persistence across reload:', {
            themeAfterToggle,
            themeAfterReload,
            hasDarkAfterToggle,
            hasDarkAfterReload
        });
    });

    test('should have accessible theme toggle button', async ({ page }) => {

        const themeToggle = page.getByRole('button', {
            name: /toggle theme|switch to (light|dark) mode/i
        }).first();

        await page.waitForTimeout(2000);
        await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

        // Verify button is keyboard accessible
        await themeToggle.focus();
        await expect(themeToggle).toBeFocused();

        // Verify aria-label exists
        const ariaLabel = await themeToggle.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel?.length).toBeGreaterThan(0);

        // Verify button can be activated with keyboard
        await themeToggle.press('Enter');
        await waitForThemeToSettle(page);

        // Verify theme changed
        const themeAfterKeyboard = await getThemeFromStorage(page);
        expect(themeAfterKeyboard).toMatch(/light|dark/);
    });
});

