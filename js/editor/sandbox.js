let currentDraftName = "";
let localStorageName = "editorState-";

function EditorInitLoad()
{
    localStorageName = localStorageName + locale;
    EditorLoad("");
}

function LoadFromList()
{
    EditorLoad(document.getElementById("draftDropdown").value);
}

function EditorLoad(preferredDraft = "")
{
    /*
        Local storage format:
        editorState-{locale}-{number}
        {
            name: "Name of draft",
            text: "Entire text of draft"
        }
    */
    // Dealing with local storage and saving state
    if (window.localStorage.getItem(localStorageName + "-meta") == null)
    {
        console.warn("W: User doesn't have editorState-meta, creating new.");
        window.localStorage.setItem(localStorageName + "-meta", JSON.stringify({allDrafts: []}));
    } 

    const localDraftMeta = JSON.parse(window.localStorage.getItem(localStorageName + "-meta"));

    let newList = "";
    localDraftMeta.allDrafts.forEach(e => {
        const isSelected = (e == preferredDraft) ? " selected" : "";
        newList += `<option${isSelected}>${e}</option>\n`;
    });
    document.getElementById("draftDropdown").innerHTML = newList;

    currentDraftName = (preferredDraft == "") ? localDraftMeta.allDrafts[0] : preferredDraft;
    if (localDraftMeta.allDrafts.length == 0) 
    {
        editorInstance.aceInstance.session.setValue("");
        return console.warn("W: No draft loaded.");
    }
    const localDraft = JSON.parse(window.localStorage.getItem(localStorageName + "-" + currentDraftName));
    editorInstance.OpenEditor(localDraft.text, false);

    editorInstance.aceInstance.session.on('change', () => {
        window.localStorage.setItem(localStorageName + "-" + currentDraftName, JSON.stringify({text: editorInstance.GetContent(), name: localDraft.name}));
    });   
}

function PreviewEdit()
{
    if (!previewingPage) editorInstance.PreviewChanges();
    else editorInstance.UnpreviewChanges();
    previewingPage = !previewingPage;
}

function AddDraft()
{
    const storageMeta = JSON.parse(window.localStorage.getItem(localStorageName + "-meta"));
    let draftList = storageMeta.allDrafts;

    if (draftList.length < 9 && !creatingDraft)
    {
        document.getElementById("draftDropWrapper").innerHTML = `<input id="draftDropdownText" placeholder="Unnamed Draft" onkeyup="OnEnter(event)">`;
        creatingDraft = true;
        editorInstance.aceInstance.setReadOnly(true);
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
    if (e.keyCode === 13) AddDraft();
}

function PreDeleteDraft()
{
    const proceedLambda = () => { DeleteDraft(); };
    const cancelLambda = () => { 
        document.getElementById("proceed").removeEventListener("click", proceedLambda);
        document.getElementById("confirmationBackdrop").style.display = "none";
    }

    ChangePrompt("default", { 
        proceedText: "Obriši", 
        cancelText: "Nazad", 
        proceedCallback: proceedLambda, 
        cancelCallback: cancelLambda,
        captionText: `<span style="text-align: center">${lang[locale].DraftDeletion}</span>`
    });
}

function CancelDraft()
{
    document.getElementById("confirmationBackdrop").style.display = "none";
}

function DeleteDraft()
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