# VSCode扩展发布指南

本文档介绍了如何打包和发布Settings Formatter扩展到VSCode Marketplace。

## 准备工作

### 1. 安装VSCE工具
```bash
npm install -g vsce
```

### 2. 获取Personal Access Token
1. 访问 [Azure DevOps](https://dev.azure.com/)
2. 创建组织或使用现有组织
3. 进入用户设置 → Personal Access Tokens
4. 创建新token，选择范围：`Marketplace (Manage)`
5. 保存token（只显示一次）

### 3. 登录VSCE
```bash
vsce login <publisher-name>
# 输入获取的Personal Access Token
```

## 发布流程

### 1. 版本更新
更新 `package.json` 中的版本号：
```json
{
  "version": "1.0.1"
}
```

同时更新 `CHANGELOG.md` 记录变更内容。

### 2. 编译项目
```bash
npm run compile
```

### 3. 验证包内容
```bash
npm run verify-package
```

### 4. 打包扩展
```bash
npm run package
# 或者直接使用
vsce package
```

这会生成 `.vsix` 文件，如：`settings-formatter-1.0.1.vsix`

### 5. 发布到市场
```bash
npm run publish
# 或者直接使用
vsce publish
```

### 6. 测试发布（Dry Run）
在正式发布前可以进行测试：
```bash
npm run publish-dry-run
# 或者
vsce publish --dry-run
```

## 发布脚本说明

| 脚本命令 | 功能描述 |
|---------|---------|
| `npm run package` | 打包扩展为 `.vsix` 文件 |
| `npm run publish` | 发布扩展到VSCode Marketplace |
| `npm run publish-dry-run` | 测试发布流程，不实际上传 |
| `npm run verify-package` | 验证打包内容 |

## 注意事项

### 包含/排除文件
`.vscodeignore` 文件控制哪些文件会被包含在发布的扩展包中：
- 排除源代码文件（`src/**`）
- 排除测试文件
- 排除开发配置文件
- 保留必要的运行时文件

### 版本管理
- 遵循语义化版本控制（SemVer）
- 主版本号：重大功能变更
- 次版本号：新增功能
- 修订号：bug修复

### 发布前检查清单
- [ ] 更新版本号
- [ ] 更新CHANGELOG.md
- [ ] 运行测试：`npm test`
- [ ] 编译项目：`npm run compile`
- [ ] 验证包内容：`npm run verify-package`
- [ ] 测试打包：`npm run package`
- [ ] 在本地安装测试：`code --install-extension settings-formatter-x.x.x.vsix`

## 故障排除

### 常见错误

1. **Missing publisher**
   ```
   Error: Missing publisher name. Learn more: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions
   ```
   解决：在 `package.json` 中添加 `publisher` 字段

2. **Invalid version**
   ```
   Error: Invalid version number
   ```
   解决：确保版本号符合语义化版本格式

3. **Package size too large**
   解决：检查 `.vscodeignore` 文件，确保排除不必要的文件

### 本地测试
打包后可以在本地测试扩展：
```bash
# 安装扩展
code --install-extension settings-formatter-1.0.1.vsix

# 卸载扩展
code --uninstall-extension settings-formatter
```

## 自动化发布

可以结合CI/CD工具实现自动化发布：

### GitHub Actions示例
```yaml
name: Publish Extension
on:
  push:
    tags:
      - 'v*'
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run compile
      - run: npm run test
      - run: npm run package
      - run: vsce publish -p ${{ secrets.VSCE_TOKEN }}
```

## 相关资源

- [VSCode Extension API](https://code.visualstudio.com/api)
- [VSCE Documentation](https://github.com/microsoft/vscode-vsce)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)