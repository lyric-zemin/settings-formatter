# VSCode扩展调试指南

本文档介绍了如何调试Settings Formatter扩展。

## 基本调试设置

### 1. 启动调试会话
1. 打开项目根目录
2. 按 `F5` 键启动调试
3. 这将打开一个新的VSCode窗口，其中加载了当前扩展

### 2. 设置断点
在源代码中点击行号左侧设置断点，扩展将在执行到断点时暂停。

## 调试配置

项目包含以下调试配置（位于 `.vscode/launch.json`）：

### Run Extension
- 启动扩展主机并加载当前扩展
- 用于测试扩展的基本功能

### Extension Tests
- 运行扩展的集成测试
- 在单独的VSCode实例中执行

### Debug Unit Tests
- 调试单元测试
- 可以设置断点来调试测试代码

### Attach to Extension Host
- 附加到正在运行的扩展主机进程
- 用于调试已经启动的扩展

## 日志和输出

### 控制台输出
在调试控制台中查看扩展的日志输出：
```
console.log('Debug info:', data);
```

### VSCode输出面板
扩展可以向VSCode输出面板写入信息：
```typescript
vscode.window.showInformationMessage('Extension activated');
```

## 常见调试场景

### 1. 命令执行调试
```typescript
// 在命令注册处设置断点
let disposable = vscode.commands.registerCommand('settings-formatter.formatSettings', () => {
    // 断点设置在这里
    console.log('Format settings command executed');
});
```

### 2. 配置读取调试
```typescript
// 调试配置读取
const config = vscode.workspace.getConfiguration('settings-formatter');
console.log('Config values:', config);
```

### 3. 文件操作调试
```typescript
// 调试文件读写操作
try {
    const document = await vscode.workspace.openTextDocument(filePath);
    // 设置断点检查document内容
} catch (error) {
    console.error('File operation failed:', error);
}
```

## 调试技巧

### 1. 条件断点
右键点击断点 → 编辑断点 → 添加条件表达式

### 2. 日志断点
右键点击断点 → 编辑断点 → 选择"记录到调试控制台"

### 3. 监视表达式
在调试视图中添加监视表达式来跟踪变量值变化

### 4. 调用堆栈检查
使用调用堆栈面板查看函数调用链

## 性能调试

### 1. 时间测量
```typescript
const startTime = Date.now();
// 执行操作
const endTime = Date.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

### 2. 内存使用监控
在调试控制台中使用：
```
process.memoryUsage()
```

## 故障排除

### 常见问题

1. **断点不命中**
   - 确保代码已被编译
   - 检查源映射配置
   - 重启调试会话

2. **扩展不加载**
   - 检查 `package.json` 中的激活事件
   - 查看扩展主机日志
   - 确认没有语法错误

3. **API调用失败**
   - 验证VSCode API版本兼容性
   - 检查权限和作用域
   - 查看官方文档更新

### 调试工具

1. **VSCode调试视图**
   - 变量检查
   - 调用堆栈
   - 监视表达式

2. **开发者工具**
   - 按 `Ctrl+Shift+I` 打开
   - 检查网络请求和控制台输出

3. **扩展宿主日志**
   - 帮助 → 切换开发人员工具
   - 查看扩展加载和运行时错误

## 最佳实践

1. **渐进式调试**
   - 从简单场景开始
   - 逐步增加复杂度

2. **日志记录**
   - 添加有意义的日志信息
   - 使用不同的日志级别

3. **测试驱动开发**
   - 先编写测试用例
   - 再实现功能代码

4. **代码审查**
   - 定期检查调试代码
   - 移除生产环境不需要的调试代码