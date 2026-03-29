import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface BackupInfo {
  name: string;
  path: string;
  size: number;
  created_at: number;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function BackupManager() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const list = await invoke<BackupInfo[]>('get_backup_list');
      setBackups(list);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const path = await invoke<string>('export_backup');
      setMessage(`备份已导出到: ${path}`);
      await loadBackups();
    } catch (error) {
      setMessage(`导出失败: ${error}`);
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Backup', extensions: ['json'] }],
      });

      if (selected) {
        setIsLoading(true);
        await invoke('import_backup', { backupPath: selected });
        setMessage('备份导入成功！');
        setIsLoading(false);
      }
    } catch (error) {
      setMessage(`导入失败: ${error}`);
      setIsLoading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (confirm('确定要删除这个备份吗？')) {
      try {
        await invoke('delete_backup', { backupPath: path });
        await loadBackups();
        setMessage('备份已删除');
      } catch (error) {
        setMessage(`删除失败: ${error}`);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-xl font-bold text-white mb-6">💾 备份管理</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className="px-4 py-2 bg-[var(--accent)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? '导出中...' : '📤 导出备份'}
        </button>
        <button
          onClick={handleImport}
          disabled={isLoading}
          className="px-4 py-2 border border-[var(--border)] text-white rounded-lg hover:bg-[var(--bg)] disabled:opacity-50"
        >
          📥 导入备份
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-[var(--bg-secondary)] rounded-lg text-white">
          {message}
        </div>
      )}

      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 mb-6">
        <h3 className="text-white font-medium mb-2">💡 备份说明</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>• 导出备份会保存所有项目、报告和 AI 配置</li>
          <li>• 导入备份会覆盖当前所有数据</li>
          <li>• 备份文件保存在本地，不会自动上传</li>
        </ul>
      </div>

      <h3 className="text-lg font-medium text-white mb-4">📁 备份列表</h3>

      {backups.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          暂无备份记录
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <div
              key={backup.path}
              className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{backup.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatFileSize(backup.size)} · {formatDate(backup.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(backup.path)}
                className="px-3 py-1 text-sm text-red-400 hover:bg-red-400/10 rounded"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
