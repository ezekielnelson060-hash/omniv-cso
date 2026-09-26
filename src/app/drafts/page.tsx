import { PublicationManager } from "@/components/discovery/publication-manager";

export const metadata = {
  title: "Drafts | Omniv",
  description: "Continue writing and publish your drafts on Omniv.",
};

export default function DraftsPage() {
  return <PublicationManager mode="drafts" />;
}
