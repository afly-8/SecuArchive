import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { ReportFile, ReportCategory, Project } from '../types';

interface ReportStore {
  reports: ReportFile[];
  projects: Project[];
  reportsDir: string;
  isLoading: boolean;
  selectedCategory: ReportCategory | null;
  selectedProject: string | null;
  searchQuery: string;
  selectedReport: ReportFile | null;
  
  initializeReportsDir: () => Promise<void>;
  loadReports: () => Promise<void>;
  loadProjects: () => Promise<void>;
  importReport: (projectId?: string, category?: string) => Promise<void>;
  deleteReport: (id: string, path: string) => Promise<void>;
  updateReportCategory: (reportId: string, category: string) => Promise<void>;
  updateReportProject: (reportId: string, projectId: string | null) => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setSelectedCategory: (category: ReportCategory | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedReport: (report: ReportFile | null) => void;
  getFilteredReports: () => ReportFile[];
}

export const useReportStore = create<ReportStore>((set, get) => ({
  reports: [],
  projects: [],
  reportsDir: '',
  isLoading: false,
  selectedCategory: null,
  selectedProject: null,
  searchQuery: '',
  selectedReport: null,

  initializeReportsDir: async () => {
    try {
      const dir = await invoke<string>('get_reports_dir');
      set({ reportsDir: dir });
    } catch (error) {
      console.error('Failed to initialize reports dir:', error);
    }
  },

  loadReports: async () => {
    const { reportsDir } = get();
    if (!reportsDir) return;
    
    set({ isLoading: true });
    try {
      const reports = await invoke<ReportFile[]>('list_reports', { dir: reportsDir });
      set({ reports, isLoading: false });
    } catch (error) {
      console.error('Failed to load reports:', error);
      set({ isLoading: false });
    }
  },

  loadProjects: async () => {
    try {
      const projects = await invoke<Project[]>('get_projects');
      set({ projects });
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  },

  importReport: async (projectId?: string, category?: string) => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Reports',
          extensions: ['pdf', 'docx', 'doc', 'txt', 'md', 'html', 'xlsx', 'xls']
        }]
      });

      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected];
        for (const file of files) {
          await invoke('import_report', { 
            src: file, 
            projectId: projectId || null,
            category: category || ''
          });
        }
        await get().loadReports();
        await get().loadProjects();
      }
    } catch (error) {
      console.error('Failed to import report:', error);
    }
  },

  deleteReport: async (_id: string, path: string) => {
    try {
      await invoke('delete_report', { path });
      await get().loadReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  },

  updateReportCategory: async (reportId: string, category: string) => {
    try {
      await invoke('update_report_category', { reportId, category });
      await get().loadReports();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  },

  updateReportProject: async (reportId: string, projectId: string | null) => {
    try {
      await invoke('update_report_project', { reportId, projectId });
      await get().loadReports();
      await get().loadProjects();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  },

  createProject: async (name: string, description: string) => {
    try {
      await invoke('create_project', { name, description });
      await get().loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      await invoke('delete_project', { projectId });
      await get().loadProjects();
      await get().loadReports();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedProject: (projectId) => set({ selectedProject: projectId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedReport: (report) => set({ selectedReport: report }),

  getFilteredReports: () => {
    const { reports, searchQuery, selectedCategory, selectedProject } = get();
    let filtered = reports;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) || 
        r.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    if (selectedProject) {
      filtered = filtered.filter(r => r.project_id === selectedProject);
    }
    
    return filtered.sort((a, b) => b.modified - a.modified);
  }
}));
