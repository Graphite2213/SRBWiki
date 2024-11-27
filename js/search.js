// Search function for all pages
function OnSearch(e)
{
    const query = e.target.value.toLowerCase();
    if (query.trim() == "" || query.length < 3) return document.getElementById("searchresults").innerHTML = "";

    const add = [];
    let last = "";
    const currTheme = CookieManager.GetCookie("theme");
    const isBlack = (currTheme == "light") ? "" : "srDarkTheme";
    window._searchMeta.pages.forEach(key => {
        if (!key.toLowerCase().includes(query.toLowerCase())) return;
        add.push(`<div onclick="InternalLink(event)" data-href="${key}" class="result ${isBlack}">${key}</div>`);
        last = key;
    });

    add.pop();
    add.push(`<div onclick="InternalLink(event)" data-href="${last}" class="result final ${isBlack}">${last}</div>`)
    document.getElementById("searchresults").innerHTML = add.join("");
}