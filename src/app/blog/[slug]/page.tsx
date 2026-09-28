import { redirect } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

/** Legacy blog post URLs redirect into discovery explore */
export default async function BlogSlugRedirect({ params }: Props) {
  await params;
  redirect("/explore");
}
