import type { SpecSection } from './specData';

interface Props {
  section: SpecSection;
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.6rem',
      background: 'rgba(59,130,246,0.1)',
      border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: 4,
      fontSize: '0.7rem',
      color: '#93c5fd',
      fontWeight: 500,
      margin: '0.2rem',
    }}>
      {label}
    </span>
  );
}

function ImpactTable({ rows }: { rows: { feature: string; function: string; impact: string }[] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
        <thead>
          <tr>
            {['Feature', 'Function', 'Impact'].map((h) => (
              <th key={h} style={{
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                background: 'rgba(56,189,248,0.06)',
                borderBottom: '1px solid rgba(56,189,248,0.15)',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.68rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <td style={{
                padding: '0.6rem 0.75rem',
                color: '#e2e8f0',
                fontWeight: 600,
                verticalAlign: 'top',
                whiteSpace: 'nowrap',
                minWidth: 160,
              }}>
                {row.feature}
              </td>
              <td style={{
                padding: '0.6rem 0.75rem',
                color: 'var(--text-secondary)',
                verticalAlign: 'top',
                lineHeight: 1.6,
              }}>
                {row.function}
              </td>
              <td style={{
                padding: '0.6rem 0.75rem',
                color: '#34d399',
                verticalAlign: 'top',
                lineHeight: 1.6,
              }}>
                {row.impact}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SpecSectionBlock({ section }: Props) {
  return (
    <section id={section.id} style={{ marginBottom: '4rem', scrollMarginTop: 80 }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.5rem',
        marginBottom: '2rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid rgba(56,189,248,0.1)',
      }}>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: 'rgba(56,189,248,0.12)',
          fontFamily: 'JetBrains Mono, monospace',
          lineHeight: 1,
          flexShrink: 0,
          marginTop: 2,
        }}>
          {section.number}
        </div>
        <div>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#38bdf8',
            marginBottom: '0.3rem',
          }}>
            {section.subtitle}
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f0f4ff',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {section.title}
          </h2>
        </div>
      </div>

      {section.intro && (
        <p style={{
          fontSize: '0.9rem',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
          marginBottom: '1.75rem',
          maxWidth: '72ch',
          borderLeft: '3px solid rgba(56,189,248,0.2)',
          paddingLeft: '1rem',
        }}>
          {section.intro}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {section.subsections.map((sub, idx) => (
          <div key={idx} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.65rem 1rem',
              background: 'var(--bg-card-header)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#cbd5e1',
              letterSpacing: '0.01em',
            }}>
              {sub.title}
            </div>
            <div style={{ padding: '1rem' }}>
              {sub.body && (
                <p style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                }}>
                  {sub.body}
                </p>
              )}

              {sub.note && (
                <div style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 6,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#f0f4ff',
                  fontStyle: 'italic',
                  letterSpacing: '-0.01em',
                }}>
                  {sub.note}
                </div>
              )}

              {sub.items && (
                <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                  {sub.items.map((item, i) => (
                    <li key={i} style={{
                      fontSize: '0.8rem',
                      lineHeight: 1.65,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.3rem',
                      paddingLeft: '0.25rem',
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sub.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem' }}>
                  {sub.tags.map((tag, i) => <Tag key={i} label={tag} />)}
                </div>
              )}

              {sub.table && <ImpactTable rows={sub.table} />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
