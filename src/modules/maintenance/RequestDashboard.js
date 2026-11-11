import RequestCard from "./RequestCard";
import { filterOptions } from "./maintenanceOptions";

// Shows maintenance requests, with filter buttons.
// The server only sends the requests this person is allowed to see:
// an admin gets all of them, a staff member gets only their own.
export default function RequestDashboard({
  staff,
  staffList,
  requests,
  statusFilter,
  setStatusFilter,
  onRequestUpdated,
  successMessage,
  clearSuccessMessage,
}) {
  const isAdmin = staff.role === "admin";

  return (
    <section>
      <h2 className="mt-heading">
        {isAdmin ? "Maintenance Dashboard" : "My Assigned Requests"}
      </h2>

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
          {isAdmin ? (
            <>
              No maintenance requests found. Create one from the <b>Student Reports</b> tab.
            </>
          ) : (
            "No requests are assigned to you right now."
          )}
        </div>
      ) : (
        <div className="mt-list">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              staff={staff}
              staffList={staffList}
              onUpdated={onRequestUpdated}
            />
          ))}
        </div>
      )}
    </section>
  );
}
