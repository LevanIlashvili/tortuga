import { logComplianceEvent } from '@tortuga/hedera';

const COMPLIANCE_TOPIC_ID = process.env.HEDERA_COMPLIANCE_TOPIC_ID!;

export async function logToHCS(eventType: string, data: Record<string, any>, actor: string) {
  if (!COMPLIANCE_TOPIC_ID) {
    console.warn('HCS compliance topic not configured, skipping log');
    return null;
  }

  try {
    const result = await logComplianceEvent(COMPLIANCE_TOPIC_ID, {
      type: eventType,
      data,
      actor,
      timestamp: new Date(),
    });

    return result;
  } catch (error) {
    console.error('Failed to log to HCS:', error);
    return null;
  }
}

export function generateOrderMemo(orderId: string): string {
  return `ORDER:${orderId}`;
}

export function getTreasuryAccount(): string {
  return process.env.HEDERA_TREASURY_ID || '';
}
