import { redirect } from "next/navigation";

/** Legacy demand product — public product is the discovery network. */
export default function VerifyRedirect() {
  redirect("/");
}
