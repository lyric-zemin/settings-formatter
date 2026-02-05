import * as vscode from 'vscode';
import { CATEGORY_SEPARATOR } from '../constants/categories';
import { CategorizedSettings, Categorizer } from './categorizer';
import { SettingItem, SettingsParser } from './settingsParser';

export interface FormatOptions {
    preserveComments: boolean;
    sortKeys: boolean;
    indentSize: number;
    categorySeparator: string;
}

export class SettingsFormatter {
    private parser: SettingsParser;
    private categorizer: Categorizer;
    private options: FormatOptions;

    constructor(options?: Partial<FormatOptions>) {
        this.parser = new SettingsParser();
        this.categorizer = new Categorizer();
        
        this.options = {
            preserveComments: true,
            sortKeys: true,
            indentSize: 2,
            categorySeparator: CATEGORY_SEPARATOR,
            ...options
        };
    }

    public async formatCurrentSettings(): Promise<void> {
        // 获取当前配置
        const config = vscode.workspace.getConfiguration('settings-formatter');
        this.updateOptionsFromConfig(config);

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
        const config = vscode.workspace.getConfiguration('settings-formatter');
        this.updateOptionsFromConfig(config);

        try {
            const { settings } = await this.parser.getCurrentSettings();
            const categorized = this.categorizer.categorize(settings);
            const formattedSettings = this.formatCategorizedSettings(categorized);

            return this.parser.formatSettingsForSave(formattedSettings);
        } catch (error) {
            throw new Error(`Preview generation failed: ${error}`);
        }
    }

    private updateOptionsFromConfig(config: vscode.WorkspaceConfiguration): void {
        this.options.preserveComments = config.get('preserveComments', true);
        this.options.sortKeys = config.get('sortKeys', true);
        this.options.indentSize = config.get('indentSize', 2);
        this.options.categorySeparator = config.get('categorySeparator', CATEGORY_SEPARATOR);
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
}