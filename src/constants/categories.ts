export interface CategoryRule {
    name: string;
    patterns: RegExp[];
    priority: number;
}

export const DEFAULT_CATEGORIES: CategoryRule[] = [
    {
        name: "编辑器基础设置",
        patterns: [
            /^editor\./,
            /^workbench\.editor\./,
            /^diffEditor\./
        ],
        priority: 1
    },
    {
        name: "文件和搜索设置",
        patterns: [
            /^files\./,
            /^search\./
        ],
        priority: 2
    },
    {
        name: "窗口和界面设置",
        patterns: [
            /^window\./,
            /^workbench\./,
            /^zenMode\./
        ],
        priority: 3
    },
    {
        name: "扩展和插件设置",
        patterns: [
            /^extensions\./
        ],
        priority: 4
    },
    {
        name: "终端设置",
        patterns: [
            /^terminal\./
        ],
        priority: 5
    },
    {
        name: "调试设置",
        patterns: [
            /^debug\./
        ],
        priority: 6
    },
    {
        name: "Git集成设置",
        patterns: [
            /^git\./
        ],
        priority: 7
    },
    {
        name: "语言特定设置",
        patterns: [
            /\[.*\]$/
        ],
        priority: 8
    }
];
