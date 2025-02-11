// Search function for all pages
function OnSearch(e)
{
    const correctResults = (window.innerWidth > 641) ? "searchresults" : "resultsMobile";
    const query = e.target.value.toLowerCase();
    let exactMatch = false;
    if (query.trim() == "" || query.length < 3) return document.getElementById(correctResults).innerHTML = "";

    const add = [];
    let currTheme = CookieManager.GetCookie("theme");
    if (currTheme == '') 
    {
        CookieManager.SetCookie("theme", "light");
        currTheme = "light";
    }
    const isBlack = (currTheme == "light") ? "" : "srDarkTheme";
    window._searchData.forEach(key => {
        if (!key.toLowerCase().includes(query)) return;
        if (!key.toLowerCase() == query) exactMatch = true;
        add.push(`<div onclick="InternalLink(this)" data-href="${key}" class="result ${isBlack}">${key}</div>`);
    });

    if (!exactMatch) add.push(`<div onclick="InternalLink(this)" data-href="${e.target.value.trim()}" class="result final ${isBlack}"><i>${lang[locale].CreatePageWith} ${e.target.value.trim()}</i></div>`);
    document.getElementById(correctResults).innerHTML = add.join("");
}