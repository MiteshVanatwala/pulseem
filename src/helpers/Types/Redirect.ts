export type generalPropTypes = {
    redirect: Function;
};

export type RedirectPropTypes = {
    url: string;
    openNewTab: boolean;
    preventRedirect?: boolean;
};