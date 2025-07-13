import * as vscode from 'vscode';
import * as path from 'path';
import { TreeNodeProvider } from './TreeNodeProvider';
import { C4InterfaceTransport } from '../../control4/interface/C4InterfaceTransport';
import { TypedJSON } from 'typedjson';
import DashboardNode from './DashboardNode';
import { DashboardResource } from '../../components/DashboardResource';

export class DashboardNodeProvider extends TreeNodeProvider<DashboardNode> {
    private _componentPath: string
    private dashboardResource: DashboardResource

    constructor(workspaceRoot: string) {
        super(workspaceRoot);

        this._componentPath = path.join(workspaceRoot, 'components', 'ui.c4c');

        this.watchFile('ui.c4c');
        this.dashboardResource = DashboardResource.getInstance(workspaceRoot);
    }

    getComponent(transport: C4InterfaceTransport): DashboardNode {
        try {
            return new DashboardNode(transport.id, transport);
        } catch (err) {
            console.log(err)
        }
    }

    resolveTypes(components) {
        return TypedJSON.parseAsArray<C4InterfaceTransport>(components, C4InterfaceTransport);
    }

    override async getNodes(component) {
        try {
            const dashboardItems = await this.dashboardResource.Reload();
            var ret = [];

            dashboardItems.forEach((transport: C4InterfaceTransport) => {
                ret.push(this.getComponent(transport));
            });

            return ret;
        } catch (err) {
            vscode.window.showErrorMessage(err.message);
            return [];
        }
    }

    override getChildren(element?: DashboardNode): Thenable<DashboardNode[]> {
        // Dashboard nodes are leaves, so no children
        return Promise.resolve([]);
    }
} 