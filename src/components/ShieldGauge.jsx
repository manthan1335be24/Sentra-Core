/**
 * Shield Health Gauge Component
 */
import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';

export function ShieldGauge({ score = 100, status = 'Optimal', scanComplete = false }) {
  const getStatusColor = () => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGaugeColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getStatusLabel = () => {
    if (score >= 80) return '✅ Safe';
    if (score >= 60) return '⚠️ Caution';
    if (score >= 40) return '🔴 Warning';
    return '🚨 Critical';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex gap-8 items-center bg-black/20 border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-all duration-300"
    >
      <div className="w-24 h-24 flex-shrink-0">
        <CircularProgressbar
          value={Math.round(score)}
          text={`${Math.round(score)}%`}
          styles={buildStyles({
            pathColor: getGaugeColor(),
            textColor: '#fff',
            trailColor: 'rgba(255,255,255,0.05)',
            pathTransitionDuration: 0.5,
            textSize: '20px',
            strokeLinecap: 'round'
          })}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1"
      >
        <h3 className="text-xl font-black text-white uppercase tracking-widest">
          Shield Health
        </h3>
        <motion.p
          key={getStatusLabel()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-xs font-bold uppercase ${getStatusColor()} transition-colors duration-500`}
        >
          {getStatusLabel()}
        </motion.p>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">
          {scanComplete ? 'Last Scan: Complete' : 'System Integrity Optimal'}
        </p>
      </motion.div>
    </motion.div>
  );
}