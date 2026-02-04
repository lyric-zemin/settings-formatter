import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class FileHelper {
    public static async readSettingsFile(): Promise<string> {
        const settingsPath = this.getSettingsPath();
        if (!fs.existsSync(settingsPath)) {
            throw new Error('Settings file not found');
        }
        return fs.readFileSync(settingsPath, 'utf8');
    }

    public static async writeSettingsFile(content: string): Promise<void> {
        const settingsPath = this.getSettingsPath();
        // 确保目录存在
        const dirPath = path.dirname(settingsPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        fs.writeFileSync(settingsPath, content, 'utf8');
    }

    public static getSettingsPath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        return path.join(workspacePath, '.vscode', 'settings.json');
    }

    public static backupSettings(): string {
        const settingsPath = this.getSettingsPath();
        const backupPath = settingsPath + '.backup';
        
        if (fs.existsSync(settingsPath)) {
            fs.copyFileSync(settingsPath, backupPath);
        }
        
        return backupPath;
    }

    public static restoreSettings(backupPath: string): void {
        const settingsPath = this.getSettingsPath();
        if (fs.existsSync(backupPath)) {
            fs.copyFileSync(backupPath, settingsPath);
        }
    }

    public static isValidJson(content: string): boolean {
        try {
            JSON.parse(content);
            return true;
        } catch {
            return false;
        }
    }

    public static async getCurrentDocumentContent(): Promise<string | null> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'json') {
            return null;
        }
        return editor.document.getText();
    }
}