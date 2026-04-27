/**
 * Theme Switcher Component
 */
import React from 'react';
import { motion } from 'framer-motion';

const THEMES = [
  {
    id: '',
    name: 'Sentra Classic',
    color: '#06b6d4',
    title: 'Sentra Classic (Cyan)',
    icon: '🔷'
  },
  {
    id: 'theme-green',
    name: 'Toxic Heuristics',
    color: '#22c55e',
    title: 'Toxic Heuristics (Green)',
    icon: '🟢'
  },
  {
    id: 'theme-red',
    name: 'Red Alert',
    color: '#ef4444',
    title: 'Red Alert (Crimson)',
    icon: '🔴'
  },
  {
    id: 'theme-silver',
    name: 'Ghost Glass',
    color: '#e2e8f0',
    title: 'Ghost Glass (Silver)',
    icon: '⚪'
  }
];

export function ThemeSwitcher({ currentTheme, onThemeChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-2 ml-8 border-l border-white/10 pl-8"
    >
      {THEMES.map((theme, idx) => (
        <motion.button
          key={theme.id}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onThemeChange(theme.id)}
          className={`relative w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
            currentTheme === theme.id ? 'ring-2 ring-offset-2 ring-offset-black' : ''
          }`}
          style={{
            backgroundColor: theme.color,
            boxShadow: currentTheme === theme.id 
              ? `0 0 12px ${theme.color}, 0 0 24px ${theme.color}80, inset 0 0 8px rgba(255,255,255,0.3)`
              : `0 0 8px ${theme.color}66`
          }}
          title={theme.title}
          aria-label={`Switch to ${theme.name} theme`}
        >
          {currentTheme === theme.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs"
            >
              ✓
            </motion.div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}