import * as vscode from 'vscode';

export class Warehouse {
    private items: { [key: string]: number } = {};

    addFood() {
        if (!this.items['食物']) {
            this.items['食物'] = 0;
        }
        this.items['食物']++;
        this.showWarehouseStatus();
    }

    consumeFood() {
        if (this.items['食物'] && this.items['食物'] > 0) {
            this.items['食物']--;
            this.showWarehouseStatus();
        }
    }

    getFoodCount() {
        return this.items['食物'] || 0;
    }

    getWarehouseStatus() {
        let status = '仓库物品：\n';
        for (const [item, count] of Object.entries(this.items)) {
            status += `${item}: ${count} 份\n`;
        }
        return status;
    }

    showWarehouseStatus() {
        vscode.window.showInformationMessage(this.getWarehouseStatus());
    }
}    