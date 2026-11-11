import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth";
import StaffManagement from "@/modules/staff-auth/StaffManagement";

// The /admin/staff page. Only a logged-in ADMIN can open it.
export default async function AdminStaffPage() {
  const staff = await getCurrentStaff();

  if (!staff) {
    redirect("/login");
  }

  if (staff.role !== "admin") {
    redirect("/maintenance");
  }

  return <StaffManagement staff={staff} />;
}
