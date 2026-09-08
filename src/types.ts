/** A value that may be absent, covering both null and undefined. */
export type Nullable<T> = T | null | undefined;

/** Type name of the icon object. */
export const iconTypeName = "icon";

/**
 * An icon an author chose, stored as the name it was chosen by alongside the shapes it draws.
 *
 * @public
 */
export interface SanityIcon {
  _type: typeof iconTypeName;
  /** Name the icon goes by in the library it was taken from. */
  name?: string;
  /** Shapes the icon is drawn from, written when the icon is chosen. */
  node?: string;
}
