/**
 * Threat Analysis Feed Component
 */
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThreatFeed({ results = [], isScanning = false }) {
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => b.risk_score - a.risk_score);
  }, [results]);

  const getRiskColor = (score) => {
    if (score > 75) return 'text-red-500';
    if (score > 50) return 'text-orange-400';
    if (score > 25) return 'text-yellow-400';
    return 'text-sentra-accent';
  };

  const getRiskBg = (score) => {
    if (score > 75) return 'bg-red-500/10';
    if (score > 50) return 'bg-orange-500/10';
    if (score > 25) return 'bg-yellow-500/10';
    return 'bg-sentra-accent/5';
  };

  return (
    <div className="h-32 bg-black/20 border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[9px] uppercase font-black text-slate-500 tracking-widest">
          Threat Analysis Feed
        </h3>
        <motion.span
          key={results?.length || 0}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[9px] text-slate-600 bg-white/5 px-2 py-1 rounded"
        >
          {results?.length || 0} Events
        </motion.span>
      </div>

      <AnimatePresence mode="wait">
        {results && results.length > 0 ? (
          <motion.div
            key="threats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            {sortedResults.map((threat, idx) => (
              <motion.div
                key={`${threat.file}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`text-[10px] text-white font-mono p-2 rounded border border-white/5 flex justify-between items-start gap-2 hover:border-white/10 transition-all duration-200 ${getRiskBg(threat.risk_score)}`}
              >
                <span className="truncate flex-1">&gt; {threat.file}</span>
                <span className={`${getRiskColor(threat.risk_score)} font-bold whitespace-nowrap text-[9px]`}>
                  {threat.risk_score}%
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-threats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[9px] text-slate-600 uppercase tracking-widest mt-4 text-center"
          >
            {isScanning ? (
              <div className="flex items-center justify-center gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-1 h-1 bg-sentra-accent rounded-full"
                />
                <span>Scanning for threats...</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-1 h-1 bg-sentra-accent rounded-full"
                />
              </div>
            ) : (
              '✓ No threats detected'
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}