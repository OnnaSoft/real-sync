
export interface Tunnel {
    id: number;
    domain: string;
    apiKey: string;
    isEnabled: boolean;
    allowMultipleConnections: boolean;
    createdAt: Date;
    updatedAt: Date;
}
