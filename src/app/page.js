import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <h1>Never Face an Empty Bottle Again 💧</h1>
        <p>
          Find clean, cold and working drinking water points across the campus,
          report problems, and help maintenance fix them faster.
        </p>
        <Link href="/water-points" className="btn btn-white">
          Find Water Points
        </Link>
      </section>

      <section className="feature-grid">
        <Link href="/water-points" className="feature-card">
          <h3>🔍 Water Point Discovery</h3>
          <p>Search and filter water points by building, availability, cleanliness and temperature.</p>
        </Link>

        <Link href="/report" className="feature-card">
          <h3>📝 Report Status</h3>
          <p>Tell everyone if a water point is empty, dirty, warm or broken.</p>
        </Link>

        <Link href="/maintenance" className="feature-card">
          <h3>🛠️ Maintenance</h3>
          <p>Staff can view complaints, assign tasks and mark repairs as completed.</p>
        </Link>
      </section>
    </div>
  );
}
