import { Octokit } from "https://esm.sh/@octokit/core@4.2.2";
import { Base64 } from 'https://cdn.jsdelivr.net/npm/js-base64@3.7.7/base64.mjs';

const clientId = `Ov23liBTgUYRbVZaet2r`;
const ghStep1Endpoint = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${location.href}&scope=user%20email&allow_signup=true&prompt=consent`;

// Check if URL contains GitHub's auth code
function BackgroundCheck() 
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ghCode = urlParams.get('code');
    if (typeof ghCode == "string")
    {
        AuthenticateGHCode(ghCode);
    }
}

// Login
function LoginWithGithub()
{
    window.location.href = ghStep1Endpoint;
}

// Logout
function LogoutWithGithub()
{
    CookieManager.DeleteCookie("github-auth");

    DisableReloadPrompt();
    location.reload();
}

// Authenticate OAuth code if one is present
async function AuthenticateGHCode(code)
{
    const response = await fetch(window._backendWorker + `/auth`, 
    {
        method: "GET",
        headers: {
            "X-WikiAuth": code
        }
    });
    
    if (response.status == 411)
    {
        CookieManager.DeleteCookie("github-auth");
        location.reload();
    }
    if (!response.ok) throw 'bad request';
    let ghResponse = await response.json();
    if (typeof ghResponse.access_token == "string") CookieManager.SetCookie("github-auth", ghResponse.access_token);
    history.replaceState({}, "", location.href.replace(/(\?|\&)(code=)([^&]*)/, '$1'));
    SetUserData(ghResponse.access_token);
}

// Get user data
async function SetUserData(token, locale, pageTitle)
{
    const octokit = new Octokit({ auth: token });
      
    await octokit.request('GET /user', { headers: { 'X-GitHub-Api-Version': '2022-11-28' } }).then((e) => 
    {
        if (e.status != 200 && e.status != 304)
        {
            CookieManager.DeleteCookie("github-auth");
            location.reload();
        }
        window._ghInfo = e.data;
        window.SetSidebarLogin();
    });

    if (window._pageExists && currentPage != "home") fetch(window._backendWorker + `/page/${locale}/${pageTitle}`, {
        method: "GET",
        headers: { "X-WikiAuth": token } }).then(async (res) => 
        {
        // Manage metadata recieved from server
        const clear = await res.json();

        window._EditingETag = res.headers.get("ETag").replace("W/", "").replaceAll("\"", "");
        window._AllImages = clear.images;
        window._HistoryData = clear.history;
        PopulateHistory();
    });

    fetch(window._backendWorker + `/user/${window._ghInfo.login}`, {
        method: "GET",
        headers: { "X-WikiAuth": token } }).then(async (res) => 
        {
        // Manage metadata recieved from server
        const clear = await res.json();
        window._userData = clear.user;

        // Set metadata for later use
        if (currentPage != "home" && _pageExists)
            if ((window._userData.clearance >= 3 && window._metadata.protection < 3) || window._userData.clearance >= 4) 
            {
                document.getElementById("deletePageLink").style.display = "block";
                document.getElementById("movePageLink").style.display = "block";
            }
    });
}

// Publish current edit of page
async function PublishEdit(content)
{
    const token = CookieManager.GetCookie("github-auth");
    let endFilename = `${pageTitle}/${pageTitle.toLowerCase()}`;
    if (window._editingNews) endFilename = "news";
    if (window._editingFeatured) endFilename = "featured";
    if (!window._pageExists && !window._creatingNewPage) endFilename = "placeholder";

    const result = await fetch(window._backendWorker + `/${locale}/${endFilename}.html`, 
    {
        method: "PUT",
        headers: {
            "X-WikiAuth": token,
            "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value),
            "If-Match": window._EditingETag
        },
        body: Base64.encode(content)
    });

    if (result.status != 205) alert(lang[locale].ConflictMessage);
    else 
    {
        DisableReloadPrompt();
        location.reload();
    }
}

// Add new image to wiki
async function AddImage(imageContent, filename)
{
    const token = CookieManager.GetCookie("github-auth");

    await fetch(window._backendWorker + `/${locale}/${pageTitle}/Images/${filename}`, 
    {
        method: "PUT",
        headers: {
            "X-WikiAuth": token
        },
        body: imageContent
    });

    DisableReloadPrompt();
    location.reload();
}

// Remove image from wiki
async function RemoveImage(filename)
{
    const token = CookieManager.GetCookie("github-auth");

    await fetch(window._backendWorker + `/${locale}/${pageTitle}/Images/${filename}`, 
    {
        method: "DELETE",
        headers: {
            "X-WikiAuth": token,
            "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
        }
    });

    DisableReloadPrompt();
    location.reload();
}

async function RemovePage()
{
    const token = CookieManager.GetCookie("github-auth");

    await fetch(window._backendWorker + `/${locale}/${pageTitle}`, 
    {
        method: "DELETE",
        headers: {
            "X-WikiAuth": token,
            "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
        }
    });

    DisableReloadPrompt();
    location.reload();
}

// Send new page metadata
async function UpdateConfig()
{
    const token = CookieManager.GetCookie("github-auth");
    let keywords = [];

    for (const x of document.getElementById("keywordInput").children)
    {
        if (x.id == "keywordTextIn") continue;
        keywords.push(x.innerText.trim());
    }

    const newData = 
    {
        link: document.getElementById("cF-link").getElementsByTagName("input")[0].value,
        description: document.getElementById("cF-desc").getElementsByTagName("input")[0].value,
        image: document.getElementById("cF-img").getElementsByTagName("select")[0].value,
        keywords: keywords,
        protection: Number(document.getElementById("protectionList").selectedOptions[0].dataset.enum),
        upload_protection: false
    };

    await fetch(window._backendWorker + `/${locale}/${pageTitle}/${pageTitle.toLowerCase()}.json`, 
    {
        method: "PUT",
        headers: {
            "X-WikiAuth": token
        },
        body: JSON.stringify(newData)
    });

    DisableReloadPrompt();
    location.reload();
}

async function MovePage(moveTo)
{
    const token = CookieManager.GetCookie("github-auth");

    await fetch(window._backendWorker + `/move/${locale}/${pageTitle}`, 
    {
        method: "POST",
        headers: {
            "X-WikiAuth": token,
            "X-WikiMove": encodeURIComponent(moveTo),
            "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
        }
    });
    
    DisableReloadPrompt();
    location.reload();
}

async function AdminFunctions(method, user) {
    const token = CookieManager.GetCookie("github-auth");

    await fetch(window._backendWorker + `/${method}/${user}`, 
    {
        method: "POST",
        headers: {
            "X-WikiAuth": token,
            "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
        }
    });

    DisableReloadPrompt();
    location.reload();
}

// Required due to module file type
window.UpdateConfig = UpdateConfig;
window.PublishEdit = PublishEdit;
window.LoginWithGithub = LoginWithGithub;
window.BackgroundCheck = BackgroundCheck;
window.SetUserData = SetUserData;
window.LogoutWithGithub = LogoutWithGithub; 
window.AddImage = AddImage;
window.RemoveImage = RemoveImage;
window.RemovePage = RemovePage;
window.MovePage = MovePage;
window.AdminFunctions = AdminFunctions;