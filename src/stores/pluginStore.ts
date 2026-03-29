import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Plugin, PluginManifest, DEFAULT_PLUGINS } from '../types/plugin';

interface PluginStore {
  plugins: Plugin[];
  isLoading: boolean;
  
  loadPlugins: () => Promise<void>;
  enablePlugin: (id: string) => Promise<void>;
  disablePlugin: (id: string) => Promise<void>;
  installPlugin: (manifest: PluginManifest) => Promise<void>;
  uninstallPlugin: (id: string) => Promise<void>;
}

export const usePluginStore = create<PluginStore>((set, get) => ({
  plugins: [],
  isLoading: false,

  loadPlugins: async () => {
    set({ isLoading: true });
    try {
      const installed = await invoke<Plugin[]>('get_plugins').catch(() => []);
      
      const allPlugins = DEFAULT_PLUGINS.map(manifest => {
        const existing = installed.find(p => p.manifest.id === manifest.id);
        return {
          manifest,
          enabled: existing?.enabled ?? true,
          installedAt: existing?.installedAt ?? Date.now(),
        };
      });
      
      set({ plugins: allPlugins, isLoading: false });
    } catch (error) {
      const allPlugins = DEFAULT_PLUGINS.map(manifest => ({
        manifest,
        enabled: true,
        installedAt: Date.now(),
      }));
      set({ plugins: allPlugins, isLoading: false });
    }
  },

  enablePlugin: async (id: string) => {
    const { plugins } = get();
    const updated = plugins.map(p => 
      p.manifest.id === id ? { ...p, enabled: true } : p
    );
    set({ plugins: updated });
    await invoke('save_plugins', { plugins: updated }).catch(() => {});
  },

  disablePlugin: async (id: string) => {
    const { plugins } = get();
    const updated = plugins.map(p => 
      p.manifest.id === id ? { ...p, enabled: false } : p
    );
    set({ plugins: updated });
    await invoke('save_plugins', { plugins: updated }).catch(() => {});
  },

  installPlugin: async (manifest: PluginManifest) => {
    const { plugins } = get();
    const newPlugin: Plugin = {
      manifest,
      enabled: true,
      installedAt: Date.now(),
    };
    set({ plugins: [...plugins, newPlugin] });
    await invoke('save_plugins', { plugins: [...plugins, newPlugin] }).catch(() => {});
  },

  uninstallPlugin: async (id: string) => {
    const { plugins } = get();
    const updated = plugins.filter(p => p.manifest.id !== id);
    set({ plugins: updated });
    await invoke('save_plugins', { plugins: updated }).catch(() => {});
  },
}));
