import clsx from 'clsx';
import { Box, Checkbox, FormControl, ListItemText, MenuItem, Select } from '@material-ui/core'
import 'moment/locale/he';
import { IoIosArrowDown } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { CampaignType } from '../../../../Models/Common/CampaignTypes';


interface CampaignArgs {
  classes: any | never;
  Value: string | any;
  Disabled: Boolean | any;
  OnUpdate: (event: any) => {} | void;
}

const SelectCampaignType = (args: CampaignArgs) => {
  const { t } = useTranslation();

  const { classes, Value, Disabled, OnUpdate }: CampaignArgs = args;

  return <>
    <FormControl
      variant="standard"
      className={clsx(classes.selectInputFormControl, classes.w100)}
    >
      <Select
        disabled={Disabled}
        variant='standard'
        multiple
        value={Value || []}
        onChange={OnUpdate}
        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
        className={clsx(classes.w100, classes.mt10, Disabled ? classes.disabled : null)}
        renderValue={() => {
          const arr: string[] = [];
          Value?.forEach((campaignType: number) => {
            switch (campaignType) {
              case CampaignType.All: {
                arr.push(t('common.All'));
                break;
              }
              case CampaignType.Newsletter: {
                arr.push(t('master.RadMenuItemResource12.Text'));
                break;
              }
              case CampaignType.SMS: {
                arr.push(t('master.RadMenuItemResource100.Text'));
                break;
              }
              case CampaignType.Whatsapp: {
                arr.push(t('master.whatsapp'));
                break;
              }
            }
          })
          return <Box className={classes.elipsis} style={{ maxWidth: 'calc(100% - 30px)' }}>{arr?.join(',')}</Box>;
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300
            },
          },
        }}
      >
        <MenuItem key={CampaignType.All} value={CampaignType.All}>
          <Checkbox checked={Value?.indexOf(CampaignType.All) > -1} />
          <ListItemText primary={t('common.All')} />
        </MenuItem>
        <MenuItem key={CampaignType.Newsletter} value={CampaignType.Newsletter}>
          <Checkbox disabled={Value?.indexOf(CampaignType.All) > -1} checked={Value?.indexOf(CampaignType.All) > -1 || Value?.indexOf(CampaignType.Newsletter) > -1} />
          <ListItemText primary={t('master.RadMenuItemResource12.Text')} />
        </MenuItem>
        <MenuItem key={CampaignType.SMS} value={CampaignType.SMS}>
          <Checkbox disabled={Value?.indexOf(CampaignType.All) > -1} checked={Value?.indexOf(CampaignType.All) > -1 || Value?.indexOf(CampaignType.SMS) > -1} />
          <ListItemText primary={t('master.RadMenuItemResource100.Text')} />
        </MenuItem>
        <MenuItem key={CampaignType.Whatsapp} value={CampaignType.Whatsapp}>
          <Checkbox disabled={Value?.indexOf(CampaignType.All) > -1} checked={Value?.indexOf(CampaignType.All) > -1 || Value?.indexOf(CampaignType.Whatsapp) > -1} />
          <ListItemText primary={t('master.whatsapp')} />
        </MenuItem>
      </Select>
    </FormControl>
  </>
}

export default SelectCampaignType;