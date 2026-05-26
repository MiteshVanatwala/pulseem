import { useSelector } from 'react-redux';
//import { getCookie } from '../Functions/cookies';
import { googleFonts, HebrewFonts } from './GoogleFonts';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';
import { sitePrefix } from '../../config/index';

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
        allowedFonts.customFonts.push(googleFonts.GoogleAssistant);
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


