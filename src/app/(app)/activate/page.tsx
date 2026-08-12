import { redirect } from "next/navigation";

/** Activate scan retired — one plan lives in Moves. */
export default function ActivatePage() {
  redirect("/opportunities");
}
