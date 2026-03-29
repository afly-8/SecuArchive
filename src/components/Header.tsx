import { useState } from 'react';
import { useReportStore } from '../stores/reportStore';

type Tab = 'reports' | 'ai' | 'settings' | 'plugins' | 'backup' | 'share';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { searchQuery, setSearchQuery, importReport, isLoading, projects, selectedProject, selectedCategory } = useReportStore();
  const [showImportMenu, setShowImportMenu] = useState(false);

  const handleImport = (projectId?: string, category?: string) => {
    importReport(projectId, category);
    setShowImportMenu(false);
  };

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      <div className="flex items-center border-b border-[var(--border)]">
        <button
          onClick={() => onTabChange('reports')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'reports'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          📄 报告
        </button>
        <button
          onClick={() => onTabChange('ai')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'ai'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          🤖 AI 助手
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          ⚙️ 设置
        </button>
        <button
          onClick={() => onTabChange('plugins')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'plugins'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          🔌 插件
        </button>
        <button
          onClick={() => onTabChange('backup')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'backup'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          💾 备份
        </button>
        <button
          onClick={() => onTabChange('share')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'share'
              ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          📡 共享
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="搜索报告名称或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            
            {(selectedProject || selectedCategory) && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-[var(--text-secondary)] hover:text-white"
              >
                清除筛选
              </button>
            )}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              disabled={isLoading}
              className="ml-4 px-4 py-2 bg-[var(--accent)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? '导入中...' : '+ 导入报告'}
            </button>
            
            {showImportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleImport()}
                    className="w-full text-left px-3 py-2 rounded hover:bg-[var(--bg)] text-white"
                  >
                    📁 导入到根目录
                  </button>
                  
                  {projects.length > 0 && (
                    <>
                      <div className="border-t border-[var(--border)] my-1"></div>
                      <p className="px-3 py-1 text-xs text-[var(--text-secondary)]">导入到项目</p>
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleImport(project.id)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-[var(--bg)] text-white flex items-center justify-between"
                        >
                          <span>📂 {project.name}</span>
                          <span className="text-xs text-[var(--text-secondary)]">{project.report_count}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
