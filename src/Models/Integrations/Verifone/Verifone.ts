import { IntegrationGroups } from '../Integration';

export interface VerifoneModel {
  ID?: number;
  ChainID: string;
  Username: string;
  Password: string;
  MainServiceUrl: string;
  SecondServiceUrl: string;
  IsSendSms: boolean;
  RegisterEventActive: boolean;
  PurchaseEventActive: boolean;
  AbandonedEventActive: boolean;
  Groups: IntegrationGroups;
  CreateDate?: string;
  UpdateDate?: string;
  IntegrationSource?: number;
}