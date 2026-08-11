import { redirect } from "next/navigation";

/** Meta / legacy links use /policy — canonical policy is /privacy. */
export default function PolicyRedirect() {
  redirect("/privacy");
}
