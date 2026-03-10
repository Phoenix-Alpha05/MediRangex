import { useEffect, useState } from 'react';

interface Props {
  message: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}

export function ErrorToast({ message, onRetry, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        background: '#1c1f26',
        border: '1px solid rgba(239,68,68,0.35)',
        borderRadius: '6px',
        padding: '12px 16px',
        maxWidth: '380px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        animation: 'toastSlideIn 0.25s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#ef4444',
            flexShrink: 0,
            marginTop: '4px',
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#ef4444',
              letterSpacing: '0.1em',
              marginBottom: '4px',
            }}
          >
            DATA FEED ERROR
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#8b9ab0',
              wordBreak: 'break-word',
              lineHeight: 1.4,
            }}
          >
            {message}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={onRetry}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '3px',
                color: '#ef4444',
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <button
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'none',
                border: '1px solid #2a3444',
                borderRadius: '3px',
                color: '#4e5f74',
                padding: '4px 10px',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
