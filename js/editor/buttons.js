let prevValue = "";

function ChangePrompt(use, settings)
{
    // Settings: { captionText: String, proceedText: String, cancelText: String, proceedCallback: (), cancelCallback: () }
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

    configEditor.style.display = "none";
    historyEditor.style.display = "none";
    userEditor.style.display = "none";
    refToolInput.style.display = "none";
    imageEditor.style.display = "none";

    switch (use) {
        case 'config':
            // Load metadata values
            document.getElementById("cF-link").getElementsByTagName("input")[0].value = window._metadata.link;
            document.getElementById("cF-desc").getElementsByTagName("input")[0].value = window._metadata.description;
            document.getElementById("cF-img").getElementsByTagName("select")[0].value = window._metadata.image;

            let newKeywords = "";
            for (const x of window._metadata.keywords)
            {
                newKeywords += ` <div class="keyword">${x} <img src="https://www.svgrepo.com/show/499592/close-x.svg" class="x-icon" onclick="RemoveKeyword(event)"></div>`
            }
            document.getElementById("keywordInput").innerHTML = `${newKeywords} <input id="keywordTextIn" onkeyup="KeywordProcess(event)">`;

            document.getElementById("protectionList").children[_metadata.protection].selected = "true";
            for (let i = _userData.clearance + 1; i < 4; i++)
            {
                document.getElementById("protectionList").children[i].disabled = "true";
            }

            let allImages = ``;
            window._AllImages.forEach((e) => {
                allImages += `<option>${e}</option>`;
            });
            document.getElementById("imagesList").innerHTML = allImages;

            confirmationPromptText.style.display = "block";
            confirmationPromptText.innerHTML = settings.captionText;
            configEditor.style.display = "flex";
            changesInput.style.display = "none";

            proceedButton.style.display = "inline-block";
            cancelButton.style.display = "inline-block";
            break;

        case 'image':
            // Load image values
            let imageList = ``;
            window._AllImages.forEach((e) => {
                imageList += `<option>${e}</option>`;
            });
            document.getElementById("allImages").innerHTML = imageList;
            document.getElementById("allImages").addEventListener("change", () => {
                document.getElementById("preview").src = `${fetchURL}${locale}/${pageTitle}/Images/${document.getElementById("allImages").value}`;
            });
            document.getElementById("preview").src = `${fetchURL}${locale}/${pageTitle}/Images/${document.getElementById("allImages").value}`;
            document.getElementById("confirmationBackdrop").style.display = "block";

            document.getElementById("fileSelect").addEventListener("change", ManageUpload);

            if (window._userData.clearance < 3) document.getElementById("removeImage").disabled = true;

            confirmationPromptText.innerHTML = settings.captionText;
            proceedButton.style.display = "none";
            changesInput.style.display = "none";
            imageEditor.style.display = "flex";
            break;

        case 'history':
            historyEditor.style.display = "flex";
            confirmationPromptText.style.display = "block";
            confirmationPromptText.innerHTML = `${settings.captionText}`;
            changesInput.style.display = "none";
            document.getElementById("historyInfo").style.display = "none";
            document.getElementById("historyList").style.display = "flex";
            document.getElementById('historyLegend').style.display = "flex";
            document.getElementById('historyPages').style.display = "block";

            proceedButton.style.display = "none";
            cancelButton.style.display = "inline-block";
            break;

        case 'user':
            const lookingFor = settings.user;
            proceedButton.style.display = "none";
            cancelButton.style.display = "inline-block";

            document.getElementById('userPFP').src = lookingFor.img;
            document.getElementById('user-login').innerHTML = lookingFor.login;
            document.getElementById('user-clearance').innerHTML = lookingFor.clearance;
            if (lookingFor.note == "") lookingFor.note = "<i>N/A</i>"
            document.getElementById('user-note').innerHTML = lookingFor.note;

            changesInput.style.display = "none";
            confirmationPromptText.innerHTML = settings.captionText;
            confirmationPromptText.style.display = "flex";
            userEditor.style.display = "flex";
            break;

        case 'refTool':
            confirmationPromptText.innerHTML = settings.captionText;
            confirmationPromptText.style.display = "flex";
            refToolInput.style.display = "flex";
            changesInput.style.display = "none";
            break;

        default:

            // Button settings
            proceedButton.style.display = "inline-block";
            cancelButton.style.display = "inline-block";
        
            if (typeof settings.haveInput == "boolean" && settings.haveInput) changesInput.style.display = "block";
            else changesInput.style.display = "none";

            confirmationPromptText.innerHTML = settings.captionText;
            confirmationPromptText.style.display = "flex";
            break;
    }

    // Show prompt
    proceedButton.innerText = settings.proceedText;
    cancelButton.innerText = settings.cancelText;
    proceedButton.addEventListener("click", settings.proceedCallback);
    cancelButton.addEventListener("click", settings.cancelCallback);

    confirmationBackdrop.style.display = "block";
}

function PreBackToRead()
{
    const proceedLambda = () => {
        BackToRead();
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    const cancelLambda = () => {
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    ChangePrompt("default", { captionText: lang[locale].BackPrompt, proceedText: lang[locale].LeaveButton, cancelText: lang[locale].CancelButton, proceedCallback: proceedLambda, cancelCallback: cancelLambda, haveInput: false });
}

function BackToRead()
{
    if (previewingPage)
    {
        const allButtons = document.getElementById("toolbar").children;
        for (x of allButtons)
        {
            x.style.display = "flex";
        }
        document.getElementById("descriptionInput").disabled = false;
        document.getElementById("descriptionInput").value = ``;
        document.getElementById('previewButton').innerText = "Sakrij Izmene";
        document.getElementById("publishButton").innerText = "Objavi Izmene";
        document.getElementById("editorOutput").style.display = "none";
    }

    // Close the editor
    editorInstance.CloseEditor();
}

function PrePreviewEdit()
{
    if (!previewingPage) 
    {
        editorInstance.toolbar.ShowButton("publishButton");
        editorInstance.toolbar.HideButton("previewButton");
        editorInstance.toolbar.SetButtonCallback("backButton", "PrePreviewEdit()");
        editorInstance.toolbar.ChangeButtonText("backButton", lang[locale].UnpreviewButton);

        editorInstance.PreviewChanges();
        window._RefManager.ClearRefs();
    }
    else 
    {
        editorInstance.toolbar.HideButton("publishButton");
        editorInstance.toolbar.ShowButton("previewButton");
        editorInstance.toolbar.SetButtonCallback("backButton", "PreBackToRead()");
        editorInstance.toolbar.ChangeButtonText("backButton", lang[locale].BackButton);

        editorInstance.UnpreviewChanges();
    }

    previewingPage = !previewingPage;
}

function PrePublish()
{
    const proceedLambda = () => {
        DisableReloadPrompt();
        window.PublishEdit(editorInstance.GetContent());
        document.getElementById("confirmationBackdrop").style.display = "none";
    }

    const cancelLambda = () => {
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    const promptSettings = { 
        captionText: lang[locale].PublishPrompt.replace(`""`, `"` + pageTitle + `"`), 
        proceedText: lang[locale].PublishShort, 
        cancelText: lang[locale].CancelButton, 
        proceedCallback: proceedLambda, 
        cancelCallback: cancelLambda, 
        haveInput: true 
    }

    ChangePrompt("default", promptSettings);
}

function OpenConfigEditor()
{
    const proceedLambda = () => {
        DisableReloadPrompt();
        window.UpdateConfig();
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    const cancelLambda = () => {
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    ChangePrompt('config', { captionText: `<b style="min-width: 5vw;">${lang[locale].MetadataTitle}</b>`, proceedText: lang[locale].PublishShort, cancelText: lang[locale].CancelButton, proceedCallback: proceedLambda, cancelCallback: cancelLambda });
}

function OpenImages()
{
    const cancelLambda = () => {
        ImageUploadPromptCancel();
        document.getElementById("confirmationBackdrop").style.display = "none";
    };
    ChangePrompt('image', { captionText: `<b style="min-width: 5vw;">${lang[locale].ImageTitle}</b>`, proceedText: "", cancelText: lang[locale].BackButton, proceedCallback: () => {}, cancelCallback: cancelLambda });
}

function ManageUpload()
{
    if (!document.getElementById("fileSelect").files || !document.getElementById("fileSelect").files[0]) return;
    
    const FR = new FileReader();
    window._selectedImage = document.getElementById("fileSelect").files[0];
          
    FR.addEventListener("load", function(evt) {
        const extension = window._selectedImage.name.match(/\.[0-9a-z]+$/i);
        document.getElementById("allImages").style.display = "none";
        document.getElementById("preview").src = evt.target.result;
        document.getElementById("filenameExtension").innerHTML = extension;
        document.getElementById("filenameInput").value = window._selectedImage.name.split(".")[0];

        document.getElementById("fileInput").innerText = lang[locale].ConfirmAddingImageButton;
        document.getElementById("removeImage").innerHTML = lang[locale].CancelButton;

        document.getElementById("removeImage").classList.remove("dangerButton");
        document.getElementById("removeImage").classList.add("normalButton");
        document.getElementById("fileInput").classList.remove("normalButton");
        document.getElementById("fileInput").classList.add("notableButton");

        document.getElementById("removeImage").addEventListener("click", ImageUploadPromptCancel);

        document.getElementById("filenameWrapper").style.display = "block";
        document.getElementById("fileInput").addEventListener("click", WrapperAddImage);
    }); 
          
    FR.readAsDataURL(document.getElementById("fileSelect").files[0]);
}

function WrapperRemoveImage()
{
    window.RemoveImage(document.getElementById('allImages').value);
}

async function WrapperAddImage(e)
{
    e.preventDefault();

    const imageData = await window._selectedImage.arrayBuffer();
    window.AddImage(imageData, document.getElementById("filenameInput").value + document.getElementById("filenameExtension").innerHTML);
}

function OpenHistory()
{
    const cancelLambda = () => {
        document.getElementById("confirmationBackdrop").style.display = "none";
    };
    ChangePrompt('history', { captionText: `<b style="font-size: 130%;">${lang[locale].HistoryTitle}</b>`, proceedText: "", cancelText: "Nazad", proceedCallback: () => {}, cancelCallback: cancelLambda });
}

function KeywordProcess(e)
{
    if (e.code == "Comma")
    {
        document.getElementById("keywordInput").innerHTML = document.getElementById("keywordInput").innerHTML.replace(`<input id="keywordTextIn" onkeyup="KeywordProcess(event)">`, "") +
            `<div class="keyword">${e.target.value.slice(0, -1)} <img src="https://www.svgrepo.com/show/499592/close-x.svg" class="x-icon" onclick="RemoveKeyword(event)"></div>` +
            `<input id="keywordTextIn" onkeyup="KeywordProcess(event)">`;
        e.target.value = ``;
    }
    else if (e.code == "Backspace" && prevValue == "")
    {
        document.getElementById("keywordInput").removeChild(document.getElementById("keywordInput").querySelector('li:nth-last-child(2)'));
    }
    prevValue = document.getElementById("keywordTextIn").value;
}


function RemoveKeyword(e)
{
    e.target.parentElement.remove();
}

const ImageUploadPromptCancel = () => {
    let allImages = ``;
    window._AllImages.forEach((e) => {
        allImages += `<option>${e}</option>`;
    });
    document.getElementById("allImages").innerHTML = allImages;
    document.getElementById("allImages").options[0].selected = true;
    document.getElementById("preview").src = `${fetchURL}${locale}/${pageTitle}/Images/${document.getElementById("allImages").value}`;

    document.getElementById("removeImage").classList.add("dangerButton");
    document.getElementById("removeImage").classList.remove("normalButton");
    document.getElementById("fileInput").classList.add("normalButton");
    document.getElementById("fileInput").classList.remove("notableButton");

    document.getElementById("fileInput").innerHTML = `${lang[locale].AddImageButton}<input id="fileSelect" type="file" accept="image/*">`;
    document.getElementById("removeImage").innerHTML = lang[locale].DeleteImage;

    document.getElementById("allImages").disabled = false;
    document.getElementById("allImages").style.display = "block";
    document.getElementById("filenameWrapper").style.display = "none";

    document.getElementById("fileInput").removeEventListener("click", WrapperAddImage);
    document.getElementById("fileSelect").addEventListener("change", ManageUpload);
}