import { useSelector } from 'react-redux';
//import { getCookie } from '../Functions/cookies';
import { googleFonts, HebrewFonts } from './GoogleFonts';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';

interface font {
    showDefaultFonts: boolean,
    customFonts: [] | any
}

export const FONTS = (isLandingPage: boolean = false) => {
    const { accountFeatures } = useSelector((state: any) => state.common);

    const allowedFonts = {
        showDefaultFonts: true,
        customFonts: []
    } as font;

    if (isLandingPage) {
        allowedFonts.customFonts = HebrewFonts;
    }
    else {
        allowedFonts.customFonts.push(googleFonts.Outfit);
        if (accountFeatures?.indexOf(PulseemFeatures.BEE_ENABLE_GOOGLE_FONTS) > -1) { // EnableBeeGoogleFonts
            allowedFonts.customFonts.push(googleFonts.Rubik);
            allowedFonts.customFonts.push(googleFonts.OpenSans);
        }
    }

    return allowedFonts;
}


