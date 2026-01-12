import { heIL, enUS, plPL } from "@material-ui/core/locale";
import { createTheme } from "@material-ui/core/styles";

const themeLanguages = {
  en: {
    direction: "ltr",
    translation: enUS,
  },
  he: {
    direction: "rtl",
    translation: heIL,
  },
  pl: {
    direction: "ltr",
    translation: plPL,
  },
};

export const getTheme = (language) => {
  // console.debug("getTheme", themeLanguages);
  // console.debug("getTheme", language);
  const { direction = "rtl", translation = heIL } =
    themeLanguages[language] || themeLanguages["he"];

  // Use Helvetica for Polish accounts
  const fontFamily = language === "pl" ? ["Helvetica", "Helvetica Neue", "Arial", "sans-serif"] : ["Assistant"];

  return createTheme(
    {
      direction,
      palette: {
        primary: {
          main: "#FF1744",
        },
      },
      overrides: {
        MuiOutlinedInput: {
          input: {
            "&::placeholder": {
              color: "rgba(0,0,0)",
              fontWeight: 500,
            },
            fontWeight: 500,
            zIndex: 0,
          },
        },
      },
      typography: {
        fontFamily: fontFamily,
        fontStyle: "normal",
        fontSize: 14,
      },
    },
    translation
  );
};
