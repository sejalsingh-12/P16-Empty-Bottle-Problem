"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import "./discovery.css";

export default function WaterPointDetails({ id }) {
  const [waterPoint, setWaterPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWaterPoint() {
      try {
        const response = await fetch("/api/water-points/" + id);
        const result = await response.json();

        if (result.success) {
          setWaterPoint(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Could not load water point details.");
      }

      setLoading(false);
    }

    loadWaterPoint();
  }, [id]);

  if (loading) {
    return <div className="message">Loading details...</div>;
  }

  if (error) {
    return (
      <div>
        <div className="message message-error">{error}</div>
        <br />
        <Link href="/water-points" className="btn btn-outline">
          ← Back to Water Points
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/water-points" className="back-link">
        ← Back to Water Points
      </Link>

      <div className="details-box">
        <div className="details-header">
          <div>
            <span className="card-id">{waterPoint.waterPointId}</span>
            <h1 className="page-title">{waterPoint.name}</h1>
          </div>
          <StatusBadge label={waterPoint.isWorking ? "Working" : "Not Working"} />
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Building</span>
            <span>{waterPoint.building}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Floor</span>
            <span>{waterPoint.floor}</span>
          </div>

          <div className="detail-item detail-wide">
            <span className="detail-label">Location Details</span>
            <span>{waterPoint.locationDetails || "Not provided"}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Availability</span>
            <StatusBadge label={waterPoint.availability} />
          </div>

          <div className="detail-item">
            <span className="detail-label">Cleanliness</span>
            <StatusBadge label={waterPoint.cleanliness} />
          </div>

          <div className="detail-item">
            <span className="detail-label">Temperature</span>
            <StatusBadge label={waterPoint.temperature} />
          </div>

          <div className="detail-item">
            <span className="detail-label">Last Updated</span>
            <span>{new Date(waterPoint.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
