declare module 'hashconnect' {
  export class HashConnect {
    constructor();
    init(metadata: any, network?: string, multiAccount?: boolean): Promise<any>;
    connectToLocalWallet(pairingString?: string, metadata?: any): Promise<any>;
    disconnect(topic: string): Promise<void>;
    pairingEvent: any;
    connectionStatusChangeEvent: any;
  }

  export interface HashConnectTypes {
    AppMetadata: {
      name: string;
      description: string;
      icon: string;
      url?: string;
    };
  }
}
