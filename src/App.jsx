import React, { useState, useEffect } from 'react';
import {
  getStatsHistory,
  getProcesses,
  performCleanup,
  updateIntelligence,
  runSecurityScan,
  healthCheck
} from './services/api';
import { useApi, usePolling } from './hooks/useApi';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { ProcessMonitor } from './components/ProcessMonitor';
import { ShieldGauge } from './components/ShieldGauge';
import { SystemGraph } from './components/SystemGraph';
import { ThreatFeed } from './components/ThreatFeed';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sentra-theme') || '';
  });
  const [scanData, setScanData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiReady, setApiReady] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const { call: callApi, loading: scanLoading } = useApi();
  
  const {
    data: history,
    loading: historyLoading,
    error: historyError
  } = usePolling(getStatsHistory, 3000, apiReady);
  
  const {
    data: processes,
    loading: processesLoading,
    error: processesError
  } = usePolling(getProcesses, 3000, apiReady);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        setApiReady(true);
        setApiError(null);
      } catch (err) {
        setApiError('Backend unavailable. Make sure the API is running on port 8000.');
        console.error('Health check failed:', err);
        setApiReady(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save theme preference
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('sentra-theme', theme);
  }, [theme]);

  const showNotif = (message, type = 'info') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 4000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleScan = async () => {
    try {
      const result = await callApi(runSecurityScan);
      setScanData(result);
      showNotif('Security scan completed', 'success');
    } catch (err) {
      showNotif(`Shield Scan failed: ${err.message}`, 'error');
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('This will delete temporary files and flush DNS cache. Continue?')) {
      return;
    }
    try {
      const result = await callApi(performCleanup);
      const message = `OPTIMIZATION COMPLETE\n${'─'.repeat(40)}\nFiles Purged: ${result.deleted_files}\nDNS Cache: ${result.dns_reset ? '✓ FLUSHED' : '✗ FAILED'}`;
      alert(message);
      showNotif('System optimization completed', 'success');
    } catch (err) {
      showNotif(`Cleanup failed: ${err.message}`, 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      const result = await callApi(updateIntelligence);
      alert(result.message || 'Intelligence updated successfully.');
      showNotif('Intelligence database updated', 'success');
    } catch (err) {
      showNotif(`Update failed: ${err.message}`, 'error');
    }
  };

  return (
    <div
      className={`h-screen w-full p-6 text-slate-300 font-sans overflow-hidden flex flex-col gap-6 bg-sentra-bg transition-colors duration-500 ${theme}`}
    >
      {/* Header */}
      <Header
        theme={theme}
        onThemeChange={handleThemeChange}
        onScan={handleScan}
        onCleanup={handleCleanup}
        onUpdate={handleUpdate}
        isScanning={scanLoading}
        apiError={apiError}
      />

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Panel: Process Monitor */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-4 bg-sentra-glass border border-white/5 rounded-3xl p-6 overflow-y-auto custom-scrollbar backdrop-blur-md transition-colors duration-500"
        >
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
            Process Intel (Aggregated)
          </h2>
          <ProcessMonitor
            processes={processes}
            loading={processesLoading}
            error={processesError}
          />
        </motion.section>

        {/* Right Panel: Monitoring & Threats */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-8 bg-sentra-glass border border-white/10 rounded-3xl p-8 flex flex-col gap-6 backdrop-blur-md transition-colors duration-500"
        >
          {/* Shield Gauge */}
          <ShieldGauge
            score={scanData?.shield_score || 100}
            scanComplete={!!scanData}
            status={scanData ? 'Threat Analysis Complete' : 'System Integrity Optimal'}
          />

          {/* System Graph */}
          <SystemGraph data={history} loading={historyLoading} />

          {/* Threat Feed */}
          <ThreatFeed results={scanData?.results} isScanning={scanLoading} />
        </motion.section>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm max-w-sm border ${
              showNotification.type === 'error'
                ? 'bg-red-500/10 border-red-500/50 text-red-400'
                : showNotification.type === 'success'
                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                : 'bg-blue-500/10 border-blue-500/50 text-blue-400'
            }`}
          >
            {showNotification.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;