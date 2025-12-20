"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProgressRingProps = {
  status: 'Improvement' | 'Stable' | 'Decline';
};

const statusConfig = {
  Improvement: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    icon: TrendingUp,
  },
  Stable: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    icon: Minus,
  },
  Decline: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: TrendingDown,
  },
};

export default function ProgressRing({ status }: ProgressRingProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { color, bgColor, icon: Icon } = statusConfig[status];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const circumference = 2 * Math.PI * 45;

  return (
    <div className="relative h-40 w-40">
      <svg className="absolute inset-0" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          className="stroke-current text-muted"
          strokeWidth="10"
          fill="transparent"
        />
        {isMounted && (
            <motion.circle
            cx="50"
            cy="50"
            r="45"
            className={`stroke-current ${color}`}
            strokeWidth="10"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            />
        )}
      </svg>
      <motion.div
        className={cn("absolute inset-0 flex items-center justify-center rounded-full", bgColor)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Icon className={cn("h-16 w-16", color)} />
      </motion.div>
    </div>
  );
}
