/**
 * Action Control Buttons Component
 */
import React from 'react';
import { motion } from 'framer-motion';

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export function ActionButtons({
  onScan,
  onCleanup,
  onUpdate,
  isScanning = false,
  isCleaningUp = false,
  isUpdating = false,
  error = null
}) {
  const buttons = [
    {
      label: 'Update Intel',
      icon: '🔄',
      onClick: onUpdate,
      loading: isUpdating,
      className: 'hover:bg-sentra-accent/10 hover:text-sentra-accent hover:border-sentra-accent/40',
      id: 'update-btn'
    },
    {
      label: 'System Optimization',
      icon: '🚀',
      onClick: onCleanup,
      loading: isCleaningUp,
      className: 'hover:bg-white/10 hover:border-white/20',
      id: 'cleanup-btn'
    },
    {
      label: 'Shield Scan',
      icon: '⚔️',
      onClick: onScan,
      loading: isScanning,
      primary: true,
      className: isScanning
        ? 'bg-white/5 border-white/10 text-slate-500'
        : 'bg-sentra-accent/10 border-sentra-accent/40 text-sentra-accent hover:shadow-glow',
      id: 'scan-btn'
    }
  ];

  const isAnyLoading = isScanning || isCleaningUp || isUpdating;

  return (
    <div className="flex gap-3 items-center flex-wrap justify-end">
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="text-[10px] text-red-400 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20 order-last"
        >
          ⚠️ {error}
        </motion.div>
      )}
      
      {buttons.map((btn, idx) => (
        <motion.button
          key={btn.id}
          id={btn.id}
          variants={buttonVariants}
          initial="idle"
          whileHover={!isAnyLoading ? "hover" : "idle"}
          whileTap={!isAnyLoading ? "tap" : "idle"}
          onClick={btn.onClick}
          disabled={isAnyLoading}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border flex items-center gap-2 ${
            btn.primary
              ? btn.className
              : `bg-white/5 text-slate-300 border-white/10 ${btn.className}`
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={btn.label}
        >
          <motion.span
            animate={btn.loading ? { rotate: 360 } : { rotate: 0 }}
            transition={btn.loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            {btn.icon}
          </motion.span>
          <span className="hidden sm:inline">{btn.label}</span>
          {btn.loading && <span className="text-[8px] animate-pulse">...</span>}
        </motion.button>
      ))}
    </div>
  );
}