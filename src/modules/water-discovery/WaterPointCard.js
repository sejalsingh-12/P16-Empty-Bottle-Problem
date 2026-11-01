import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";

// Shows ONE water point as a card on the list page.
export default function WaterPointCard({ waterPoint }) {
  return (
    <div className="water-card">
      <div className="card-top">
        <span className="card-id">{waterPoint.waterPointId}</span>
        <StatusBadge label={waterPoint.isWorking ? "Working" : "Not Working"} />
      </div>

      <h3>{waterPoint.name}</h3>
      <p className="card-location">
        📍 {waterPoint.building}, {waterPoint.floor}
      </p>

      <div className="badge-row">
        <StatusBadge label={waterPoint.availability} />
        <StatusBadge label={waterPoint.cleanliness} />
        <StatusBadge label={waterPoint.temperature} />
      </div>

      <Link href={`/water-points/${waterPoint.waterPointId}`} className="btn btn-primary">
        View Details
      </Link>
    </div>
  );
}
