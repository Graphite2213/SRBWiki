// Admin log code

// Values to track log pages, all logs and allat
let logPages = [[], []];
let usedPages = [[], []];
const maxLogsPerPage = 25;
let currentLogPage = 1;
let lastLogPage = 1;

/**
 * A single log entry
 */
class LogEntry
{
    htmlText = "";
    rawText = "";

    constructor(htmlText, rawText)
    {
        this.htmlText = htmlText;
        this.rawText = rawText;
    }
}

/**
 * Populates admin log
 * @returns {void}
 */
async function PopulateLog()
{
    const lang = window._languageDiff;

    // Templates
    const pageCreateTemplate = lang[locale].pageCreateTemplate.replaceAll(":selfURL:", selfURL);
    const imageAddTemplate = lang[locale].imageAddTemplate.replaceAll(":selfURL:", selfURL);
    const pageRemoveTemplate = lang[locale].pageRemoveTemplate.replaceAll(":selfURL:", selfURL);
    const imageRemoveTemplate = lang[locale].imageRemoveTemplate.replaceAll(":selfURL:", selfURL);
    const approvalTemplate = lang[locale].approvalTemplate.replaceAll(":selfURL:", selfURL);
    const escalationTemplate = lang[locale].escalationTemplate.replaceAll(":selfURL:", selfURL);
    const higherEscalationTemplate = lang[locale].higherEscalationTemplate.replaceAll(":selfURL:", selfURL);
    const deapprovalTemplate = lang[locale].deapprovalTemplate.replaceAll(":selfURL:", selfURL);
    const patosTemplate = lang[locale].patosTemplate.replaceAll(":selfURL:", selfURL);
    const banTemplate = lang[locale].banTemplate.replaceAll(":selfURL:", selfURL);
    const moveTemplate = lang[locale].moveTemplate.replaceAll(":selfURL:", selfURL);

    // Fetch the entire log
    const data = fetch(fetchURL + "dev.log");
    const parsedData = (await ((await data).text())).split("\n");
    let l_counter = 0;
    let l_page = 1;
    logPages = [[], []];

    // Go through all the logs and fill in the pages
    for (const x of parsedData)
    {
        if (x == "") continue;
        const user = x.split(" ")[0];
        const intent = x.split(" ")[1];
        const target = x.split(" ")[2];
        // [3] and [5] is always filler
        const cet = x.split(" ")[4];
        console.log(cet);
        let finalElement = "";

        // Depends on intent and action
        switch (intent)
        {
            case 'ADD_IMAGE':
                finalElement = imageAddTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":filename:", target);
                finalElement = finalElement.replaceAll(":page:", decodeURIComponent(cet.split("/")[1]));
                finalElement = finalElement.replaceAll(":locale:", cet.split("/")[0]);
                break;

            case 'ADD_PAGE':
                finalElement = pageCreateTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":page:", decodeURIComponent(target.split("/")[1]));
                finalElement = finalElement.replaceAll(":locale:", target.split("/")[0]);
                break;

            case 'DELETE_IMAGE':
                finalElement = imageRemoveTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":filename:", target);
                finalElement = finalElement.replaceAll(":page:", decodeURIComponent(cet.split("/")[1]));
                finalElement = finalElement.replaceAll(":locale:", cet.split("/")[0]);
                finalElement = finalElement.replaceAll(":reason:", decodeURIComponent(decodeURIComponent(x.split(" ")[6])));
                break;

            case 'DELETE_PAGE':
                finalElement = pageRemoveTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":page:", decodeURIComponent(target.split("/")[1]));
                finalElement = finalElement.replaceAll(":locale:", target.split("/")[0]);
                finalElement = finalElement.replaceAll(":reason:", decodeURIComponent(cet));
                break;

            case 'APPROVE':
                finalElement = approvalTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":subject:", target);
                break;

            case 'PROMOTE_ADMIN':
                finalElement = escalationTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":subject:", target);
                break;

            case 'PROMOTE_HIGHER_ADMIN':
                finalElement = higherEscalationTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":subject:", target);
                break;

            case 'DEAPPROVE':
                finalElement = deapprovalTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":subject:", target);
                finalElement = finalElement.replaceAll(":reason:", decodeURIComponent(cet));
                break;

            case 'DEFAULT':
                finalElement = patos.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":subject:", target);
                finalElement = finalElement.replaceAll(":reason:", decodeURIComponent(cet));
                break;

            case 'BAN':
                finalElement = banTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":subject:", target);
                finalElement = finalElement.replaceAll(":reason:", decodeURIComponent(cet));
                break;

            case 'MOVE':
                finalElement = moveTemplate.replaceAll(":user:", user);
                finalElement = finalElement.replaceAll(":page:", decodeURIComponent(target.split("/")[1]));
                finalElement = finalElement.replaceAll(":page2:", decodeURIComponent(cet.split("/")[1]));
                finalElement = finalElement.replaceAll(":locale:", target.split("/")[0]);

            default:
                console.warn("W: Weird log output. Check logs manually?");
                break;
        }

        // Actually add the log card
        logPages[l_page].unshift(new LogEntry(" " + `<div class="logEntry"><span>${finalElement}</span><span style="font-size: 75%; opacity: 70%;">${x.split("TIME ")[1]}</span></div>`, x));
        l_counter++;
        if (l_counter >= maxLogsPerPage)
        {
            l_page++;
            logPages[l_page] = [];
        }
    }

    // Set page numbers
    document.getElementById('logPageTot').innerText = l_page;
    lastLogPage = l_page;
    usedPages = logPages;
    OpenPage(1);
}

/**
 * Goes forward a page in the log
 * @returns {void}
 */
function NextLogPage()
{
    if (currentLogPage >= lastLogPage) return;
    currentLogPage++;
    OpenPage(currentLogPage);
    document.getElementById('logPage').innerText = currentLogPage;
}

/**
 * Goes back a page in the log
 * @returns {void}
 */
function PrevLogPage()
{
    if (currentLogPage <= 1) return;
    currentLogPage--;
    OpenPage(currentLogPage);
    document.getElementById('logPage').innerText = currentLogPage;
}

/**
 * Opens specific log page
 * @returns {void}
 * @param {number} num - Page number
 */
function OpenPage(num)
{
    let str = ``;

    for (const x of usedPages[num])
    {
        str = x.htmlText + " " + str;
    }
    document.getElementById("logList").innerHTML = str;
}

/**
 * Filters the current logs
 * @returns {void}
 * @param {number} num - Page number
 */
function FilterLogs()
{
    let newPages = [[], []];
    let counter = 0;
    let pageCounter = 1;
    const actionFilter = document.getElementById("filters").children[0];
    const localeFilter = document.getElementById("filters").children[1];

    const userFilter = document.getElementById("filters").children[2];
    const targetFilter = document.getElementById("filters").children[2];

    const selectedOptionAct = Array.from(actionFilter.children).indexOf(actionFilter.selectedOptions[0]);
    const selectedOptionLoc = Array.from(localeFilter.children).indexOf(localeFilter.selectedOptions[0]);

    const allActions = ["", "ADD_PAGE", "ADD_IMAGE", "DELETE_PAGE", "DELETE_IMAGE", "APPROVE", "PROMOTE_ADMIN", "PROMOTE_HIGHER_ADMIN", "DEAPPROVE", "DEFAULT", "BAN", "MOVE"];
    const allLocaleMatch = ["", "(rs)", "(en)"];

    // Reconstruct log pages depending on filters
    for (const i of logPages)
    {
        for (const j of i)
        {
            // Action filter
            if (selectedOptionAct != 0 && j.rawText.split(" ")[1] == allActions[selectedOptionAct])
            {
                newPages[pageCounter].unshift(j);
                counter++;
                if (counter >= maxLogsPerPage)
                {
                    pageCounter++;
                    newPages[pageCounter] = [];
                }
            }

            // Locale filter
            if (selectedOptionLoc != 0 && j.htmlText.includes(`${allLocaleMatch[selectedOptionLoc]}`))
            {
                newPages[pageCounter].unshift(j);
                counter++;
                if (counter >= maxLogsPerPage)
                {
                    pageCounter++;
                    newPages[pageCounter] = [];
                }
            }

            // User filter
            if (userFilter.value != "" && j.rawText.split(" ")[0] == userFilter.value)
            {
                newPages[pageCounter].unshift(j);
                counter++;
                if (counter >= maxLogsPerPage)
                {
                    pageCounter++;
                    newPages[pageCounter] = [];
                }
            }

            // Target filter
            if (targetFilter.value != "")
            {
                let delim = 2;
                if (j.rawText.includes("ADD_IMAGE") || j.rawText.includes("DELETE_IMAGE")) delim = 4;

                if (j.rawText.split(" ")[delim].includes(targetFilter))
                {
                    newPages[pageCounter].unshift(j);
                    counter++;
                    if (counter >= maxLogsPerPage)
                    {
                        pageCounter++;
                        newPages[pageCounter] = [];
                    }
                }
            }
        }
    }

    // Set new pages and open first one
    usedPages = newPages;
    OpenPage(1);
}
