
export interface Tunnel {
    id: number;
    domain: string;
    apiKey: string;
    isEnabled: boolean;
    allowMultipleConnections: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type Consumption = {
    year: number;
    month: number;
    dataUsage: string;
}

export interface DomainConsumption {
    domain: string;
    consumptions: Consumption[];
}