export default function LogSnippet({ lines }: { lines: string[] }) {
  const getColor = (line: string) => {
    if (line.startsWith('ERROR')) return '#C17B3A'
    if (line.startsWith('WARN'))  return '#F59E0B'
    return 'rgba(255,255,255,0.55)'
  }
  return (
    <div>
      <div
        className="rounded-lg p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-0.5"
        style={{ background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.07)', maxHeight: 160 }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ color: getColor(line) }}>{line}</div>
        ))}
      </div>
      <p className="text-[10px] text-white/30 italic mt-1.5">
        (Demo logs — live logs fetched via Kubernetes client-go at incident time)
      </p>
    </div>
  )
}
