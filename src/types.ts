export type TxType = 'in' | 'out' | 'diya' | 'liya' | 'diya_back' | 'liya_back';

export interface Transaction {
  id: string;
  type: TxType;
  amt: number;
  note?: string;
  person?: string;
  date: string;
  uid?: string;
}

export interface Udhar {
  id: string;
  kind: 'diya' | 'liya';
  person: string;
  amt: number;
  paid: number;
  note?: string;
  date: string;
}

export interface BankState {
  tx: Transaction[];
  ud: Udhar[];
}

export type ActiveTab = 'home' | 'txn' | 'diya' | 'liya' | 'more';
export type FilterType = 'all' | 'in' | 'out' | 'udhar';
