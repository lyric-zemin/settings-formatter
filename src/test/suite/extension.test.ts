import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { SettingsParser } from '../../formatter/settingsParser';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    test('Category comments should not be duplicated when formatting multiple times', async () => {
        // 创建模拟的设置内容，包含已有的分类注释
        const mockSettingsContent = `{
  // ==================== 编辑器基础设置 ====================
  "editor.fontSize": 14,
  "editor.tabSize": 2,

  // ==================== 文件和搜索设置 ====================
  "files.autoSave": "onFocusChange"
}`;

        // 创建设置解析器实例
        const parser = new SettingsParser();
        
        // 模拟解析方法来测试我们的修复
        const parseResult = (parser as any).parseSettingsContent(mockSettingsContent);
        
        // 验证解析结果中不应该包含分类注释行作为设置项
        const categoryComments = parseResult.settings.filter((setting: any) => 
            setting.comment && setting.comment.includes('====================')
        );
        
        // 断言：解析后的设置中不应该包含分类注释
        assert.strictEqual(categoryComments.length, 0, 'Should not include category comments as settings');
        
        // 验证正常设置项应该被正确解析
        const fontSizeSetting = parseResult.settings.find((s: any) => s.key === 'editor.fontSize');
        assert.ok(fontSizeSetting, 'Should parse normal settings correctly');
        assert.strictEqual(fontSizeSetting.value, 14, 'Should parse setting values correctly');
    });

    test('Settings parser should skip category comment lines', () => {
        const parser = new SettingsParser();
        
        // 测试各种格式的分类注释
        const testCases = [
            '// ==================== 编辑器基础设置 ====================',
            '// -------- 文件和搜索设置 --------',
            '// ######## 窗口和界面设置 ########',
            '// ******** 扩展和插件设置 ********'
        ];

        testCases.forEach(commentLine => {
            const result = (parser as any).isCategoryComment(commentLine);
            assert.strictEqual(result, true, `Should recognize "${commentLine}" as category comment`);
        });

        // 测试普通注释不应该被识别为分类注释
        const normalComments = [
            '// 这是一个普通的注释',
            '// editor.fontSize 设置字体大小',
            '// TODO: 需要优化这个设置'
        ];

        normalComments.forEach(commentLine => {
            const result = (parser as any).isCategoryComment(commentLine);
            assert.strictEqual(result, false, `Should not recognize "${commentLine}" as category comment`);
        });
    });
});