/** Bun-specific extensions to ImportMeta used by scripts in /scripts */
declare interface ImportMeta {
  /** The directory of the current module (Bun runtime API) */
  dir: string;
}
