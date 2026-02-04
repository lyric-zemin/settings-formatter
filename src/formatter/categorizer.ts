import { SettingItem } from './settingsParser';
import { CategoryRule, DEFAULT_CATEGORIES } from '../constants/categories';

export interface CategorizedSettings {
    categoryName: string;
    settings: SettingItem[];
}

export class Categorizer {
    private categories: CategoryRule[];

    constructor(customCategories?: CategoryRule[]) {
        this.categories = customCategories || DEFAULT_CATEGORIES;
        // 按优先级排序
        this.categories.sort((a, b) => a.priority - b.priority);
    }

    public categorize(settings: SettingItem[]): CategorizedSettings[] {
        const categorized: Map<string, SettingItem[]> = new Map();
        const uncategorized: SettingItem[] = [];

        // 初始化所有分类
        this.categories.forEach(category => {
            categorized.set(category.name, []);
        });

        // 对每个设置项进行分类
        settings.forEach(setting => {
            let categorizedFlag = false;
            
            for (const category of this.categories) {
                if (this.matchesCategory(setting.key, category)) {
                    categorized.get(category.name)?.push(setting);
                    categorizedFlag = true;
                    break;
                }
            }
            
            if (!categorizedFlag) {
                uncategorized.push(setting);
            }
        });

        // 构建结果数组
        const result: CategorizedSettings[] = [];
        
        // 添加已分类的项目
        this.categories.forEach(category => {
            const categorySettings = categorized.get(category.name);
            if (categorySettings && categorySettings.length > 0) {
                result.push({
                    categoryName: category.name,
                    settings: categorySettings
                });
            }
        });

        // 添加未分类的项目
        if (uncategorized.length > 0) {
            result.push({
                categoryName: "其他设置",
                settings: uncategorized
            });
        }

        return result;
    }

    private matchesCategory(key: string, category: CategoryRule): boolean {
        return category.patterns.some(pattern => pattern.test(key));
    }

    public addCustomCategory(category: CategoryRule): void {
        this.categories.push(category);
        this.categories.sort((a, b) => a.priority - b.priority);
    }

    public removeCategory(categoryName: string): void {
        this.categories = this.categories.filter(cat => cat.name !== categoryName);
    }

    public getCategories(): CategoryRule[] {
        return [...this.categories];
    }
}