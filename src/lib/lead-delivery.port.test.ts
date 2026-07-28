import { describe, expect, it } from 'vitest';
import { deliverLead, type Lead, type LeadDeliveryPort } from './lead-delivery.port';

describe('deliverLead', () => {
  const lead: Lead = { name: 'Ana Pérez', email: 'ana@example.com', phone: '11 5555 0101' };

  it('delivers a validated lead through the configured port', async () => {
    const delivered: Lead[] = [];
    const port: LeadDeliveryPort = {
      async deliver(candidate) {
        delivered.push(candidate);
      },
    };

    await expect(deliverLead(port, lead)).resolves.toBeUndefined();
    expect(delivered).toEqual([lead]);
  });

  it('preserves a provider failure for the route boundary to map safely', async () => {
    const providerError = new Error('provider unavailable');
    const port: LeadDeliveryPort = {
      async deliver() {
        throw providerError;
      },
    };

    await expect(deliverLead(port, lead)).rejects.toBe(providerError);
  });
});
