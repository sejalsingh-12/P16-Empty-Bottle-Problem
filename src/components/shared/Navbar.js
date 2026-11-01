import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          💧 Campus Water
        </Link>

        <div className="navbar-links">
          <Link href="/">Home</Link>
          <Link href="/water-points">Water Points</Link>
          <Link href="/report">Report Status</Link>
          <Link href="/maintenance">Maintenance</Link>
        </div>
      </div>
    </nav>
  );
}
