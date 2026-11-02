import RequestCard from "./RequestCard";
import { filterOptions } from "./maintenanceOptions";

// Shows ALL maintenance requests, with filter buttons.
export default function RequestDashboard({
  requests,
  statusFilter,
  setStatusFilter,
  onRequestUpdated,
  successMessage,
  clearSuccessMessage,
}) {
  return (
    <section>
      <h2 className="mt-heading">Maintenance Dashboard</h2>

      {successMessage && (
        <div className="mt-success-box">
          ✅ {successMessage}
          <button className="mt-close" onClick={clearSuccessMessage}>
            ✕
          </button>
        </div>
      )}

      <div className="mt-filters">
        {filterOptions.map((option) => (
          <button
            key={option}
            className={statusFilter === option ? "mt-filter mt-filter-active" : "mt-filter"}
            onClick={() => setStatusFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="mt-help">Showing {requests.length} request(s)</p>

      {requests.length === 0 ? (
        <div className="message">
          No maintenance requests found. Create one from the <b>Student Reports</b> tab.
        </div>
      ) : (
        <div className="mt-list">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onUpdated={onRequestUpdated}
            />
          ))}
        </div>
      )}
    </section>
  );
}
