export interface TransactionResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function associateTokens(
  hashconnect: any,
  accountId: string,
  tokenIds: string[]
): Promise<TransactionResponse> {
  if (!hashconnect) {
    return { success: false, error: 'HashConnect not initialized' };
  }

  if (tokenIds.length === 0) {
    return { success: false, error: 'No tokens provided' };
  }

  try {
    const { TokenAssociateTransaction, AccountId, TokenId } = await import('@hashgraph/sdk');

    const signer = hashconnect.getSigner(AccountId.fromString(accountId));

    const transaction = await new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds(tokenIds.map(id => TokenId.fromString(id)))
      .freezeWithSigner(signer);

    const response = await transaction.executeWithSigner(signer);

    return {
      success: true,
      transactionId: response.transactionId.toString(),
    };
  } catch (error: any) {
    console.error('Token association failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to associate tokens',
    };
  }
}

export async function sendPayment(
  hashconnect: any,
  accountId: string,
  treasuryAccountId: string,
  amount: number,
  memo: string
): Promise<TransactionResponse> {
  if (!hashconnect) {
    return { success: false, error: 'HashConnect not initialized' };
  }

  try {
    const { TransferTransaction, AccountId, Hbar } = await import('@hashgraph/sdk');

    const signer = hashconnect.getSigner(AccountId.fromString(accountId));

    const transaction = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(accountId), new Hbar(-amount))
      .addHbarTransfer(AccountId.fromString(treasuryAccountId), new Hbar(amount))
      .setTransactionMemo(memo)
      .freezeWithSigner(signer);

    const response = await transaction.executeWithSigner(signer);

    return {
      success: true,
      transactionId: response.transactionId.toString(),
    };
  } catch (error: any) {
    console.error('Payment failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to send payment',
    };
  }
}

export async function signTransaction(
  hashconnect: any,
  accountId: string,
  transactionBytes: Uint8Array
): Promise<TransactionResponse> {
  if (!hashconnect) {
    return { success: false, error: 'HashConnect not initialized' };
  }

  try {
    return {
      success: false,
      error: 'Direct transaction signing not implemented',
    };
  } catch (error: any) {
    console.error('Transaction signing failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to sign transaction',
    };
  }
}
