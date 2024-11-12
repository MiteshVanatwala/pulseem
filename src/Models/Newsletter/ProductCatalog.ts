export interface ProductDetailsInterface {
    CategoriesId: string;
    CategoriesName: string;
    Description: string;
    ID: number;
    ImageURLs: string;
    MaxPrice: number | string;
    Name: string;
    URL: string;
    Error?: string;
}

export interface StaticProductListInterface {
    [index: number]: ProductDetailsInterface
}