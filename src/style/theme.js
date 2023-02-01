import { heIL, enUS } from "@material-ui/core/locale";
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
};

export const getTheme = (language) => {
  // console.debug("getTheme", themeLanguages);
  // console.debug("getTheme", language);
  const { direction = "rtl", translation = heIL } =
    themeLanguages[language] || themeLanguages["he"];

  return createTheme(
    {
      direction,
      palette: {
        primary: {
          main: "#ff3343",
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
        fontFamily: ["Assistant"],
        fontStyle: "normal",
        fontSize: 14,
      },
    },
    translation
  );
};
