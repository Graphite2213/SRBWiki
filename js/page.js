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
async function GetPage(page) 
{
    const htmlFilePath = fetchURL + `${locale}/${page}/${page.toLowerCase()}.html`;
    const jsonFilePath = fetchURL + `${locale}/${page}/${page.toLowerCase()}.json`;

    const response = await fetch(htmlFilePath, { method: "GET" });
    const response2 = await fetch(jsonFilePath, { method: "GET" });
    
    if (response.status == 404)
    {
        console.warn("W: This page doesn't exist! Loading placeholder text");
        
        const d = await GetPlaceholderFile();
        const postBody = await d.html;
        unchangedPostText = postBody;
        document.getElementById("postTitle").innerText = page;
        document.getElementById("postText").innerHTML = WikiWhitelines(postBody);
        document.getElementById("editPageLink").innerText = "Uređuj ovaj template"
        window._pageExists = false;
        return { html: {}, meta: {}, errorCon: true };
    }
    if (!response.ok) throw 'bad request';
    if (!response2.ok) throw 'bad request';

    return { html: await response.text(), meta: JSON.parse(await response2.text()), errorCon: false };
}

// Load the entire post query
async function LoadPost()
{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const page = urlParams.get('page');
    const properOtherLanguage = (window.innerWidth > 641) ? "otherLanguage" : "otherLanguageMobile";

    if (!page) return console.warn("W: No query provided, initial load skipped.");

    pageTitle = page;

    const d = await GetPage(page);
    const postBody = d.html;
    const metaBody = d.meta;

    if (!d.errorCon)
    {
        window._metadata = metaBody;

        if (typeof metaBody.link == "undefined" || metaBody.link.trim() == "")
        {
            metaBody.link = pageTitle;
        }
        if (!await PageExists(oppLocale, metaBody.link)) document.getElementById("otherLanguage").classList.add("nonExistent");
        document.getElementById("postTitle").innerText = page;
        unchangedPostText = postBody;
        document.getElementById("postText").innerHTML = WikiWhitelines(postBody);
    }
    else if (metaBody == {} || metaBody.link == "" || typeof metaBody.link == "undefined" || !await PageExists(oppLocale, metaBody.link)) 
    {
        document.getElementById(properOtherLanguage).classList.add("nonExistent");
        document.getElementById(properOtherLanguage).classList.remove("sidebarLink");
    }
    document.getElementById(properOtherLanguage).href = selfURL + `/${oppLocale}/wiki?page=${metaBody.link}`;

    // Load sidebar a second time, because of possible bad timing with network
    LoadSidebar();
    SetMetadata(metaBody.description, metaBody.image, metaBody.keywords);
}

function SetMetadata(desc, image, keywords)
{
    document.querySelector('meta[name="description"]').setAttribute("content", desc);
    document.querySelector('title').innerText = pageTitle + " - SRBWiki";

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

function PreCreateNewPage()
{
    window._creatingNewPage = true;
    document.getElementById("postText").style.display = "none";
    CreateNewPage();
}

function CreateNewPage()
{
    editorInstance.OpenEditor("", false);
    const allButtons = editorInstance.toolbar.toolbarButtons;
    let seen = false;
    for (let [x, y] of allButtons)
    {
        if (x == "backButton") continue;
        if (x == "previewButton") break;
        if (seen) editorInstance.toolbar.HideButton(x);
        if (x == "redo") seen = true;
    }
}

function PreDeletePage() 
{  
    const proceedLambda = () => {
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }
        window.RemovePage();
    };

    const cancelLambda = () => {
        document.getElementById("descriptionInput").style.border = "";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };


    ChangePrompt("default", { 
        proceedText: "Obriši", 
        cancelText: "Nazad", 
        proceedCallback: proceedLambda, 
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${DeletionConfirmation}<br><b>${lang[locale].AdminLogAppearance} ${lang[locale].ReasonNeeded}</b><span>`, 
        haveInput: true
    });
}

function PreMovePage()
{
    const proceedLambda = () => {
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }
        window.MovePage(document.getElementById("descriptionInput").value);
    };

    const cancelLambda = () => {
        document.getElementById("descriptionInput").style.border = "";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
        document.getElementById("descriptionInput").placeholder = lang[locale].ChangeDescText;
    };

    document.getElementById("descriptionInput").placeholder = lang[locale].MoveLocation;

    ChangePrompt("default", { 
        proceedText: "Pomeri", 
        cancelText: "Nazad", 
        proceedCallback: proceedLambda, 
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${lang[locale].MovingConfirmation}<br><b>${lang[locale].AdminLogAppearance}</b><span>`, 
        haveInput: true
    });
}

function PreDeleteImage() 
{ 
    const proceedLambda = () => {
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }
        window.RemoveImage(document.getElementById("allImages").value);
    };

    const cancelLambda = () => {
        document.getElementById("descriptionInput").style.border = "";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    ChangePrompt("default", { 
        proceedText: "Obriši", 
        cancelText: "Nazad", 
        proceedCallback: proceedLambda, 
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${lang[locale].ImageDeletionConfirmation}<br><b>${lang[locale].AdminLogAppearance} ${lang[locale].ReasonNeeded}</b><span>`, 
        haveInput: true
    });
}

async function ShowUserData(user)
{
    if (user == _ghInfo.login) document.getElementById("modButtons").style.display = "none";
    else document.getElementById("modButtons").style.display = "flex";

    const buttonKids = document.getElementById("modButtons").children;

    for (const x of buttonKids)
    {
        const buttonClearance = x.classList.toString().split("access-")[1];
        if (_userData.clearance >= Number(buttonClearance)) x.style.display = "block";
        else x.style.display = "none";
    }

    let userQuery = {};
    if (userCache.has(user)) userQuery = userCache[user];
    else 
    {
        userQuery = await fetch(window._backendWorker + `/user/${user}`, { method: "GET" });
        if (userQuery.status != "200") return;
        userQuery = JSON.parse(await userQuery.text());
        userCache.set(user, userQuery);
    }
    const clearanceComputed = ComputeClear(userQuery.user.clearance);

    const cancelLambda = () => {
        document.getElementById("confirmationBackdrop").style.display = "none";
    };
    ChangePrompt('user', { captionText: `<b>Informacije o Korisniku</b>`, proceedText: "", cancelText: "Nazad", proceedCallback: () => {}, cancelCallback: cancelLambda, user: { img: userQuery.user.img, clearance: clearanceComputed, login: user, note: userQuery.user.note }});
}

function BackPage()
{
    if (historyPageNum == 1) return;
    const currentP = Number(document.getElementById("historyStr").innerText);
    historyPageNum = currentP - 1;
    document.getElementById("historyStr").innerText = historyPageNum;
    document.getElementById("historyList").innerHTML = historyPages[historyPageNum];
}

function ForwardPage()
{
    if (historyPageNum == historyPages.length - 1) return;
    const currentP = Number(document.getElementById("historyStr").innerText);
    historyPageNum = currentP + 1;
    document.getElementById("historyStr").innerText = historyPageNum;
    document.getElementById("historyList").innerHTML = historyPages[historyPageNum];
}

function AddJSPostLoad(source, callback) 
{
    let script = document.createElement('script');
    let prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = function(_, isAbort) 
    {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) 
        {
            script.onload = script.onreadystatechange = null;
            script = undefined;
            if (!isAbort && callback) setTimeout(callback, 0);
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
}