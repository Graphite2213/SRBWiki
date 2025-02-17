// Every day i lament the fact i didnt start this project in typescript like i should have.

declare namespace Wiki
{
    type AdminMethods = "approve" | "promote_admin" | "promote_higher_admin" | "ban" | "deapprove" | "patos";
    type PromptTypes = "config" | "history" | "image" | "user" | "refTool" | "default";

    enum UserTypes
    {
        BANNED = -1,
        DEFAULT = 0,
        APPROVED = 1,
        ADMIN = 2,
        HIGH_ADMIN = 3,
        TOP = 4
    }

    enum ProtectionTypes
    {
        NO_PROTECTION = 0,
        BASIC_PROTECTION = 1,
        ADVANCED_PROTECTION = 2,
        SYSTEM_PROTECTION = 3
    }

    type PromptSettings = {
        proceedText: string,
        cancelText: string,
        proceedCallback: Function,
        cancelCallback: Function,
        captionText: string,
        haveInput: boolean,
        user: string | undefined
    };

    type ArticleMetadata = {
        description: string,
        image: string,
        keywords: Array<string>,
        link: string,
        protection: ProtectionTypes,
        upload_protection: boolean
    }

    type HistoryEntry = {
        date: string,
        user: string,
        userIcon: string,
        description: string,
        type: "html/text" | "meta/json"
    }

    type HistoryFile = {
        [key: string]: HistoryEntry
    }

    type PageData = {
        images: Array<string>,
        history: HistoryFile,
        meta: ArticleMetadata
    }

    type UserData = {
        login: string,
        img: string,
        note: string,
        clearance: UserTypes
    }

    type ToolbarButton = {
        element: HTMLElement,
        parent: HTMLElement
    }

    type ToolbarButtonMap = Map<String, ToolbarButton>;
}
