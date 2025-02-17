// Manages mobile dropdown n stuff
let showingDropdown = false;
let showingToolbarDropdown = false;

/**
 * Toggles mobile dropdown
 * @returns {void}
 */
function ToggleMobileDropdown()
{
    if (showingDropdown) document.getElementById("mobileDropdown").style.display = "none";
    else document.getElementById("mobileDropdown").style.display = "flex";
    showingDropdown = !showingDropdown;
}

/**
 * Toggles mobile toolbar dropdown
 * @returns {void}
 */
function ToggleToolbarDropdown() 
{
    if (showingToolbarDropdown) document.getElementById("mobileToolbarDropdown").style.display = "none";
    else document.getElementById("mobileToolbarDropdown").style.display = "flex";
    showingToolbarDropdown = !showingToolbarDropdown;
}