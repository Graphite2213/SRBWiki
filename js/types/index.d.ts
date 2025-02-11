// Every day i reconsider the fact i didnt start this project in typescript like i should have.

type ToolbarButton = {
    element: HTMLElement,
    parent: HTMLElement
}

type ToolbarButtonMap = Map<String, ToolbarButton>;

enum UserTypes {
    BANNED = -1,
    DEFAULT = 0,
    APPROVED = 1,
    ADMIN = 2,
    HIGH_ADMIN = 3,
    TOP = 4
}

enum ProtectionTypes {
    NO_PROTECTION = 0,
    BASIC_PROTECTION = 1,
    ADVANCED_PROTECTION = 2,
    SYSTEM_PROTECTION = 3
}

export { ToolbarButton, ToolbarButtonMap, UserTypes, ProtectionTypes }