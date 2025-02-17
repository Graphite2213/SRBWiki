// Socalled "big" buttons, text buttons, non-essential stuff

// Value to keep track of keyword input
let prevValue = "";

/**
 * Opens metadata editor for page
 * @returns {void}
 */
function OpenConfigEditor()
{
    const proceedLambda = () =>
    {
        // Update metadata if proceeds
        DisableReloadPrompt();
        UpdateConfig();
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    const cancelLambda = () =>
    {
        // Remove used 
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    // Show prompt
    ChangePrompt('config', {
        captionText: `<b style="min-width: 5vw;">${lang[locale].MetadataTitle}</b>`,
        proceedText: lang[locale].PublishShort,
        cancelText: lang[locale].CancelButton,
        proceedCallback: proceedLambda,
        cancelCallback: cancelLambda
    });
}

/**
 * Takes keyword input in metadata editor
 * @returns {void}
 */
function KeywordProcess(e)
{
    // If comma, create new keyword
    if (e.code == "Comma")
    {
        document.getElementById("keywordInput").innerHTML = document.getElementById("keywordInput").innerHTML.replace(`<input id="keywordTextIn" onkeyup="KeywordProcess(event)">`, "") +
            `<div class="keyword">${e.target.value.slice(0, -1)} <img src="https://www.svgrepo.com/show/499592/close-x.svg" class="x-icon" onclick="RemoveKeyword(event)"></div>` +
            `<input id="keywordTextIn" onkeyup="KeywordProcess(event)">`;
        e.target.value = ``;
    }
    // If backspace and there's nothing typed up, remove last one
    else if (e.code == "Backspace" && prevValue == "")
    {
        document.getElementById("keywordInput").removeChild(document.getElementById("keywordInput").querySelector('li:nth-last-child(2)'));
    }

    // Tracker
    prevValue = document.getElementById("keywordTextIn").value;
}

/**
 * Removes keyword from list
 * @returns {void}
 */
function RemoveKeyword(e)
{
    e.target.parentElement.remove();
}

/**
 * Opens images editor
 * @returns {void}
 */
function OpenImages()
{
    const cancelLambda = () =>
    {
        ImageUploadPromptCancel();
        document.getElementById("confirmationBackdrop").style.display = "none";
    };
    ChangePrompt('image', {
        captionText: `<b style="min-width: 5vw;">${lang[locale].ImageTitle}</b>`,
        proceedText: "",
        cancelText: lang[locale].BackButton,
        proceedCallback: () => {},
        cancelCallback: cancelLambda
    });
}

/**
 * Wrapper for removing images
 * @returns {void}
 */
function PreDeleteImage() 
{
    const proceedLambda = () =>
    {
        // Demand reason
        if (document.getElementById("descriptionInput").value == "")
        {
            document.getElementById("descriptionInput").style.border = "1px solid red";
            return;
        }

        // Remove
        RemoveImage(document.getElementById("allImages").value);
    };

    const cancelLambda = () =>
    {
        // On cancel just go back
        document.getElementById("descriptionInput").style.border = "";
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    // Show prompt
    ChangePrompt("default", {
        proceedText: lang[locale].DeleteButton,
        cancelText: lang[locale].BackButton,
        proceedCallback: proceedLambda,
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${lang[locale].ImageDeletionConfirmation}<br><b>${lang[locale].AdminLogAppearance} ${lang[locale].ReasonNeeded}</b><span>`,
        haveInput: true
    });
}

/**
 * Wrapper for adding images
 * @returns {void}
 */
async function WrapperAddImage(e)
{
    e.preventDefault();

    // Choking caroline.gif
    const imageData = await window._selectedImage.arrayBuffer();
    AddImage(imageData, document.getElementById("filenameInput").value + document.getElementById("filenameExtension").innerHTML);
}

/**
 * Image upload callback for image editor
 * @returns {void}
 */
function ManageUpload()
{
    // If we didnt select an image what are we doing
    if (!document.getElementById("fileSelect").files || !document.getElementById("fileSelect").files[0]) return;

    // Fileread and set to global vars
    const FR = new FileReader();
    window._selectedImage = document.getElementById("fileSelect").files[0];

    // When we load an image:
    FR.addEventListener("load", function (evt)
    {
        // Change UI, ask for filename and preview the image
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

    // Once uploaded run the callback above
    FR.readAsDataURL(document.getElementById("fileSelect").files[0]);
}

/**
 * Cancels image upload
 * @returns {void}
 */
const ImageUploadPromptCancel = () =>
{
    // Fill in images again
    let allImages = ``;
    pageMetadata.images.forEach((e) =>
    {
        allImages += `<option>${e}</option>`;
    });
    document.getElementById("allImages").innerHTML = allImages;

    // Dont do these if there's no images to avoid conflicts
    if (document.getElementById("allImages").options.length > 0)
    {
        document.getElementById("allImages").options[0].selected = true;
        document.getElementById("preview").src = `${fetchURL}${locale}/${pageTitle}/Images/${document.getElementById("allImages").value}`;
    } else document.getElementById("preview").src = `https://upload.wikimedia.org/wikipedia/commons/b/b1/Missing-image-232x150.png`;

    // Reset buttons, preview, allat
    document.getElementById("removeImage").classList.add("dangerButton");
    document.getElementById("removeImage").classList.remove("normalButton");
    document.getElementById("fileInput").classList.add("normalButton");
    document.getElementById("fileInput").classList.remove("notableButton");

    document.getElementById("fileInput").innerHTML = `${lang[locale].AddImageButton}<input id="fileSelect" type="file" accept="image/*">`;
    document.getElementById("removeImage").innerHTML = lang[locale].DeleteImage;

    document.getElementById("allImages").disabled = false;
    document.getElementById("allImages").style.display = "block";
    document.getElementById("filenameWrapper").style.display = "none";

    // Reset callbacks
    document.getElementById("fileInput").removeEventListener("click", WrapperAddImage);
    document.getElementById("fileSelect").addEventListener("change", ManageUpload);
};

/**
 * Open history prompt
 * @returns {void}
 */
function OpenHistory()
{
    // Simple enough
    const cancelLambda = () => { document.getElementById("confirmationBackdrop").style.display = "none"; };
    ChangePrompt('history', {
        captionText: `<b style="font-size: 130%;">${lang[locale].HistoryTitle}</b>`,
        proceedText: "",
        cancelText: lang[locale].BackButton,
        proceedCallback: () => {},
        cancelCallback: cancelLambda
    });
}

/**
 * Goes back a page in history editor
 * @returns {void}
 */
function BackPage()
{
    if (historyPageNum == 1) return;
    const currentP = Number(document.getElementById("historyStr").innerText);
    historyPageNum = currentP - 1;
    document.getElementById("historyStr").innerText = historyPageNum;
    document.getElementById("historyList").innerHTML = historyPages[historyPageNum];
}

/**
 * Goes forward a page in history editor
 * @returns {void}
 */
function ForwardPage()
{
    if (historyPageNum == historyPages.length - 1) return;
    const currentP = Number(document.getElementById("historyStr").innerText);
    historyPageNum = currentP + 1;
    document.getElementById("historyStr").innerText = historyPageNum;
    document.getElementById("historyList").innerHTML = historyPages[historyPageNum];
}