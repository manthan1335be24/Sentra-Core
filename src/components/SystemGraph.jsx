/**
 * System CPU Usage Graph Component
 */
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/20 rounded-lg p-2 text-xs text-white">
        <p className="font-mono">{payload[0].payload.time}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SystemGraph({ data = [], loading = false }) {
  // GUARD RAIL: Ensure we always have an array, even if the API returns null initially
  const safeData = data || [];

  const chartData = useMemo(() => {
    return safeData.map(entry => ({
      time: entry.time,
      cpu: entry.cpu,
      memory: entry.memory || 0
    }));
  }, [safeData]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex-1 bg-black/30 border border-white/5 rounded-3xl p-4 shadow-cyber relative overflow-hidden"
    >
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 text-[10px] text-slate-500 animate-pulse"
        >
          ● Live Update
        </motion.div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--sentra-accent)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--sentra-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.03)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke="#475569"
            fontSize={10}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            stroke="#475569"
            fontSize={10}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickCount={6}
            yAxisId="left"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#475569"
            fontSize={10}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickCount={6}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cpu"
            stroke="var(--sentra-accent)"
            strokeWidth={3}
            dot={{ r: 4, fill: '#050505', stroke: 'var(--sentra-accent)', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-in-out"
            name="CPU"
          />
          {safeData.some(d => d.memory) && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="memory"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={1500}
              name="Memory"
              opacity={0.7}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
}