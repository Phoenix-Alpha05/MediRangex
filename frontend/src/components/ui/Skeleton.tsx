import type React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(90deg, #151c26 25%, #1a2332 50%, #151c26 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        borderRadius: '3px',
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: '#111820',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '14px',
      }}
    >
      <Skeleton style={{ height: '10px', width: '35%' }} />
      <Skeleton style={{ height: '24px', width: '25%' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Skeleton style={{ height: '8px', width: '100%', flex: 1 }} />
        <Skeleton style={{ height: '8px', width: '100%', flex: 1 }} />
      </div>
      <Skeleton style={{ height: '8px', width: '80%' }} />
      <Skeleton style={{ height: '8px', width: '60%' }} />
      <Skeleton style={{ height: '8px', width: '45%' }} />
    </div>
  );
}
