export enum NotificationType {
    Info,
    Warning,
    Error
}

export function dispatchNotification(message : string, type : NotificationType) : void {
    vscode.window.showInformationMessage(message);
}