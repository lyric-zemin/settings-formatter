import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface SettingItem {
    key: string;
    value: any;
    comment?: string;
}

export class SettingsParser {
    private document: vscode.TextDocument | null = null;

    constructor(document?: vscode.TextDocument) {
        if (document) {
            this.document = document;
        }
    }

    public async getCurrentSettings(): Promise<{ settings: SettingItem[], rawContent: string }> {
        if (!this.document) {
            // 获取当前工作区的settings文件
            const settingsPath = this.getSettingsPath();
            if (!fs.existsSync(settingsPath)) {
                throw new Error('Settings file not found');
            }
            
            const rawContent = fs.readFileSync(settingsPath, 'utf8');
            return this.parseSettingsContent(rawContent);
        } else {
            const rawContent = this.document.getText();
            return this.parseSettingsContent(rawContent);
        }
    }

    private getSettingsPath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder found');
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;
        return path.join(workspacePath, '.vscode', 'settings.json');
    }

    private parseSettingsContent(content: string): { settings: SettingItem[], rawContent: string } {
        try {
            // 简单的JSON解析，保留注释信息
            const lines = content.split('\n');
            const settings: SettingItem[] = [];
            let currentComment = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // 处理注释
                if (line.startsWith('//')) {
                    currentComment = line.substring(2).trim();
                    continue;
                }

                // 处理键值对
                const match = line.match(/^"([^"]+)":\s*(.+?)(?:,?)$/);
                if (match) {
                    const key = match[1];
                    const valueStr = match[2];
                    
                    try {
                        const value = JSON.parse(valueStr);
                        settings.push({
                            key,
                            value,
                            comment: currentComment || undefined
                        });
                    } catch (parseError) {
                        // 如果JSON解析失败，保留原始字符串
                        settings.push({
                            key,
                            value: valueStr,
                            comment: currentComment || undefined
                        });
                    }
                    
                    currentComment = ''; // 重置注释
                }
            }

            return { settings, rawContent: content };
        } catch (error) {
            throw new Error(`Failed to parse settings: ${error}`);
        }
    }

    public async saveSettings(settings: SettingItem[]): Promise<void> {
        const formattedContent = this.formatSettingsForSave(settings);
        
        if (this.document) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                this.document.positionAt(0),
                this.document.positionAt(this.document.getText().length)
            );
            edit.replace(this.document.uri, fullRange, formattedContent);
            await vscode.workspace.applyEdit(edit);
        } else {
            const settingsPath = this.getSettingsPath();
            fs.writeFileSync(settingsPath, formattedContent, 'utf8');
        }
    }

    private formatSettingsForSave(settings: SettingItem[]): string {
        let content = '{\n';
        const indent = '  '; // 固定2个空格缩进用于保存
        
        settings.forEach((setting, index) => {
            // 处理类别注释
            if (setting.key === '__category_comment' && setting.comment) {
                content += `${indent}// ${setting.comment}\n`;
                return;
            }
            
            // 处理类别分隔符（空行）
            if (setting.key === '__category_separator') {
                content += '\n';
                return;
            }
            
            // 处理普通设置项
            if (setting.comment) {
                content += `${indent}// ${setting.comment}\n`;
            }
            
            const valueStr = typeof setting.value === 'string' 
                ? `"${setting.value}"`
                : JSON.stringify(setting.value, null, 2);
                
            content += `${indent}"${setting.key}": ${valueStr}`;
            
            if (index < settings.length - 1) {
                content += ',';
            }
            content += '\n';
        });
        
        content += '}';
        return content;
    }
}