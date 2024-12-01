// Search function for all pages
function OnSearch(e)
{
    const correctResults = (window.innerWidth > 641) ? "searchresults" : "resultsMobile";
    const query = e.target.value.toLowerCase();
    if (query.trim() == "" || query.length < 3) return document.getElementById(correctResults).innerHTML = "";

    const add = [];
    let last = "";
    let currTheme = CookieManager.GetCookie("theme");
    if (currTheme == '') 
    {
        CookieManager.SetCookie("theme", "light");
        currTheme = "light";
    }
    const isBlack = (currTheme == "light") ? "" : "srDarkTheme";
    window._searchMeta.pages.forEach(key => {
        if (!key.toLowerCase().includes(query.toLowerCase())) return;
        add.push(`<div onclick="InternalLink(event)" data-href="${key}" class="result ${isBlack}">${key}</div>`);
        last = key;
    });

    add.pop();
    add.push(`<div onclick="InternalLink(event)" data-href="${last}" class="result final ${isBlack}">${last}</div>`)
    document.getElementById(correctResults).innerHTML = add.join("");
}