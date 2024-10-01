import modsData from "../data/modinfo.json" with { type: 'json' }

export type ModInfo = {
  name: string;
  url?: string;
  modrinth?: string;
  curseforge?: string;
  version?: string;
  icon?: string;
  status: 'allowed' | 'disallowed' | 'partially_allowed' | 'unknown';
  note?: string;
  server?: Array<string>;
}

export const mods = modsData as Array<ModInfo>
