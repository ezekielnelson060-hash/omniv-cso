import { redirect } from "next/navigation";

/** After onboarding / legacy /dashboard links → Activate research, then user goes to CRM. */
export default function DashboardRedirect() {
  redirect("/activate");
}
