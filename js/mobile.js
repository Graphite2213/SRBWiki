let showingDropdown = false;
let showingToolbarDropdown = false;

function ToggleMobileDropdown()
{
    if (showingDropdown) document.getElementById("mobileDropdown").style.display = "none";
    else document.getElementById("mobileDropdown").style.display = "flex";
    showingDropdown = !showingDropdown;
}

function ToggleToolbarDropdown() 
{
    if (showingToolbarDropdown) document.getElementById("mobileToolbarDropdown").style.display = "none";
    else document.getElementById("mobileToolbarDropdown").style.display = "flex";
    showingToolbarDropdown = !showingToolbarDropdown;
}