export type Lead = {
  name: string;
  email: string;
  phone: string;
};

export interface LeadDeliveryPort {
  deliver(lead: Lead): Promise<void>;
}

export function deliverLead(port: LeadDeliveryPort, lead: Lead): Promise<void> {
  return port.deliver(lead);
}
