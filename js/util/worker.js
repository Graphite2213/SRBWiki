const clientId = `Ov23liBTgUYRbVZaet2r`;

/**
 * Check if there are any pending url queries like Github's auth code or redirect-from
 * @returns {Promise<void>}
 */
async function QueryCheck() 
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ghCode = urlParams.get('code');
    const redirectedFrom = urlParams.get('re');

    // If there's code authenticate, if there's re add the title text
    if (typeof ghCode == "string") await AuthenticateGHCode(ghCode);
    if (typeof redirectedFrom == "string" && PageExists(redirectedFrom))
    {
        document.getElementById("postTitle").innerHTML +=
            `<span class="redirectedFrom">(${lang[locale].RedirectFrom} <a href="${selfURL}/${locale}/wiki/${redirectedFrom}?redirect=no">${redirectedFrom}</a>)</span>`;
    }
}

/**
 * Prompts the user to log in with GitHub
 * @returns {Promise<void>}
 */
function LoginWithGithub()
{
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${selfURL}/${locale}/home&scope=read:user&allow_signup=true&prompt=consent`;
}

/**
 * Logs user out by clearing auth cookie
 * @returns {Promise<void>}
 */
function LogoutWithGithub()
{
    CookieManager.DeleteCookie("github-auth");

    // Reload
    DisableReloadPrompt();
    location.reload();
}

/**
 * Gets Github token from backend with OAuth code
 * @returns {Promise<void>}
 * @param {string} code
 */
async function AuthenticateGHCode(code)
{
    const response = await fetch(workerURL + `/auth`,
        {
            method: "GET",
            headers: { "X-WikiAuth": code }
        });

    // If the backend gets a certain error code from Github this will force a logout
    if (response.status == 411)
    {
        CookieManager.DeleteCookie("github-auth");
        location.reload();
    }
    else if (!response.ok) throw 'bad request';

    const ghResponse = await response.json();
    if (typeof ghResponse.access_token == "string") CookieManager.SetCookie("github-auth", ghResponse.access_token);

    // Remove query strings from url
    history.replaceState({}, "", location.href.replace(/(\?|\&)(code=)([^&]*)/, '$1'));
    await GetUserData(ghResponse.access_token);
}

/**
 * Gets page metadata
 * @returns {Promise<void>}
 */
async function GetMetaData()
{
    const pageQuery = await fetch(workerURL + `/page/${locale}/${pageTitle}`,
        {
            method: "GET",
            headers: { "X-WikiAuth": "" }
        });

    // Manage metadata recieved from server
    const clear = await pageQuery.json();

    editingETag = pageQuery.headers.get("ETag").replace("W/", "").replaceAll("\"", "");
    pageMetadata = clear;
    PopulateHistory();
}

/**
 * Gets user metadata of provided token 
 * @returns {Promise<void>}
 * @param {string} token
 */
async function GetUserData(token)
{
    const userQuery = await fetch(workerURL + `/user`, {
        method: "GET",
        headers: { "X-WikiAuth": token }
    });

    // Manage metadata recieved from server
    if (userQuery.status == 200)
    {
        const clear = await userQuery.json();
        userData = clear.user;
        loggedIn = true;
    }
}

/**
 * Publishes changes to edited page
 * @returns {Promise<void>}
 * @param {string} content
 */
async function PublishEdit(content)
{
    const token = CookieManager.GetCookie("github-auth");
    let endFilename = `${pageTitle}/${pageTitle.toLowerCase()}`;

    // If we're on the homepage and editing one of the tiles update those instead
    if (pageTitle == "home" && editingTile != "") endFilename = editingTile;
    if (!pageExists && !creatingNewPage) endFilename = "placeholder";

    // PUT it
    const result = await fetch(workerURL + `/${locale}/${endFilename}.html`,
        {
            method: "PUT",
            headers: {
                "X-WikiAuth": token,
                "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value),
                "If-Match": editingETag
            },
            body: Base64.encode(content)
        });

    // If the user's editing session is out of date alert them to save the changes locally
    if (result.status != 205) return alert(lang[locale].ConflictMessage);

    // Otherwise reload the page
    DisableReloadPrompt();
    location.reload();
}

/**
 * Uploads new image to page
 * @returns {Promise<void>}
 * @param {ArrayBuffer} imageContent
 * @param {string} filename
 */
async function AddImage(imageContent, filename)
{
    const token = CookieManager.GetCookie("github-auth");

    // PUT it
    await fetch(workerURL + `/${locale}/${pageTitle}/Images/${filename}`,
        {
            method: "PUT",
            headers: { "X-WikiAuth": token },
            body: imageContent
        });

    // Reload
    DisableReloadPrompt();
    location.reload();
}

/**
 * Removes image from page
 * @returns {Promise<void>}
 * @param {string} filename
 */
async function RemoveImage(filename)
{
    const token = CookieManager.GetCookie("github-auth");

    // DELETE it
    await fetch(workerURL + `/${locale}/${pageTitle}/Images/${filename}`,
        {
            method: "DELETE",
            headers: {
                "X-WikiAuth": token,
                "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
            }
        });

    // Reload
    DisableReloadPrompt();
    location.reload();
}

/**
 * Removes current page from wiki
 * @returns {Promise<void>}
 */
async function RemovePage()
{
    const token = CookieManager.GetCookie("github-auth");

    // DELETE it
    await fetch(workerURL + `/${locale}/${pageTitle}`,
        {
            method: "DELETE",
            headers: {
                "X-WikiAuth": token,
                "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
            }
        });

    // Reload
    DisableReloadPrompt();
    location.reload();
}

/**
 * Creates new metadata JSON and updates it
 * @returns {Promise<void>}
 */
async function UpdateConfig()
{
    const token = CookieManager.GetCookie("github-auth");
    let keywords = [];

    // Turn keywords into actual string
    for (const x of document.getElementById("keywordInput").children)
    {
        if (x.id == "keywordTextIn") continue;
        keywords.push(x.innerText.trim());
    }

    // New metadata
    const newData =
    {
        link: document.getElementById("cF-link").getElementsByTagName("input")[0].value,
        description: document.getElementById("cF-desc").getElementsByTagName("input")[0].value,
        image: document.getElementById("cF-img").getElementsByTagName("select")[0].value,
        keywords: keywords,
        protection: Number(document.getElementById("protectionList").selectedOptions[0].dataset.enum),
        upload_protection: false
    };

    // PUT it
    await fetch(workerURL + `/${locale}/${pageTitle}/${pageTitle.toLowerCase()}.json`,
        {
            method: "PUT",
            headers: {
                "X-WikiAuth": token
            },
            body: JSON.stringify(newData)
        });

    // Reload
    DisableReloadPrompt();
    location.reload();
}

/**
 * Move current page to other location
 * @returns {Promise<void>}
 * @param {string} moveTo 
 */
async function MovePage(moveTo)
{
    const token = CookieManager.GetCookie("github-auth");

    // POST it
    await fetch(workerURL + `/move/${locale}/${pageTitle}`,
        {
            method: "POST",
            headers: {
                "X-WikiAuth": token,
                "X-WikiMove": encodeURIComponent(moveTo),
                "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
            }
        });

    // Reload
    DisableReloadPrompt();
    location.reload();
}

/**
 * Does administrative action on user
 * @returns {Promise<void>}
 * @param {Wiki.AdminMethods} method
 * @param {string} user 
 */
async function AdminFunctions(method, user)
{
    const token = CookieManager.GetCookie("github-auth");

    await fetch(workerURL + `/${method}/${user}`,
        {
            method: "POST",
            headers: {
                "X-WikiAuth": token,
                "X-WikiNote": encodeURIComponent(document.getElementById("descriptionInput").value)
            }
        });

    // Reload
    DisableReloadPrompt();
    location.reload();
}