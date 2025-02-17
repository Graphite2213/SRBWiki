// Contains minimum required buttons for editor to work. Used everywhere.

/**
 * Prompts user with message and buttons. My honest advice? Collapse this monster
 * @returns {void}
 * @param {Wiki.PromptTypes} use
 * @param {Wiki.PromptSettings} settings 
 */
function ChangePrompt(use, settings)
{
    // Define some often used elements
    const proceedButton = document.getElementById("proceed");
    const cancelButton = document.getElementById("cancel");
    const confirmationPromptText = document.getElementById("confirmationPromptText");

    // Editors
    const configEditor = document.getElementById("configEditor");
    const imageEditor = document.getElementById("imageEditor");
    const historyEditor = document.getElementById("historyEditor");
    const userEditor = document.getElementById("userEditor");
    const refToolInput = document.getElementById("refToolInput");

    const confirmationBackdrop = document.getElementById("confirmationBackdrop");
    const changesInput = document.getElementById("descriptionInput");

    // Hide everything from the get-go
    configEditor.style.display = "none";
    historyEditor.style.display = "none";
    userEditor.style.display = "none";
    refToolInput.style.display = "none";
    imageEditor.style.display = "none";

    // Show buttons unless specified otherwise
    proceedButton.style.display = "inline-block";
    cancelButton.style.display = "inline-block";

    switch (use)
    {
        case 'config':
            // Load metadata values
            document.getElementById("cF-link").getElementsByTagName("input")[0].value = pageMetadata.meta.link;
            document.getElementById("cF-desc").getElementsByTagName("input")[0].value = pageMetadata.meta.description;
            document.getElementById("cF-img").getElementsByTagName("select")[0].value = pageMetadata.meta.image;

            // Turning keywords into elements
            let newKeywords = "";
            for (const x of pageMetadata.meta.keywords)
            {
                newKeywords += ` <div class="keyword">${x} <img src="https://www.svgrepo.com/show/499592/close-x.svg" class="x-icon" onclick="RemoveKeyword(event)"></div>`;
            }
            document.getElementById("keywordInput").innerHTML = `${newKeywords} <input id="keywordTextIn" onkeyup="KeywordProcess(event)">`;

            // Selecting correct protection list
            document.getElementById("protectionList").children[pageMetadata.meta.protection].selected = "true";
            for (let i = userData.clearance + 1; i < 4; i++)
            {
                document.getElementById("protectionList").children[i].disabled = "true";
            }

            // Listing out all images
            let allImages = ``;
            pageMetadata.images.forEach((e) =>
            {
                allImages += `<option>${e}</option>`;
            });
            document.getElementById("imagesList").innerHTML = allImages;

            // Show the needed elements
            confirmationPromptText.style.display = "block";
            confirmationPromptText.innerHTML = settings.captionText;
            configEditor.style.display = "flex";
            changesInput.style.display = "none";
            break;

        case 'image':
            // Load image values
            let imageList = ``;
            pageMetadata.images.forEach((e) =>
            {
                imageList += `<option>${e}</option>`;
            });
            document.getElementById("allImages").innerHTML = imageList;

            // When image changes change preview
            document.getElementById("allImages").addEventListener("change", () =>
            {
                document.getElementById("preview").src = `${fetchURL}${locale}/${pageTitle}/Images/${document.getElementById("allImages").value}`;
            });

            // If there's atleast one image show it as preview
            if (document.getElementById("allImages").value != "")
                document.getElementById("preview").src = `${fetchURL}${locale}/${pageTitle}/Images/${document.getElementById("allImages").value}`;

            // Setup file upload and disable button if clearance isnt enough
            document.getElementById("fileSelect").addEventListener("change", ManageUpload);
            if (userData.clearance < 1) 
            {
                document.getElementById("removeImage").classList.add("disabledDangerButton");
                document.getElementById("removeImage").setAttribute("onclick", "");
            }

            // Show necessary elements
            confirmationPromptText.innerHTML = settings.captionText;
            imageEditor.style.display = "flex";
            break;

        case 'history':
            // Show necessary elements, history is already populated
            historyEditor.style.display = "flex";
            confirmationPromptText.style.display = "block";
            confirmationPromptText.innerHTML = `${settings.captionText}`;

            document.getElementById("historyInfo").style.display = "none";
            document.getElementById("historyList").style.display = "flex";
            document.getElementById('historyLegend').style.display = "flex";
            document.getElementById('historyPages').style.display = "block";
            break;

        case 'user':
            // The user is not undefined if this prompt is called
            const lookingFor = settings.user;

            // Show user data
            document.getElementById('userPFP').src = lookingFor.img;
            document.getElementById('user-login').innerHTML = lookingFor.login;
            document.getElementById('user-clearance').innerHTML = lookingFor.clearance;

            // If note is nothing, show NA
            if (lookingFor.note == "") lookingFor.note = "<i>N/A</i>";
            document.getElementById('user-note').innerHTML = lookingFor.note;

            // Show editor
            userEditor.style.display = "flex";
            break;

        case 'refTool':
            // Show tool
            refToolInput.style.display = "flex";
            break;

        default:
            break;
    }

    // Show and hide buttons depending on settings, give them their callbacks
    if (settings.proceedText != "") proceedButton.innerText = settings.proceedText;
    else proceedButton.style.display = "none";

    if (settings.cancelText != "") cancelButton.innerText = settings.cancelText;
    else cancelButton.style.display = "none";

    proceedButton.addEventListener("click", settings.proceedCallback);
    cancelButton.addEventListener("click", settings.cancelCallback);

    // Show prompt
    if (typeof settings.haveInput == "boolean" && settings.haveInput) changesInput.style.display = "block";
    else changesInput.style.display = "none";

    if (typeof settings.captionText == "string" && settings.captionText != "") confirmationPromptText.innerHTML = settings.captionText;
    else confirmationPromptText.style.display = "none";

    confirmationBackdrop.style.display = "block";
}

/**
* Opens the local page editor
* @returns {string}
*/
function OpenLocalEditor()
{
    // If already open, close
    if (editorInstance.editorElement.style.display == "flex") return PreBackToRead();

    if (loggedIn)
    {
        // If mobile collapse the text buttons into a dropdown
        if (window.matchMedia(`(max-width: ${mobileTreshold}px)`).matches) ToggleMobileDropdown();
        if (!pageExists)
        {
            // Don't let my bad programming fool you, this is where you edit the template on a nonexistent page
            // You don't/can't use all this if the page doesn't already exist
            editorInstance.OpenEditor(unchangedPostText, !CanAccess(userData.clearance, 2));

            editorInstance.toolbar.HideButton("historyButton");
            editorInstance.toolbar.HideButton("configEdit");
            editorInstance.toolbar.HideButton("imagesEditor");
            return;
        }

        // If you're banned or can't edit due to protection, disable editor
        const disableDefault = !CanAccess(userData.clearance, pageMetadata.meta.protection);
        if (disableDefault) editorInstance.toolbar.DisableToolbar(`${lang[locale].LowClearanceMessage} (${ComputeProtectionString(pageMetadata.meta.protection)})`);
        editorInstance.OpenEditor(unchangedPostText, disableDefault);
    }
    // If token doesnt exist prompt login
    else editorInstance.EditorLoginState();
}


/**
 * Creates new page if one doesn't already exist
 * @returns {void}
 */
function CreateNewPage()
{
    // JIC
    if (pageExists) return;
    creatingNewPage = true;

    // Hide all buttons not necessary for creation process
    const allButtons = editorInstance.toolbar.toolbarButtons;
    let seen = false;
    for (let [x, y] of allButtons)
    {
        if (x == "backButton") continue;
        if (x == "previewButton") break;
        if (seen) editorInstance.toolbar.HideButton(x);
        if (x == "redo") seen = true;
    }

    // Open editor
    editorInstance.OpenEditor("", false);
}

/**
 * Prompts user about deleting current page
 * @returns {void}
 */
function PreDeletePage() 
{
    const proceedLambda = () =>
    {
        // Deleting a page needs a reason
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }
        // If you have a reason, go ahead
        RemovePage();
    };

    const cancelLambda = () =>
    {
        // Reset border, remove event listener, hide
        document.getElementById("descriptionInput").style.border = "";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    // Show prompt
    ChangePrompt("default", {
        proceedText: "Obriši",
        cancelText: "Nazad",
        proceedCallback: proceedLambda,
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${DeletionConfirmation}<br><b>${lang[locale].AdminLogAppearance} ${lang[locale].ReasonNeeded}</b><span>`,
        haveInput: true
    });
}

/**
 * Prompts user about moving current page
 * @returns {void}
 */
function PreMovePage()
{
    const proceedLambda = () =>
    {
        // Moving a page needs a location
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }

        // Go ahead, within reason
        MovePage(document.getElementById("descriptionInput").value);
    };

    const cancelLambda = () =>
    {
        // Reset border, remove callback, hide and replace placeholder
        document.getElementById("descriptionInput").style.border = "";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
        document.getElementById("descriptionInput").placeholder = lang[locale].ChangeDescText;
    };

    // This is where we move the page so we need to make that clear to the user
    document.getElementById("descriptionInput").placeholder = lang[locale].MoveLocation;
    ChangePrompt("default", {
        proceedText: lang[locale].MoveButton,
        cancelText: lang[locale].BackButton,
        proceedCallback: proceedLambda,
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${lang[locale].MovingConfirmation}<br><b>${lang[locale].AdminLogAppearance}</b><span>`,
        haveInput: true
    });
}

/**
 * Previews editor changes
 * @returns {void}
 */
function PrePreviewEdit()
{
    if (!previewingPage) 
    {
        // Preview changes
        editorInstance.toolbar.ShowButton("publishButton");
        editorInstance.toolbar.HideButton("previewButton");
        editorInstance.toolbar.SetButtonCallback("backButton", "PrePreviewEdit()");
        editorInstance.toolbar.ChangeButtonText("backButton", lang[locale].UnpreviewButton);

        // I hate mobile dev
        if (window.matchMedia(`(max-width: ${mobileTreshold}px)`).matches)
        {
            document.getElementById("publishWrap").style.display = "flex";
            document.getElementById("previewWrap").style.display = "none";
            document.getElementById("backButtonWrapper").style.display = "none";
        }

        // We need to clear the refs so they dont duplicate
        editorInstance.PreviewChanges();
        window._RefManager.ClearRefs();
    }
    else 
    {
        // Hide changes
        editorInstance.toolbar.HideButton("publishButton");
        editorInstance.toolbar.ShowButton("previewButton");
        editorInstance.toolbar.SetButtonCallback("backButton", "PreBackToRead()");
        editorInstance.toolbar.ChangeButtonText("backButton", lang[locale].BackButton);

        // Mobile
        if (window.matchMedia(`(max-width: ${mobileTreshold}px)`).matches)
        {
            document.getElementById("publishWrap").style.display = "none";
            document.getElementById("previewWrap").style.display = "flex";
            document.getElementById("backButtonWrapper").style.display = "flex";
        }

        editorInstance.UnpreviewChanges();
    }
    previewingPage = !previewingPage;
}

/**
 * Exists editor
 * @returns {void}
 */
function PreBackToRead()
{
    const proceedLambda = () =>
    {
        BackToRead();
    };

    const cancelLambda = () =>
    {
        // Remove used button's callback
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    ChangePrompt("default", {
        captionText: lang[locale].BackPrompt,
        proceedText: lang[locale].LeaveButton,
        cancelText: lang[locale].CancelButton,
        proceedCallback: proceedLambda,
        cancelCallback: cancelLambda,
        haveInput: false
    });
}

function BackToRead()
{
    // TODO: Hardcoded button text
    if (previewingPage)
    {
        // Show all buttons that were previously hidden
        const allButtons = document.getElementById("toolbar").children;
        for (x of allButtons) x.style.display = "flex";

        // Reset some values to default
        document.getElementById("descriptionInput").disabled = false;
        document.getElementById("descriptionInput").value = ``;
        document.getElementById('previewButton').innerText = lang[locale].PreviewButton;
        document.getElementById("publishButton").innerText = lang[locale].PublishButton;
        document.getElementById("editorOutput").style.display = "none";
    }

    // Close the editor
    editorInstance.CloseEditor();
    document.getElementById("confirmationBackdrop").style.display = "none";
}

/**
 * Prompts user about publishing changes
 * @returns {void}
 */
function PrePublish()
{
    const proceedLambda = () =>
    {
        // Editing need a summar
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }

        // Publish edit to wiki
        PublishEdit(editorInstance.GetContent());
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    const cancelLambda = () =>
    {
        // Remove used
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    // Show prompt
    const promptSettings = {
        captionText: lang[locale].PublishPrompt.replace(`""`, `"` + pageTitle + `"`),
        proceedText: lang[locale].PublishShort,
        cancelText: lang[locale].CancelButton,
        proceedCallback: proceedLambda,
        cancelCallback: cancelLambda,
        haveInput: true
    };
    ChangePrompt("default", promptSettings);
}