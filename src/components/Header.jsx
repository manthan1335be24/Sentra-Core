/**
 * Header Component
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ActionButtons } from './ActionButtons';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Header({
  theme,
  onThemeChange,
  onScan,
  onCleanup,
  onUpdate,
  isScanning,
  isCleaningUp,
  isUpdating,
  apiError
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center bg-sentra-glass border border-white/5 p-4 rounded-2xl shadow-cyber backdrop-blur-md transition-colors duration-500"
    >
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-10 h-10 bg-sentra-accent/20 rounded-lg flex items-center justify-center border border-sentra-accent/40 shadow-glow transition-all duration-500"
        >
          <span className="text-sentra-accent font-black text-xl transition-colors duration-500">
            S
          </span>
        </motion.div>
        
        <h1 className="text-xl font-black tracking-ultra-widest text-white uppercase">
          SENTRA CORE
        </h1>

        {/* Theme Switcher */}
        <ThemeSwitcher currentTheme={theme} onThemeChange={onThemeChange} />
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onScan={onScan}
        onCleanup={onCleanup}
        onUpdate={onUpdate}
        isScanning={isScanning}
        isCleaningUp={isCleaningUp}
        isUpdating={isUpdating}
        error={apiError}
      />
    </motion.header>
  );
}