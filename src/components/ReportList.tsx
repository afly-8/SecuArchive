import { useReportStore } from '../stores/reportStore';
import { ReportFile, getCategoryInfo } from '../types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('zh-CN');
}

function getFileIcon(extension: string): string {
  const icons: Record<string, string> = {
    pdf: '📕',
    docx: '📘',
    doc: '📗',
    txt: '📄',
    md: '📝',
    html: '🌐',
    xlsx: '📊',
    xls: '📈',
  };
  return icons[extension.toLowerCase()] || '📄';
}

interface ReportItemProps {
  report: ReportFile;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ReportItem({ report, isSelected, onSelect, onDelete }: ReportItemProps) {
  const category = getCategoryInfo(report.category);

  return (
    <div 
      onClick={onSelect}
      className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors group ${
        isSelected 
          ? 'bg-[var(--primary)] border border-[var(--accent)]' 
          : 'bg-[var(--bg-secondary)] hover:bg-[var(--border)]'
      }`}
    >
      <span className="text-2xl mr-4">{getFileIcon(report.extension)}</span>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate">{report.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span 
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: category.color + '30', color: category.color }}
          >
            {category.icon} {category.name}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            {formatFileSize(report.size)} · {formatDate(report.modified)}
          </span>
        </div>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all"
      >
        删除
      </button>
    </div>
  );
}

interface ReportListProps {
  onPreview?: () => void;
}

export function ReportList({ onPreview }: ReportListProps) {
  const { getFilteredReports, deleteReport, selectedReport, setSelectedReport, isLoading } = useReportStore();
  const reports = getFilteredReports();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">加载中...</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">📂</p>
          <p className="text-[var(--text-secondary)]">暂无报告</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            点击右上角"导入报告"开始使用
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid gap-3">
        {reports.map((report) => (
          <ReportItem
            key={report.id}
            report={report}
            isSelected={selectedReport?.id === report.id}
            onSelect={() => {
              setSelectedReport(report);
              onPreview?.();
            }}
            onDelete={() => deleteReport(report.id, report.path)}
          />
        ))}
      </div>
    </div>
  );
}
