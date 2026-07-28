export type Demo = {
  alt: string;
  src: string;
};

const CLINICIAN_WORKFLOW_DEMO: Demo = {
  alt: 'Demostración sintética del flujo de seguimiento de una nutricionista',
  src: '/demos/clinician-workflow-v1.svg',
};

const WHATSAPP_WORKFLOW_DEMO: Demo | undefined = undefined;

export function canShowWhatsAppDemo(whatsAppReady: boolean): boolean {
  return whatsAppReady && WHATSAPP_WORKFLOW_DEMO !== undefined;
}

export function getApprovedDemo(whatsAppReady = false): Demo | undefined {
  if (canShowWhatsAppDemo(whatsAppReady)) {
    return WHATSAPP_WORKFLOW_DEMO;
  }

  return CLINICIAN_WORKFLOW_DEMO;
}
