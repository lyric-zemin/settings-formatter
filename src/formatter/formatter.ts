import * as vscode from 'vscode';
import { CategorizedSettings, Categorizer } from './categorizer';
import { SettingItem, SettingsParser } from './settingsParser';
import { ConfigManager, SettingsFormatterConfig } from '../utils/configManager';

export interface FormatOptions {
    preserveComments: boolean;
    sortKeys: boolean;
    indentSize: number;
    categorySeparator: string;
}

export class SettingsFormatter {
    private parser: SettingsParser;
    private categorizer: Categorizer;
    private configManager: ConfigManager;
    private options!: FormatOptions; // 使用 definite assignment assertion

    constructor(options?: Partial<FormatOptions>) {
        this.parser = new SettingsParser();
        this.categorizer = new Categorizer();
        this.configManager = ConfigManager.getInstance();
        
        // 初始化默认配置
        this.loadConfiguration();
        
        // 如果传入了自定义选项，则合并
        if (options) {
            this.options = { ...this.options, ...options };
        }
    }

    /**
     * 从配置管理器加载配置
     */
    private loadConfiguration(): void {
        const config = this.configManager.getAllConfig();
        this.options = {
            preserveComments: config.preserveComments,
            sortKeys: config.sortKeys,
            indentSize: config.indentSize,
            categorySeparator: config.categorySeparator
        };

        // 监听配置变化
        this.configManager.onConfigChange((newConfig) => {
            this.options = {
                preserveComments: newConfig.preserveComments,
                sortKeys: newConfig.sortKeys,
                indentSize: newConfig.indentSize,
                categorySeparator: newConfig.categorySeparator
            };
        });
    }

    /**
     * 更新配置（供外部调用）
     */
    public async updateConfiguration(updates: Partial<SettingsFormatterConfig>): Promise<void> {
        await this.configManager.updateConfigs(updates);
        // 配置变化会通过监听器自动更新this.options
    }

    public async formatCurrentSettings(): Promise<void> {
        try {
            // 解析当前设置
            const { settings } = await this.parser.getCurrentSettings();
            
            // 分类设置
            const categorized = this.categorizer.categorize(settings);
            
            // 格式化设置（包括类别头）
            const formattedSettings = this.formatCategorizedSettings(categorized);
            
            // 保存格式化后的设置
            await this.parser.saveSettings(formattedSettings);
            
            vscode.window.showInformationMessage('Settings formatted successfully!');
        } catch (error) {
            throw new Error(`Formatting failed: ${error}`);
        }
    }

    public async getFormattedPreview(): Promise<string> {
        try {
            const { settings } = await this.parser.getCurrentSettings();
            const categorized = this.categorizer.categorize(settings);
            const formattedSettings = this.formatCategorizedSettings(categorized);

            return this.parser.formatSettingsForSave(formattedSettings);
        } catch (error) {
            throw new Error(`Preview generation failed: ${error}`);
        }
    }

    private formatCategorizedSettings(categorized: CategorizedSettings[]): SettingItem[] {
        const result: SettingItem[] = [];

        categorized.forEach(category => {
            // 对类别内的设置进行排序
            if (this.options.sortKeys) {
                category.settings.sort((a, b) => a.key.localeCompare(b.key));
            }

            // 添加分类标题作为注释（使用特殊标记以便后续识别）
            const categoryComment: SettingItem = {
                key: '__category_comment',
                value: null,
                comment: `${this.options.categorySeparator} ${category.categoryName} ${this.options.categorySeparator}`
            };
            result.push(categoryComment);

            // 添加该类别的所有设置
            category.settings.forEach(setting => {
                if (this.options.preserveComments || !setting.comment) {
                    result.push(setting);
                } else {
                    // 不保留注释时，移除原有注释
                    result.push({ ...setting, comment: undefined });
                }
            });

            // 在类别间添加空行分隔（使用特殊标记）
            result.push({
                key: '__category_separator',
                value: null
            });
        });

        // 移除最后一个分隔符
        if (result.length > 0 && result[result.length - 1].key === '__category_separator') {
            result.pop();
        }

        return result;
    }

    /**
     * 获取当前配置状态
     */
    public getCurrentOptions(): Readonly<FormatOptions> {
        return { ...this.options };
    }

}