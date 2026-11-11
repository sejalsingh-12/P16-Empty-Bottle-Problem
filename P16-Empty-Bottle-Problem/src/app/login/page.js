import { redirect } from "next/navigation";
import { getCurrentStaff } from "@/lib/auth";
import LoginForm from "@/modules/staff-auth/LoginForm";

// The /login page. If you are already logged in, go straight to the dashboard.
export default async function LoginPage() {
  const staff = await getCurrentStaff();

  if (staff) {
    redirect("/maintenance");
  }

  return <LoginForm />;
}
