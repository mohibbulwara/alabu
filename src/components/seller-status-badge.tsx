
'use client';

import { Badge } from '@/components/ui/badge';
import type { SellerStatus } from '@/types';
import { Star, Zap, Award } from 'lucide-react';

interface SellerStatusBadgeProps {
  status: SellerStatus;
  className?: string;
}

const statusConfig = {
  'Top Seller': {
    icon: Star,
    label: 'Top Seller',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  },
  'Rising Star': {
    icon: Zap,
    label: 'Rising Star',
    className: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  },
  'Customer Favorite': {
    icon: Award,
    label: 'Customer Favorite',
    className: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  },
};

export default function SellerStatusBadge({ status, className }: SellerStatusBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-semibold">{config.label}</span>
    </Badge>
  );
}
