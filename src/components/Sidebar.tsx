import { useReportStore } from '../stores/reportStore';
import { CATEGORIES, ReportCategory } from '../types';

export function Sidebar() {
  const { selectedCategory, setSelectedCategory, reports, setSelectedProject } = useReportStore();

  const getCategoryCount = (categoryId: string) => {
    return reports.filter(r => r.category === categoryId).length;
  };

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId as ReportCategory);
    setSelectedProject(null);
  };

  return (
    <nav className="p-2">
      <div className="mb-4">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]'
          }`}
        >
          <span className="mr-2">📁</span>
          全部报告
          <span className="float-right text-sm opacity-70">{reports.length}</span>
        </button>
      </div>
      
      <div className="space-y-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]'
            }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
            <span className="float-right text-sm opacity-70">
              {getCategoryCount(cat.id)}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
