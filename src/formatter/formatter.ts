import * as vscode from 'vscode';
import { SettingsParser, SettingItem } from './settingsParser';
import { Categorizer, CategorizedSettings } from './categorizer';
import { CATEGORY_SEPARATOR } from '../constants/categories';

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
            
            // 格式化设置
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
            return this.generatePreviewContent(categorized);
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

            // 添加分类标题作为注释
            const categoryHeader: SettingItem = {
                key: `__category_header_${category.categoryName}`,
                value: null,
                comment: `${this.options.categorySeparator} ${category.categoryName} ${this.options.categorySeparator}`
            };
            result.push(categoryHeader);

            // 添加该类别的所有设置
            category.settings.forEach(setting => {
                if (this.options.preserveComments || !setting.comment) {
                    result.push(setting);
                } else {
                    // 不保留注释时，移除原有注释
                    result.push({ ...setting, comment: undefined });
                }
            });

            // 在类别间添加空行分隔
            result.push({
                key: '__empty_line',
                value: null
            });
        });

        // 移除最后一个空行标记
        if (result.length > 0 && result[result.length - 1].key === '__empty_line') {
            result.pop();
        }

        // 过滤掉特殊标记
        return result.filter(item => 
            !item.key.startsWith('__category_header_') && 
            item.key !== '__empty_line'
        );
    }

    private generatePreviewContent(categorized: CategorizedSettings[]): string {
        let content = '{\n';
        const indent = ' '.repeat(this.options.indentSize);

        categorized.forEach((category, categoryIndex) => {
            // 添加分类注释
            content += `${indent}// ${this.options.categorySeparator} ${category.categoryName} ${this.options.categorySeparator}\n`;

            // 对设置进行排序
            const sortedSettings = this.options.sortKeys 
                ? [...category.settings].sort((a, b) => a.key.localeCompare(b.key))
                : category.settings;

            // 添加设置项
            sortedSettings.forEach((setting, settingIndex) => {
                // 添加注释
                if (this.options.preserveComments && setting.comment) {
                    content += `${indent}// ${setting.comment}\n`;
                }

                // 添加键值对
                const valueStr = this.formatValue(setting.value);
                content += `${indent}"${setting.key}": ${valueStr}`;

                // 添加逗号（如果不是最后一个元素）
                const isLastSetting = settingIndex === sortedSettings.length - 1;
                const isLastCategory = categoryIndex === categorized.length - 1;
                
                if (!isLastSetting || !isLastCategory) {
                    content += ',';
                }
                
                content += '\n';
            });

            // 类别间添加空行（除了最后一个类别）
            if (categoryIndex < categorized.length - 1) {
                content += '\n';
            }
        });

        content += '}';
        return content;
    }

    private formatValue(value: any): string {
        if (typeof value === 'string') {
            return `"${value}"`;
        } else if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, this.options.indentSize);
        } else {
            return JSON.stringify(value);
        }
    }
}