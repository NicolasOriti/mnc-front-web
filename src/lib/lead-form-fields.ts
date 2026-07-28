import type { LeadField } from './lead-response';

/**
 * Presentation-only descriptors for the lead form fields.
 *
 * `lead-validation.ts` remains the sole source of validation authority
 * (required-ness, length bounds, email format). This module only describes
 * how the already-authoritative `LeadField` names are rendered, so the
 * field name set is declared once and shared by `LeadForm.astro` and
 * `src/pages/api/leads.ts` instead of being repeated as literals in each.
 */
export type LeadFormFieldConfig = {
  name: LeadField;
  label: string;
  type: 'text' | 'email' | 'tel';
  autocomplete: string;
};

export const LEAD_FORM_FIELDS: readonly LeadFormFieldConfig[] = [
  { name: 'name', label: 'Nombre', type: 'text', autocomplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { name: 'phone', label: 'Teléfono', type: 'tel', autocomplete: 'tel' },
];

export const LEAD_HONEYPOT_FIELD: LeadFormFieldConfig = {
  name: 'website',
  label: 'Sitio web',
  type: 'text',
  autocomplete: 'off',
};
