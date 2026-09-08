import type { ObjectFieldProps } from "sanity";
import { FormField } from "sanity";

export type FieldProps = ObjectFieldProps;

// Swaps the frame Sanity puts around a nested object for the flat one a plain field gets.
export function Field({ title, description, inputId, validation, path, children }: FieldProps) {
  return (
    <FormField title={title} description={description} inputId={inputId} validation={validation} path={path}>
      {children}
    </FormField>
  );
}
