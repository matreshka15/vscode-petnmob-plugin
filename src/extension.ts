import * as vscode from 'vscode';
import { Pet } from './pet';
import { Farming } from './farming';
import { Warehouse } from './warehouse';

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
    constructor(private pet: Pet, private farming: Farming, private warehouse: Warehouse) {}

    getTreeItem(element: PetTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: PetTreeItem): vscode.ProviderResult<PetTreeItem[]> {
        if (!element) {
            return [
                new PetTreeItem('宠物基本状态', vscode.TreeItemCollapsibleState.Expanded),
                new PetTreeItem(pet.getBasicStatus(), vscode.TreeItemCollapsibleState.None, {
                    command: '',
                    title: ''
                }),
                new PetTreeItem('耕地状态', vscode.TreeItemCollapsibleState.Expanded),
                new PetTreeItem(farming.getFarmingStatus(), vscode.TreeItemCollapsibleState.None, {
                    command: '',
                    title: ''
                }),
                new PetTreeItem('仓库状态', vscode.TreeItemCollapsibleState.Expanded),
                new PetTreeItem(warehouse.getWarehouseStatus().replace(/\n/g, ' '), vscode.TreeItemCollapsibleState.None, {
                    command: '',
                    title: ''
                })
            ];
        }
        return [];
    }
}

let pet: Pet;
let farming: Farming;
let warehouse: Warehouse;
let petTreeDataProvider: PetTreeDataProvider;

// 激活插件
export function activate(context: vscode.ExtensionContext) {
    const hatchPet = async () => {
        vscode.window.showInformationMessage('开始孵化宠物，请等待 5 秒...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        warehouse = new Warehouse();
        pet = new Pet('小萌宠', warehouse);
        farming = new Farming();
        petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
        vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        vscode.window.showInformationMessage('宠物孵化成功！');
    };

    // 检查是否需要孵化宠物
    if (!pet) {
        hatchPet();
    }

    // 喂食命令
    let feedCommand = vscode.commands.registerCommand('extension.feedPet', () => {
        if (pet) {
            pet.feed();
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 休息命令
    let restCommand = vscode.commands.registerCommand('extension.restPet', () => {
        if (pet) {
            pet.rest();
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 探险命令
    let exploreCommand = vscode.commands.registerCommand('extension.explorePet', () => {
        if (pet) {
            pet.explore();
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 犁地命令
    let plowCommand = vscode.commands.registerCommand('extension.plowLand', () => {
        if (pet && farming) {
            pet.plowLand(farming);
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 选择胡萝卜种子命令
    let selectCarrotCommand = vscode.commands.registerCommand('extension.selectCarrot', () => {
        if (farming) {
            farming.selectSeed('carrot');
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 选择土豆种子命令
    let selectPotatoCommand = vscode.commands.registerCommand('extension.selectPotato', () => {
        if (farming) {
            farming.selectSeed('potato');
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 浇水命令
    let waterCropCommand = vscode.commands.registerCommand('extension.waterCrop', () => {
        if (farming && pet) {
            const hasHarvest = farming.waterCrop(pet);
            if (hasHarvest) {
                petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
                vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
            }
        }
    });

    // 施肥命令
    let fertilizeCommand = vscode.commands.registerCommand('extension.fertilize', () => {
        if (farming) {
            farming.fertilize();
            petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
            vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
        }
    });

    // 查看仓库命令
    let viewWarehouseCommand = vscode.commands.registerCommand('extension.viewWarehouse', () => {
        if (warehouse) {
            warehouse.showWarehouseStatus();
        }
    });

    // 注册右键菜单命令
    const registerContextMenuCommands = () => {
        const contextMenuItems = [
            { command: 'extension.feedPet', title: '喂食宠物' },
            { command: 'extension.restPet', title: '让宠物休息' },
            { command: 'extension.explorePet', title: '派遣宠物探险' },
            { command: 'extension.plowLand', title: '宠物犁地' },
            { command: 'extension.selectCarrot', title: '选择胡萝卜种子' },
            { command: 'extension.selectPotato', title: '选择土豆种子' },
            { command: 'extension.waterCrop', title: '给作物浇水' },
            { command: 'extension.fertilize', title: '给土地施肥' },
            { command: 'extension.viewWarehouse', title: '查看仓库' }
        ];

        contextMenuItems.forEach(item => {
            const contextMenuCommand = vscode.commands.registerCommand(item.command, () => {
                if (pet) {
                    if (item.command === 'extension.feedPet') {
                        pet.feed();
                    } else if (item.command === 'extension.restPet') {
                        pet.rest();
                    } else if (item.command === 'extension.explorePet') {
                        pet.explore();
                    } else if (item.command === 'extension.plowLand') {
                        pet.plowLand(farming);
                    } else if (item.command === 'extension.selectCarrot') {
                        if (farming) {
                            farming.selectSeed('carrot');
                        }
                    } else if (item.command === 'extension.selectPotato') {
                        if (farming) {
                            farming.selectSeed('potato');
                        }
                    } else if (item.command === 'extension.waterCrop') {
                        if (farming && pet) {
                            const hasHarvest = farming.waterCrop(pet);
                            if (hasHarvest) {
                                pet['warehouse'].addFood();
                            }
                        }
                    } else if (item.command === 'extension.fertilize') {
                        if (farming) {
                            farming.fertilize();
                        }
                    } else if (item.command === 'extension.viewWarehouse') {
                        if (warehouse) {
                            warehouse.showWarehouseStatus();
                        }
                    }
                    petTreeDataProvider = new PetTreeDataProvider(pet, farming, warehouse);
                    vscode.window.registerTreeDataProvider('petView', petTreeDataProvider);
                }
            });
            context.subscriptions.push(contextMenuCommand);
        });
    };

    registerContextMenuCommands();

    context.subscriptions.push(
        feedCommand,
        restCommand,
        exploreCommand,
        plowCommand,
        selectCarrotCommand,
        selectPotatoCommand,
        waterCropCommand,
        fertilizeCommand,
        viewWarehouseCommand
    );
}

// 停用插件
export function deactivate() {}