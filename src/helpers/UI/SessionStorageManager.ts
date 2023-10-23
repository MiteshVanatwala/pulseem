export type PageProperty = {
    PageName: string;
    PageNumber: number;
    SearchData: any;
    SearchTerm: any;
    IsDynamic: boolean;
}

export const SetPageState = (page: PageProperty) => {
    const existPage = GetPageNyName(page.PageName);
    const object: any = sessionStorage.getItem("PageState");
    let pageItem: string = '';

    if (existPage || object) {
        const sessionObject = JSON.parse(object);
        let overwriteObject = page;
        if (existPage) {
            overwriteObject = sessionObject.map((p: PageProperty) => {
                if (p.PageName === page.PageName) {
                    p.PageNumber = page.PageNumber;
                    p.SearchData = page.SearchData;
                    p.IsDynamic = page.IsDynamic;
                }
                return p;
            });
            pageItem = JSON.stringify(overwriteObject);
        }
        else {
            pageItem = JSON.stringify([...sessionObject, overwriteObject]);
        }
    }
    else {
        pageItem = JSON.stringify([page]);
    }

    sessionStorage.setItem("PageState", pageItem);
}
export const GetPageNyName = (pageName: string) => {
    let pageFound: any | null = null;
    const sessionObject: any = sessionStorage.getItem("PageState");
    if (sessionObject) {
        const list: PageProperty[] = JSON.parse(sessionObject);
        pageFound = list?.find((p: any) => {
            return p.PageName === pageName;
        });
    }

    return pageFound ?? null;
}
export const ClearPageState = () => {
    window.sessionStorage.removeItem('PageState');
    window.sessionStorage.removeItem('searchData')
}