// Switch to dark theme
function SwitchToDark() {
    CookieManager.SetCookie("theme", "dark");
    const themeText = (locale == "en") ? "Light theme" : "Svetli režim";

    for (x of document.querySelectorAll(".toolWrapper div")) {
        x.style.filter = "{ filter: contrast(0.2) invert(100%); } :hover { filter: contrast(1) invert(100%); }";
        x.classList.add("darkModif");
    }

    if (window._editorGlobal != null)
    {
        window._editorGlobal.setTheme("ace/theme/github_dark");
        if (wrapT) document.getElementById("wrapToggle").style.filter = "invert(100%) contrast(1)";
        if (highlightT) document.getElementById("highlightToggle").style.filter = "invert(100%) contrast(1)";
    } 
    document.getElementById("mainLayout").style.color = "#f0f0f0";
    document.getElementById("themeSwitch").innerText = themeText;
    document.getElementById("sidebar").style.backgroundColor = "#14141a";
    document.getElementById("mainArea").style.backgroundColor = "#1f202b";
    document.getElementById("themeSwitch").addEventListener("click", (e) => {
        e.preventDefault();
        SwitchToLight();
    });

    const switchables = document.getElementsByClassName("followMode");
    const switchablesInfobox = document.getElementsByClassName("followModeInfobox");

    for (e of switchables)
    {
        e.style.color = "#F0F0F0";
    }
    
    for (e of switchablesInfobox)
    {
        e.style.color = "#F0F0F0";
        e.style.backgroundColor = "rgb(20, 20, 26)";
    }
}

// Switch to light theme
function SwitchToLight() {
    CookieManager.SetCookie("theme", "light");
    const themeText = (locale == "en") ? "Dark theme" : "Tamni režim";

    document.getElementById("themeSwitch").addEventListener("click", (e) => {
        e.preventDefault();
        SwitchToDark();
    });


    if (window._editorGlobal != null)
    {
        window._editorGlobal.setTheme("ace/theme/github_light_default");
        if (wrapT) document.getElementById("wrapToggle").style.filter = "contrast(1)";
        if (highlightT) document.getElementById("highlightToggle").style.filter = "contrast(1)";
    }
    document.getElementById("mainLayout").style.color = "black";
    document.getElementById("themeSwitch").innerText = themeText;
    document.getElementById("sidebar").style.backgroundColor = "#e8e8e8";
    document.getElementById("mainArea").style.backgroundColor = "#fafafa"; 

    for (x of document.querySelectorAll(".toolWrapper div")) {
        x.classList.remove("darkModif");
    }

    const switchables = document.getElementsByClassName("followMode");
    const switchablesInfobox = document.getElementsByClassName("followModeInfobox");

    for (x of document.querySelectorAll(".toolWrapper div")) {
        x.style.filter = "0";
    }

    for (e of switchables)
    {
        e.style.color = "black";
    }

    for (e of switchablesInfobox)
    {
        e.style.color = "black";
        e.style.backgroundColor = "#e6e6e6";
    }
}