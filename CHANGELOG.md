# Change Log

All notable changes to the "settings-formatter" extension will be documented in this file.

## [1.1.0] - 2025-05-13

### Bug Fixes
- **Fixed JSON parsing error with trailing commas**
  - Added `safeJsonParse` function to handle JSON strings with trailing commas
  - Support for processing trailing commas in objects `{}` and arrays `[]`
  - Support for handling trailing commas in multi-line JSON structures
  - Maintain compatibility with normal JSON, without affecting existing functionality

### Technical Improvements
- Enhanced robustness of JSON parsing
- Added complete test cases to verify the effectiveness of the fix
- Optimized parser's ability to handle various edge cases

## [1.0.0] - 2024-02-04

### Added
- Initial release
- Smart categorization of VSCode settings by parameter types
- Visual preview functionality with webview interface
- Configurable formatting options
- Backup and restore functionality
- Support for preserving comments
- Alphabetical sorting of settings keys
- Customizable indentation and separators
- Comprehensive error handling and user feedback

### Features
- **Core Functionality**: 
  - Parse and format VSCode settings files
  - Automatic categorization based on predefined rules
  - Real-time preview before applying changes
  
- **User Experience**:
  - Intuitive webview-based preview interface
  - Progress notifications and status feedback
  - One-click apply functionality
  - Refresh preview capability
  
- **Configuration**:
  - Preserve existing comments option
  - Toggle alphabetical sorting
  - Customizable indentation size
  - Configurable category separators

### Technical Details
- Built with TypeScript for type safety
- Uses VSCode Webview API for rich preview experience
- Implements robust JSON parsing with comment preservation
- Modular architecture with clear separation of concerns
- Comprehensive test suite foundation
- ESLint integration for code quality

### Supported Categories
1. 编辑器基础设置 (Editor Basic Settings)
2. 文件和搜索设置 (Files and Search Settings)
3. 窗口和界面设置 (Window and UI Settings)
4. 扩展和插件设置 (Extensions Settings)
5. 终端设置 (Terminal Settings)
6. 调试设置 (Debug Settings)
7. Git集成设置 (Git Integration Settings)
8. 语言特定设置 (Language Specific Settings)
9. 其他设置 (Other Settings)

### Known Issues
- None identified in initial release

### Planned Features
- Custom category rule definition
- Multiple workspace support
- Export/import formatting profiles
- Advanced diff visualization
- Performance optimizations for large settings files