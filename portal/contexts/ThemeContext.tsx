"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme as useNextTheme, ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeContextType {
    theme: string | undefined;
    resolvedTheme: string | undefined;
    toggleTheme: () => void;
    systemTheme: 'light' | 'dark' | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Log initial theme state
    if (typeof window !== 'undefined') {
        const initialTheme = localStorage.getItem('theme');
        const htmlHasDark = document.documentElement.classList.contains('dark');
        console.log('[ThemeProvider] Initializing with:', {
            localStorageTheme: initialTheme,
            htmlHasDark,
            systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
        });
    }

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="theme"
        >
            <ThemeProviderInner>{children}</ThemeProviderInner>
        </NextThemesProvider>
    );
}

function ThemeProviderInner({ children }: { children: ReactNode }) {
    const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();

    // Log theme changes for debugging
    React.useEffect(() => {
        console.log('[ThemeProviderInner] Theme state changed:', {
            theme,
            resolvedTheme,
            systemTheme,
            htmlHasDark: typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : 'N/A'
        });
    }, [theme, resolvedTheme, systemTheme]);

    const toggleTheme = () => {
        try {
            console.log('[ThemeContext] toggleTheme called');
            console.log('[ThemeContext] Current state:', {
                theme,
                resolvedTheme,
                systemTheme,
                htmlHasDark: typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : 'N/A',
                localStorageTheme: typeof window !== 'undefined' ? localStorage.getItem('theme') : 'N/A'
            });

            // Get the current effective/active theme
            // Priority: resolvedTheme > theme (if not 'system') > systemTheme > default to 'light'
            let currentActiveTheme: 'light' | 'dark';

            if (resolvedTheme) {
                // resolvedTheme is the actual active theme ('light' or 'dark')
                // It resolves 'system' to the actual system preference
                currentActiveTheme = resolvedTheme as 'light' | 'dark';
                console.log('[ThemeContext] Using resolvedTheme:', currentActiveTheme);
            } else if (theme && theme !== 'system') {
                // Theme is explicitly set to 'light' or 'dark'
                currentActiveTheme = theme as 'light' | 'dark';
                console.log('[ThemeContext] Using explicit theme:', currentActiveTheme);
            } else if (systemTheme) {
                // Fall back to system theme if available
                currentActiveTheme = systemTheme;
                console.log('[ThemeContext] Using systemTheme:', currentActiveTheme);
            } else {
                // Default to light if nothing else is available
                currentActiveTheme = 'light';
                console.log('[ThemeContext] Using default theme:', currentActiveTheme);
            }

            // Determine the new theme (opposite of current)
            const newTheme: 'light' | 'dark' = currentActiveTheme === 'dark' ? 'light' : 'dark';

            console.log('[ThemeContext] Toggling theme:', {
                from: currentActiveTheme,
                to: newTheme
            });

            // Set the new theme explicitly (not 'system')
            // next-themes will automatically add/remove the 'dark' class based on the theme
            setTheme(newTheme);

            console.log('[ThemeContext] setTheme called with:', newTheme);

            // Check immediately after setTheme
            if (typeof document !== 'undefined') {
                const htmlElement = document.documentElement;
                const hasDarkBefore = htmlElement.classList.contains('dark');
                console.log('[ThemeContext] HTML dark class before safety check:', hasDarkBefore);
            }

            // Ensure the dark class is applied/removed correctly after theme change
            // This is a safety check - next-themes should handle this automatically
            setTimeout(() => {
                if (typeof document !== 'undefined') {
                    const htmlElement = document.documentElement;
                    const hasDarkBefore = htmlElement.classList.contains('dark');

                    if (newTheme === 'dark') {
                        if (!htmlElement.classList.contains('dark')) {
                            console.log('[ThemeContext] Safety check: Adding dark class');
                            htmlElement.classList.add('dark');
                        } else {
                            console.log('[ThemeContext] Safety check: Dark class already present');
                        }
                    } else {
                        if (htmlElement.classList.contains('dark')) {
                            console.log('[ThemeContext] Safety check: Removing dark class');
                            htmlElement.classList.remove('dark');
                        } else {
                            console.log('[ThemeContext] Safety check: Dark class already removed');
                        }
                    }

                    const hasDarkAfter = htmlElement.classList.contains('dark');
                    console.log('[ThemeContext] HTML dark class after safety check:', {
                        before: hasDarkBefore,
                        after: hasDarkAfter,
                        expected: newTheme === 'dark',
                        matches: hasDarkAfter === (newTheme === 'dark')
                    });

                    // Also check localStorage
                    const storedTheme = localStorage.getItem('theme');
                    console.log('[ThemeContext] localStorage theme after toggle:', storedTheme);

                    // Check computed background color to verify theme is applied
                    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                    console.log('[ThemeContext] Body background color:', bodyBg);
                }
            }, 100);
        } catch (error) {
            console.error('[ThemeContext] Error toggling theme:', error);
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, systemTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
