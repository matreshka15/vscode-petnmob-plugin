import * as vscode from 'vscode';
import { Farming } from './farming';
import { Warehouse } from './warehouse';

// 配置参数
const CONFIG = {
    hungerDecreaseInterval: 60 * 1000, // 饥饿值减少的时间间隔（毫秒），这里设置为1分钟
    hungerDecreaseAmount: 5, // 每次减少的饥饿值
    explorationFoodChance: 0.3, // 探索获得食物的概率
    starvationTimeToComa: 72 * 60 * 60 * 1000, // 饥饿到昏迷的时间（毫秒），72小时
    comaTimeToDeath: 72 * 60 * 60 * 1000, // 昏迷到死亡的时间（毫秒），72小时
    hatchingTime: 5 * 1000, // 孵化时间（毫秒），5秒
    beggingThreshold: 80 // 饥饿值达到该阈值时开始要饭
};

// 宠物类
export class Pet {
    name: string;
    hunger: number;
    energy: number;
    level: number;
    equipment: string[];
    isComa: boolean;
    lastFedTime: number;
    comaStartTime: number;
    isAlive: boolean;
    private warehouse: Warehouse;

    constructor(name: string, warehouse: Warehouse) {
        this.name = name;
        this.hunger = 50;
        this.energy = 100;
        this.level = 1;
        this.equipment = [];
        this.isComa = false;
        this.lastFedTime = Date.now();
        this.comaStartTime = 0;
        this.isAlive = true;
        this.warehouse = warehouse;

        // 定时减少饥饿值
        setInterval(() => {
            if (this.isAlive) {
                this.hunger += CONFIG.hungerDecreaseAmount;
                if (this.hunger >= 100) {
                    this.hunger = 100;
                    if (!this.isComa) {
                        this.isComa = true;
                        this.comaStartTime = Date.now();
                        this.showMessage(`${this.name} 因为饥饿昏迷了！`);
                    }
                }
                if (this.isComa && Date.now() - this.comaStartTime >= CONFIG.comaTimeToDeath) {
                    this.isAlive = false;
                    this.showMessage(`${this.name} 不幸去世了，你需要重新孵化一只新宠物。`);
                }
                if (Date.now() - this.lastFedTime >= CONFIG.starvationTimeToComa && !this.isComa) {
                    this.isComa = true;
                    this.comaStartTime = Date.now();
                    this.showMessage(`${this.name} 因为饥饿昏迷了！`);
                }
                if (this.hunger >= CONFIG.beggingThreshold &&!this.isComa) {
                    this.showMessage(`${this.name} 饿坏啦，快给它点吃的吧！`);
                }
            }
        }, CONFIG.hungerDecreaseInterval);
    }

    // 喂食
    feed() {
        if (this.isAlive &&!this.isComa && this.warehouse.getFoodCount() > 0) {
            this.hunger -= 20;
            if (this.hunger < 0) {
                this.hunger = 0;
            }
            this.warehouse.consumeFood();
            this.lastFedTime = Date.now();
            this.showMessage(`哇，${this.name} 吃得好饱呀！`);
        } else if (this.isComa) {
            this.showMessage(`${this.name} 处于昏迷状态，无法进食。`);
        } else if (this.warehouse.getFoodCount() === 0) {
            this.showMessage(`仓库里没有食物了，无法喂食。`);
        }
    }

    // 休息
    rest() {
        if (this.isAlive &&!this.isComa) {
            this.energy += 30;
            if (this.energy > 100) {
                this.energy = 100;
            }
            this.showMessage(`${this.name} 休息好了，充满活力！`);
        } else if (this.isComa) {
            this.showMessage(`${this.name} 处于昏迷状态，无法休息。`);
        }
    }

    // 探险
    explore() {
        if (this.isAlive &&!this.isComa && this.energy >= 20) {
            this.energy -= 20;
            this.hunger += 10;
            const hasDrop = Math.random() < CONFIG.explorationFoodChance;
            if (hasDrop) {
                this.warehouse.addFood();
                this.showMessage(`${this.name} 探险归来，捡到了一份食物，已存入仓库！`);
            } else {
                this.showMessage(`${this.name} 探险回来啦，不过没找到食物。`);
            }
        } else if (this.isComa) {
            this.showMessage(`${this.name} 处于昏迷状态，无法探险。`);
        } else if (this.energy < 20) {
            this.showMessage(`${this.name} 太累了，没办法去探险啦！`);
        }
    }

    // 犁地
    plowLand(farming: Farming) {
        if (this.isAlive &&!this.isComa && this.energy >= 30) {
            this.energy -= 30;
            this.hunger += 15;
            farming.plow();
            this.showMessage(`${this.name} 努力犁地，土地已整理好！`);
        } else if (this.isComa) {
            this.showMessage(`${this.name} 处于昏迷状态，无法犁地。`);
        } else if (this.energy < 30) {
            this.showMessage(`${this.name} 太累了，没办法犁地啦！`);
        }
    }

    // 显示消息
    showMessage(message: string) {
        vscode.window.setStatusBarMessage(message);
    }

    // 获取宠物基本状态信息
    getBasicStatus() {
        return `饥饿值: ${this.hunger}, 活力值: ${this.energy}, 精力值: ${this.energy}, 当前装备: ${this.equipment.join(', ')}`;
    }
}    