// Random utilities

// Current hovered reference/link
let currHover;

// Highlighted reference
let refHighlight;

// Bar to clear the little ref note so it doesn't immediately disappear
let barToClearNote = false;

/**
 * Small cookie manager class
 */
class CookieManager
{
    static GetCookie(cname)
    {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${cname}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        else return null;
    }

    static SetCookie(cname, value)
    {
        document.cookie = `${cname}=${value};path=/`;
    }

    static DeleteCookie(cname)
    {
        document.cookie = cname + '=; Max-Age=-99999999;path=/';
    }
}


/**
 * Show user data card
 * @return {Promise<void>}
 * @param {string} user - User whose card we're getting
 */
async function ShowUserData(user)
{
    // You can't do admin actions on yourself
    if (user == userData.login) document.getElementById("modButtons").style.display = "none";
    else document.getElementById("modButtons").style.display = "flex";

    // Show only buttons which you can use
    const buttonKids = document.getElementById("modButtons").children;
    for (const x of buttonKids)
    {
        const buttonClearance = x.classList.toString().split("access-")[1];
        if (userData.clearance >= Number(buttonClearance)) x.style.display = "block";
        else x.style.display = "none";
    }

    // If we haven't gotten this user before, request them from the server
    let userQuery = {};
    if (userCache.has(user)) userQuery = userCache[user];
    else 
    {
        userQuery = await fetch(workerURL + `/user/${user}`, { method: "GET" });
        if (userQuery.status != "200") return;
        userQuery = JSON.parse(await userQuery.text());
        userCache.set(user, userQuery);
    }

    // Compute clearance to normal language
    const clearanceComputed = ComputeClear(userQuery.user.clearance);

    // Show prompt
    const cancelLambda = () => { document.getElementById("confirmationBackdrop").style.display = "none"; };
    ChangePrompt('user', { captionText: `<b>Informacije o Korisniku</b>`, proceedText: "", cancelText: "Nazad", proceedCallback: () => {}, cancelCallback: cancelLambda, user: { img: userQuery.user.img, clearance: clearanceComputed, login: user, note: userQuery.user.note } });
}

/**
 * All internal links go through this method
 * @returns {Promise<void>}
 * @param {Event} e - Click event
 */
async function InternalLink(e)
{
    const newPage = encodeURI(e.getAttribute("data-href"));
    window.location.href = `${selfURL}/${locale}/wiki/` + newPage;
}

/**
 * Scrolls header into view, because shadow DOM doesn't support # links we have to use this
 * @returns {void}
 * @param {Event} e - Click event
 */
function ScrollHeaderIntoView(e)
{
    const allElems = document.getElementById("postText").getElementsByTagName("w-h1");

    for (let i = 0; i < allElems.length; i++)
    {
        if (allElems[i].innerHTML.trim() == e.target.innerText.trim()) allElems[i].scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Scrolls reference into view
 * @returns {void}
 * @param {Event} e - Click event
 */
function ScrollRefIntoView(e)
{
    // Scroll into view and highlight
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).scrollIntoView({ behavior: "smooth" });
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.backgroundColor = "var(--infobox-bg)";
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.border = "solid 1px grey";
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.padding = "2px";

    if (typeof refHighlight != "undefined") refHighlight.style.backgroundColor = "transparent";
    refHighlight = document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number);
}

/**
 * Shows little ref tooltip on hover
 * @returns {void}
 * @param {Event} e - Hover event
 */
function NotationHover(e)
{
    const x = e.layerX;
    const y = e.layerY;
    const rfm = window._RefManager;

    let num = e.target.innerText;
    num = parseInt(num.match(/\[(.*?)\]/)[1]);
    currHover = setTimeout(() =>
    {
        document.getElementById("reftooltip").style.visibility = "visible";
        document.getElementById("reftooltip").style.opacity = "100%";
        document.getElementById("reftooltipText").innerHTML = num + ". " + rfm.GetRefByNumber(num).refText;
        document.getElementById("reftooltipImage").style.display = "none";
        document.getElementById("reftooltip").style.left = (x + 5) + "px";
        document.getElementById("reftooltip").style.top = (y + 5) + "px";
    }, 300);
}

/**
 * Shows little ref tooltip on hover, but for links
 * @returns {void}
 * @param {Event} e - Hover event
 */
async function LinkHover(e)
{
    const x = e.layerX;
    const y = e.layerY;

    let num = decodeURIComponent(e.target.href.split("/").pop());
    currHover = setTimeout(() =>
    {
        document.getElementById("reftooltip").style.visibility = "visible";
        document.getElementById("reftooltip").style.opacity = "100%";
        document.getElementById("reftooltipText").innerHTML = linkCache[`${locale}, ${num}`].description;
        document.getElementById("reftooltipImage").src = fetchURL + `${locale}/${num}/Images/${linkCache[`${locale}, ${num}`].image}`;
        document.getElementById("reftooltipImage").style.display = "flex";
        document.getElementById("reftooltip").style.left = (x + 5) + "px";
        document.getElementById("reftooltip").style.top = (y + 5) + "px";
    }, 300);
}

/**
 * Hide tooltip once hover is over
 * @returns {void}
 */
async function NotationHoverClear()
{
    setTimeout(() =>
    {
        if (barToClearNote) return;
        document.getElementById("reftooltip").style.visibility = "hidden";
        document.getElementById("reftooltip").style.opacity = "0";
        document.getElementById("reftooltipImage").style.display = "none";
        clearTimeout(currHover);
    }, 100);
}

/**
 * Don't let the tooltip hide if the user is hovering over the box
 * @returns {void}
 */
function HoverRefBox()
{
    barToClearNote = true;
}

/**
 * Let the tooltip hide if the user is not hovering over the box
 * @returns {void}
 */
async function HoverRefBoxClear()
{
    barToClearNote = false;
    NotationHoverClear();
}

/**
 * Perm check for user
 * @returns {boolean}
 * @param {Wiki.UserTypes} user
 * @param {Wiki.ProtectionTypes} page
 */
function CanAccess(user, page)
{
    // FRONTEND auth check
    if (page == 0 && user < 0) return false;
    if (page == 1 && user < 1) return false;
    if (page == 2 && user < 2) return false;
    if (page == 3 && user < 4) return false;

    return true;
}

/**
 * Returns string that matches user clearance
 * @returns {string}
 * @param {Wiki.UserTypes} numb
 */
function ComputeClear(num)
{
    if (num == 4) return lang[locale].SystemAdmin;
    else if (num == 3) return lang[locale].HigherAdmin;
    else if (num == 2) return lang[locale].Admin;
    else if (num == 1) return lang[locale].ApprovedUser;
    else if (num == 0) return lang[locale].User;
    else return lang[locale].Banned;
}

/**
 * Returns string that matches page protection
 * @returns {string}
 * @param {Wiki.ProtectionTypes} lvl
 */
function ComputeProtectionString(lvl) 
{
    return lang[locale][`Level${lvl}Protection`];
}

/**
 * Remotely checks if page exists
 * @returns {Promise<boolean>}
 * @param {("rs"|"en")} locale
 * @param {string} page
 */
async function PageExists(locale, page)
{
    // Try to fetch page, return no if 404
    if (linkCache.has(`${locale}, ${page}`)) return linkCache.get(`${locale}, ${page}`);
    const check = await fetch(fetchURL + `${locale}/${page}/${page.toLowerCase()}.json`);
    let ret = true;
    if (check.status == 404) ret = false;
    else ret = await check.json();

    linkCache.set(`${locale}, ${page}`, ret);
    return ret;
}

/**
 * Redirect to other page 
 * @returns {void}
 */
function WikiRedirect(page)
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const red = urlParams.get('redirect');

    // If "redirect=no" in query don't redirect
    if (previewingPage || red == "no") return;

    window.location.replace(`${selfURL}/${locale}/wiki/${encodeURIComponent(page)}?re=${pageTitle}`);
}

/**
 * Process text so newlines are turned into paragraphs
 * @returns {string}
 */
function WikiWhitelines(text)
{
    // Sorry in advance!
    const splitted = text.replaceAll("<p>", "").replaceAll("</p>", "").split(/\n\s*\n/);
    const arr = [];
    let styleCheck = false;

    splitted.forEach(x =>
    {
        // Ignore these 
        if (x.includes("<style>")) styleCheck = true;
        if (x.includes("</style>")) styleCheck = false;
        if (
            !x.includes('<w-reflist') &&
            !x.includes('<w-annotation') &&
            !x.includes('<w-infobox') &&
            !x.includes('<w-h') &&
            !x.includes('<w-drop') &&
            !x.includes('</w-drop') &&
            !x.includes('<w-img') &&
            !x.includes('<wvs-') &&
            !x.includes('<wi-') &&
            !styleCheck
        )
        {
            arr.push(`<p>${x}</p>`);
        } else arr.push(x);
    });

    return arr.join('\n\n');
}

/**
 * GZip decompression string
 * @returns {string}
 */
async function Decompress(byteArray, encoding)
{
    const cs = new DecompressionStream(encoding);
    const writer = cs.writable.getWriter();
    writer.write(byteArray);
    writer.close();
    return new Response(cs.readable).arrayBuffer().then(function (arrayBuffer)
    {
        return new TextDecoder().decode(arrayBuffer);
    });
}