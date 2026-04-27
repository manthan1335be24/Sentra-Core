/**
 * Process Monitor Panel Component
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ProcessMonitor({ processes, loading, error }) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-red-400 p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-2"
      >
        <span>⚠️</span> {error}
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {loading && processes?.length === 0 && (
        <div className="text-xs text-slate-500 animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
          Loading processes...
        </div>
      )}
      
      <AnimatePresence mode="popLayout">
        {processes?.map((proc, index) => (
          <motion.div
            key={proc.name}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="p-3 mb-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 flex flex-col gap-2 transition-all duration-300 overflow-hidden"
          >
            <div className="flex justify-between items-center text-xs font-mono">
              <span 
                className="text-slate-200 truncate max-w-[150px]"
                title={proc.name}
              >
                {proc.name}
              </span>
              <span className={`font-bold transition-colors duration-500 ${
                proc.cpu_percent > 50 ? 'text-red-400' :
                proc.cpu_percent > 25 ? 'text-yellow-400' :
                'text-sentra-accent'
              }`}>
                {proc.cpu_percent}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(proc.cpu_percent, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full transition-colors duration-500 ${
                  proc.cpu_percent > 50 ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                  proc.cpu_percent > 25 ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                  'bg-sentra-accent shadow-glow'
                }`}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {!loading && (!processes || processes.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-slate-600 text-center py-4"
        >
          No processes detected
        </motion.div>
      )}
    </div>
  );
}