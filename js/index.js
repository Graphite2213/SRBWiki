/// <reference path="./types/index.d.ts"/>

// Constants (development values)
//const fetchURL = "http://localhost:4000";
//const selfURL = "http://localhost:8080"

// Constants (deployment values)
const fetchURL = "https://data.graphite.in.rs/";
const workerURL = `https://bolognese.graphite2264.workers.dev`;
const selfURL = window.location.origin;
const lang = window._languageDiff;

// Other hardcoded values
const historyElemPerPage = 15;
const mobileTreshold = 780; // in px, consistent with CSS

// Global variables
let unchangedPostText = document.getElementById("postText").innerHTML.replaceAll("<p>", "").replaceAll("</p>", "");
let pageTitle = decodeURIComponent(window.location.pathname.split("/").pop());
let locale = window.location.pathname.split("/")[1];
let theme;
let editingTile = "";
let editingETag = "";
let historyPageNum = 1;
let historyPages = ["", ""];
let articleTitles = [];
let searchData = [];
let userCache = new Map();
let linkCache = new Map();
let pageExists = false;
let creatingNewPage = false;
let loggedIn = false;
let previewingPage = false;

/*** @type {Wiki.PageData} */
let pageMetadata;

/*** @type {Wiki.UserData} */
let userData;

/*** @type {Editor} */
let editorInstance;

/**
 * Site entry point
 * @returns {Promise<void>}
 * @param {string} l - Locale in which the page will be shown
 * @param {boolean} ps_pageExists - Pseudo var of page's existence, filled by router
 */
async function OnLoad(l, ps_pageExists = true) 
{
    // Set theme, locale
    document.getElementById("mainArea").style.visibility = "visible";
    theme = CookieManager.GetCookie("theme");
    ThemeInit();

    locale = l;
    pageExists = ps_pageExists;

    // Check for GitHub auth
    const gh = CookieManager.GetCookie("github-auth");
    if (typeof gh == "string") await GetUserData(gh);
    else document.getElementById("loginWithGH").style.display = "flex";

    // Check for queries, load search and other page contents
    await QueryCheck();
    LoadLogin();
    LoadSearch();
    if (pageTitle != "home" && pageTitle != "sandbox" && pageExists) await GetMetaData();
    else if (pageTitle != "sandbox") LoadSidebar();

    // Once everything is loaded,  create an editor
    editorInstance = new Editor("editorInput", "editorOutput", "postText", "loginPrompt", "toolbar");
    if (pageTitle == "sandbox") EditorInitLoad();
}

/**
 * Loads sidebar for non-home pages
 * @returns {Promise<void>}
 */
async function LoadSidebar()
{
    // If page exists and isn't special, generate content
    if (pageExists && !pageTitle.startsWith("Special:"))
    {
        let allTitles = `<li><b>(Top)</b></li>`;
        articleTitles.forEach(e => 
        {
            allTitles += `<li><a class="contentListChild" onclick="ScrollHeaderIntoView(event)">${e}</a></li>`;
        });
        document.getElementById("pageContent").innerHTML = allTitles;
    }

    // There is a different link to other language based on if we're on mobile or not and we have to guess which one it is :3
    const properOtherLanguage = (window.innerWidth > mobileTreshold) ? "otherLanguage" : "otherLanguageMobile";

    // Opposite locale
    let oppLocale = 'en';
    if (locale == 'en') oppLocale = 'rs';

    if (!pageExists)
    {
        document.getElementById(properOtherLanguage).classList.add("nonExistent");
        document.getElementById(properOtherLanguage).href = selfURL + `/${oppLocale}/wiki/${pageTitle}`;
        return;
    }
    // Set sidebar link to other page linked in metadata
    if (!await PageExists(oppLocale, pageMetadata.meta.link)) document.getElementById(properOtherLanguage).classList.add("nonExistent");

    // If we didn't fill out the metadata just use this page title
    else if (pageMetadata.meta.link == "" || typeof pageMetadata.meta.link != "string") pageMetadata.meta.link = pageTitle;
    document.getElementById(properOtherLanguage).href = selfURL + `/${oppLocale}/wiki/${pageMetadata.meta.link}`;
}

/**
 * Loads search data for entire site
 * @returns {void}
 */
async function LoadSearch()
{
    const response3 = await fetch(workerURL + `/search/${locale}`);
    searchData = (await response3.json()).pages;
}

/**
 * Loads sidebar for homepage
 * @returns {Promise<void>}
 */
async function LoadLogin()
{
    if (loggedIn)
    {
        // Display logged in text
        for (const x of document.getElementsByClassName("loginSidebar"))
        {
            x.classList.remove("sidebarLink");
            x.classList.add("sidebarText");
            x.setAttribute("onclick", "");
            x.innerHTML = `${lang[locale].LoggedInAs} <a class="sidebarLink" style="display: inline" onclick="ShowUserData('${userData.login}')">${userData.login}</a>`;
        }

        for (const x of document.getElementsByClassName("logoutLink"))
        {
            x.style.display = "flex";
        }
    }
}