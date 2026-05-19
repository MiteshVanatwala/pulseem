import clsx from 'clsx'
import { AppBar, FormControl, Grid, MenuItem } from "@material-ui/core";
import PulseemNewLogo from "../../assets/images/PulseemNewLogo";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { setLanguage } from "../../redux/reducers/coreSlice";
import { IoIosArrowDown } from 'react-icons/io';
import EnImage from '../../assets/images/british.svg';
import IsraelImage from "../../assets/images/israel-flag-icon.svg";
import PolandImage from "../../assets/images/poland-flag-icon.svg";
import { setCookie } from '../../helpers/Functions/cookies';
import i18n from '../../i18n';

const SharedAppBar = ({ classes, title }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { windowSize, isRTL, language, imageURL } = useSelector((state: StateType) => state.core);

  const isBeeperDomain = window.location.hostname.includes('beeper');

  const changeLanguage = (value: any) => {
    setCookie('Culture', `${value}-${value === 'he' ? 'IL' : 'US'}`);
    i18n.changeLanguage(value);
    dispatch(setLanguage(value));
  }

  return <AppBar
    component="nav"
    className={clsx(classes.p10, classes.f18, classes.bold, classes.flexColCenter, windowSize === 'xl' ? classes.p10 : '')}
    style={isBeeperDomain ? { background: '#ffffff', color: '#333' } : {}}
    classes={isBeeperDomain ? {} : { root: classes.gradientBackground }}
  >
    <Grid container>
      <Grid md={2}></Grid>

      <Grid md={8} style={{ display: 'flex', alignItems: 'center' }}>
        {isBeeperDomain && imageURL
          ? <img src={imageURL as string} alt="Beeper" className={classes.appBarLogo} />
          : isBeeperDomain
            ? <img src={`${window.location.origin}/Pulseem/Images/beeper/beeper-logo.png`} alt="Beeper" style={{ height: 40 }} />
            : <PulseemNewLogo />
        }
        {title && title !== '' && <span className={clsx(classes.f25, classes.dInlineBlock, classes.pr10, classes.verticalAlignTop)} style={isBeeperDomain ? { color: '#333' } : {}}>
          -&nbsp;&nbsp;{title}
        </span>}
      </Grid>

      <Grid md={2} className={clsx(classes.w100, {
        [classes.textRight]: !isRTL,
        [classes.textLeft]: isRTL,
        [classes.mt10]: windowSize === 'sm' || windowSize === 'xs'
      })}>
        <FormControl variant='standard' className={clsx(classes.selectInputFormControl, classes.SignUpLanguageDropdown, classes.bgWhite)}>
          <Select
            variant="standard"
            value={language}
            name='TwoFactorAuthOptionID'
            onChange={(e: SelectChangeEvent) => changeLanguage(e.target.value)}
            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} style={{ right: isRTL ? 15 : 'auto', left: isRTL ? 'auto' : 15 }} />}
            MenuProps={{
              PaperProps: {
                style: {
                  width: 100,
                  maxHeight: 200,
                  direction: isRTL ? 'rtl' : 'ltr'
                },
              },
            }}
            className={clsx(classes.SignUpLanguageDropdown)}
          >
            <MenuItem value={'he'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
              <img width={35} src={IsraelImage} alt={t('languages.langCodes.hebrew')} />
              <label>{t('languages.langCodes.hebrew')}</label>
            </MenuItem>

            <MenuItem value={'en'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
              <img width={35} src={EnImage} alt={t('languages.langCodes.english')} />
              <label>{t('languages.langCodes.english')}</label>
            </MenuItem>
            
            <MenuItem value={'pl'} className={clsx(classes.SignUpLanguageDropdown, classes.cursorPointer)}>
              <img width={35} src={PolandImage} alt={t('languages.langCodes.polish')} />
              <label>{t('languages.langCodes.polish')}</label>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </AppBar>
}

export default SharedAppBar;