

  export interface Exchange {
        id: number;
        name: string;
        opening: string;
        closing: string;
    }

    export interface Instrument2 {
        id: number;
        market: string;
        type: string;
        category: string;
        symbol: string;
        eexSymbol: string;
        name: string;
        vtp: string;
        loadPeriod: string;
        deliveryStart: string;
        deliveryEnd: string;
        deliveryHours: number;
    }

    export interface Instrument {
        id: number;
        exchangeId: number;
        minAmount: string;
        maxAmount: string;
        firstTrading: string;
        lastTrading: string;
        alias: string;
        instrument: Instrument2;
    }

    export interface Loadperiod {
        name: string;
        instruments: Instrument[];
    }

    export interface Vtp {
        name: string;
        loadPeriods: Loadperiod[];
    }

    
    export interface ExchangeRes {
        exchange: Exchange;        
        vtps: Vtp[];
        vtpsLc: string[];
    }
