// Search function for all pages
const correctResults = (window.innerWidth > mobileTreshold) ? "searchresults" : "resultsMobile";

/**
 * Search entire wiki
 * @returns {void}
 * @param {Event} e - Event
 */
function OnSearch(e)
{
    ShowSearch();
    const query = e.target.value.toLowerCase();
    let exactMatch = false;
    if (query.trim() == "" || query.length < 3) return document.getElementById(correctResults).innerHTML = "";

    const add = [];
    const isBlack = (theme == "light") ? "" : "srDarkTheme";
    searchData.forEach(key =>
    {
        if (!key.toLowerCase().includes(query)) return;
        if (!key.toLowerCase() == query) exactMatch = true;
        add.push(`<div onclick="InternalLink(this)" data-href="${key}" class="result ${isBlack}">${key}</div>`);
    });

    if (!exactMatch) add.push(`<div onclick="InternalLink(this)" data-href="${e.target.value.trim()}" class="result final ${isBlack}"><i>${lang[locale].CreatePageWith} ${e.target.value.trim()}</i></div>`);
    document.getElementById(correctResults).innerHTML = add.join("");
}

/**
 * Hides results when unfocused
 * @returns {void}
 */
function HideSearch() { document.getElementById(correctResults).style.display = "none"; }

/**
 * Shows results when focused again
 * @returns {void}
 */
function ShowSearch() { document.getElementById(correctResults).style.display = "block"; }