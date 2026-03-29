import { useState } from 'react';
import { useReportStore } from '../stores/reportStore';

export function ProjectSidebar() {
  const { 
    projects, 
    selectedProject, 
    setSelectedProject, 
    createProject, 
    deleteProject,
    loadReports
  } = useReportStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = async () => {
    if (newName.trim()) {
      await createProject(newName.trim(), newDesc.trim());
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
    }
  };

  const handleSelect = (projectId: string | null) => {
    setSelectedProject(projectId);
    loadReports();
  };

  return (
    <div className="border-t border-[var(--border)] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-secondary)]">项目</span>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-[var(--accent)] hover:opacity-80 text-sm"
        >
          + 新建
        </button>
      </div>

      {showCreate && (
        <div className="mb-3 p-2 bg-[var(--bg)] rounded-lg">
          <input
            type="text"
            placeholder="项目名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-2 py-1 mb-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-white"
          />
          <input
            type="text"
            placeholder="描述 (可选)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full px-2 py-1 mb-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 px-2 py-1 text-sm bg-[var(--accent)] text-[var(--bg)] rounded"
            >
              创建
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 px-2 py-1 text-sm border border-[var(--border)] rounded text-[var(--text-secondary)]"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`group flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm ${
              selectedProject === project.id
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]'
            }`}
            onClick={() => handleSelect(project.id)}
          >
            <span className="truncate">📁 {project.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{project.report_count}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`删除项目 "${project.name}"?`)) {
                    deleteProject(project.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && !showCreate && (
          <div className="text-xs text-[var(--text-secondary)] text-center py-2">
            暂无项目
          </div>
        )}
      </div>
    </div>
  );
}
