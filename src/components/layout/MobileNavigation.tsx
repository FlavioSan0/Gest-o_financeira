"use client";

import { useState } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileMenuSheet } from "@/components/layout/MobileMenuSheet";

export function MobileNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <MobileMenuSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}