import 'reflect-metadata';
import { jsonMember, jsonObject, jsonArrayMember } from 'typedjson';
import * as builder from 'xmlbuilder2';
import C4InterfaceCommand from './C4InterfaceCommand';

@jsonObject
export class C4NotificationButton {
    @jsonMember
    name: string;
    
    @jsonMember
    screenId?: string;
    
    @jsonMember
    command?: C4InterfaceCommand;
}

@jsonObject
export class C4NotificationCancelButton {
    @jsonMember
    name: string;
    
    @jsonMember
    command?: C4InterfaceCommand;
}

@jsonObject
export default class C4InterfaceNotification {
    @jsonMember
    id: string;
    @jsonMember
    iconId: string;
    @jsonArrayMember(C4NotificationButton)
    buttons: C4NotificationButton[];
    @jsonMember
    cancelButton?: C4NotificationCancelButton;

    toXml() {
        let node = builder.create('Notification').root();
        node.ele('Id').txt(this.id);
        if (this.cancelButton) {
            let cancel = node.ele('CancelButton');
            cancel.ele('Name').txt(this.cancelButton.name);
            if (this.cancelButton.command) {
                let command = cancel.ele('Command');
                command.ele('Name').txt(this.cancelButton.command.name);
                command.ele('Type').txt(this.cancelButton.command.type);
                if (this.cancelButton.command.params) {
                    let params = command.ele('Params');
                    this.cancelButton.command.params.forEach((param: any) => {
                        let paramNode = params.ele('Param');
                        paramNode.ele('Name').txt(param.name);
                        paramNode.ele('Type').txt(param.type);
                        if (param.value) {
                            paramNode.ele('Value').txt(param.value);
                        }
                    });
                }
            }
        }
        if (this.buttons && this.buttons.length > 0) {
            let buttons = node.ele('Buttons');
            this.buttons.forEach((btn: C4NotificationButton) => {
                let button = buttons.ele('Button');
                button.ele('Name').txt(btn.name);
                if (btn.command) {
                    let command = button.ele('Command');
                    command.ele('Name').txt(btn.command.name);
                    command.ele('Type').txt(btn.command.type);
                    if (btn.command.params) {
                        let params = command.ele('Params');
                        btn.command.params.forEach((param: any) => {
                            let paramNode = params.ele('Param');
                            paramNode.ele('Name').txt(param.name);
                            paramNode.ele('Type').txt(param.type);
                            if (param.value) {
                                paramNode.ele('Value').txt(param.value);
                            }
                        });
                    }
                }
                if (btn.screenId) {
                    button.ele('ScreenId').txt(btn.screenId);
                }
            });
        }
        node.ele('IconId').txt(this.iconId);
        return node;
    }

    static fromXml(obj: any): C4InterfaceNotification {
        const notification = new C4InterfaceNotification();
        
        notification.id = obj.Id;
        notification.iconId = obj.IconId;
        
        if (obj.CancelButton) {
            const cancelButton = new C4NotificationCancelButton();
            cancelButton.name = obj.CancelButton.Name;
            cancelButton.command = obj.CancelButton.Command ? C4InterfaceCommand.fromXml(obj.CancelButton.Command) : undefined;
            notification.cancelButton = cancelButton;
        }

        if (obj.Buttons && obj.Buttons.Button) {
            notification.buttons = Array.isArray(obj.Buttons.Button)
                ? obj.Buttons.Button.map((b: any) => {
                    const button = new C4NotificationButton();
                    button.name = b.Name;
                    button.screenId = b.ScreenId;
                    button.command = b.Command ? C4InterfaceCommand.fromXml(b.Command) : undefined;
                    return button;
                })
                : [(() => {
                    const button = new C4NotificationButton();
                    button.name = obj.Buttons.Button.Name;
                    button.screenId = obj.Buttons.Button.ScreenId;
                    button.command = obj.Buttons.Button.Command ? C4InterfaceCommand.fromXml(obj.Buttons.Button.Command) : undefined;
                    return button;
                })()];
        }

        return notification;
    }
} 