# SecuArchive - 安全服务报告归档工具

## 📋 项目简介

SecuArchive 是一款面向安全服务项目组的桌面端文件处理程序，专门用于整理、归档渗透测试、代码审计、基础环境测试等漏洞扫描报告。

## ✅ 当前版本: v1.1 (已发布)

## 🎯 核心功能

### v1.0规划 (已完成 ✅)
- [x] 报告文件管理（导入、分类、归档）
- [x] 项目维度的报告组织
- [x] 基础搜索和筛选
- [x] 报告预览（PDF、Word、文本等）

### v1.1规划 (已完成 ✅)
- [x] 数据备份/导出功能
- [x] 数据导入/恢复功能
- [x] 局域网文件共享服务
- [x] P2P 文件传输

### v2.0规划 (开发中 🚧)
- [ ] AI 智能问答助手（基于报告内容）
- [ ] 报告智能分类
- [ ] 多模型支持（OpenAI/Claude/SCNet/智谱/DeepSeek/本地等）

### v3.0规划 (待开发)
- [ ] 插件系统
- [ ] 自定义扩展

## 🛠 技术选型

### 核心技术栈
| 类别 | 技术 | 理由 |
|------|------|------|
| **框架** | Tauri 2.x | 跨平台、轻量、安全 |
| **前端** | React + TypeScript | 生态丰富、类型安全 |
| **UI 组件** | Tailwind CSS + 自定义组件 | 现代美观 |
| **状态管理** | Zustand | 轻量、简单 |
| **打包** | Vite | 快速开发 |
| **后端** | Rust | 高性能、安全 |

### 为什么选择 Tauri？
1. **跨平台** - 一套代码支持 Windows、macOS、Linux
2. **轻量** - 安装包比 Electron 小 10 倍
3. **性能** - Rust 后端，性能卓越
4. **安全** - 默认沙箱隔离
5. **AI 友好** - 易于集成各种 AI 能力

## 📁 项目结构

```
SecuArchive/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   │   ├── Layout.tsx      # 布局组件
│   │   ├── Sidebar.tsx     # 侧边栏
│   │   ├── Header.tsx     # 顶部导航
│   │   ├── ReportList.tsx  # 报告列表
│   │   ├── ReportPreview.tsx # 报告预览
│   │   ├── AIChat.tsx     # AI 助手
│   │   ├── Settings.tsx   # 设置页面
│   │   ├── PluginManager.tsx # 插件管理
│   │   ├── BackupManager.tsx # 备份管理
│   │   ├── FileShare.tsx  # 文件共享
│   │   └── Splitter.tsx   # 可调整分隔栏
│   ├── stores/            # 状态管理 (Zustand)
│   │   ├── reportStore.ts # 报告状态
│   │   ├── aiStore.ts     # AI 状态
│   │   └── pluginStore.ts # 插件状态
│   ├── types/             # TypeScript 类型
│   │   ├── index.ts       # 基础类型
│   │   └── plugin.ts      # 插件类型
│   └── App.tsx            # 主应用
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   └── lib.rs         # Tauri 命令和业务逻辑
│   ├── Cargo.toml
│   └── capabilities/      # 权限配置
├── dist/                   # 构建产物
└── README.md
```

## 🚀 开发指南

### 环境要求
- Node.js 20+
- Rust 1.70+
- pnpm（推荐）

### 安装依赖
```bash
# 安装前端依赖
pnpm install

# 安装 Rust 依赖
cd src-tauri && cargo build
```

### 开发模式
```bash
# 启动 Tauri 开发模式
pnpm tauri dev
```

### 构建发布
```bash
# 构建生产版本
pnpm tauri build
```

## 📊 报告分类体系

```
安全服务报告/
├── 渗透测试报告/
│   ├── Web渗透
│   ├── APP渗透
│   ├── 内网渗透
│   └── 红队评估
├── 代码审计报告/
│   ├── Web代码审计
│   ├── APP代码审计
│   └── SDK审计
├── 基础环境测试/
│   ├── 基线检查
│   ├── 配置核查
│   └── 漏洞扫描
└── 应急响应报告/
```

## 🎨 UI 设计

### 设计风格
- **现代简约** - 干净的线条和布局
- **专业感** - 适合安全行业
- **暗色主题** - 护眼，默认暗色

### 配色方案
- 主色：深蓝色 (#1e3a5f)
- 强调色：青色 (#00d4aa)
- 背景：深灰 (#1a1a2e)
- 文字：白色/灰色

### 主要界面
- **报告页面** - 可拖动调整宽度的列表+预览布局
- **AI 助手** - 对话式 AI 问答
- **备份管理** - 数据备份/恢复
- **文件共享** - P2P 文件传输
- **设置** - AI 配置、插件管理
- **插件管理** - 插件启用/禁用

## 📌 开发计划

### Phase 1 - 基础框架 ✅
- [x] 项目初始化
- [x] Tauri 环境搭建
- [x] React 基础架构
- [x] 文件系统基础功能
- [x] Tailwind CSS 配置

### Phase 2 - 核心功能 ✅
- [x] 报告导入与管理
- [x] 项目分类体系
- [x] 报告预览功能
- [x] 搜索与筛选
- [x] 可调整宽度布局

### Phase 3 - AI 集成 ✅ (暂未启用)
- [ ] AI 问答接口
- [ ] 智能分类
- [ ] 内容摘要
- [ ] 多模型支持

### Phase 4 - 插件系统 ✅ (暂未启用)
- [ ] 插件架构设计
- [ ] 插件管理界面
- [ ] 内置插件

### Phase 5 - 数据备份 ✅
- [x] 备份导出功能
- [x] 备份导入功能
- [x] 备份列表管理

### Phase 6 - 文件共享 ✅
- [x] 共享服务启动/停止
- [x] 连接远程用户
- [x] P2P 文件传输

## 💾 数据存储

数据保存在用户主目录：
```
~/.local/share/SecuArchive/
├── data.json          # 项目和报告元数据
├── config.json        # AI 配置
├── share_config.json  # 文件共享配置
├── backups/           # 备份文件目录
│   └── secuarchive_backup_*.json
├── reports/           # 导入的报告文件
└── projects/          # 项目文件
```

## 🔧 主要命令 (Rust 后端)

| 命令 | 功能 |
|------|------|
| `get_reports_dir` | 获取报告存储目录 |
| `list_reports` | 列出所有报告 |
| `import_report` | 导入报告 |
| `delete_report` | 删除报告 |
| `get_projects` | 获取项目列表 |
| `create_project` | 创建项目 |
| `delete_project` | 删除项目 |
| `get_ai_config` | 获取 AI 配置 |
| `save_ai_config` | 保存 AI 配置 |
| `ai_chat` | AI 对话 |
| `export_backup` | 导出备份 |
| `import_backup` | 导入备份 |
| `get_backup_list` | 获取备份列表 |
| `start_share_server` | 启动文件共享服务 |
| `connect_to_peer` | 连接远程用户 |
| `send_file_to_peer` | 发送文件 |

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
