let highlightT = true;
let wrapT = true;
let previewingPage = false;
let creatingDraft = false;

function highlightToggle()
{
    highlightT = !highlightT;

    if (!highlightT)
    {
        editorInstance.aceInstance.session.setMode("ace/mode/text");
        document.getElementById("wrapToggle").parentElement.classList.remove("tWActive");
    }
    else 
    {
        editorInstance.aceInstance.session.setMode("ace/mode/html");
        document.getElementById("wrapToggle").parentElement.classList.add("tWActive");
    }
}

function wrapToggle()
{
    wrapT = !wrapT;

    if (!wrapT)
    {
        editorInstance.aceInstance.session.setUseWrapMode(false);
        document.getElementById("wrapToggle").parentElement.classList.remove("tWActive");
    }
    else 
    {
        editorInstance.aceInstance.session.setUseWrapMode(true);
        document.getElementById("wrapToggle").parentElement.classList.add("tWActive");
    }
}

function boldTool()
{
    editorInstance.aceInstance.insert(`<b>${editorInstance.aceInstance.getSelectedText()}</b>`);
}

function italicTool()
{
    editorInstance.aceInstance.insert(`<i>${editorInstance.aceInstance.getSelectedText()}</i>`);
}

function linkTool()
{
    (editorInstance.aceInstance.getSelectedText() != "") ? editorInstance.aceInstance.insert(`<w-a>${editorInstance.aceInstance.getSelectedText()}|URL</w-a>`) : editorInstance.aceInstance.insert(`<w-a>Caption|URL</w-a>`);
}

function imageTool()
{
    (editorInstance.aceInstance.getSelectedText() != "") ? editorInstance.aceInstance.insert(`<w-img>${editorInstance.aceInstance.getSelectedText()}|URL</w-img>`) : editorInstance.aceInstance.insert(`<w-img>Caption|URL</w-img>`);
}

function undoEditor()
{
    editorInstance.Undo();
}

function redoEditor()
{
    editorInstance.Redo();
}

function preRefTool()
{
    const cancelLambda = () => {
        document.getElementById("proceed").removeEventListener("click", refTool);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    ChangePrompt('refTool', { proceedText: "Ubaci", cancelText: "Nazad", proceedCallback: refTool, cancelCallback: cancelLambda, captionText: `<b>${lang[locale].RefTool}</b>`});
}

function refTool()
{
    const kids = document.getElementById("refToolInput").children;
    const values = ["", "", "", "", ""]
    let malformed = false;

    for (let i = 0; i < kids.length; i++)
    {
        // This one isnt required
        if (i == 3) continue;

        if (kids[i].children[0].value == "")
        {
            malformed = true;
            kids[i].children[0].style.border = "1px solid var(--link-nonexistent-color)";
        }
        else values[i] = kids[i].children[0].value;
    }

    if (malformed) return;

    let threeExists = "";
    if (values[3] != "") threeExists = ", ";

    editorInstance.aceInstance.insert(`<w-ref><i><w-a>${values[0]}|${values[1]}</w-a></i>, ${values[3]}${threeExists}${values[2]} ${values[4]}</w-ref>`);
    document.getElementById("proceed").removeEventListener("click", refTool);
    document.getElementById("confirmationBackdrop").style.display = "none";
    for (const x of kids) { x.border = "2px solid light-dark(rgb(118, 118, 118), rgb(133, 133, 133));"; }
}