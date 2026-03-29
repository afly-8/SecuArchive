import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { ProjectSidebar } from './components/ProjectSidebar';
import { Header } from './components/Header';
import { ReportList } from './components/ReportList';
import { ReportPreview } from './components/ReportPreview';
import { AIChat } from './components/AIChat';
import { Settings } from './components/Settings';
import { PluginManager } from './components/PluginManager';
import { BackupManager } from './components/BackupManager';
import { FileShare } from './components/FileShare';
import { Splitter } from './components/Splitter';
import { useReportStore } from './stores/reportStore';
import { useAIStore } from './stores/aiStore';
import { usePluginStore } from './stores/pluginStore';

type Tab = 'reports' | 'ai' | 'settings' | 'plugins' | 'backup' | 'share';

function App() {
  const { initializeReportsDir, loadReports, loadProjects, reportsDir } = useReportStore();
  const { loadConfig } = useAIStore();
  const { loadPlugins } = usePluginStore();
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('reports');

  useEffect(() => {
    const init = async () => {
      await initializeReportsDir();
      await loadProjects();
      await loadConfig();
      await loadPlugins();
    };
    init();
  }, []);

  useEffect(() => {
    if (reportsDir) {
      loadReports();
    }
  }, [reportsDir]);

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return <AIChat />;
      case 'settings':
        return <Settings />;
      case 'plugins':
        return <PluginManager />;
      case 'backup':
        return <BackupManager />;
      case 'share':
        return <FileShare />;
      default:
        if (!showPreview) {
          return <ReportList onPreview={() => setShowPreview(true)} />;
        }
        return (
          <Splitter defaultRatio={0.5} minRatio={0.3} maxRatio={0.7}>
            <ReportList onPreview={() => setShowPreview(true)} />
            <ReportPreview />
          </Splitter>
        );
    }
  };

  return (
    <Layout 
      sidebar={
        <div>
          <Sidebar />
          <ProjectSidebar />
        </div>
      }
    >
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      {renderContent()}
    </Layout>
  );
}

export default App;
