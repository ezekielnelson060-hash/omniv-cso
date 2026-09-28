import { redirect } from "next/navigation";

/** Legacy blog removed — discovery publications live on Explore */
export default function BlogIndexRedirect() {
  redirect("/explore");
}
