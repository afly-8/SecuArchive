import { useEffect, useState } from 'react';
import { usePluginStore } from '../stores/pluginStore';
import { Plugin, DEFAULT_PLUGINS } from '../types/plugin';

export function PluginManager() {
  const { plugins, loadPlugins, enablePlugin, disablePlugin } = usePluginStore();
  const [activeTab, setActiveTab] = useState<'installed' | 'available'>('installed');

  useEffect(() => {
    loadPlugins();
  }, []);

  const installedPlugins = plugins.filter(p => p.manifest);
  const availablePlugins = DEFAULT_PLUGINS.filter(
    p => !installedPlugins.find(ip => ip.manifest.id === p.id)
  );

  const handleToggle = async (id: string, enabled: boolean) => {
    if (enabled) {
      await disablePlugin(id);
    } else {
      await enablePlugin(id);
    }
  };

  const renderPluginCard = (plugin: Plugin | typeof DEFAULT_PLUGINS[0], isEnabled: boolean) => {
    const manifest = 'manifest' in plugin ? plugin.manifest : plugin;
    
    return (
      <div
        key={manifest.id}
        className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center bg-[var(--bg)] rounded-lg text-xl">
            {manifest.actions?.[0]?.icon || '🔌'}
          </div>
          <div>
            <h3 className="text-white font-medium">{manifest.name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{manifest.description}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              v{manifest.version} · by {manifest.author}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggle(manifest.id, isEnabled)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isEnabled
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30'
            }`}
          >
            {isEnabled ? '禁用' : '启用'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-xl font-bold text-white mb-6">🔌 插件管理</h2>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('installed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'installed'
              ? 'bg-[var(--accent)] text-[var(--bg)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          已安装 ({installedPlugins.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-[var(--accent)] text-[var(--bg)]'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          可用插件 ({availablePlugins.length})
        </button>
      </div>

      <div className="space-y-3">
        {activeTab === 'installed' ? (
          installedPlugins.length > 0 ? (
            installedPlugins.map(p => renderPluginCard(p, p.enabled))
          ) : (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <p className="text-4xl mb-4">🔌</p>
              <p>暂无已安装的插件</p>
            </div>
          )
        ) : (
          availablePlugins.length > 0 ? (
            availablePlugins.map(p => renderPluginCard(p, false))
          ) : (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <p className="text-4xl mb-4">✨</p>
              <p>没有更多可用插件</p>
            </div>
          )
        )}
      </div>

      <div className="mt-8 p-4 bg-[var(--bg-secondary)] rounded-lg">
        <h3 className="text-white font-medium mb-2">💡 关于插件</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>• 插件可以扩展 SecuArchive 的功能</li>
          <li>• 插件需要获取相应权限才能正常工作</li>
          <li>• 禁用插件不会删除已安装的插件</li>
          <li>• 更多插件即将推出...</li>
        </ul>
      </div>
    </div>
  );
}
