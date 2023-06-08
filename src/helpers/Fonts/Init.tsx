import { useSelector } from 'react-redux';
//import { getCookie } from '../Functions/cookies';
import { googleFonts } from './GoogleFonts';
import { PulseemFeatures } from '../../model/PulseemFields/Fields';

interface font {
    showDefaultFonts: boolean,
    customFonts: [] | any
}

export const FONTS = () => {
    const { accountFeatures } = useSelector((state: any) => state.common);

    const allowedFonts = {
        showDefaultFonts: true,
        customFonts: []
    } as font;

    if (accountFeatures?.indexOf(PulseemFeatures.BEE_ENABLE_GOOGLE_FONTS) > -1) { // EnableBeeGoogleFonts
        allowedFonts.customFonts.push(googleFonts.Rubik);
    }

    return allowedFonts;
}


