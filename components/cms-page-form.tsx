"use client";

import { CmsEditorForm } from "@/components/cms-editor-form";

interface PageFormProps {
  initialValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
}

export function PageForm({ initialValues, onSubmit }: PageFormProps) {
  return (
    <CmsEditorForm
      type="page"
      initialValues={initialValues}
      onSubmit={onSubmit}
      cancelHref="/dashboard/content/pages"
    />
  );
}
