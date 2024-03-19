
export interface PreviewTypes {
    classes: any,
    width: number;
    isImageVisible: boolean,
    isNameVisible: boolean,
    isDescriptionVisible: boolean,
    isPriceVisible: boolean,
    isButtonVisible: boolean,
    imageURL: string,
    name: string,
    description: string,
    price: string,
    buttonText: string,
    structure: string,
    direction: string,
    eventType: string,
    category: string,
}

export interface ProductCatalogTypes {
    classes: any,
    isOpen: boolean,
    save: (a: any) => void
}