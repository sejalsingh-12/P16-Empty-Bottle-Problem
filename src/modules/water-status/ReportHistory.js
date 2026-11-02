import StatusBadge from "@/components/shared/StatusBadge";
import UsageBadge from "./UsageBadge";

// Shows previous reports (newest first) with their timestamps.
export default function ReportHistory({ reports, waterPoints, filter, setFilter }) {
  // Find the name of a water point from its ID
  function getName(waterPointId) {
    const found = waterPoints.find((wp) => wp.waterPointId === waterPointId);
    return found ? found.name : "Unknown water point";
  }

  return (
    <section className="status-section">
      <div className="history-header">
        <h2>🕒 Previous Reports</h2>

        <div className="form-group history-filter">
          <label>Show reports for</label>
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="All">All water points</option>
            {waterPoints.map((wp) => (
              <option key={wp.waterPointId} value={wp.waterPointId}>
                {wp.waterPointId} - {wp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="message">No reports yet. Be the first to submit one!</div>
      ) : (
        <div className="history-list">
          {reports.map((report) => (
            <div className="history-item" key={report._id}>
              <div className="history-top">
                <b>
                  {report.waterPointId} - {getName(report.waterPointId)}
                </b>
                <span className="history-time">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="badge-row">
                <StatusBadge label={report.availability} />
                <StatusBadge label={report.cleanliness} />
                <StatusBadge label={report.temperature} />
                <StatusBadge label={report.isWorking ? "Working" : "Not Working"} />
                <UsageBadge label={report.usageStatus} />
              </div>

              {report.description && (
                <p className="history-description">“{report.description}”</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
