let currHover;
let refHighlight;
let barToClearNote = false;

class CookieManager {
    static GetCookie(cname) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${cname}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        else return null;
    }

    static SetCookie(cname, value) {
        document.cookie = `${cname}=${value};path=/`;
    }

    static DeleteCookie(cname) {
        document.cookie = cname + '=; Max-Age=-99999999;'; 
    }
}

// All internal links go through this function
async function InternalLink(e)
{
    const newPage = encodeURI(e.getAttribute("data-href"));
    window.location.href = `${selfURL}/${locale}/wiki?page=` + newPage;
}

// Because shadow DOM doesn't support # links, we have to scroll headers into view using this.
function ScrollHeaderIntoView(e)
{
    const allElems = document.getElementById("postText").getElementsByTagName("w-h1");

    for (let i = 0; i < allElems.length; i++)
    {
        if (allElems[i].innerHTML.trim() == e.target.innerText.trim()) allElems[i].scrollIntoView({ behavior: "smooth" });
    }
}

function ScrollRefIntoView(e)
{
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).scrollIntoView({ behavior: "smooth" })
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.backgroundColor = "var(--infobox-bg)";
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.border = "solid 1px grey";
    document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number).style.padding = "2px";
    if (typeof refHighlight != "undefined") refHighlight.style.backgroundColor = "transparent";
    refHighlight = document.getElementById("postText").getElementsByTagName("w-reflist")[0].shadowRoot.getElementById("ref_link_" + e.target.dataset.ref_number);
}

// Hovering over inline citations
async function NotationHover(e)
{
    const x = e.layerX;
    const y = e.layerY;
    const rfm = window._RefManager;
    let num = e.target.innerText;
    num = parseInt(num.match(/\[(.*?)\]/)[1])
    currHover = setTimeout((e) => {
        document.getElementById("reftooltip").style.visibility = "visible";
        document.getElementById("reftooltip").style.opacity = "100%";
        document.getElementById("reftooltip").innerHTML = num + ". " + rfm.GetRefByNumber(num).refText;
        document.getElementById("reftooltip").style.left = (x + 5) + "px";
        document.getElementById("reftooltip").style.top = (y + 5) + "px";
        console.log(x, y);
    }, 300)
}

// Un-hovering inline citations
async function NotationHoverClear()
{
    setTimeout(() => {
        if (barToClearNote) return;
        document.getElementById("reftooltip").style.visibility = "hidden";
        document.getElementById("reftooltip").style.opacity = "0";
        clearTimeout(currHover);
    }, 100);
}

async function HoverRefBox()
{
    barToClearNote = true;
}

async function HoverRefBoxClear()
{
    barToClearNote = false;
    NotationHoverClear();
}

function CanAccess(user, page)
{
    // THIS IS A FRONTEND AUTH CHECK! Changing this wont change how the backend authorizes you, so if you're reading this dont even bother
    if (page == 0 && user < 0) return false;
    if (page == 1 && user < 1) return false;
    if (page == 2 && user < 2) return false;
    if (page == 3 && user < 4) return false;
    
    return true;
}

function ComputeClear(num)
{
    if (num == 4) return lang[locale].SystemAdmin;
    else if (num == 3) return lang[locale].HigherAdmin;
    else if (num == 2) return lang[locale].Admin;
    else if (num == 1) return lang[locale].ApprovedUser;
    else if (num == 0) return lang[locale].User;
    else return lang[locale].Banned;
}

function ComputeProtectionString(lvl) 
{
    return lang[locale][`Level${lvl}Protection`];
}

async function PageExists(locale, page)
{
    if (existenceCache.has(`${locale}, ${page}`)) return existenceCache.get(`${locale}, ${page}`);
    const check = await fetch(fetchURL + `${locale}/${page}/${page.toLowerCase()}.html`).catch((e) => {});
    let ret = true;
    if (check.status == 404) ret = false;
    
    existenceCache.set(`${locale}, ${page}`, ret);
    return ret;
}

function WikiRedirect(page)
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const red = urlParams.get('redirect');

    if (previewingPage || red == "no") return;

    window.location.replace(`${selfURL}/${locale}/wiki?page=${encodeURIComponent(page)}`);
}

function WikiWhitelines(text)
{
    const splitted = text.replaceAll("<p>", "").replaceAll("</p>").split(/\n\s*\n/);
    const arr = [];
    let styleCheck = false
    
    splitted.forEach(x => {
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
        ) {
            arr.push(`<p>${x}</p>`);
        } else arr.push(x);
    });
    
    return arr.join('\n\n')
}