import * as vscode from 'vscode';

// 定义配置项类型
export interface SettingsFormatterConfig {
    preserveComments: boolean;
    sortKeys: boolean;
    indentSize: number;
    categorySeparator: string;
}

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'settings-formatter';
    private static instance: ConfigManager;
    
    private constructor() {}

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    /**
     * 获取完整配置对象
     */
    public getAllConfig(): SettingsFormatterConfig {
        const config = vscode.workspace.getConfiguration(ConfigManager.CONFIG_SECTION);
        return {
            preserveComments: config.get<boolean>('preserveComments', true),
            sortKeys: config.get<boolean>('sortKeys', true),
            indentSize: config.get<number>('indentSize', 2),
            categorySeparator: config.get<string>('categorySeparator', '====================')
        };
    }

    /**
     * 获取单个配置项
     */
    public getConfig<T>(key: keyof SettingsFormatterConfig, defaultValue: T): T {
        const config = vscode.workspace.getConfiguration(ConfigManager.CONFIG_SECTION);
        return config.get<T>(key, defaultValue);
    }

    /**
     * 更新配置项
     */
    public async updateConfig<T>(key: keyof SettingsFormatterConfig, value: T): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigManager.CONFIG_SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    /**
     * 批量更新配置
     */
    public async updateConfigs(updates: Partial<SettingsFormatterConfig>): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigManager.CONFIG_SECTION);
        for (const [key, value] of Object.entries(updates)) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
    }

    /**
     * 监听配置变化
     */
    public onConfigChange(listener: (config: SettingsFormatterConfig) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(ConfigManager.CONFIG_SECTION)) {
                listener(this.getAllConfig());
            }
        });
    }

}