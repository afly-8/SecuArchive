import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface PeerInfo {
  id: string;
  name: string;
  address: string;
}

interface ShareConfig {
  enabled: boolean;
  port: number;
  user_name: string;
  connection_id: string | null;
  connected_peers: PeerInfo[];
}

export function FileShare() {
  const [config, setConfig] = useState<ShareConfig>({
    enabled: false,
    port: 8765,
    user_name: '用户',
    connection_id: null,
    connected_peers: [],
  });
  const [serverUrl, setServerUrl] = useState('');
  const [connectAddress, setConnectAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState('');
  const [peers, setPeers] = useState<PeerInfo[]>([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await invoke<ShareConfig>('get_share_config');
      setConfig(cfg);
      setPeers(cfg.connected_peers || []);
      if (cfg.enabled) {
        setServerUrl(`http://your-ip:${cfg.port}`);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleStartServer = async () => {
    setMessage('');
    try {
      const url = await invoke<string>('start_share_server', {
        port: config.port,
        userName: config.user_name,
      });
      setServerUrl(url);
      setConfig({ ...config, enabled: true });
      setMessage(`服务已启动: ${url}`);
    } catch (error) {
      setMessage(`启动失败: ${error}`);
    }
  };

  const handleStopServer = async () => {
    try {
      await invoke('stop_share_server');
      setConfig({ ...config, enabled: false });
      setServerUrl('');
      setMessage('服务已停止');
    } catch (error) {
      setMessage(`停止失败: ${error}`);
    }
  };

  const handleConnect = async () => {
    if (!connectAddress.trim()) return;
    
    setIsConnecting(true);
    setMessage('');
    try {
      const peer = await invoke<PeerInfo>('connect_to_peer', {
        address: connectAddress.trim(),
        userName: config.user_name,
      });
      setPeers([...peers, peer]);
      setConnectAddress('');
      setMessage('连接成功！');
    } catch (error) {
      setMessage(`连接失败: ${error}`);
    }
    setIsConnecting(false);
  };

  const handleDisconnect = (peerId: string) => {
    setPeers(peers.filter(p => p.id !== peerId));
    setMessage('已断开连接');
  };

  const handleSendFile = async (peerAddress: string) => {
    try {
      const selected = await open({
        multiple: false,
      });

      if (selected) {
        setMessage('正在发送文件...');
        await invoke('send_file_to_peer', {
          peerAddress,
          filePath: selected,
        });
        setMessage('文件发送成功！');
      }
    } catch (error) {
      setMessage(`发送失败: ${error}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-xl font-bold text-white mb-6">📡 文件共享</h2>

      <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">🔧 我的共享服务</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              用户名
            </label>
            <input
              type="text"
              value={config.user_name}
              onChange={(e) => setConfig({ ...config, user_name: e.target.value })}
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white"
              disabled={config.enabled}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              端口
            </label>
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 8765 })}
              className="w-full px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white"
              disabled={config.enabled}
            />
          </div>

          <div className="flex gap-3">
            {!config.enabled ? (
              <button
                onClick={handleStartServer}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90"
              >
                🚀 启动服务
              </button>
            ) : (
              <button
                onClick={handleStopServer}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:opacity-90"
              >
                ⏹ 停止服务
              </button>
            )}
          </div>

          {serverUrl && (
            <div className="p-3 bg-[var(--bg)] rounded-lg">
              <p className="text-sm text-[var(--text-secondary)] mb-1">服务地址：</p>
              <p className="text-white font-mono">{serverUrl}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                将此地址分享给其他人，他们可以通过下方连接
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">🔗 连接其他用户</h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={connectAddress}
            onChange={(e) => setConnectAddress(e.target.value)}
            placeholder="输入对方的服务地址，如 http://192.168.1.100:8765"
            className="flex-1 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500"
          />
          <button
            onClick={handleConnect}
            disabled={isConnecting || !connectAddress.trim()}
            className="px-4 py-2 bg-[var(--accent)] text-[var(--bg)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isConnecting ? '连接中...' : '连接'}
          </button>
        </div>

        {message && (
          <div className="p-3 bg-[var(--bg)] rounded-lg text-white text-sm">
            {message}
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-secondary)] rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">👥 已连接的设备</h3>
        
        {peers.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            暂无连接的设备
          </div>
        ) : (
          <div className="space-y-3">
            {peers.map((peer) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-4 bg-[var(--bg)] rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{peer.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{peer.address}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendFile(peer.address)}
                    className="px-3 py-1 text-sm bg-[var(--accent)] text-[var(--bg)] rounded hover:opacity-90"
                  >
                    发送文件
                  </button>
                  <button
                    onClick={() => handleDisconnect(peer.id)}
                    className="px-3 py-1 text-sm text-red-400 hover:bg-red-400/10 rounded"
                  >
                    断开
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
        <h3 className="text-white font-medium mb-2">💡 使用说明</h3>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>1. 点击"启动服务"开启文件共享</li>
          <li>2. 将服务地址分享给对方</li>
          <li>3. 对方在"连接其他用户"中输入你的地址</li>
          <li>4. 连接成功后即可互相发送文件</li>
          <li>5. 双方都需要启动服务才能传输文件</li>
        </ul>
      </div>
    </div>
  );
}
