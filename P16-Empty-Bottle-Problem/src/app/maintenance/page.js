import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth";
import MaintenancePage from "@/modules/maintenance/MaintenancePage";

// The /maintenance page. The check happens on the SERVER, so a person who is
// not logged in never receives the dashboard at all.
export default async function MaintenanceRoutePage() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect("/login");
  }

  return <MaintenancePage staff={staff} />;
}
