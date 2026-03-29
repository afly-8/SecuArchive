import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  provider: string;
  api_key: string;
  model: string;
  custom_api_url?: string;
}

interface AIStore {
  config: AIConfig;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  loadConfig: () => Promise<void>;
  saveConfig: (config: AIConfig) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  config: {
    provider: 'openai',
    api_key: '',
    model: 'gpt-3.5-turbo',
  },
  messages: [],
  isLoading: false,
  error: null,

  loadConfig: async () => {
    try {
      const config = await invoke<AIConfig>('get_ai_config');
      set({ config });
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
  },

  saveConfig: async (config: AIConfig) => {
    try {
      await invoke('save_ai_config', { config });
      set({ config });
    } catch (error) {
      console.error('Failed to save AI config:', error);
    }
  },

  sendMessage: async (content: string) => {
    const { messages, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });
    
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content },
    ];
    set({ messages: newMessages });

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      
      const response = await invoke<{ content: string; error: string | null }>('ai_chat', {
        message: content,
        history,
      });

      if (response.error) {
        set({ error: response.error, isLoading: false });
      } else {
        set({
          messages: [
            ...newMessages,
            { role: 'assistant', content: response.content },
          ],
          isLoading: false,
        });
      }
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}));
