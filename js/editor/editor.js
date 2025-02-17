// Toolbar and Editor classes used everywhere

/**
 * Editor toolbar class
 */
class Toolbar
{
    /*** @type {Wiki.ToolbarButtonMap} */
    toolbarButtons = new Map();

    /*** @type {HTMLElement} */
    toolbarElement = null;

    /*** @type {Wiki.ToolbarButton} */
    pusherTracker = { element: null };

    constructor(toolbarElementId)
    {
        this.toolbarElement = document.getElementById(toolbarElementId);
        const toolbarKids = this.toolbarElement.children;

        for (const child of toolbarKids) 
        {
            this.toolbarButtons.set(child.children[0].id, { element: child.children[0], parent: this });
            if (child.classList.contains("pusher")) this.pusherTracker.element = child;
        }
    }

    HideButton(buttonId)
    {
        // Parent elem to affect the wrapper
        this.toolbarButtons.get(buttonId).element.parentElement.style.display = "none";
    }

    ShowButton(buttonId)
    {
        this.toolbarButtons.get(buttonId).element.parentElement.style.display = "flex";
    }

    ChangePusher(newPusher)
    {
        this.pusherTracker.element.parentElement.classList.remove('pusher');
        this.pusherTracker.element = document.getElementById(newPusher);
        this.pusherTracker.element.parentElement.classList.add('pusher');
    }

    ChangeButtonText(buttonId, newText)
    {
        this.toolbarButtons.get(buttonId).element.innerText = newText;
    }

    ChangeButtonStyle(buttonId, newStyle)
    {
        const wrapper = this.toolbarButtons.get(buttonId).element.parentElement;
        switch (newStyle)
        {
            case 'normal':
                wrapper.style.backgroundColor = "transparent";
                wrapper.style.filter = "none";
                wrapper.classList.add("toolWrapper");
                if (wrapper.attributes.getNamedItem("data-onclick") != null) wrapper.setAttribute("onclick", wrapper.attributes.getNamedItem("data-onclick").value);
                break;

            case 'danger':
                wrapper.style.backgroundColor = "#bf3c2c";
                wrapper.style.filter = "none";
                wrapper.classList.add("toolWrapper");
                if (wrapper.attributes.getNamedItem("data-onclick") != null) wrapper.setAttribute("onclick", wrapper.attributes.getNamedItem("data-onclick").value);
                break;

            case 'notable':
                wrapper.style.backgroundColor = "#0378cb";
                wrapper.style.filter = "none";
                wrapper.classList.add("toolWrapper");
                if (wrapper.attributes.getNamedItem("data-onclick") != null) wrapper.setAttribute("onclick", wrapper.attributes.getNamedItem("data-onclick").value);
                break;

            case 'disabled':
                wrapper.style.filter = "contrast(0.5)";
                wrapper.classList.remove("toolWrapper");
                wrapper.setAttribute("data-onclick", wrapper.attributes.getNamedItem("onclick").value);
                wrapper.setAttribute("onclick", "");
                break;
        }
    }

    HideToolbar()
    {
        this.toolbarElement.style.display = "none";
        document.getElementById("mobileToolbarDropdown").style.display = "none";
    }

    ShowToolbar()
    {
        const toolbarKids = this.toolbarElement.children;

        for (let i = toolbarKids.length - 1; i >= 0; --i)
        {
            if (toolbarKids[i].classList.contains("textWrapper") && window.matchMedia("(max-width: 780px)").matches) 
            {
                const cloned = toolbarKids[i].cloneNode(true);
                document.getElementById("mobileToolbarDropdown").append(cloned);
                this.toolbarButtons[toolbarKids[i].id] = { element: cloned, parent: this };
                toolbarKids[i].remove();
            }
        }

        this.toolbarElement.children;
        this.toolbarElement.style.display = "flex";
    }

    SetButtonCallback(buttonId, callback)
    {
        document.getElementById(buttonId).parentElement.setAttribute("onclick", callback);
    }

    DisableToolbar(message) 
    {
        document.getElementById("toolbar").innerHTML = `
        <span class="toolbarMessage">
            ${message}
        </span>
        <div onclick="BackToRead()" id="backButtonWrapper" class="toolWrapper textWrapper" title="Vrati se na stranicu">
            <div class="tool textTool" id="backButton">${lang[locale].BackButton}</div>
        </div>`;
        document.getElementById("toolbar").style.justifyContent = "space-around";
    }
}

/**
 * Editor class
 */
class Editor
{

    /*** @type {import("../types/ace").AceAjax.Editor} */
    aceInstance = {};

    /*** @type {Toolbar} */
    toolbar = null;

    /*** @type {HTMLElement} */
    editorElement = null;

    /*** @type {HTMLElement} */
    outputElement = null;

    /*** @type {HTMLElement} */
    pageElement = null;

    /*** @type {HTMLElement} */
    overlayElement = null;

    /**
    * Creates an ACE instance, sets default settings and parameters
    * @returns {void}
    */
    constructor(editorId, outputId, actualPageId, overlayId, toolbarId)
    {
        this.aceInstance = ace.edit(editorId);
        this.aceInstance.setTheme("ace/theme/github_light_default");
        this.aceInstance.session.setMode("ace/mode/html");
        this.aceInstance.session.setUseWrapMode(true);
        this.editorElement = document.getElementById(editorId);
        this.outputElement = document.getElementById(outputId);
        this.pageElement = document.getElementById(actualPageId);
        this.overlayElement = document.getElementById(overlayId);
        this.editorElement.style.fontSize = '15px';
        this.toolbar = new Toolbar(toolbarId);

        if (theme == "dark") this.aceInstance.setTheme("ace/theme/github_dark");

        this.aceInstance.gotoLine(1);

        // Nothing to un/redo on creation
        document.getElementById("undo").style.filter = "contrast(0.2)";
        document.getElementById("redo").style.filter = "contrast(0.2)";
    }

    /**
    * Shows loading spinner over editor
    * @returns {void}
    */
    EditorLoadingState()
    {
        this.toolbar.ShowToolbar();
        this.editorElement.parentElement.style.display = "flex";

        this.editorElement.style.display = "none";
        this.outputElement.style.display = "none";
        this.pageElement.style.display = "none";
        this.overlayElement.style.display = "flex";

        document.getElementById("loginWithGH").style.display = "none";
        document.getElementById("loadingGif").style.display = "flex";
    }

    /**
    * Shows login button over editor
    * @returns {void}
    */
    EditorLoginState()
    {
        this.toolbar.ShowToolbar();
        this.toolbar.DisableToolbar(lang[locale].YouNeedToLogin);
        this.editorElement.parentElement.style.display = "flex";

        this.editorElement.style.display = "none";
        this.outputElement.style.display = "none";
        this.pageElement.style.display = "none";
        this.overlayElement.style.display = "flex";

        document.getElementById("loadingGif").style.display = "none";
        document.getElementById("loginWithGH").style.display = "flex";
    }

    /**
    * Changes editor's theme
    * @returns {void}
    * @param {("dark"|"light")} theme
    */
    ChangeEditorTheme(theme)
    {
        if (theme == "light") this.aceInstance.setTheme("ace/theme/github_light_default");
        else this.aceInstance.setTheme("ace/theme/github_dark");
    }

    /**
    * Shows editor with toolbar
    * @returns {void}
    * @param {string} content - Text that gets edited
    * @param {boolean} isReadOnly - Can the editor be used?
    */
    OpenEditor(content, isReadOnly = false)
    {
        this.aceInstance.setReadOnly(isReadOnly);
        this.aceInstance.session.setValue(content);
        this.editorElement.style.display = "flex";
        this.outputElement.style.display = "none";
        this.pageElement.style.display = "none";
        this.overlayElement.style.display = "none";
        this.toolbar.ShowToolbar();

        this.editorElement.parentElement.style.display = "flex";
        EnableReloadPrompt();

        // Update undo and redo buttons
        this.aceInstance.session.on('change', this._UndoRedoCheck);
        this._UndoRedoCheck();
    }

    /**
    * Previews changes while keeping the toolbar
    * @returns {void}
    */
    PreviewChanges()
    {
        this.outputElement.innerHTML = WikiWhitelines(this.aceInstance.session.getValue());

        this.editorElement.style.display = "none";
        this.outputElement.style.display = "inline-block";
    }

    /**
    * Hides changes and restores editor
    * @returns {void}
    */
    UnpreviewChanges()
    {
        this.outputElement.innerHTML = ``;
        if (pageTitle == "sandbox") _RefManager.ClearRefs();

        this.editorElement.style.display = "flex";
        this.outputElement.style.display = "none";
    }

    /**
    * Fully closes editor and hides toolbar
    * @returns {void}
    */
    CloseEditor()
    {
        this.editorElement.style.display = "none";
        this.outputElement.style.display = "none";
        this.overlayElement.style.display = "none";
        this.pageElement.style.display = "inline-block";
        this.toolbar.HideToolbar();

        // Cleanup
        this.outputElement.innerHTML = "";
        DisableReloadPrompt();
    }

    /**
    * Returns editor's contents
    * @returns {string}
    */
    GetContent() { return this.aceInstance.session.getValue(); }

    /**
    * Checks if there's anything to be un/redone and updates small buttons
    * @returns {string}
    */
    _UndoRedoCheck()
    {
        // Outside of sandbox dont show publish without changes
        if (pageTitle != "sandbox")
        {
            if (editorInstance.aceInstance.getSession().getValue() == unchangedPostText) 
            {
                editorInstance.toolbar.ChangeButtonStyle("publishButton", "disabled");
            }
            else 
            {
                editorInstance.toolbar.ChangeButtonStyle("publishButton", "notable");
            }
        }

        // Cant use this here because of javascript being wonky
        if (editorInstance.aceInstance.getSession().getUndoManager().hasUndo()) document.getElementById("undo").parentElement.classList.add("tWActive");
        else document.getElementById("undo").parentElement.classList.remove("tWActive");

        if (editorInstance.aceInstance.getSession().getUndoManager().hasRedo()) document.getElementById("redo").parentElement.classList.add("tWActive");
        else document.getElementById("redo").parentElement.classList.remove("tWActive");
    }

    Undo()
    {
        this.aceInstance.undo();
        this._UndoRedoCheck();
    }

    Redo()
    {
        this.aceInstance.redo();
        this._UndoRedoCheck();
    }
}

/**
 * Prevents page from reloading
 * @returns {void}
 */
function beforeUnloadHandler(e) 
{
    e.preventDefault();
    e.returnValue = true;
}

/**
 * Enables reload protection
 * @returns {void}
 */
function EnableReloadPrompt()
{
    window.addEventListener("beforeunload", beforeUnloadHandler);
}

/**
 * Disables reload protection
 * @returns {void}
 */
function DisableReloadPrompt()
{
    window.removeEventListener("beforeunload", beforeUnloadHandler);
}