import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  PrivateKey,
} from '@hashgraph/sdk';
import { getClient, getPrivateKey } from './client';
import { ComplianceEvent } from './types';

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
