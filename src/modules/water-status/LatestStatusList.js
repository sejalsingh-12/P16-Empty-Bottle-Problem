import StatusBadge from "@/components/shared/StatusBadge";
import UsageBadge from "./UsageBadge";

// Shows the LATEST reported status of every water point.
export default function LatestStatusList({ waterPoints }) {
  return (
    <section className="status-section">
      <h2>💧 Latest Status of Each Water Point</h2>

      {waterPoints.length === 0 ? (
        <div className="message">
          No water points found. (Open <b>/api/seed</b> once to add sample data.)
        </div>
      ) : (
        <div className="latest-grid">
          {waterPoints.map((wp) => (
            <div className="latest-card" key={wp.waterPointId}>
              <div className="card-top">
                <span className="card-id">{wp.waterPointId}</span>
                <StatusBadge label={wp.isWorking ? "Working" : "Not Working"} />
              </div>

              <h3>{wp.name}</h3>
              <p className="card-location">📍 {wp.building}, {wp.floor}</p>

              <div className="badge-row">
                <StatusBadge label={wp.availability} />
                <StatusBadge label={wp.cleanliness} />
                <StatusBadge label={wp.temperature} />
                <UsageBadge label={wp.usageStatus || "Normal"} />
              </div>

              <p className="last-reported">
                {wp.lastReportedAt
                  ? "Last reported: " + new Date(wp.lastReportedAt).toLocaleString()
                  : "No student reports yet"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
