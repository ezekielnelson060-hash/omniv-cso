import { redirect } from "next/navigation";

/** Home entry → Moves (precision plan). Activate scan was redundant. */
export default function DashboardPage() {
  redirect("/opportunities");
}
