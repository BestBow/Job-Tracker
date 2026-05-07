export default function StatsBar({ jobs }) {
  const total     = jobs.length;
  const responses = jobs.filter(j => j.status !== 'applied').length;
  const offers    = jobs.filter(j => j.status === 'offer').length;
  const rate      = total ? Math.round((responses / total) * 100) : 0;

  const stats = [
    { label: 'TOTAL APPLIED',  value: total,      color: '#60a5fa' },
    { label: 'RESPONSES',      value: responses,  color: '#f59e0b' },
    { label: 'RESPONSE RATE',  value: `${rate}%`, color: '#ec4899' },
    { label: 'OFFERS',         value: offers,     color: '#34d399', highlight: offers > 0 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
      {stats.map(({ label, value, color, highlight }) => (
        <div key={label} style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${highlight ? color + '44' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '24px',
          padding: '20px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.18em', marginBottom: '24px' }}>{label}</p>
          <p style={{ color, fontSize: '48px', fontFamily: 'Fraunces, serif', fontWeight: 500, lineHeight: 1 }}>{value}</p>
          {highlight && offers > 0 && <p style={{ color, fontSize: '12px', marginTop: '8px' }}>↑ celebrate</p>}
        </div>
      ))}
    </div>
  );
}