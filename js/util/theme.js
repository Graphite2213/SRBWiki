function ThemeInit()
{
    if (CookieManager.GetCookie("theme") != null) return SwitchToTheme(CookieManager.GetCookie("theme"));
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) 
    {
        CookieManager.SetCookie("theme", "dark");
        const correctThemeSwitch = (window.innerWidth > 641) ? "themeSwitch" : "themeSwitchMobile";

        document.getElementById(correctThemeSwitch).innerText = lang[locale].LightThemeText;
    }
}

function ThemeToggle()
{
    if (CookieManager.GetCookie("theme") == "dark") SwitchToTheme("light");
    else SwitchToTheme("dark");
}

function SwitchToTheme(theme)
{
    const oppTheme = theme == "dark" ? "Light" : "Dark";
    CookieManager.SetCookie("theme", theme);
    const correctThemeSwitch = (window.innerWidth > 641) ? "themeSwitch" : "themeSwitchMobile";
    document.documentElement.style.colorScheme = theme;
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

    document.getElementById(correctThemeSwitch).innerText = lang[locale][`${oppTheme}ThemeText`];
}