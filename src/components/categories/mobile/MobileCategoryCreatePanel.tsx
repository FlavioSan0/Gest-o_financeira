"use client";

import { useState } from "react";
import { Plus, Tags, X } from "lucide-react";
import { CategoryForm } from "@/components/categories/CategoryForm";

type MobileCategoryCreatePanelProps = {
  familyId: string;
};

export function MobileCategoryCreatePanel({
  familyId,
}: MobileCategoryCreatePanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mobile-category-create">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mobile-category-create__button"
        >
          <div>
            <Plus className="h-5 w-5" />
          </div>

          <span>Nova categoria</span>
        </button>
      )}

      {isOpen && (
        <div className="mobile-category-create__panel">
          <div className="mobile-category-create__header">
            <div className="mobile-category-create__icon">
              <Tags className="h-5 w-5" />
            </div>

            <div>
              <p className="mobile-eyebrow">Cadastro</p>
              <h3>Nova categoria</h3>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mobile-category-create__close"
              aria-label="Fechar cadastro de categoria"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <CategoryForm familyId={familyId} />
        </div>
      )}
    </section>
  );
}