'use client';

import { formatDistanceToNow } from 'date-fns';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

interface RelativeTimeProps extends React.ComponentProps<'time'> {
  value: string | Date;
  addSuffix?: boolean;
  fallback?: ReactNode;
}

export function RelativeTime({ value, addSuffix = true, fallback = '…', ...props }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateValue = useMemo(() => (typeof value === 'string' ? new Date(value) : value), [value]);

  if (!mounted) {
    const date = typeof value === 'string' ? value : value.toISOString();
    return (
      <time dateTime={date} {...props}>
        {fallback}
      </time>
    );
  }

  const label = formatDistanceToNow(dateValue, { addSuffix });

  return (
    <time dateTime={dateValue.toISOString()} {...props}>
      {label}
    </time>
  );
}
