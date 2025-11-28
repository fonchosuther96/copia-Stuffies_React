export default function KpiCard({ title, value }) {
  return (
    <div className="col-6 col-md-3">
      <div className="card text-center p-3">
        <h3 className="m-0">{value}</h3>
        <span className="text-muted small">{title}</span>
      </div>
    </div>
  );
}
