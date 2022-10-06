export type PageProperty = {
    PageName: string;
    PageNumber: number;
}

export const SetPageState = (page: PageProperty) => {
    const existPage = GetPageNyName(page.PageName);
    const object: any = sessionStorage.getItem("PageProperties");
    if (existPage || object) {
        const sessionObject = JSON.parse(object);
        let overwriteObject = page;
        if (existPage) {
            overwriteObject = sessionObject.map((p: PageProperty) => {
                if (p.PageName === page.PageName) {
                    p.PageNumber = page.PageNumber;
                }
                return p;
            });
            sessionStorage.setItem("PageProperties", JSON.stringify(overwriteObject));
        }
        else {
            sessionStorage.setItem("PageProperties", JSON.stringify([...sessionObject, overwriteObject]));
        }
    }
    else {
        const json = JSON.stringify([page]);
        sessionStorage.setItem("PageProperties", json);
    }
}
export const GetPageNyName = (pageName: string) => {
    let pageFound: any | null = null;
    const sessionObject: any = sessionStorage.getItem("PageProperties");
    if (sessionObject) {
        const list: PageProperty[] = JSON.parse(sessionObject);
        pageFound = list?.find((p: any) => {
            return p.PageName === pageName;
        });
    }

    return pageFound ?? null;
}