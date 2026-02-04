import * as vscode from 'vscode';

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'settings-formatter';

    public static getConfig<T>(key: string, defaultValue: T): T {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.get<T>(key, defaultValue);
    }

    public static async updateConfig(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    public static getAllConfig(): any {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return {
            preserveComments: config.get<boolean>('preserveComments', true),
            sortKeys: config.get<boolean>('sortKeys', true),
            indentSize: config.get<number>('indentSize', 2),
            categorySeparator: config.get<string>('categorySeparator', '// ====================')
        };
    }
}