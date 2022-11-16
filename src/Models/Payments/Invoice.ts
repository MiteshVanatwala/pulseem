export interface Receipt {
    ID: number;
    RecieptURL: string;
    CreationDate: Date | string;
    OpenDate: Date | string;
}
export interface Invoice {
    ID: number;
    InvoiceURL: string;
    AccountPurchaseID: number;
    CreateDate: Date | string;
    DocumentNumber: number;
    OpenDate: Date | string;
}
export interface InvoiceResponse {
    status: boolean;
    reason: string;
    client_id: string;
    custom_client_id: string;
    doctype: string;
    docnum: string;
    doc_url: string;
    email_success_count: number;
}