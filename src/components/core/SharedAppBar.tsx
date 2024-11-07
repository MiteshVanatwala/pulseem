import clsx from 'clsx'
import { AppBar, FormControl, Grid, MenuItem } from "@material-ui/core";
import PulseemNewLogo from "../../assets/images/PulseemNewLogo";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { setLanguage } from "../../redux/reducers/coreSlice";
import { IoIosArrowDown } from 'react-icons/io';
import USImage from "../../assets/images/united-states-flag-icon.svg";
import IsraelImage from "../../assets/images/israel-flag-icon.svg";
import { setCookie } from '../../helpers/Functions/cookies';
import i18n from '../../i18n';

const SharedAppBar = ({ classes, title }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { windowSize, isRTL } = useSelector((state: StateType) => state.core);

  const changeLanguage = (value: any) => {
    setCookie('Culture', `${value}-${value === 'he' ? 'IL' : 'US'}`);
    i18n.changeLanguage(value);
    dispatch(setLanguage(value));
  }

  return <AppBar component="nav" className={clsx(classes.p10, classes.f18, classes.bold, classes.flexColCenter, classes.gradientBackground, windowSize === 'xl' ? classes.p10 : '')}>
    <Grid container>
      <Grid md={2}></Grid>

      <Grid md={8}>
        <PulseemNewLogo />
        {title && title !== '' && <span className={clsx(classes.f25, classes.dInlineBlock, classes.pr10, classes.verticalAlignTop)}>
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
            value={isRTL ? 'he' : 'en'}
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
              <img width={35} src={USImage} alt={t('languages.langCodes.english')} />
              <label>{t('languages.langCodes.english')}</label>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </AppBar>
}

export default SharedAppBar;