"use client";

import { useState, useEffect } from "react";
import SearchFilterBar from "./SearchFilterBar";
import WaterPointCard from "./WaterPointCard";
import { emptyFilters } from "./filterOptions";
import "./discovery.css";

export default function WaterPointList() {
  const [filters, setFilters] = useState(emptyFilters);
  const [waterPoints, setWaterPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs once at the start, and again every time the filters change
  useEffect(() => {
    async function loadWaterPoints() {
      setLoading(true);
      setError("");

      try {
        // Turn the filters into a URL like ?search=lib&building=All...
        const params = new URLSearchParams(filters);
        const response = await fetch("/api/water-points?" + params.toString());
        const result = await response.json();

        if (result.success) {
          setWaterPoints(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Could not load water points. Is the server running?");
      }

      setLoading(false);
    }

    loadWaterPoints();
  }, [filters]);

  return (
    <div>
      <h1 className="page-title">Campus Water Points</h1>
      <p className="page-subtitle">
        Search and filter to find the best drinking water point near you.
      </p>

      <SearchFilterBar filters={filters} setFilters={setFilters} />

      {error && <div className="message message-error">{error}</div>}

      {loading && <div className="message">Loading water points...</div>}

      {!loading && !error && (
        <>
          <p className="result-count">
            Showing {waterPoints.length} water point(s)
          </p>

          {waterPoints.length === 0 ? (
            <div className="message">
              No water points found. Try changing your search or filters.
              <br />
              (First time? Open <b>/api/seed</b> once to add sample data.)
            </div>
          ) : (
            <div className="cards-grid">
              {waterPoints.map((waterPoint) => (
                <WaterPointCard key={waterPoint.waterPointId} waterPoint={waterPoint} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
