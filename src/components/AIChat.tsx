import { useState, useRef, useEffect } from 'react';
import { useAIStore } from '../stores/aiStore';

export function AIChat() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useAIStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-medium text-white">🤖 AI 助手</h2>
        <button
          onClick={clearMessages}
          className="text-sm text-[var(--text-secondary)] hover:text-white"
        >
          清空对话
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] py-8">
            <p className="text-4xl mb-4">🤖</p>
            <p>我可以帮你分析安全服务报告</p>
            <p className="text-sm mt-2">例如：</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>- "总结这份报告的主要内容"</li>
              <li>- "有哪些高危漏洞？"</li>
              <li>- "建议哪些优先修复？"</li>
            </ul>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[var(--accent)] text-[var(--bg)]'
                  : 'bg-[var(--bg)] text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg)] p-3 rounded-lg">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-[var(--accent)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
