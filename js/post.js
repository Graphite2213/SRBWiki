// Request placeholder if no file
async function GetPlaceholderFile()
{
    const response = await fetch(fetchURL + `${locale}/placeholder.html`, 
    {
        method: "GET"
    });
    if (!response.ok) throw 'bad request';

    return { html: response.text() };
}

// Request file
async function MakeRequest(file) 
{
    const htmlFilePath = fetchURL + `${locale}/${file}/${file.toLowerCase()}.html`;
    const jsonFilePath = fetchURL + `${locale}/${file}/${file.toLowerCase()}.json`;

    const response = await fetch(htmlFilePath, { method: "GET" });
    const response2 = await fetch(jsonFilePath, { method: "GET" });
    if (!response.ok) throw 'bad request';
    if (response2.status == 404)
    {
        console.warn(`W: Site meta-data doesn't exist! Consider adding a ${file}.json file to better describe this page.`);
        return { html: response.text(), meta: {} };
    }
    else if (!response2.ok) throw 'bad request'; 
    return { html: await response.text(), meta: JSON5.parse(await response2.text()) };
}

// Load the entire post query
async function LoadPost()
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const page = urlParams.get('page');

    if (!page) return console.warn("W: No query provided, initial load skipped.");
    if (!window._searchMeta.pages.includes(page))
    {
        console.warn("W: This page doesn't exist! Loading placeholder text");
        pageTitle = page;

        const d = await GetPlaceholderFile();
        const postBody = await d.html;
        document.getElementById("postTitle").innerText = page;
        document.getElementById("postText").innerHTML = `${postBody}`;
        document.getElementById("editPageLink").href = `https://github.com/Graphite2213/SNSWiki-Pages/blob/master/${locale}/`;
        document.getElementById("editPageLink").classList.add("nonExistent");
        return;
    }
    pageTitle = page;
    const d = await MakeRequest(page);
    const postBody = await d.html;
    const metaBody = await d.meta;

    document.getElementById("postTitle").innerText = page;
    document.getElementById("postText").innerHTML = `${postBody}`;
    document.getElementById("editPageLink").href = `https://github.com/Graphite2213/SNSWiki-Pages/blob/master/${locale}/${page}/${page.toLowerCase()}.html`;
    if (metaBody == {} || metaBody.link == "" || typeof metaBody.link == "undefined") 
    {
        document.getElementById("otherLanguage").classList.add("nonExistent");
        document.getElementById("otherLanguage").classList.remove("sidebarLink");
    }
    else
    {
        document.getElementById("otherLanguage").href = selfURL + `/${oppLocale}/wiki.html?page=${metaBody.link}`;
    }

    // Load sidebar a second time, because of possible bad timing with network
    LoadSidebar();
    SetMetadata(metaBody.description, metaBody.image, metaBody.keywords);
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
        document.getElementById("reftooltip").innerHTML = num + ". " + rfm.getRefByNumber(num).refText;
        document.getElementById("reftooltip").style.left = Math.floor(x) + 5;
        document.getElementById("reftooltip").style.top = Math.floor(y) + 5;
    }, 300)
}

// Un-hovering inline citations
async function NotationHoverClear()
{
    if (barToClearNote) return;
    document.getElementById("reftooltip").style.visibility = "hidden";
    document.getElementById("reftooltip").style.opacity = "0";
    clearTimeout(currHover);
}

async function HoverRefBox()
{
    barToClearNote = true;
}

async function HoverRefBoxClear()
{
    barToClearNote = false;
    NotationHoverClear();
    barToClearNote = true;
}

function SetMetadata(desc, image, keywords)
{
    document.querySelector('meta[name="description"]').setAttribute("content", desc);
    document.querySelector('title').innerText = pageTitle + " - SNSWiki";

    const metas = Array.from(document.getElementsByTagName('meta'));
    const metaTitle = metas.find((m) => m.attributes[0].nodeValue === 'og:title');
    metaTitle.attributes[1].nodeValue = pageTitle;

    const metaUrl = metas.find((m) => m.attributes[0].nodeValue === 'og:url');
    metaUrl.attributes[1].nodeValue = window.location.href;

    const metaImage = metas.find((m) => m.attributes[0].nodeValue === 'og:image');
    metaImage.attributes[1].nodeValue = `https://github.com/Graphite2213/SNSWiki-Pages/blob/master/${locale}/${pageTitle}/Images/${image}`;

    const metaDescription = metas.find((m) => m.attributes[0].nodeValue === 'og:description');
    metaDescription.attributes[1].nodeValue = desc;

    let keywordList = "";
    for (x in keywords) 
    {
        keywordList += x + ", ";
    }
    keywordList.substring(0, keywordList.length - 2);
    document.querySelector('meta[name="keywords"]').setAttribute("content", keywordList);
}