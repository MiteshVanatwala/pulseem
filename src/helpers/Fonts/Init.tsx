import { useSelector } from 'react-redux';
//import { getCookie } from '../Functions/cookies';
import { googleFonts, HebrewFonts } from './GoogleFonts';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { sitePrefix } from '../../config/index';

const RAG_SANS_BASE_URL = 'https://www.pulseem.co.il/react/assets/fonts/RAGSans';

const RAG_SANS_FONT_FACE_CSS = `
@font-face{font-family:'RAGSans';font-style:normal;font-weight:100;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Thin.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Thin.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:200;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-ExtraLight.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-ExtraLight.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:300;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Light.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Light.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:400;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Regular.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Regular.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:500;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Medium.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Medium.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:600;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-SemiBold.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-SemiBold.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:700;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Bold.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Bold.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:800;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-ExtraBold.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-ExtraBold.woff') format('woff')}
@font-face{font-family:'RAGSans';font-style:normal;font-weight:900;src:url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Black.woff2') format('woff2'),url('${RAG_SANS_BASE_URL}/RAG-Sans-1.1-Black.woff') format('woff')}
`.trim();

export const injectRagSansFontFace = (html: string): string => {
    if (!html || !html.includes('RAGSans')) return html;
    const styleTag = `<style>${RAG_SANS_FONT_FACE_CSS}</style>`;
    if (html.includes('</head>')) {
        return html.replace('</head>', `${styleTag}</head>`);
    }
    return styleTag + html;
};

interface font {
    showDefaultFonts: boolean,
    customFonts: [] | any
}

export const FONTS = (isLandingPage: boolean = false) => {
    const { subAccount, accountFeatures } = useSelector((state: any) => state.common);
    const { language } = useSelector((state: any) => state.core);
    const IsPoland = language === 'pl';

    const allowedFonts = {
        showDefaultFonts: true,
        customFonts: []
    } as font;

    if (isLandingPage) {
        allowedFonts.customFonts = [...HebrewFonts];
    }
    else {
        allowedFonts.customFonts.push(googleFonts.Outfit);
        if (accountFeatures?.indexOf(PulseemFeatures.BEE_ENABLE_GOOGLE_FONTS) > -1) { // EnableBeeGoogleFonts
            allowedFonts.customFonts.push(googleFonts.Rubik);
            allowedFonts.customFonts.push(googleFonts.OpenSans);

            // Add Helvetica for Polish accounts
            if (IsPoland) {
                allowedFonts.customFonts.push(googleFonts.Helvetica);
            }
        }
    }

    const ragSansFont = {
        name: "RAG Sans",
        fontFamily: "'RAGSans', 'RAG Sans', sans-serif",
        url: (() => {
            const origin = window.location.origin;
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                // Fallback to staging to bypass CORS/Loopback security blocks on localhost inside BEE iframe
                return 'https://clients.reactstage.club/assets/fonts/RAGSans/RAGSans.css';
            }
            return `${origin}${sitePrefix}assets/fonts/RAGSans/RAGSans.css`;
        })(),
        fontWeight: {
            100: 'Thin',
            200: 'Extra Light',
            300: 'Light',
            400: 'Regular',
            500: 'Medium',
            600: 'Semi-bold',
            700: 'Bold',
            800: 'Extra-bold',
            900: 'Black'
        }
    };
    allowedFonts.customFonts.push(ragSansFont);

    return allowedFonts;
}


