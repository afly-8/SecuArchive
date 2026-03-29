import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { openPath } from '@tauri-apps/plugin-opener';
import { useReportStore } from '../stores/reportStore';
import { CATEGORIES } from '../types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
}

export function ReportPreview() {
  const { selectedReport, setSelectedReport, updateReportCategory, updateReportProject, projects } = useReportStore();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedReport) {
      const ext = selectedReport.extension.toLowerCase();
      if (['txt', 'md', 'html'].includes(ext)) {
        setIsLoading(true);
        invoke<string>('read_text_file', { path: selectedReport.path })
          .then(setContent)
          .catch(() => setContent('无法预览此文件'))
          .finally(() => setIsLoading(false));
      } else {
        setContent('');
      }
    }
  }, [selectedReport]);

  if (!selectedReport) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-center text-[var(--text-secondary)]">
          <p className="text-4xl mb-2">📄</p>
          <p>选择一个报告查看详情</p>
        </div>
      </div>
    );
  }

  const handleOpenExternal = async () => {
    try {
      await openPath(selectedReport.path);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const handleCategoryChange = (category: string) => {
    updateReportCategory(selectedReport.id, category);
  };

  const handleProjectChange = (projectId: string | null) => {
    updateReportProject(selectedReport.id, projectId);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-secondary)] overflow-hidden">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">{selectedReport.name}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {formatFileSize(selectedReport.size)} · {formatDate(selectedReport.modified)}
            </p>
          </div>
          <button
            onClick={() => setSelectedReport(null)}
            className="text-[var(--text-secondary)] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">分类</label>
            <select
              value={selectedReport.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-2 py-1 text-sm bg-[var(--bg)] border border-[var(--border)] rounded text-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">项目</label>
            <select
              value={selectedReport.project_id || ''}
              onChange={(e) => handleProjectChange(e.target.value || null)}
              className="px-2 py-1 text-sm bg-[var(--bg)] border border-[var(--border)] rounded text-white"
            >
              <option value="">无项目</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleOpenExternal}
              className="px-3 py-1 text-sm bg-[var(--accent)] text-[var(--bg)] rounded hover:opacity-90"
            >
              用系统应用打开
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="text-center text-[var(--text-secondary)]">加载中...</div>
        ) : content ? (
          <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono">
            {content}
          </pre>
        ) : (
          <div className="text-center text-[var(--text-secondary)]">
            <p className="text-4xl mb-2">📄</p>
            <p>此文件类型不支持预览</p>
            <p className="text-sm mt-2">点击"用系统应用打开"查看完整内容</p>
          </div>
        )}
      </div>
    </div>
  );
}
