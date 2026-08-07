"use client";

import { AppShell } from "@/components/layout/app-shell";
import { CataloguePanel } from "@/components/catalogue/catalogue-panel";

export default function CataloguePage() {
  return (
    <AppShell>
      <CataloguePanel />
    </AppShell>
  );
}
