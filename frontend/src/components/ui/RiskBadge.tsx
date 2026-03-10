import { getRiskColor } from '../../utils/statusColors';

interface RiskBadgeProps {
  level: string;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
}

const SIZE = {
  xs: { px: '5px', py: '1px', fs: '8px',  dot: '4px' },
  sm: { px: '6px', py: '2px', fs: '9px',  dot: '4px' },
  md: { px: '8px', py: '3px', fs: '10px', dot: '5px' },
};

export function RiskBadge({ level, size = 'sm', showDot = true }: RiskBadgeProps) {
  const color = getRiskColor(level);
  const sz = SIZE[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        paddingLeft: sz.px,
        paddingRight: sz.px,
        paddingTop: sz.py,
        paddingBottom: sz.py,
        fontSize: sz.fs,
        fontWeight: 700,
        letterSpacing: '0.08em',
        borderRadius: '3px',
        border: `1px solid ${color}33`,
        background: `${color}12`,
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {showDot && (
        <span
          style={{
            width: sz.dot,
            height: sz.dot,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }}
        />
      )}
      {level?.toUpperCase()}
    </span>
  );
}
