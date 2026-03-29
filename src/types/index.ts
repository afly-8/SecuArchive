export interface ReportFile {
  id: string;
  name: string;
  path: string;
  size: number;
  extension: string;
  modified: number;
  category: string;
  project_id: string | null;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  created_at: number;
  report_count: number;
}

export type ReportCategory = 
  | 'pentest'
  | 'code-audit'
  | 'baseline'
  | 'emergency'
  | 'other';

export const CATEGORIES: { id: ReportCategory; name: string; icon: string; color: string }[] = [
  { id: 'pentest', name: '渗透测试', icon: '🔍', color: '#FF6B6B' },
  { id: 'code-audit', name: '代码审计', icon: '📝', color: '#4ECDC4' },
  { id: 'baseline', name: '基础环境测试', icon: '🛡️', color: '#45B7D1' },
  { id: 'emergency', name: '应急响应', icon: '🚨', color: '#FFA94D' },
  { id: 'other', name: '其他报告', icon: '📄', color: '#868E96' },
];

export const getCategoryInfo = (id: string) => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[4];
};
