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
    description: 'Start analysis',
    icon: Camera,
    gradient: 'from-purple-500 to-pink-500',
    action: 'navigate',
    path: '/',
  },
  {
    id: 'export-data',
    name: 'Export Data',
    description: 'Download JSON',
    icon: Download,
    gradient: 'from-blue-500 to-cyan-500',
    action: 'export',
  },
  {
    id: 'share-dashboard',
    name: 'Share',
    description: 'Copy link',
    icon: Share2,
    gradient: 'from-green-500 to-emerald-500',
    action: 'share',
  },
  {
    id: 'refresh-data',
    name: 'Refresh',
    description: 'Update metrics',
    icon: RefreshCw,
    gradient: 'from-orange-500 to-red-500',
    action: 'refresh',
  },
  {
    id: 'api-docs',
    name: 'API Docs',
    description: 'Integration',
    icon: FileText,
    gradient: 'from-indigo-500 to-purple-500',
    action: 'external',
    url: 'https://docs.dreamforge.ai',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure',
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

function ShortcutItem({ shortcut, onAction }) {
  const Icon = shortcut.icon;
  
  return (
    <button
      onClick={() => onAction(shortcut)}
      className="flex items-center space-x-3 w-full p-2.5 rounded-lg hover:bg-white/[0.05] transition-colors text-left group"
    >
      <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
      </div>
      <span className="text-xs text-gray-300 group-hover:text-white transition-colors leading-tight">
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

  const handleShortcutAction = (shortcut) => {
    console.log('Shortcut action:', shortcut.id);
    onAction?.(shortcut);
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

      {/* Recent Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">Recent Shortcuts</h4>
          <button className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            View all
          </button>
        </div>
        
        <div className="space-y-1">
          {recentShortcuts.slice(0, 4).map((shortcut) => (
            <ShortcutItem
              key={shortcut.id}
              shortcut={shortcut}
              onAction={handleShortcutAction}
            />
          ))}
        </div>
      </div>

      {/* Status Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">At a Glance</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">System Status</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-green-400">Operational</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Last Update</span>
            <span className="text-gray-300">{new Date().toLocaleTimeString().slice(0, 5)}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">API Health</span>
            <span className="text-green-400">99.9% uptime</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Response Time</span>
            <span className="text-blue-400">~2.4s avg</span>
          </div>
        </div>
      </div>

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