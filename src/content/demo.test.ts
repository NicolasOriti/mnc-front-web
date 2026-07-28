import { describe, expect, it } from 'vitest';
import { canShowWhatsAppDemo } from './demo';

describe('canShowWhatsAppDemo', () => {
  it('withholds WhatsApp media while launch validation is off', () => {
    expect(canShowWhatsAppDemo(false)).toBe(false);
  });

  it('withholds WhatsApp media until an approved variant exists even when validation is on', () => {
    expect(canShowWhatsAppDemo(true)).toBe(false);
  });
});
