/*
  Admin Panel
  Design: Obsidian Forge — tactical dashboard with analytics and management tools
  Features: Analytics, User Management, Content Management, Server Monitoring
*/

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Film, TrendingUp, AlertTriangle, Settings,
  Download, Upload, RefreshCw, Lock, LogOut, Menu, X,
  Activity, Zap, Database, Shield, Eye, Clock,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalStreams: number;
  totalDownloads: number;
  avgSessionTime: string;
  topContent: Array<{ title: string; views: number }>;
  serverStatus: Array<{ name: string; status: 'online' | 'offline'; uptime: number }>;
  platformMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    avgLoadTime: number;
    errorRate: number;
  };
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'servers' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 15420,
    activeUsers: 3847,
    totalStreams: 284920,
    totalDownloads: 42183,
    avgSessionTime: '47m 23s',
    topContent: [
      { title: 'Breaking Bad', views: 8420 },
      { title: 'The Ramparts of Ice', views: 7230 },
      { title: 'Naruto Shippuden', views: 6890 },
      { title: 'Frieren', views: 5420 },
      { title: 'The Boys', views: 4920 },
    ],
    serverStatus: [
      { name: 'MultiEmbed HD', status: 'online', uptime: 99.8 },
      { name: 'VidSrc 4K', status: 'online', uptime: 99.5 },
      { name: 'Zoro SUB', status: 'online', uptime: 98.2 },
      { name: 'AniWatch SUB', status: 'online', uptime: 97.8 },
      { name: 'GogoAnime DUB', status: 'offline', uptime: 95.2 },
    ],
    platformMetrics: {
      pageViews: 524800,
      uniqueVisitors: 42300,
      avgLoadTime: 1.24,
      errorRate: 0.3,
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ background: '#050816', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-2xl"
          style={{
            background: 'rgba(11, 18, 32, 0.95)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: '#00D4FF' }} />
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              Admin Panel
            </h1>
            <p className="text-sm mt-2" style={{ color: '#8899AA' }}>
              Enter password to access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#FFFFFF',
                border: '1px solid rgba(0, 212, 255, 0.2)',
              }}
              autoFocus
            />
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg font-600 transition-all"
              style={{
                background: '#00D4FF',
                color: '#050816',
              }}
            >
              Login
            </button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: '#8899AA' }}>
            Demo password: <code style={{ color: '#06FFA5' }}>admin123</code>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: '#050816', minHeight: '100vh' }}>
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <motion.div
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className="border-r"
          style={{
            borderColor: 'rgba(0, 212, 255, 0.1)',
            background: 'rgba(11, 18, 32, 0.8)',
          }}
        >
          <div className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'content', label: 'Content', icon: Film },
              { id: 'servers', label: 'Servers', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className="w-full px-4 py-3 rounded-lg text-sm font-600 transition-all flex items-center gap-3"
                  style={{
                    background: activeTab === item.id ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                    color: activeTab === item.id ? '#00D4FF' : '#8899AA',
                    border: activeTab === item.id ? '1px solid rgba(0, 212, 255, 0.4)' : 'none',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="w-full px-4 py-2 rounded-lg text-sm font-600 transition-all flex items-center gap-2"
              style={{
                background: 'rgba(255, 100, 100, 0.1)',
                color: '#FF6464',
                border: '1px solid rgba(255, 100, 100, 0.2)',
              }}
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#FFFFFF' }}>
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'content' && 'Content Management'}
                  {activeTab === 'servers' && 'Server Monitoring'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm mt-1" style={{ color: '#8899AA' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#8899AA',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: analytics.totalUsers.toLocaleString(), icon: Users, color: '#00D4FF' },
                    { label: 'Active Now', value: analytics.activeUsers.toLocaleString(), icon: Activity, color: '#06FFA5' },
                    { label: 'Total Streams', value: analytics.totalStreams.toLocaleString(), icon: TrendingUp, color: '#8B5CF6' },
                    { label: 'Downloads', value: analytics.totalDownloads.toLocaleString(), icon: Download, color: '#FF6464' },
                  ].map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-xl"
                        style={{
                          background: 'rgba(11, 18, 32, 0.8)',
                          border: `1px solid ${metric.color}20`,
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm" style={{ color: '#8899AA' }}>
                              {metric.label}
                            </p>
                            <p className="text-2xl font-bold mt-2" style={{ color: metric.color }}>
                              {metric.value}
                            </p>
                          </div>
                          <Icon className="w-6 h-6" style={{ color: metric.color, opacity: 0.5 }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Top Content & Server Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(11, 18, 32, 0.8)',
                      border: '1px solid rgba(0, 212, 255, 0.1)',
                    }}
                  >
                    <h3 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
                      Top Content
                    </h3>
                    <div className="space-y-3">
                      {analytics.topContent.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span style={{ color: '#8899AA' }}>{item.title}</span>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(item.views / 8420) * 100}px`,
                                background: '#00D4FF',
                              }}
                            />
                            <span className="text-sm font-600" style={{ color: '#00D4FF' }}>
                              {item.views.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Server Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-xl"
                    style={{
                      background: 'rgba(11, 18, 32, 0.8)',
                      border: '1px solid rgba(0, 212, 255, 0.1)',
                    }}
                  >
                    <h3 className="text-lg font-bold mb-4" style={{ color: '#FFFFFF' }}>
                      Server Status
                    </h3>
                    <div className="space-y-3">
                      {analytics.serverStatus.map((server, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: server.status === 'online' ? '#06FFA5' : '#FF6464',
                              }}
                            />
                            <span style={{ color: '#8899AA' }}>{server.name}</span>
                          </div>
                          <span className="text-sm font-600" style={{ color: '#00D4FF' }}>
                            {server.uptime}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Platform Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 rounded-xl"
                  style={{
                    background: 'rgba(11, 18, 32, 0.8)',
                    border: '1px solid rgba(0, 212, 255, 0.1)',
                  }}
                >
                  <h3 className="text-lg font-bold mb-6" style={{ color: '#FFFFFF' }}>
                    Platform Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Page Views', value: analytics.platformMetrics.pageViews.toLocaleString(), icon: Eye },
                      { label: 'Unique Visitors', value: analytics.platformMetrics.uniqueVisitors.toLocaleString(), icon: Users },
                      { label: 'Avg Load Time', value: `${analytics.platformMetrics.avgLoadTime}s`, icon: Clock },
                      { label: 'Error Rate', value: `${analytics.platformMetrics.errorRate}%`, icon: AlertTriangle },
                    ].map((metric, idx) => {
                      const Icon = metric.icon;
                      return (
                        <div key={idx} className="p-4 rounded-lg" style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4" style={{ color: '#00D4FF' }} />
                            <span className="text-xs" style={{ color: '#8899AA' }}>
                              {metric.label}
                            </span>
                          </div>
                          <p className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                            {metric.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'rgba(11, 18, 32, 0.8)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}
              >
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#00D4FF' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                    User Management
                  </h3>
                  <p className="text-sm mt-2" style={{ color: '#8899AA' }}>
                    Manage user accounts, roles, and permissions. Feature coming soon.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'rgba(11, 18, 32, 0.8)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}
              >
                <div className="text-center py-12">
                  <Film className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#00D4FF' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                    Content Management
                  </h3>
                  <p className="text-sm mt-2" style={{ color: '#8899AA' }}>
                    Upload, edit, and organize movies, TV shows, and anime. Feature coming soon.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Servers Tab */}
            {activeTab === 'servers' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'rgba(11, 18, 32, 0.8)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}
              >
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#00D4FF' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                    Server Monitoring
                  </h3>
                  <p className="text-sm mt-2" style={{ color: '#8899AA' }}>
                    Real-time monitoring of streaming infrastructure. Feature coming soon.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl"
                style={{
                  background: 'rgba(11, 18, 32, 0.8)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                }}
              >
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#00D4FF' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                    Settings
                  </h3>
                  <p className="text-sm mt-2" style={{ color: '#8899AA' }}>
                    Configure platform settings and preferences. Feature coming soon.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
