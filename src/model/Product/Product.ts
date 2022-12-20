export interface ProductFilter {

    PageIndex: number;
    PageSize: number;
    ProductName: String | null;
    CategoryID: number[];
    IsExport: boolean;
    OrderBY: eOrderBy;
    OrderByParameter: string | null;
}

export enum eOrderBy {
    UNDEFINED = -1,
    DESC = 0,
    ASC = 1
}

/*
Default Values
=============================
    PageIndex: 1,
    PageSize: 6,
    ProductName: null,
    CategoryID: [],
    IsExport: false,
    OrderBY: 0,
    OrderByParameter: null
*/