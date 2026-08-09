import { redirect } from "next/navigation";

/** After onboarding / legacy /dashboard links → Activate research. */
export default function DashboardRedirect() {
  redirect("/activate");
}
