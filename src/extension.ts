import * as vscode from 'vscode';

// 宠物类
class Pet {
    name: string;
    hunger: number;
    energy: number;
    level: number;
    equipment: string[];

    constructor(name: string) {
        this.name = name;
        this.hunger = 50;
        this.energy = 100;
        this.level = 1;
        this.equipment = [];
    }

    // 喂食
    feed() {
        this.hunger -= 20;
        if (this.hunger < 0) {
            this.hunger = 0;
        }
        this.showMessage(`哇，${this.name} 吃得好饱呀！`);
    }

    // 休息
    rest() {
        this.energy += 30;
        if (this.energy > 100) {
            this.energy = 100;
        }
        this.showMessage(`${this.name} 休息好了，充满活力！`);
    }

    // 探险
    explore() {
        if (this.energy < 20) {
            this.showMessage(`${this.name} 太累了，没办法去探险啦！`);
            return;
        }
        this.energy -= 20;
        this.hunger += 10;
        const hasDrop = Math.random() > 0.5;
        if (hasDrop) {
            const newEquipment = `装备 ${Math.floor(Math.random() * 100)}`;
            this.equipment.push(newEquipment);
            this.showMessage(`${this.name} 探险归来，获得了新装备：${newEquipment}`);
        } else {
            this.showMessage(`${this.name} 探险回来啦，不过没找到什么好东西。`);
        }
    }

    // 显示消息
    showMessage(message: string) {
        vscode.window.setStatusBarMessage(message);
    }

    // 获取宠物状态信息
    getStatus() {
        return `名字: ${this.name}, 饥饿度: ${this.hunger}, 能量: ${this.energy}, 等级: ${this.level}`;
    }
}

// 宠物树数据项
class PetTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}

// 宠物树数据提供器
class PetTreeDataProvider implements vscode.TreeDataProvider<PetTreeItem> {
    constructor(private pet: Pet) {}

    getTreeItem(element: PetTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: PetTreeItem): vscode.ProviderResult<PetTreeItem[]> {
        if (!element) {
            return [
                new PetTreeItem(this.pet.getStatus(), vscode.TreeItemCollapsibleState.None)
            ];
        }
        return [];
    }
}

// 激活插件
export function activate(context: vscode.ExtensionContext) {
    const pet = new Pet('小萌宠');
    const petTreeDataProvider = new PetTreeDataProvider(pet);

    // 注册宠物视图
    vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);

    // 喂食命令
    let feedCommand = vscode.commands.registerCommand('extension.feedPet', () => {
        pet.feed();
        // 更新视图
        vscode.commands.executeCommand('workbench.actions.view.refresh');
    });

    // 休息命令
    let restCommand = vscode.commands.registerCommand('extension.restPet', () => {
        pet.rest();
        // 更新视图
        vscode.commands.executeCommand('workbench.actions.view.refresh');
    });

    // 探险命令
    let exploreCommand = vscode.commands.registerCommand('extension.explorePet', () => {
        pet.explore();
        // 更新视图
        vscode.commands.executeCommand('workbench.actions.view.refresh');
    });

    context.subscriptions.push(feedCommand, restCommand, exploreCommand);
}

// 停用插件
export function deactivate() {}