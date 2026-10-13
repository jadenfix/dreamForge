import React, { useState } from 'react';
import { Download, Share2, RefreshCw, Camera, ExternalLink, Check } from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'new-analysis', name: 'New Analysis', description: 'Start analysis', icon: Camera, gradient: 'from-purple-500 to-pink-500', action: 'navigate', path: '/' },
  { id: 'export-data', name: 'Export Data', description: 'Download displayed records', icon: Download, gradient: 'from-blue-500 to-cyan-500', action: 'export' },
  { id: 'share-dashboard', name: 'Share', description: 'Copy dashboard URL', icon: Share2, gradient: 'from-green-500 to-emerald-500', action: 'share' },
  { id: 'refresh-data', name: 'Refresh', description: 'Update metrics', icon: RefreshCw, gradient: 'from-orange-500 to-red-500', action: 'refresh' }
];

function ActionCard({ action, onAction, isLoading = false }) {
  const Icon = action.icon;

  return (
    <button
      onClick={() => onAction(action)}
      disabled={isLoading}
      className="group relative p-3 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl hover:from-white/[0.08] hover:to-white/[0.04] hover:border-white/[0.1] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-left w-full"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
            {isLoading ? (
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Icon className="w-4 h-4 text-white" />
            )}
          </div>
          <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h4 className="font-medium text-white text-sm mb-1 leading-tight">{action.name}</h4>
        <p className="text-xs text-gray-400 leading-tight">{action.description}</p>
      </div>
    </button>
  );
}

export default function QuickActions({
  data,
  onRefresh,
  className = ''
}) {
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (action) => {
    if (loadingActions.has(action.id)) return;
    setError('');

    setLoadingActions(prev => new Set([...prev, action.id]));

    try {
      switch (action.action) {
        case 'navigate':
          if (action.path) {
            window.location.href = action.path;
          }
          break;

        case 'export':
          await handleExport();
          break;

        case 'share':
          await handleShare();
          break;

        case 'refresh':
          await onRefresh?.();
          break;

      }
    } catch (error) {
      setError(error.message);
    } finally {
      setTimeout(() => {
        setLoadingActions(prev => {
          const next = new Set(prev);
          next.delete(action.id);
          return next;
        });
      }, 1000);
    }
  };

  const handleExport = async () => {
    if (!data) throw new Error('Load usage data before exporting');
    const exported = { exported_at: new Date().toISOString(), dashboard: 'DreamForge Analytics', ...data };

    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamforge-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <RefreshCw
          className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
          onClick={() => window.location.reload()}
        />
      </div>

      {/* Main Actions Grid - More compact 2x3 grid */}
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            onAction={handleAction}
            isLoading={loadingActions.has(action.id)}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Source: {data?.metadata?.dataSource || 'not loaded'}. Provider uptime is not measured here.
      </p>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

      {/* Copy Success Feedback */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg flex items-center space-x-2 backdrop-blur-xl">
          <Check className="w-4 h-4" />
          <span className="text-sm">Link copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}
