import { getCookie } from '../cookies';
import { googleFonts } from './GoogleFonts';

interface font {
    showDefaultFonts: boolean,
    customFonts: [] | any
}

export const FONTS = () => {
    const accountSettings = getCookie("accountSettings")

    const allowedFonts = {
        showDefaultFonts: true,
        customFonts: []
    } as font;

    if (accountSettings?.AccountFeatures?.indexOf(44) > -1) { // EnableBeeGoogleFonts
        allowedFonts.customFonts.push(googleFonts.Rubik);
    }

    return allowedFonts;
}


