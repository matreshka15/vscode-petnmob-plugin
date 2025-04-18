import * as vscode from 'vscode';
import { Pet } from './pet';

// 种子配置
const SEEDS = {
    carrot: {
        waterNeeded: 2,
        growthTime: 8 * 1000,
        name: '胡萝卜'
    },
    potato: {
        waterNeeded: 3,
        growthTime: 12 * 1000,
        name: '土豆'
    }
};

// 土地最大茬数和初始营养值
const LAND_MAX_CROPS = 3;
const INITIAL_NUTRIENTS = 100;

// 种地类
export class Farming {
    waterCount: number;
    isFarming: boolean;
    farmingStartTime: number;
    landStatus: 'wasteland' | 'plowed' | 'planted';
    selectedSeed: keyof typeof SEEDS | null;
    cropCount: number;
    nutrients: number;

    constructor() {
        this.waterCount = 0;
        this.isFarming = false;
        this.farmingStartTime = 0;
        this.landStatus = 'wasteland';
        this.selectedSeed = null;
        this.cropCount = 0;
        this.nutrients = INITIAL_NUTRIENTS;
    }

    // 犁地
    plow() {
        if (this.landStatus === 'wasteland' && this.nutrients > 0) {
            this.landStatus = 'plowed';
            vscode.window.showInformationMessage('土地已犁好，可以选择种子种植啦！');
        } else if (this.nutrients <= 0) {
            vscode.window.showInformationMessage('土地营养不足，需要施肥！');
        } else {
            vscode.window.showInformationMessage('土地已经犁好了，无需再次犁地。');
        }
    }

    // 选择种子
    selectSeed(seed: keyof typeof SEEDS) {
        if (this.landStatus === 'plowed') {
            this.selectedSeed = seed;
            this.landStatus = 'planted';
            this.waterCount = 0;
            this.farmingStartTime = Date.now();
            this.isFarming = true;
            vscode.window.showInformationMessage(`已种下 ${SEEDS[seed].name}，记得浇水哦！`);
        } else {
            vscode.window.showInformationMessage('土地还未犁好，无法种植！');
        }
    }

    // 浇水
    waterCrop(pet: Pet) {
        if (this.isFarming && this.selectedSeed) {
            const seedConfig = SEEDS[this.selectedSeed];
            this.waterCount++;
            if (this.waterCount >= seedConfig.waterNeeded) {
                if (Date.now() - this.farmingStartTime >= seedConfig.growthTime) {
                    this.isFarming = false;
                    this.landStatus = 'wasteland';
                    this.cropCount++;
                    this.nutrients -= 20; // 每收获一次减少营养值
                    if (this.cropCount >= LAND_MAX_CROPS) {
                        this.nutrients = 0;
                    }
                    pet['warehouse'].addFood();
                    vscode.window.showInformationMessage(`${SEEDS[this.selectedSeed].name} 成熟啦，获得一份食物，已存入仓库！`);
                    this.selectedSeed = null;
                    return true;
                } else {
                    vscode.window.showInformationMessage('还没到收获时间，继续等待吧。');
                }
            } else {
                vscode.window.showInformationMessage(`已浇水 ${this.waterCount} 次，还需浇水 ${seedConfig.waterNeeded - this.waterCount} 次。`);
            }
        } else {
            vscode.window.showInformationMessage('还没开始种地，先犁地并选择种子吧。');
        }
        return false;
    }

    // 施肥
    fertilize() {
        if (this.nutrients < INITIAL_NUTRIENTS) {
            this.nutrients = INITIAL_NUTRIENTS;
            this.cropCount = 0;
            vscode.window.showInformationMessage('土地已施肥，恢复了营养！');
        } else {
            vscode.window.showInformationMessage('土地营养充足，无需施肥。');
        }
    }

    // 获取耕地状态信息
    getFarmingStatus() {
        if (this.landStatus === 'wasteland') {
            return `土地状态: 荒废，营养值: ${this.nutrients}`;
        } else if (this.landStatus === 'plowed') {
            return `土地状态: 已犁好，营养值: ${this.nutrients}，可以选择种子种植`;
        } else if (this.landStatus === 'planted' && this.selectedSeed) {
            const seedConfig = SEEDS[this.selectedSeed];
            const timeLeft = Math.max(0, (this.farmingStartTime + seedConfig.growthTime - Date.now()) / 1000);
            return `正在种植 ${seedConfig.name}，已浇水 ${this.waterCount} 次，还需浇水 ${seedConfig.waterNeeded - this.waterCount} 次，剩余时间: ${timeLeft.toFixed(0)} 秒，营养值: ${this.nutrients}`;
        }
        return '未在种地';
    }
}    