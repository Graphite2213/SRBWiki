// History previews n stuff are really huge and had to get seperated from the rest of the buttons

// Diff global vars
let showingDiff = false;
let differ;

/**
* Populate page history
* @returns {void}
*/
function PopulateHistory()
{
    let counter = 0;
    let curr = 1;
    const infoText = !window.matchMedia(`(max-width: ${mobileTreshold}px)`).matches ? lang[locale].ChangesInfoText : lang[locale].ChangesInfoText.split(" ")[0];

    // Default history card
    const prompt = `
        <div class="historyElement">
            <div class="hist-name"><img class="hist-icon" src=":img:"><a onclick="ShowUserData(':user:')">:user:</a></div>
            <div class="hist-desc"><a class="hist-info" data-hash=":hash:" onclick="OpenHistoryInfo(event)">${infoText}</a></div>
            <div class="hist-date">:date:</div>
            <div class="hist-type">:type:</div>
        </div>
    `;

    // Go one by one
    const sortable = [];
    for (const [key, value] of Object.entries(pageMetadata.history)) 
    {
        sortable.push([key, value]);
    }

    // Sort by date (newest first)
    sortable.sort((a, b) =>
    {
        const date1 = new Date(a[1].date);
        const date2 = new Date(b[1].date);

        return date2.valueOf() - date1.valueOf();
    });

    // Replace tags in template
    sortable.forEach((e) =>
    {
        let modified = prompt.replaceAll(":user:", e[1].user);
        if (e[1].description == "") e[1].description = "<i>No description</i>";
        modified = modified.replaceAll(":date:", e[1].date);
        modified = modified.replaceAll(":hash:", e[0]);
        modified = modified.replaceAll(":img:", e[1].userIcon);
        modified = modified.replaceAll(":type:", e[1].type.replaceAll("meta/json", "META").replaceAll("html/text", "HTML"));

        counter++;
        historyPages[curr] += modified;

        // Fall back to next page if necessary
        if (counter == historyElemPerPage) 
        {
            curr++;
            counter = 0;
            add = "";
            historyPages[curr] = "";
        }
    });

    // Set page numbers
    document.getElementById("historyList").innerHTML = historyPages[1];
    document.getElementById("historyStrTotal").innerText = historyPages.length - 1;
}

/**
* Preview previous version in history
* @returns {void}
* @param {string} hash - ID/Hash of history which is being previewed
*/
async function PreviewPreviousVer(hash)
{
    // URI to history element
    const entireURI = `https://data.graphite.in.rs/${locale}/${pageTitle}/History/${encodeURIComponent(pageTitle.toLowerCase())}-${hash}.hist`;

    const res = await fetch(entireURI, { method: "GET" });

    // Decompress history fetch because its gzipped
    const oldVer = await Decompress(await res.arrayBuffer(), "gzip");

    // Change callbacks, show source code, make read only
    editorInstance.OpenEditor(oldVer, true);
    previewingPage = true;

    editorInstance.toolbar.ShowButton("publishButton");
    editorInstance.toolbar.ChangeButtonText("previewButton", lang[locale].OpenSourceCode);
    editorInstance.toolbar.ChangeButtonText("publishButton", lang[locale].ReturnToOldVer);
    editorInstance.toolbar.ChangeButtonText("historyButton", lang[locale].ShowDiff);
    editorInstance.toolbar.SetButtonCallback("historyButton", "ToggleDiff()");
    editorInstance.toolbar.HideButton("historyButton");
    editorInstance.PreviewChanges();

    // Hide buttons
    const allButtons = editorInstance.toolbar.toolbarButtons;
    for (let [x, y] of allButtons)
    {
        if (x == "backButton" || x == "historyButton") continue;
        if (x == "previewButton") break;
        editorInstance.toolbar.HideButton(x);
    }

    const backLambda = () =>
    {
        // When you go back, reverse all above changes
        editorInstance.toolbar.ChangeButtonText("previewButton", lang[locale].PreviewButton);
        editorInstance.toolbar.ChangeButtonText("publishButton", lang[locale].PublishButton);
        editorInstance.toolbar.ChangeButtonText("historyButton", lang[locale].HistoryButton);
        editorInstance.UnpreviewChanges();
        editorInstance.OpenEditor(unchangedPostText, false);

        document.getElementById("editorDiff").style.display = "none";

        // Show em buttons again
        const allButtons = editorInstance.toolbar.toolbarButtons;
        for (let [x, y] of allButtons)
        {
            editorInstance.toolbar.ShowButton(x);
        }

        // Return to hardcoded values
        document.getElementById("backButton").parentElement.removeEventListener("click", backLambda);
        editorInstance.toolbar.SetButtonCallback("backButton", "PreBackToRead()");

        document.getElementById("previewButton").parentElement.removeEventListener("click", showSourceLambda);
        editorInstance.toolbar.SetButtonCallback("previewButton", "PrePreviewEdit()");

        editorInstance.toolbar.HideButton("publishButton");
        document.getElementById("publishWrap").setAttribute("data-onclick", "PrePublish()");
        editorInstance.toolbar.SetButtonCallback("historyButton", "OpenHistory()");
        previewingPage = false;

        document.getElementById("descriptionInput").disabled = false;
        document.getElementById("descriptionInput").value = ``;
    };

    const showSourceLambda = () =>
    {
        // Basically a preview flipflop for this current history ver.
        if (previewingPage)
        {
            editorInstance.UnpreviewChanges();
            editorInstance.toolbar.ShowButton("historyButton");
            editorInstance.toolbar.ChangeButtonText("previewButton", lang[locale].CloseSourceCode);
        }
        else 
        {
            editorInstance.PreviewChanges();
            editorInstance.toolbar.HideButton("historyButton");
            editorInstance.toolbar.ChangeButtonText("previewButton", lang[locale].OpenSourceCode);
        }
        previewingPage = !previewingPage;
    };

    // Set new values for callbacks
    document.getElementById("backButton").parentElement.addEventListener("click", backLambda);
    editorInstance.toolbar.SetButtonCallback("backButton", "()");

    document.getElementById("previewButton").parentElement.addEventListener("click", showSourceLambda);
    editorInstance.toolbar.SetButtonCallback("previewButton", "()");

    document.getElementById("confirmationBackdrop").style.display = "none";
    document.getElementById("descriptionInput").disabled = true;
    document.getElementById("descriptionInput").value = `${lang[locale].BringBackHistoryText} ${hash}.`;

    previewingPage = true;
    DisableReloadPrompt();
}

/**
* Open history card info
* @returns {void}
*/
function OpenHistoryInfo(e)
{
    // Hide other prompt elements
    document.getElementById('historyList').style.display = "none";
    document.getElementById('historyLegend').style.display = "none";

    // Show all the history entry data
    const hash = e.target.getAttribute("data-hash");
    let template = `
    <div class="infoField"><b>${lang[locale].UserText}</b><span>:username:</span></div>
    <div class="infoField"><b style="min-width: 20%;">${lang[locale].ChangeDescText}</b><span style="text-align: right;text-wrap: pretty;max-width: 80%;height: fit-content;">:description:</span></div>
    <div class="infoField"><b>${lang[locale].TimeText}</b><i>:date:</i></div>
    <div class="infoField"><b>${lang[locale].VersionText}</b><i>:hash:</i></div>
    `;

    // Replace in template
    template = template.replace(":username:", pageMetadata.history[hash].user);
    template = template.replace(":description:", decodeURIComponent(pageMetadata.history[hash].description));
    template = template.replace(":date:", pageMetadata.history[hash].date);
    template = template.replace(":hash:", hash);
    document.getElementById("historyInfo").innerHTML = template;

    // Remove all event listeners
    const old_element = document.getElementById("cancel");
    const new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);

    const proceedLambda = () =>
    {
        // Show previous ver on proceed
        PreviewPreviousVer(hash);
        document.getElementById("confirmationBackdrop").style.display = "none";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById('historyLegend').style.display = "flex";
    };

    // Don't show preview option if it's not a html/text change
    if (pageMetadata.history[hash].type == "html/text")
    {
        document.getElementById("proceed").style.display = "inline-block";
        document.getElementById("proceed").innerHTML = lang[locale].PreviewButton;

        // oh my god. i hate event listeners so much, why can't i just remove all of them without cloning a button
        const c_elem = document.getElementById("proceed");
        const cp_elem = c_elem.cloneNode(true);
        c_elem.parentNode.replaceChild(cp_elem, c_elem);

        cp_elem.addEventListener("click", proceedLambda);
    }
    else
    {
        document.getElementById("proceed").style.display = "none";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
    }


    const listen = () =>
    {
        // Go back to history list if back
        const cancelLambda = () =>
        {
            document.getElementById("proceed").removeEventListener("click", proceedLambda);
            document.getElementById("confirmationBackdrop").style.display = "none";
        };

        new_element.removeEventListener("click", listen);
        new_element.addEventListener("click", cancelLambda);

        // Revert everything
        document.getElementById("historyInfo").style.display = "none";
        document.getElementById("historyList").style.display = "flex";
        document.getElementById('historyLegend').style.display = "flex";
        document.getElementById('historyPages').style.display = "block";
        document.getElementById("proceed").style.display = "none";
    };

    // Listening and cleanup
    new_element.addEventListener("click", listen);
    document.getElementById("historyInfo").style.display = "flex";
    document.getElementById('historyLegend').style.display = "none";
    document.getElementById('historyPages').style.display = "none";
}

/**
* Shows diffs between two history versions
* @returns {void}
*/
function ToggleDiff()
{
    if (showingDiff)
    {
        // If already showing diff just go back to source code
        document.getElementById("editorDiff").style.display = "none";
        document.getElementById("editorInput").style.display = "flex";
        editorInstance.toolbar.ChangeButtonText("historyButton", lang[locale].ShowDiff);
        editorInstance.toolbar.ShowButton("previewButton");
        differ.destroy();
    }
    else
    {
        // Otherwise open new diff editor
        editorInstance.toolbar.ChangeButtonText("historyButton", lang[locale].HideDiff);
        differ = new AceDiff({
            element: '#editorDiff',
            theme: "ace/theme/github_light_default",
            mode: `ace/mode/html`,
            left: {
                content: unchangedPostText,
                copyLinkEnabled: false,
                editable: false
            },
            right: {
                content: editorInstance.GetContent(),
                copyLinkEnabled: false,
                editable: false
            },
        });
        differ.getEditors().left.session.setUseWrapMode(true);
        differ.getEditors().right.session.setUseWrapMode(true);
        document.getElementById("editorDiff").style.display = "flex";
        document.getElementById("editorInput").style.display = "none";
        editorInstance.toolbar.HideButton("previewButton");
    }

    showingDiff = !showingDiff;
}