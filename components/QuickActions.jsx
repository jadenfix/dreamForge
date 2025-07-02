import React, { useState } from 'react';
import { 
  Zap, 
  Download, 
  Share2, 
  Settings, 
  HelpCircle, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  FileText,
  Camera,
  Clock,
  Bookmark,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    id: 'new-analysis',
    name: 'New Analysis',
    description: 'Start fresh analysis',
    icon: Camera,
    gradient: 'from-purple-500 to-pink-500',
    action: 'navigate',
    path: '/',
  },
  {
    id: 'export-data',
    name: 'Export Data',
    description: 'Download analytics',
    icon: Download,
    gradient: 'from-blue-500 to-cyan-500',
    action: 'export',
  },
  {
    id: 'share-dashboard',
    name: 'Share Dashboard',
    description: 'Share public link',
    icon: Share2,
    gradient: 'from-green-500 to-emerald-500',
    action: 'share',
  },
  {
    id: 'refresh-data',
    name: 'Refresh Data',
    description: 'Update all metrics',
    icon: RefreshCw,
    gradient: 'from-orange-500 to-red-500',
    action: 'refresh',
  },
  {
    id: 'api-docs',
    name: 'API Docs',
    description: 'Integration guide',
    icon: FileText,
    gradient: 'from-indigo-500 to-purple-500',
    action: 'external',
    url: 'https://docs.dreamforge.ai',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure dashboard',
    icon: Settings,
    gradient: 'from-gray-500 to-slate-500',
    action: 'modal',
    modal: 'settings',
  },
];

const RECENT_SHORTCUTS = [
  { id: 'detect-last', name: 'Re-run last detection', icon: TrendingUp },
  { id: 'export-week', name: 'Export weekly report', icon: BarChart3 },
  { id: 'bookmark-query', name: 'Saved query templates', icon: Bookmark },
  { id: 'recent-images', name: 'Recent uploaded images', icon: Camera },
];

function ActionCard({ action, onAction, isLoading = false }) {
  const Icon = action.icon;
  
  return (
    <button
      onClick={() => onAction(action)}
      disabled={isLoading}
      className="group relative p-4 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl hover:from-white/[0.08] hover:to-white/[0.04] hover:border-white/[0.1] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            {isLoading ? (
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Icon className="w-5 h-5 text-white" />
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <h4 className="font-medium text-white mb-1">{action.name}</h4>
        <p className="text-sm text-gray-400">{action.description}</p>
      </div>
    </button>
  );
}

function ShortcutItem({ shortcut, onAction }) {
  const Icon = shortcut.icon;
  
  return (
    <button
      onClick={() => onAction(shortcut)}
      className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/[0.05] transition-colors text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-white" />
      </div>
      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
        {shortcut.name}
      </span>
    </button>
  );
}

export default function QuickActions({ 
  onAction, 
  onRefresh,
  className = '',
  recentShortcuts = RECENT_SHORTCUTS 
}) {
  const [loadingActions, setLoadingActions] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const handleAction = async (action) => {
    if (loadingActions.has(action.id)) return;

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
          
        case 'external':
          window.open(action.url, '_blank');
          break;
          
        case 'modal':
          onAction?.(action);
          break;
          
        default:
          onAction?.(action);
      }
    } catch (error) {
      console.error(`Action ${action.id} failed:`, error);
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
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create and download a sample JSON file
    const data = {
      exported_at: new Date().toISOString(),
      dashboard: 'DreamForge Analytics',
      note: 'This is a sample export. Real implementation would include actual analytics data.'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
    const shareUrl = window.location.href;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShortcutAction = (shortcut) => {
    onAction?.({ type: 'shortcut', shortcut });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Actions Grid */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
          <div className="flex items-center space-x-2">
            {copied && (
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </div>
            )}
            <button
              onClick={() => onRefresh?.()}
              className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onAction={handleAction}
              isLoading={loadingActions.has(action.id)}
            />
          ))}
        </div>
      </div>

      {/* Recent Shortcuts */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Shortcuts</h3>
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            View all
          </button>
        </div>
        
        <div className="space-y-1">
          {recentShortcuts.map((shortcut) => (
            <ShortcutItem
              key={shortcut.id}
              shortcut={shortcut}
              onAction={handleShortcutAction}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">At a Glance</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">System Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Operational</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Update</span>
            <span className="text-sm text-white flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              2 minutes ago
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">API Health</span>
            <span className="text-sm text-green-400">99.9% uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
} 