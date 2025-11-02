# Theme Toggle UI Tests

This directory contains Playwright UI tests for the theme toggle functionality.

## Running Tests

### Run all tests
```bash
npm run test
```

### Run theme toggle tests only
```bash
npm run test:theme
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run tests with UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

## Test Coverage

The theme toggle tests verify:

1. **Visibility & Accessibility**
   - Theme toggle button is visible
   - Button is enabled and interactive
   - Button is keyboard accessible
   - Proper aria-labels are present

2. **Theme Toggle Functionality**
   - Clicking toggles between light and dark mode
   - HTML element class changes correctly (`dark` class added/removed)
   - Theme state updates in localStorage
   - Multiple toggles work correctly

3. **Persistence**
   - Theme persists in localStorage
   - Theme is restored after page refresh
   - Theme survives page reload

4. **Visual Updates**
   - Background colors change appropriately
   - Visual appearance updates correctly
   - Icon changes based on current theme

5. **Edge Cases**
   - Works from 'system' theme preference
   - Handles initial state correctly
   - Works with keyboard navigation

## Test Structure

Tests are located in `tests/theme-toggle.spec.ts` and use Playwright's testing framework.

## Requirements

- Node.js 18+
- Next.js dev server running (tests will start it automatically)
- Playwright browsers installed (run `npx playwright install` if needed)

## Debugging Failed Tests

If a test fails:

1. Run tests in headed mode to see what's happening:
   ```bash
   npm run test:headed
   ```

2. Use debug mode to step through tests:
   ```bash
   npm run test:debug
   ```

3. Check the Playwright report:
   ```bash
   npx playwright show-report
   ```

4. View screenshots and videos in the `test-results/` directory

