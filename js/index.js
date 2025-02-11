// Constants (development values)
//const fetchURL = "http://localhost:4000";
//const selfURL = "http://localhost:8080"

// Constants (deployment values)
const fetchURL = "https://data.graphite.in.rs/";
const selfURL = window.location.origin;
const currentPage = window.location.pathname.split("/").pop();
const globalHeaders = { Accept: "text/plain" };
const historyElemPerPage = 15;
const lang = window._languageDiff;

// Global variables
let pageTitle = "home";
let locale;
let oppLocale;
let theme;
let historyPageNum = 1;
let historyPages = ["", ""];
let userCache = new Map();
let existenceCache = new Map();
let unchangedPostText = "";
let isMobile = false;

/*** @type {Editor} */
let editorInstance;

// Initialize sitewide variables (used in shadow DOM too)
window._userData = {};
window._titles = [];
window._searchData = "";
window._backendWorker = `http://127.0.0.1:8787`;
window._pageExists = true;
window._editingNews = false;
window._editingFeatured = false;
window._creatingNewPage = false;

// On site load
async function OnLoad(l) 
{
    // Set theme, locale and opposing locale
    theme = CookieManager.GetCookie("theme");
    locale = l;
    ThemeInit();
    if (locale == 'en') oppLocale = 'rs';
    else oppLocale = 'en';

    window.BackgroundCheck();
    LoadSearch();
    if (currentPage == "wiki") await LoadPost();
    if (currentPage == "home") await LoadHomeContent();

    // Check for GitHub auth
    const gh = CookieManager.GetCookie("github-auth");
    if (typeof gh == "string") window.SetUserData(gh, locale, pageTitle);
    else document.getElementById("loginWithGH").style.display = "flex";

    // Once everything is loaded, show the page
    document.body.style.visibility = "visible";

    editorInstance = new Editor("editorInput", "editorOutput", "postText", "loginPrompt", "toolbar");
    if (currentPage == "sandbox") await EditorInitLoad();
}

// Load the sidebar
function LoadSidebar()
{
    // For the "wiki" part of the wiki (pages n stuff) load the content
    if (currentPage == "wiki")
    {
        setTimeout(() => 
        {
            let allTitles = `<li><b>(Top)</b></li>`;
            window._titles.forEach(e => 
            {
                allTitles += `<li><a class="contentListChild" onclick="ScrollHeaderIntoView(event)">${e}</a></li>`;
            });
            document.getElementById("pageContent").innerHTML = allTitles;
        }, 50);
    }
}

function SetSidebarLogin() {
    const gh = CookieManager.GetCookie("github-auth");
    if (gh != "" && typeof gh != "undefined")
    {
        document.getElementById("loginSidebar").classList.remove("sidebarLink");
        document.getElementById("loginSidebar").classList.add("sidebarText");
        document.getElementById("loginSidebar").setAttribute("onclick", "");
        document.getElementById("loginSidebar").innerHTML = `${lang[locale].LoggedInAs} <a class="sidebarLink" style="display: inline" onclick="ShowUserData('${window._ghInfo.login}')">${window._ghInfo.login}</a>`;
        document.getElementById("logoutLink").style.display = "block";
    }  
};

async function LoadHomeContent() {
    const featuredText = await fetch(fetchURL + `${locale}/featured.html`, { method: "GET" });
    const newsText = await fetch(fetchURL + `${locale}/featured.html`, { method: "GET" });
    const searchData = await fetch(window._backendWorker + `/search/${locale}`);

    document.getElementById("newsList").innerHTML = await newsText.text();
    document.getElementById("featuredList").innerHTML = await featuredText.text();
    window._searchData = (await searchData.json()).pages;
}

async function EditNewsTile()
{
    const allButtons = editorInstance.toolbar.toolbarButtons;
    let seen = false;
    for (let [x, y] of allButtons)
    {
        if (x == "backButton") continue;
        if (x == "previewButton") break;
        if (seen) editorInstance.toolbar.HideButton(x);
        if (x == "redo") seen = true;
    }

    editorInstance.OpenEditor(document.getElementById("newsList").innerHTML, false);
}

async function EditFeaturedTile()
{
    const allButtons = editorInstance.toolbar.toolbarButtons;
    let seen = false;
    for (let [x, y] of allButtons)
    {
        if (x == "backButton") continue;
        if (x == "previewButton") break;
        if (seen) editorInstance.toolbar.HideButton(x);
        if (x == "redo") seen = true;
    }

    editorInstance.OpenEditor(document.getElementById("featuredList").innerHTML, false);
}

async function LoadSearch()
{
    const response3 = await fetch(window._backendWorker + `/search/${locale}`);
    window._searchData = (await response3.json()).pages;
}

window.SetSidebarLogin = SetSidebarLogin;