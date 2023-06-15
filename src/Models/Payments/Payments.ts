import { CreditCardType } from '../Enums/Payment';
import { eMasterProduct } from '../Product/BillingProduct';
import { BulkType } from '../Product/BillingProduct';


export interface PaymentDetails {
    TotalAmount: number;
    TerminalNumber: string;
    UserName: string;
    FirstName: string;
    LastName: string;
    Email: string;
    ProductName: string;
    Amount: number;
    ProductPrice: number;
    Cellphone: string;
    DepartmentId: number | null;
    SKU: string;
}

export interface Purchase {
    ID: number;
    WebformID: number;
    CreatedDate: Date | string;
    UpdatedDate: Date | string;
    ClientID: number;
    Price: number;
    Status: number;
    ErrorType: number;
    LowProfileCode: string;
}
export interface WebformToCardcomDetail {
    ID: number;
    CreatedDate: Date | string | null;
    WebformID: number | null;
    TerminalNumber: string;
    UserName: string;
    DepartmentId: number | null;
}
export interface CreditCard extends PackagePrice {
    ID: number;
    AccountID: number;
    SubAccountID: number;
    ExpDate: string;
    CVV: string;
    Token: string;
    IsActive: boolean;
    LastDigits: string;
    CreditTypeID: CreditCardType;
    IsNewCard: boolean;

}
export interface PackagePrice {
    CreditNumber: string;
    PackageType: eMasterProduct;
    Credits: number;
    Price: number;
    PackageName: string;
    Quantity: number;
}
export interface PackageRequest {
    AccountId: string;
    SubAccountId: string;
    PackageId: string;
    Culture: string;
}

export interface PaymentLog {
    ID: number;
    AccountID: number;
    OperationID: number;
    BulkType: BulkType;
    Message: string;
    PaymentStatus: string;
    Date: Date | string;
}