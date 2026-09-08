import type { ObjectFieldProps } from "sanity";
import { FormField } from "sanity";

export type FieldProps = ObjectFieldProps;

export function Field({ title, description, inputId, validation, path, children }: FieldProps) {
  return (
    <FormField title={title} description={description} inputId={inputId} validation={validation} path={path}>
      {children}
    </FormField>
  );
}
