export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  entry?: string;
  actions?: PluginAction[];
}

export interface PluginAction {
  id: string;
  name: string;
  icon?: string;
  handler?: string;
}

export interface Plugin {
  manifest: PluginManifest;
  enabled: boolean;
  installedAt?: number;
}

export interface PluginStore {
  plugins: Plugin[];
  availablePlugins: PluginManifest[];
  
  loadPlugins: () => Promise<void>;
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => Promise<void>;
  installPlugin: (manifest: PluginManifest) => Promise<void>;
  uninstallPlugin: (id: string) => Promise<void>;
}

export const DEFAULT_PLUGINS: PluginManifest[] = [
  {
    id: 'export-pdf',
    name: '导出 PDF',
    version: '1.0.0',
    description: '将报告导出为 PDF 格式',
    author: 'SecuArchive',
    permissions: ['file:read', 'file:write'],
    actions: [
      { id: 'export-pdf', name: '导出 PDF', icon: '📄' }
    ]
  },
  {
    id: 'export-excel',
    name: '导出 Excel',
    version: '1.0.0',
    description: '将报告列表导出为 Excel 表格',
    author: 'SecuArchive',
    permissions: ['file:read', 'file:write'],
    actions: [
      { id: 'export-excel', name: '导出 Excel', icon: '📊' }
    ]
  },
  {
    id: 'batch-rename',
    name: '批量重命名',
    version: '1.0.0',
    description: '批量重命名报告文件',
    author: 'SecuArchive',
    permissions: ['file:read', 'file:write'],
    actions: [
      { id: 'batch-rename', name: '批量重命名', icon: '✏️' }
    ]
  },
  {
    id: 'tag-manager',
    name: '标签管理',
    version: '1.0.0',
    description: '管理报告标签',
    author: 'SecuArchive',
    permissions: ['data:read', 'data:write'],
    actions: [
      { id: 'manage-tags', name: '管理标签', icon: '🏷️' }
    ]
  }
];
