import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { C4InterfaceTransport } from '../control4/interface/C4InterfaceTransport';
import { C4UI } from '../control4/C4UI';
import { TypedJSON } from 'typedjson';

export class DashboardResource {
    private static instance: DashboardResource;
    private workspaceRoot: string;
    private uiPath: string;
    private dashboardItems: C4InterfaceTransport[] = [];

    private constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
        this.uiPath = path.join(workspaceRoot, 'components', 'ui.c4c');
    }

    public static getInstance(workspaceRoot: string): DashboardResource {
        if (!DashboardResource.instance) {
            DashboardResource.instance = new DashboardResource(workspaceRoot);
        }
        return DashboardResource.instance;
    }

    public async Reload(): Promise<C4InterfaceTransport[]> {
        try {
            if (!fs.existsSync(this.uiPath)) {
                return [];
            }

            const data = fs.readFileSync(this.uiPath, 'utf8');
            const uiComponents: C4UI[] = JSON.parse(data);
            
            this.dashboardItems = [];
            
            uiComponents.forEach(ui => {
                if (ui.dashboard && ui.dashboard.length > 0) {
                    this.dashboardItems.push(...ui.dashboard);
                }
            });

            return this.dashboardItems;
        } catch (error) {
            console.error('Error loading dashboard items:', error);
            return [];
        }
    }

    public async Add(item: C4InterfaceTransport): Promise<void> {
        try {
            const uiComponents = await this.loadUIComponents();
            
            // Find the first UI component or create one
            let uiComponent = uiComponents.find(ui => ui.proxybindingid);
            if (!uiComponent) {
                uiComponent = new C4UI();
                uiComponent.proxybindingid = 5001; // Default proxy binding
                uiComponents.push(uiComponent);
            }

            if (!uiComponent.dashboard) {
                uiComponent.dashboard = [];
            }

            uiComponent.dashboard.push(item);
            
            await this.saveUIComponents(uiComponents);
            this.dashboardItems.push(item);
        } catch (error) {
            console.error('Error adding dashboard item:', error);
            throw error;
        }
    }

    public async Update(oldItem: C4InterfaceTransport, newItem: C4InterfaceTransport): Promise<void> {
        try {
            const uiComponents = await this.loadUIComponents();
            
            uiComponents.forEach(ui => {
                if (ui.dashboard) {
                    const index = ui.dashboard.findIndex(item => item.id === oldItem.id);
                    if (index !== -1) {
                        ui.dashboard[index] = newItem;
                    }
                }
            });
            
            await this.saveUIComponents(uiComponents);
            
            // Update local cache
            const index = this.dashboardItems.findIndex(item => item.id === oldItem.id);
            if (index !== -1) {
                this.dashboardItems[index] = newItem;
            }
        } catch (error) {
            console.error('Error updating dashboard item:', error);
            throw error;
        }
    }

    public async Delete(item: C4InterfaceTransport): Promise<void> {
        try {
            const uiComponents = await this.loadUIComponents();
            
            uiComponents.forEach(ui => {
                if (ui.dashboard) {
                    ui.dashboard = ui.dashboard.filter(dashboardItem => dashboardItem.id !== item.id);
                }
            });
            
            await this.saveUIComponents(uiComponents);
            
            // Update local cache
            this.dashboardItems = this.dashboardItems.filter(dashboardItem => dashboardItem.id !== item.id);
        } catch (error) {
            console.error('Error deleting dashboard item:', error);
            throw error;
        }
    }

    public MoveUp(item: C4InterfaceTransport): void {
        const index = this.dashboardItems.findIndex(dashboardItem => dashboardItem.id === item.id);
        if (index > 0) {
            const temp = this.dashboardItems[index];
            this.dashboardItems[index] = this.dashboardItems[index - 1];
            this.dashboardItems[index - 1] = temp;
            this.saveDashboardItems();
        }
    }

    public MoveDown(item: C4InterfaceTransport): void {
        const index = this.dashboardItems.findIndex(dashboardItem => dashboardItem.id === item.id);
        if (index < this.dashboardItems.length - 1) {
            const temp = this.dashboardItems[index];
            this.dashboardItems[index] = this.dashboardItems[index + 1];
            this.dashboardItems[index + 1] = temp;
            this.saveDashboardItems();
        }
    }

    private async loadUIComponents(): Promise<C4UI[]> {
        if (!fs.existsSync(this.uiPath)) {
            return [];
        }

        const data = fs.readFileSync(this.uiPath, 'utf8');
        const uiComponents: C4UI[] = JSON.parse(data);
        return TypedJSON.parseAsArray<C4UI>(uiComponents, C4UI);
    }

    private async saveUIComponents(uiComponents: C4UI[]): Promise<void> {
        const data = JSON.stringify(uiComponents, null, 2);
        fs.writeFileSync(this.uiPath, data, 'utf8');
    }

    public async saveDashboardItems(): Promise<void> {
        const uiComponents = await this.loadUIComponents();
        
        // Find the first UI component or create one
        let uiComponent = uiComponents.find(ui => ui.proxybindingid);
        if (!uiComponent) {
            uiComponent = new C4UI();
            uiComponent.proxybindingid = 5001; // Default proxy binding
            uiComponents.push(uiComponent);
        }

        uiComponent.dashboard = this.dashboardItems;
        
        await this.saveUIComponents(uiComponents);
    }
} 