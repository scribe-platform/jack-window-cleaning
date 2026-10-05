import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

export interface ScribeField {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  hidden?: boolean;
}

export interface ScribeCollection {
  name: string;
  path: string;
  label?: string;
  form?: boolean;
  fields: ScribeField[];
}

export interface ScribeSchema {
  site: string;
  turnstileSiteKey?: string;
  umamiWebsiteId?: string;
  umamiScriptUrl?: string;
  collections: ScribeCollection[];
}

export interface Pkg {
  title: string;
  tagline?: string;
  price: string;
  features: string[];
  featured: boolean;
  order: number;
}

let cached: ScribeSchema | undefined;

/** Build-time only. Resolved from cwd, not import.meta.url (see schema recipe). */
export function loadScribeSchema(): ScribeSchema {
  cached ??= parse(readFileSync(resolve(process.cwd(), '.scribe.yml'), 'utf-8')) as ScribeSchema;
  return cached;
}

export function loadPackages(): Pkg[] {
  const dir = resolve(process.cwd(), 'content/packages');
  let files: string[] = [];
  try { files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f)); } catch {}
  return files
    .map((f) => parse(readFileSync(resolve(dir, f), 'utf-8')) ?? {})
    .map((d: any) => ({
      title: String(d.title ?? ''),
      tagline: d.tagline ? String(d.tagline) : undefined,
      price: String(d.price ?? ''),
      features: String(d.features ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      featured: d.featured === true,
      order: Number(d.order ?? 999),
    }))
    .filter((p) => p.title)
    .sort((a, b) => a.order - b.order);
}

/** Prefix a site path with Astro's base so links work on github.io project pages. */
export const href = (path = '') =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
