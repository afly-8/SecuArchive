import { useState, useEffect } from 'react';
import { useAIStore, AIConfig } from '../stores/aiStore';

interface ProviderOption {
  id: string;
  name: string;
  icon: string;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
}

const PROVIDERS: ProviderOption[] = [
  { id: 'openai', name: 'OpenAI', icon: '🔵' },
  { id: 'anthropic', name: 'Anthropic (Claude)', icon: '🟣' },
  { id: 'azure', name: 'Azure OpenAI', icon: '☁️' },
  { id: 'scnet', name: 'SCNet 丝绸计算', icon: '🧵' },
  { id: 'moonshot', name: '月之暗面 (Moonshot)', icon: '🌙' },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔮' },
  { id: 'zhipu', name: '智谱 AI', icon: '📊' },
  { id: 'local', name: '本地模型 (Ollama)', icon: '💻' },
  { id: 'custom', name: '自定义 API', icon: '⚙️' },
];

const MODELS: ModelOption[] = [
  { id: 'gpt-4o', name: 'GPT-4o (推荐)', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (推荐)', provider: 'anthropic' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
  { id: 'gpt-4o', name: 'Azure OpenAI GPT-4o', provider: 'azure' },
  { id: 'gpt-4', name: 'Azure OpenAI GPT-4', provider: 'azure' },
  { id: 'gpt-35-turbo', name: 'Azure GPT-3.5 Turbo', provider: 'azure' },
  { id: 'abab6.5s-chat', name: 'Abab 6.5s Chat (推荐)', provider: 'scnet' },
  { id: 'abab5.5s-chat', name: 'Abab 5.5s Chat', provider: 'scnet' },
  { id: 'abab4-chat', name: 'Abab 4 Chat', provider: 'scnet' },
  { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K (推荐)', provider: 'moonshot' },
  { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', provider: 'moonshot' },
  { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', provider: 'moonshot' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat (推荐)', provider: 'deepseek' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
  { id: 'glm-4', name: 'GLM-4 (推荐)', provider: 'zhipu' },
  { id: 'glm-4-flash', name: 'GLM-4 Flash', provider: 'zhipu' },
  { id: 'glm-3-turbo', name: 'GLM-3 Turbo', provider: 'zhipu' },
  { id: 'llama3', name: 'Llama 3', provider: 'local' },
  { id: 'llama2', name: 'Llama 2', provider: 'local' },
  { id: 'mistral', name: 'Mistral', provider: 'local' },
  { id: 'qwen2', name: 'Qwen 2', provider: 'local' },
  { id: 'custom', name: '自定义模型', provider: 'custom' },
];

export function Settings() {
  const { config, loadConfig, saveConfig } = useAIStore();
  const [localConfig, setLocalConfig] = useState<AIConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setLocalConfig(config);
    if (config.custom_api_url) {
      setCustomApiUrl(config.custom_api_url);
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveConfig({ ...localConfig, custom_api_url: customApiUrl });
    setIsSaving(false);
  };

  const handleProviderChange = (provider: string) => {
    const providerModels = MODELS.filter(m => m.provider === provider);
    const defaultModel = providerModels[0]?.id || '';
    setLocalConfig({ ...localConfig, provider, model: defaultModel });
  };

  const filteredModels = MODELS.filter(m => m.provider === localConfig.provider);
  const selectedProvider = PROVIDERS.find(p => p.id === localConfig.provider);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-xl font-bold text-white mb-6">⚙️ 设置</h2>

      <div className="max-w-2xl space-y-6">
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">🤖 AI 配置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                API Provider
              </label>
              <select
                value={localConfig.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={localConfig.api_key}
                  onChange={(e) => setLocalConfig({ ...localConfig, api_key: e.target.value })}
                  placeholder={localConfig.provider === 'local' ? 'http://localhost:11434' : 'sk-...'}
                  className="w-full px-4 py-2 pr-10 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white"
                >
                  {showKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {localConfig.provider === 'openai' && '在 OpenAI 官网获取 API Key'}
                {localConfig.provider === 'anthropic' && '在 Anthropic 官网获取 API Key'}
                {localConfig.provider === 'azure' && '在 Azure 门户获取 API Key'}
                {localConfig.provider === 'scnet' && '在 SCNet 丝绸计算平台获取 API Key'}
                {localConfig.provider === 'moonshot' && '在月之暗面平台获取 API Key'}
                {localConfig.provider === 'deepseek' && '在 DeepSeek 平台获取 API Key'}
                {localConfig.provider === 'zhipu' && '在智谱 AI 开放平台获取 API Key'}
                {localConfig.provider === 'local' && '本地 Ollama 服务地址'}
                {localConfig.provider === 'custom' && '输入自定义 API 地址'}
              </p>
            </div>

            {localConfig.provider === 'custom' && (
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  自定义 API URL
                </label>
                <input
                  type="text"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500"
                />
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  输入兼容 OpenAI API 格式的第三方 API 地址
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Model
              </label>
              {localConfig.provider === 'custom' ? (
                <input
                  type="text"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  placeholder="gpt-3.5-turbo"
                  className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500"
                />
              ) : (
                <select
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white"
                >
                  {filteredModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存配置'}
              </button>
              
              {selectedProvider?.id === 'local' && (
                <button
                  onClick={() => setLocalConfig({ ...localConfig, api_key: 'http://localhost:11434' })}
                  className="px-4 py-2 border border-[var(--border)] text-white rounded-lg hover:bg-[var(--bg)]"
                >
                  使用本地默认
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">📋 支持的模型</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {PROVIDERS.filter(p => p.id !== 'custom').map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">💡 使用说明</h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            <li>1. 配置 AI API Key 后，可以使用 AI 问答功能</li>
            <li>2. 在报告列表中选择一个报告</li>
            <li>3. 点击"AI 分析"按钮获取报告摘要</li>
            <li>4. 可以使用 AI 助手询问关于报告的问题</li>
            <li>5. AI 会根据报告内容给出专业建议</li>
          </ul>
        </div>

        <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">🔒 隐私说明</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            您的 API Key 保存在本地，不会发送给除 AI 服务商以外的任何服务器。
            报告内容仅在您明确请求时发送给 AI 进行分析。
          </p>
        </div>
      </div>
    </div>
  );
}
