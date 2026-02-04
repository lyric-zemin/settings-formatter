import * as vscode from 'vscode';
import { SettingsFormatter } from '../formatter/formatter';

export class PreviewPanel {
    private panel: vscode.WebviewPanel | undefined;
    private formatter: SettingsFormatter;

    constructor(private extensionUri: vscode.Uri) {
        this.formatter = new SettingsFormatter();
    }

    public async showPreview(): Promise<void> {
        // 创建或显示webview面板
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
        } else {
            this.createPreviewPanel();
        }

        // 更新预览内容
        await this.updatePreviewContent();
    }

    private createPreviewPanel(): void {
        this.panel = vscode.window.createWebviewPanel(
            'settingsFormatterPreview',
            'Settings Formatter Preview',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'apply':
                    await this.applyFormatting();
                    break;
                case 'refresh':
                    await this.updatePreviewContent();
                    break;
            }
        });
    }

    private async updatePreviewContent(): Promise<void> {
        if (!this.panel) return;

        try {
            const formattedContent = await this.formatter.getFormattedPreview();
            this.panel.webview.html = this.getWebviewContent(formattedContent);
        } catch (error) {
            this.panel.webview.html = this.getErrorContent(error as Error);
        }
    }

    private getWebviewContent(formattedContent: string): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings Formatter Preview</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        
        .header h1 {
            color: var(--vscode-foreground);
            margin: 0 0 10px 0;
        }
        
        .controls {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 2px;
            cursor: pointer;
            font-size: var(--vscode-font-size);
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            cursor: not-allowed;
        }
        
        .preview-content {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 16px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            line-height: 1.5;
            white-space: pre-wrap;
            overflow-x: auto;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .comment {
            color: var(--vscode-editorCommentsForeground);
        }
        
        .key {
            color: var(--vscode-editorBracketHighlight-foreground1);
        }
        
        .string {
            color: var(--vscode-editorBracketHighlight-foreground2);
        }
        
        .number {
            color: var(--vscode-editorBracketHighlight-foreground3);
        }
        
        .boolean {
            color: var(--vscode-editorBracketHighlight-foreground4);
        }
        
        .notification {
            padding: 12px;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        .success {
            background-color: var(--vscode-diffEditor-insertedTextBackground);
            border: 1px solid var(--vscode-diffEditor-insertedLineBackground);
        }
        
        .error {
            background-color: var(--vscode-diffEditor-removedTextBackground);
            border: 1px solid var(--vscode-diffEditor-removedLineBackground);
        }
        
        .info {
            background-color: var(--vscode-editorInfo-background);
            border: 1px solid var(--vscode-editorInfo-border);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Settings Formatter Preview</h1>
            <p>Preview the formatted settings before applying changes</p>
        </div>
        
        <div class="controls">
            <button id="applyBtn">Apply Changes</button>
            <button id="refreshBtn">Refresh Preview</button>
        </div>
        
        <div id="notification"></div>
        
        <div class="preview-content" id="previewContent">${this.escapeHtml(formattedContent)}</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        document.getElementById('applyBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'apply' });
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'refresh' });
        });
        
        window.addEventListener('message', event => {
            const message = event.data;
            const notification = document.getElementById('notification');
            
            if (message.type === 'notification') {
                notification.className = 'notification ' + message.level;
                notification.textContent = message.text;
                
                // 自动隐藏通知
                setTimeout(() => {
                    notification.className = 'notification';
                    notification.textContent = '';
                }, 3000);
            }
        });
    </script>
</body>
</html>`;
    }

    private getErrorContent(error: Error): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: var(--vscode-font-family);
            color: var(--vscode-errorForeground);
            padding: 20px;
        }
        .error-container {
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h2>Error Loading Preview</h2>
        <p>${this.escapeHtml(error.message)}</p>
        <button onclick="location.reload()">Retry</button>
    </div>
</body>
</html>`;
    }

    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    private async applyFormatting(): Promise<void> {
        try {
            await this.formatter.formatCurrentSettings();
            
            // 发送成功通知到webview
            this.panel?.webview.postMessage({
                type: 'notification',
                level: 'success',
                text: 'Settings formatted successfully!'
            });
            
            // 关闭预览面板
            setTimeout(() => {
                this.panel?.dispose();
            }, 1500);
            
        } catch (error) {
            this.panel?.webview.postMessage({
                type: 'notification',
                level: 'error',
                text: `Failed to apply formatting: ${(error as Error).message}`
            });
        }
    }
}