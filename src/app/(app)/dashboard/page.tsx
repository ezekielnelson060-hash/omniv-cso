import { redirect } from "next/navigation";

/** Command Center retired — Audience is home. */
export default function DashboardRedirect() {
  redirect("/crm");
}
