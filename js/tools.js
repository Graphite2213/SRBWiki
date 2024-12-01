let highlightT = true;
let wrapT = true;
let previewT = false;
let creatingDraft = false;

function highlightToggle()
{
    highlightT = !highlightT;

    if (!highlightT)
    {
        editor.session.setMode("ace/mode/text");
        document.getElementById("highlightToggle").style.filter = "contrast(0.5)";
        if (theme == "dark") document.getElementById("highlightToggle").style.filter = "contrast(0.2) invert(100%)";
    }
    else 
    {
        editor.session.setMode("ace/mode/html");
        document.getElementById("highlightToggle").style.filter = "contrast(1)";
        if (theme == "dark") document.getElementById("highlightToggle").style.filter = "contrast(1) invert(100%)";
    }
}

function wrapToggle()
{
    wrapT = !wrapT;

    if (!wrapT)
    {
        editor.session.setUseWrapMode(false);
        document.getElementById("wrapToggle").style.filter = "contrast(0.5)";
        if (theme == "dark") document.getElementById("wrapToggle").style.filter = "contrast(0.2) invert(100%)";
    }
    else 
    {
        editor.session.setUseWrapMode(true);
        document.getElementById("wrapToggle").style.filter = "contrast(1)";
        if (theme == "dark") document.getElementById("wrapToggle").style.filter = "contrast(1) invert(100%)";
    }
}

function boldTool()
{
    editor.insert(`<b>${editor.getSelectedText()}</b>`);
}

function italicTool()
{
    editor.insert(`<i>${editor.getSelectedText()}</i>`);
}

function linkTool()
{
    (editor.getSelectedText() != "") ? editor.insert(`<w-a>URL|${editor.getSelectedText()}</w-a>`) : editor.insert(`<w-a>URL|Caption</w-a>`);
}

function imageTool()
{
    (editor.getSelectedText() != "") ? editor.insert(`<w-img>URL|${editor.getSelectedText()}</w-img>`) : editor.insert(`<w-img>URL|Caption</w-img>`);
}

function addDraft()
{
    const storageMeta = JSON.parse(window.localStorage.getItem(localStorageName + "-meta"));
    let draftList = storageMeta.allDrafts;

    if (draftList.length < 9 && !creatingDraft)
    {
        document.getElementById("draftDropWrapper").innerHTML = `<input id="draftDropdownText" placeholder="Unnamed Draft" onkeyup="OnEnter(event)">`;
        creatingDraft = true;
        window._editorGlobal.setReadOnly(true);
        return;
    }
    else if (creatingDraft)
    {
        const newDraftName = document.getElementById("draftDropdownText").value;
        if (newDraftName == "") return;

        if (draftList.includes(newDraftName))
        {
            document.getElementById("draftDropdownText").style.border = "1px red solid";
            return;
        }
        creatingDraft = false;
        window._editorGlobal.setReadOnly(false);
        document.getElementById("draftDropdownText").style.border = "0";
        draftList.push(newDraftName);
        document.getElementById("draftDropWrapper").innerHTML = `<select id="draftDropdown" onchange="LoadFromList()"></select>`;
        window.localStorage.setItem(localStorageName + "-meta", JSON.stringify({allDrafts: draftList}));
        window.localStorage.setItem(localStorageName + "-" + newDraftName, JSON.stringify({text: "", name: newDraftName}));
        EditorLoad(newDraftName);
    }
}

function OnEnter(e)
{
    if (e.keyCode === 13) addDraft();
}

function preDeleteDraft()
{
    const currentDraft = document.getElementById("draftDropdown").value;
    document.getElementById("confirmationPromptText").innerHTML = document.getElementById("confirmationPromptText").innerText.replace('""', '"'+ currentDraft + '"'); 
    document.getElementById("confirmationBackdrop").style.display = "block";
}

function cancelDraft()
{
    document.getElementById("confirmationBackdrop").style.display = "none";
}

function deleteDraft()
{
    const currentDraft = document.getElementById("draftDropdown").value;
    document.getElementById("confirmationBackdrop").style.display = "none";
    const storageMeta = JSON.parse(window.localStorage.getItem(localStorageName + "-meta"));
    const draftList = storageMeta.allDrafts;
    draftList.splice(draftList.findIndex(p => p == currentDraft), 1);

    window.localStorage.setItem(localStorageName + "-meta", JSON.stringify({allDrafts: draftList}));
    window.localStorage.removeItem(localStorageName + "-" + currentDraft);

    EditorLoad(draftList[0], true);
}

function undoEditor()
{
    window._editorGlobal.undo();
    UndoRedoButtonCheck();
}

function redoEditor()
{
    window._editorGlobal.redo();
    UndoRedoButtonCheck();
}