let editor;
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
    // Editor styling
    editor = ace.edit("editorInput");
    window._editorGlobal = editor;
    editor.setTheme("ace/theme/github_light_default");
    editor.session.setMode("ace/mode/html");
    editor.session.setUseWrapMode(true);
    editor.setReadOnly(true);
    document.getElementById('editorInput').style.fontSize = '15px';

    theme = CookieManager.GetCookie("theme");
    if (theme == "dark") SwitchToDark(); 

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
        editor.session.setValue("");
        UndoRedoButtonCheck();
        return console.warn("W: No draft loaded.");
    }
    const localDraft = JSON.parse(window.localStorage.getItem(localStorageName + "-" + currentDraftName));
    editor.session.setValue(localDraft.text);
    editor.gotoLine(1);
    editor.setReadOnly(false);

    editor.session.on('change', () => {
        UndoRedoButtonCheck();
        window.localStorage.setItem(localStorageName + "-" + currentDraftName, JSON.stringify({text: editor.getValue(), name: localDraft.name}));
    });   

    document.getElementById("undo").style.filter = "contrast(0.2)";
    document.getElementById("redo").style.filter = "contrast(0.2)";
}

function PreviewEdit()
{
    previewT = !previewT;

    if (previewT)
    {
        document.getElementById('editorInput').style.display = "none";
        document.getElementById('editorOutput').style.display = "block";
        document.getElementById('editorOutput').innerHTML = editor.getValue();
        document.getElementById('previewButton').style.color = "black";
        document.getElementById('previewIcon').style.filter = "contrast(1)";
    }
    else 
    {
        document.getElementById('editorInput').style.display = "block";
        document.getElementById('editorOutput').style.display = "none";
        document.getElementById('previewButton').style.color = "rgba(0, 0, 0, 0.8);";
        document.getElementById('previewIcon').style.filter = "contrast(0.2)";
        window._RefManager.clearRefs();
    }
}

function UndoRedoButtonCheck()
{
    const editor = window._editorGlobal;
    const invert = (theme == "dark") ? "invert(100%) " : "";
    if (editor.session.getUndoManager().hasUndo())
        {
            document.getElementById("undo").style.filter = `${invert}contrast(1)`;
        }
        else
        {
            document.getElementById("undo").style.filter = `${invert}contrast(0.2)`;
        }

        if (editor.session.getUndoManager().hasRedo())
        {
            document.getElementById("redo").style.filter = `${invert}contrast(1)`;
        }
        else 
        {
            document.getElementById("redo").style.filter = `${invert}contrast(0.2)`;
        }
}