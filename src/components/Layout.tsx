import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function Layout({ children, sidebar }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="text-xl font-bold text-[var(--accent)]">SecuArchive</h1>
          <p className="text-xs text-[var(--text-secondary)]">安全服务报告归档</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
