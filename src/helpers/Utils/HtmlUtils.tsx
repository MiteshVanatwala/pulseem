export const RenderHtml = (html: any, style: any) => {
    function createMarkup() {
        return { __html: html };
    }
    return (
        <label style={{...style}} dangerouslySetInnerHTML={createMarkup()}></label>
    );
}