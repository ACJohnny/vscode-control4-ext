'use strict';
import * as vscode from 'vscode';
import { C4InterfaceTransport } from '../../control4/interface/C4InterfaceTransport';
import { TreeNode } from './TreeNode';

export default class DashboardNode extends TreeNode<C4InterfaceTransport> {
    constructor(name: string, transport: C4InterfaceTransport) {
        super(name, transport, "play-circle");
        
        this.tooltip = `${transport.buttonType} - ${transport.releaseCommand.name}`;
        this.description = `${transport.buttonType} - ${transport.releaseCommand.name}`;
    }

    getNameOfType() {
        return "C4InterfaceTransport"
    }

    contextValue = "dashboard";
} 