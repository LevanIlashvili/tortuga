import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  PrivateKey,
} from '@hashgraph/sdk';
import axios from 'axios';
import { getClient, getPrivateKey } from './client';
import { ComplianceEvent } from './types';
import { MIRROR_NODE_URLS, HEDERA_NETWORK } from './constants';

export async function createComplianceTopic(
  memo: string = 'Tortuga Compliance Log',
  adminKey?: PrivateKey
): Promise<string> {
  const client = getClient();
  const key = adminKey || getPrivateKey('HEDERA_ADMIN_KEY');

  const transaction = new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setAdminKey(key)
    .freezeWith(client);

  const signedTx = await transaction.sign(key);
  const txResponse = await signedTx.execute(client);
  const receipt = await txResponse.getReceipt(client);

  if (!receipt.topicId) {
    throw new Error('Failed to create topic: No topic ID in receipt');
  }

  return receipt.topicId.toString();
}

export async function logComplianceEvent(
  topicId: string,
  event: ComplianceEvent
): Promise<{ transactionId: string; sequenceNumber: string }> {
  const client = getClient();

  const message = JSON.stringify({
    type: event.type,
    data: event.data,
    actor: event.actor,
    timestamp: event.timestamp.toISOString(),
  });

  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(TopicId.fromString(topicId))
    .setMessage(message);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);

  return {
    transactionId: txResponse.transactionId.toString(),
    sequenceNumber: receipt.topicSequenceNumber?.toString() || '0',
  };
}

export async function getComplianceAuditTrail(
  topicId: string,
  limit: number = 100,
  order: 'asc' | 'desc' = 'desc'
): Promise<ComplianceEvent[]> {
  const mirrorNodeUrl = MIRROR_NODE_URLS[HEDERA_NETWORK as keyof typeof MIRROR_NODE_URLS];
  const url = `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=${order}`;

  const response = await axios.get(url);
  const messages = response.data.messages || [];

  return messages.map((msg: any) => {
    const decoded = Buffer.from(msg.message, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return {
      type: parsed.type,
      data: parsed.data,
      actor: parsed.actor,
      timestamp: new Date(parsed.timestamp),
    };
  });
}

export async function queryEventsByType(
  topicId: string,
  eventType: string,
  limit: number = 100
): Promise<ComplianceEvent[]> {
  const allEvents = await getComplianceAuditTrail(topicId, limit);
  return allEvents.filter(event => event.type === eventType);
}
