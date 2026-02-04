# Settings Formatter

A VSCode extension to format settings files by parameter types with preview functionality.

## Features

- **Smart Categorization**: Automatically groups settings by parameter types
- **Visual Preview**: Preview formatting changes before applying
- **Customizable**: Configure formatting options to your preference
- **Safe Operations**: Backup and restore functionality

## Installation

1. Install the extension from VSCode Marketplace
2. Reload VSCode when prompted

## Usage

### Commands

- `Format Settings File`: Format the current settings file
- `Preview Settings Formatting`: Show preview of formatted settings

### Keyboard Shortcuts

You can assign custom keyboard shortcuts to these commands in your keybindings.json:

```json
[
  {
    "key": "ctrl+shift+f",
    "command": "settings-formatter.formatSettings",
    "when": "editorTextFocus && resourceExtname == '.json'"
  },
  {
    "key": "ctrl+shift+p",
    "command": "settings-formatter.previewSettings",
    "when": "editorTextFocus && resourceExtname == '.json'"
  }
]
```

## Configuration

The extension can be configured through VSCode settings:

```json
{
  "settings-formatter.preserveComments": true,
  "settings-formatter.sortKeys": true,
  "settings-formatter.indentSize": 2,
  "settings-formatter.categorySeparator": "===================="
}
```

### Available Options

- `preserveComments`: Whether to preserve existing comments (default: `true`)
- `sortKeys`: Whether to sort settings keys alphabetically (default: `true`)
- `indentSize`: Number of spaces for indentation (default: `2`)
- `categorySeparator`: String used to separate category blocks (default: `"===================="`)

## Categories

Settings are automatically categorized into the following groups:

1. **编辑器基础设置** - Editor basic settings
2. **文件和搜索设置** - Files and search settings  
3. **窗口和界面设置** - Window and UI settings
4. **扩展和插件设置** - Extensions settings
5. **终端设置** - Terminal settings
6. **调试设置** - Debug settings
7. **Git集成设置** - Git integration settings
8. **语言特定设置** - Language specific settings
9. **其他设置** - Other settings

## Development

### Prerequisites

- Node.js (version 16.x or higher)
- VSCode (version 1.74.0 or higher)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Scripts

```bash
# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Run tests
npm test

# Lint code
npm run lint

# Package extension
npm run package

# Publish extension
npm run publish
```

### Debugging

1. Open the project in VSCode
2. Press `F5` to launch the extension in debug mode
3. This opens a new VSCode window with the extension loaded

See [DEBUGGING.md](DEBUGGING.md) for detailed debugging information.

## Publishing

To publish updates to VSCode Marketplace:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Run tests and compile
4. Package and publish:
   ```bash
   npm run package
   npm run publish
   ```

See [PUBLISHING.md](PUBLISHING.md) for detailed publishing instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/lyric-zemin/settings-formatter/issues) on GitHub.