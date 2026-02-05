import * as vscode from 'vscode';
import { SettingsFormatter } from './formatter/formatter';
import { PreviewPanel } from './preview/previewPanel';
import { ConfigManager } from './utils/configManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('Settings Formatter extension is now active!');
    
    // 初始化配置管理器（用于确保单例实例创建）
    ConfigManager.getInstance();
    
    // 注册格式化命令
    const formatCommand = vscode.commands.registerCommand(
        'settings-formatter.formatSettings',
        async () => {
            try {
                const formatter = new SettingsFormatter();
                await formatter.formatCurrentSettings();
            } catch (error) {
                vscode.window.showErrorMessage(`Formatting failed: ${error}`);
            }
        }
    );

    // 注册预览命令
    const previewCommand = vscode.commands.registerCommand(
        'settings-formatter.previewSettings',
        async () => {
            try {
                const panel = new PreviewPanel(context.extensionUri);
                await panel.showPreview();
            } catch (error) {
                vscode.window.showErrorMessage(`Preview failed: ${error}`);
            }
        }
    );

    context.subscriptions.push(formatCommand);
    context.subscriptions.push(previewCommand);
}

export function deactivate() {
    console.log('Settings Formatter extension is now deactivated!');
}