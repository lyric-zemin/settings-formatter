import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'

/**
 * 安全地解析JSON字符串，支持处理尾逗号
 * @param jsonString 包含可能尾逗号的JSON字符串
 * @returns 解析后的JavaScript对象
 */
function safeJsonParse(jsonString: string): any {
  try {
    // 首先尝试直接解析
    return JSON.parse(jsonString)
  } catch (error) {
    // 如果直接解析失败，尝试清理尾逗号
    try {
      // 移除对象和数组末尾的逗号
      let cleanedString = jsonString
        // 移除字符结尾的逗号
        .replace(/(.*),$/, '$1')
        // 处理对象中的尾逗号: }, } -> }}
        .replace(/,\s*\}/g, '}')
        // 处理数组中的尾逗号: , ] -> ]
        .replace(/,\s*\]/g, ']')
        // 处理多行情况下的尾逗号
        .replace(/,\s*\n\s*\}/g, '\n}')
        .replace(/,\s*\n\s*\]/g, '\n]')

      return JSON.parse(cleanedString)
    } catch (cleanError) {
      // 如果清理后仍然失败，抛出原始错误
      throw error
    }
  }
}

export interface SettingItem {
  key: string
  value: any
  comment?: string
}

export class SettingsParser {
  private document: vscode.TextDocument | null = null

  constructor(document?: vscode.TextDocument) {
    if (document) {
      this.document = document
    }
  }

  public async getCurrentSettings(): Promise<{
    settings: SettingItem[]
    rawContent: string
  }> {
    if (!this.document) {
      // 获取当前工作区的settings文件
      const settingsPath = this.getSettingsPath()
      if (!fs.existsSync(settingsPath)) {
        throw new Error('Settings file not found')
      }

      const rawContent = fs.readFileSync(settingsPath, 'utf8')
      return this.parseSettingsContent(rawContent)
    } else {
      const rawContent = this.document.getText()
      return this.parseSettingsContent(rawContent)
    }
  }

  private getSettingsPath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found')
    }

    const workspacePath = workspaceFolders[0].uri.fsPath
    return path.join(workspacePath, '.vscode', 'settings.json')
  }

  /**
   * 检查是否为分类注释行
   * @param line 行内容
   * @returns 是否为分类注释
   */
  private isCategoryComment(line: string): boolean {
    // 匹配各种格式的分类注释
    const categoryPatterns = [
      /^\/\/\s*=+\s*[^=]+\s*=+$/, // ======== 分类名称 ========
      /^\/\/\s*-+\s*[^-]+\s*-+$/, // -------- 分类名称 --------
      /^\/\/\s*#+\s*[^#]+\s*#+$/, // ######## 分类名称 ########
      /^\/\/\s*\*+\s*[^*]+\s*\*+$/ // ******** 分类名称 ********
    ];
    
    return categoryPatterns.some(pattern => pattern.test(line.trim()));
  }

  private parseSettingsContent(content: string): {
    settings: SettingItem[]
    rawContent: string
  } {
    try {
      const lines = content.split('\n')
      const settings: SettingItem[] = []
      let currentComment = ''

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // 跳过分类注释行和空行分隔符
        if (this.isCategoryComment(line) || line === '') {
          continue
        }

        // 处理注释
        if (line.startsWith('//')) {
          currentComment = line.substring(2).trim()
          continue
        }

        // 处理键值对
        const match = line.match(/^"([^"]+)":\s*(.+?)(?:,?)$/)
        if (match) {
          const key = match[1]
          let valueStr = match[2]

          try {
            // 使用安全的JSON解析函数
            const value = safeJsonParse(valueStr)
            settings.push({
              key,
              value,
              comment: currentComment || undefined,
            })
          } catch (parseError) {
            // 如果直接解析失败，尝试收集多行内容
            if (
              (valueStr.includes('[') && !valueStr.includes(']')) ||
              (valueStr.includes('{') && !valueStr.includes('}'))
            ) {
              // 收集多行直到找到匹配的结束括号
              let fullLines = [valueStr]
              let j = i + 1
              let bracketCount = this.countUnmatchedBrackets(valueStr)

              while (j < lines.length && bracketCount > 0) {
                const nextLine = lines[j].trim()
                if (nextLine && !nextLine.startsWith('//')) {
                  fullLines.push(nextLine)
                  bracketCount += this.countBracketChanges(nextLine)
                }
                j++
              }

              try {
                const fullValueStr = fullLines.join('')
                const value = safeJsonParse(fullValueStr)
                settings.push({
                  key,
                  value,
                  comment: currentComment || undefined,
                })
                i = j - 1 // 跳过已处理的行
              } catch (multiParseError) {
                // 如果多行解析也失败，保留原始字符串
                settings.push({
                  key,
                  value: valueStr,
                  comment: currentComment || undefined,
                })
              }
            } else {
              // 简单值解析失败，保留原始字符串
              settings.push({
                key,
                value: valueStr,
                comment: currentComment || undefined,
              })
            }
          }

          currentComment = '' // 重置注释
        }
      }

      return { settings, rawContent: content }
    } catch (error) {
      throw new Error(`Failed to parse settings: ${error}`)
    }
  }

  // 计算未匹配的括号数量
  private countUnmatchedBrackets(str: string): number {
    let open = 0
    let close = 0

    for (const char of str) {
      if (char === '{' || char === '[') {
        open++
      }
      if (char === '}' || char === ']') {
        close++
      }
    }

    return open - close
  }

  // 计算一行中括号的变化量
  private countBracketChanges(line: string): number {
    let open = 0
    let close = 0

    for (const char of line) {
      if (char === '{' || char === '[') {
        open++
      }
      if (char === '}' || char === ']') {
        close++
      }
    }

    return open - close
  }

  public async saveSettings(settings: SettingItem[]): Promise<void> {
    const formattedContent = this.formatSettingsForSave(settings)

    if (this.document) {
      const edit = new vscode.WorkspaceEdit()
      const fullRange = new vscode.Range(
        this.document.positionAt(0),
        this.document.positionAt(this.document.getText().length)
      )
      edit.replace(this.document.uri, fullRange, formattedContent)
      await vscode.workspace.applyEdit(edit)
    } else {
      const settingsPath = this.getSettingsPath()
      fs.writeFileSync(settingsPath, formattedContent, 'utf8')
    }
  }

  private formatSettingsForSave(settings: SettingItem[]): string {
    let content = '{\n'
    const indent = '  ' // 固定2个空格缩进用于保存

    settings.forEach((setting, index) => {
      // 处理类别注释
      if (setting.key === '__category_comment' && setting.comment) {
        content += `${indent}// ${setting.comment}\n`
        return
      }

      // 处理类别分隔符（空行）
      if (setting.key === '__category_separator') {
        content += '\n'
        return
      }

      // 处理普通设置项
      if (setting.comment) {
        content += `${indent}// ${setting.comment}\n`
      }

      const valueStr = JSON.stringify(setting.value, null, 2)

      content += `${indent}"${setting.key}": ${valueStr}`

      if (index < settings.length - 1) {
        content += ','
      }
      content += '\n'
    })

    content += '}'
    return content
  }
}
