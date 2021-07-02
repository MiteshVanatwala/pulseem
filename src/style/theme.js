import {heIL,enUS} from '@material-ui/core/locale';
import {createMuiTheme} from '@material-ui/core/styles';
const themeLanguages={
  en: {
    direction: 'ltr',
    translation: enUS
  },
  he: {
    direction: 'rtl',
    translation: heIL
  }
}

export const getTheme=(language) => {
  const {direction,translation}=themeLanguages[language]

  return createMuiTheme({
    direction,
    palette: {
      primary: {
        main: '#0371ad'
      }
    },
    overrides: {
      MuiOutlinedInput: {
        input: {
          '&::placeholder': {
            color: 'rgba(0,0,0)',
            fontWeight: 500
          },
          fontWeight: 500,
          zIndex: 0
        }
      }
    },
    typography: {
      fontFamily: [
        'Assistant'
      ],
      fontStyle: 'normal',
      fontSize: 14
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 768,
        md: 1024,
        lg: 1400,
        xl: 1920,
      },
    },
  },translation)
}