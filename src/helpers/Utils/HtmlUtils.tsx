export const RenderHtml = (html: any) => {
    function createMarkup() {
        return { __html: html };
    }
    return (
        <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
}