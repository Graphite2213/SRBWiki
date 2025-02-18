// Home related methods

/**
 * Editing home tiles - wrapper
 * @returns {void}
 * @param {("featured"|"news")} tileName
 */
function EditTile(tileName)
{
    editingTile = tileName;

    if (loggedIn)
    {
        // If mobile collapse the text buttons into a dropdown
        if (window.matchMedia(`(max-width: ${mobileTreshold}px)`).matches) ToggleMobileDropdown();
        const allButtons = editorInstance.toolbar.toolbarButtons;
        let seen = false;
        for (let [x, y] of allButtons)
        {
            if (x == "backButton") continue;
            if (x == "previewButton") break;
            if (seen) editorInstance.toolbar.HideButton(x);
            if (x == "redo") seen = true;
        }

        // If you're banned or can't edit due to protection, disable editor
        const disableDefault = !CanAccess(userData.clearance, 2);
        if (disableDefault) editorInstance.toolbar.DisableToolbar(`${lang[locale].LowClearanceMessage} (${ComputeProtectionString(2)})`);
        editorInstance.toolbar.ShowToolbar();
        editorInstance.OpenEditor(document.getElementById(`${tileName}List`).innerHTML, disableDefault);
    }
    else editorInstance.EditorLoginState();
}