import { makeStyles } from "@material-ui/core";

export const RenderHtml = (html: any) => {
    function createMarkup() {
        return { __html: html };
    }
    return (
        <label dangerouslySetInnerHTML={createMarkup()}></label>
    );
}
export const RenderHtmlTemplate = (html: any) => {
    function createMarkup() {
        return { __html: html };
    }
    const backgroundColor = getBackgroundColor(html) as any;

    return (
        <label style={backgroundColor} dangerouslySetInnerHTML={createMarkup()}></label>
    );
}

export const ConvertObjectToQueryString = (object: any) => {
    let queryString = '?';
    Object.keys(object).forEach((o, idx) => {
        queryString += `${idx > 0 ? '&' : ''}${o}=${Object.values(object)[idx]}`
    });
    return queryString;
}

export const useStylesBootstrapPasswordHint = makeStyles((theme) => ({
    arrow: {
        color: '#000 !important',
    },
    tooltip: {
        backgroundColor: '#000 !important',
        fontSize: '16px !important',
        width: '350px !important',
        maxWidth: "none !important",
    },
}));

export const getBackgroundColor = (html: string): string | null => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        if (doc && doc != null) {
            // Find the <style> element
            const styleNode = doc.querySelector('style');
            if (styleNode) {
                const cssRules = styleNode.innerHTML;
                const guidPattern = /body\.(\w{8}-(\w{4}-\w{4}-\w{4}-\w{12}))/; // Adjust regex as needed
                const match = cssRules.match(guidPattern);

                if (match) {
                    const styleSheet = new CSSStyleSheet();
                    styleSheet.replaceSync(cssRules);
                    // Convert CSSRuleList to an array
                    const rulesArray = Array.from(styleSheet.cssRules);
                    // Loop through the CSS rules to find the matching class
                    for (const rule of rulesArray) {
                        if (rule instanceof CSSStyleRule && rule.selectorText === match[0]) {
                            // Get the background color for the matched class
                            return { backgroundColor: rule.style.backgroundColor || null, display: 'block' } as any;
                        }
                    };
                }
            }
        }
    } catch (error) {
        console.log('htmlUtils: ', error)
    }
    return null;
}
