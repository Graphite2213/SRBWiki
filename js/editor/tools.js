// Small editor tools

// Vars for keeping track of tool status
let highlightT = true;
let wrapT = true;

/**
* Toggle syntax highlighting in editor
* @returns {void}
*/
function highlightToggle()
{
    highlightT = !highlightT;
    if (!highlightT)
    {
        editorInstance.aceInstance.session.setMode("ace/mode/text");
        document.getElementById("highlightToggle").classList.remove("tWActive");
    }
    else 
    {
        editorInstance.aceInstance.session.setMode("ace/mode/html");
        document.getElementById("highlightToggle").classList.add("tWActive");
    }
}

/**
* Toggle code wrapping in editor
* @returns {void}
*/
function wrapToggle()
{
    wrapT = !wrapT;
    if (!wrapT)
    {
        editorInstance.aceInstance.session.setUseWrapMode(false);
        document.getElementById("wrapToggle").classList.remove("tWActive");
    }
    else 
    {
        editorInstance.aceInstance.session.setUseWrapMode(true);
        document.getElementById("wrapToggle").classList.add("tWActive");
    }
}

/**
* Bold selected text
* @returns {void}
*/
function boldTool()
{
    editorInstance.aceInstance.insert(`<b>${editorInstance.aceInstance.getSelectedText()}</b>`);
}

/**
* Italic
* @returns {void}
*/
function italicTool()
{
    editorInstance.aceInstance.insert(`<i>${editorInstance.aceInstance.getSelectedText()}</i>`);
}

/**
* Wrap text in wikilink
* @returns {void}
*/
function linkTool()
{
    (editorInstance.aceInstance.getSelectedText() != "") ? editorInstance.aceInstance.insert(`<w-a>${editorInstance.aceInstance.getSelectedText()}|URL</w-a>`) : editorInstance.aceInstance.insert(`<w-a>Caption|URL</w-a>`);
}

/**
* Wrap text in image
* @returns {void}
*/
function imageTool()
{
    (editorInstance.aceInstance.getSelectedText() != "") ? editorInstance.aceInstance.insert(`<w-img>${editorInstance.aceInstance.getSelectedText()}|URL</w-img>`) : editorInstance.aceInstance.insert(`<w-img>Caption|URL</w-img>`);
}

/**
* Undo in editor
* @returns {void}
*/
function undoEditor()
{
    editorInstance.Undo();
}

/**
* Redo in editor
* @returns {void}
*/
function redoEditor()
{
    editorInstance.Redo();
}

/**
* Ref tool prompt
* @returns {void}
*/
function preRefTool()
{
    const cancelLambda = () =>
    {
        document.getElementById("proceed").removeEventListener("click", refTool);
        document.getElementById("confirmationBackdrop").style.display = "none";
    };

    // Show prompt
    ChangePrompt('refTool', {
        proceedText: "Ubaci",
        cancelText: "Nazad",
        proceedCallback: refTool,
        cancelCallback: cancelLambda,
        captionText: `<b>${lang[locale].RefTool}</b>`
    });
}

/**
* Insert source reference created in tool
* @returns {void}
*/
function refTool()
{
    // Go through all input fields in tool and take their values
    const kids = document.getElementById("refToolInput").children;
    const values = ["", "", "", "", ""];
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

    // Don't add if one of the required fields arent selected
    if (malformed) return;
    let threeExists = "";
    if (values[3] != "") threeExists = ", ";

    // Insert premade ref
    editorInstance.aceInstance.insert(`<w-ref><i><w-a>${values[0]}|${values[1]}</w-a></i>, ${values[3]}${threeExists}${values[2]} ${values[4]}</w-ref>`);
    document.getElementById("proceed").removeEventListener("click", refTool);
    document.getElementById("confirmationBackdrop").style.display = "none";

    // Reset borders
    for (const x of kids) { x.border = "2px solid light-dark(rgb(118, 118, 118), rgb(133, 133, 133));"; }
}