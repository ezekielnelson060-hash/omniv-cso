import { PublicationManager } from "@/components/discovery/publication-manager";

export const metadata = {
  title: "Publications | Omniv",
  description: "Manage publications for the active Omniv identity.",
};

export default function PublicationsPage() {
  return <PublicationManager mode="publications" />;
}
