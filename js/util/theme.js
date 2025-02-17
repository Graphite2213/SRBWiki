// Theme settings on the site

/**
 * Initiate theme on page load
 * @returns {void}
 */
function ThemeInit()
{
    // If not null switch to that theme
    if (CookieManager.GetCookie("theme") != null) return SwitchToTheme(CookieManager.GetCookie("theme"));

    // If the cookie is null just make it (preferred)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) 
    {
        CookieManager.SetCookie("theme", "dark");
        const correctThemeSwitch = (window.innerWidth > mobileTreshold) ? "themeSwitch" : "themeSwitchMobile";

        document.getElementById(correctThemeSwitch).innerText = lang[locale].LightThemeText;
    }
}

/**
 * Switch to other theme
 * @returns {void}
 */
function ThemeToggle()
{
    if (CookieManager.GetCookie("theme") == "dark") SwitchToTheme("light");
    else SwitchToTheme("dark");
}

/**
 * New theme settings
 * @returns {void}
 * @param {("dark"|"light")} theme - Which theme you're switching to
 */
function SwitchToTheme(theme)
{
    // Switch to other theme
    const oppTheme = theme == "dark" ? "Light" : "Dark";
    CookieManager.SetCookie("theme", theme);

    // Change correct theme flip text 
    const correctThemeSwitch = (window.innerWidth > mobileTreshold) ? "themeSwitch" : "themeSwitchMobile";
    document.documentElement.style.colorScheme = theme;

    // Change root vars and editor theme
    const rootSel = document.querySelector(':root');
    if (theme == "dark")
    {
        if (typeof editorInstance != "undefined") editorInstance.aceInstance.setTheme("ace/theme/github_dark");
        rootSel.style.setProperty("--toolbar-item-filter", "invert(100%) contrast(1)");
    }
    else 
    {
        if (typeof editorInstance != "undefined") editorInstance.aceInstance.setTheme("ace/theme/github_light_default");
        rootSel.style.setProperty("--toolbar-item-filter", "contrast(1)");
    }

    // New theme text
    document.getElementById(correctThemeSwitch).innerText = lang[locale][`${oppTheme}ThemeText`];
}