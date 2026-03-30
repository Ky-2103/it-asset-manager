type Props = {
  // Label describing the statistic
  label: string

  // Numeric value of the statistic
  value: number
}

// Display a simple statistic card with a label and value
export function StatCard({ label, value }: Props) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  )
}
