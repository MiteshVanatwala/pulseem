import clsx from 'clsx';
import {
    Grid, FormControl, MenuItem, InputLabel
} from '@material-ui/core'
import 'moment/locale/he';
import { Select } from '@mui/material';
import { IoIosArrowDown } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import moment from "moment";

const UpdateGroup = ({ classes, data, onUpdate }: any) => {
    const { t } = useTranslation();
    const dateFormat = 'YYYY-MM-DD HH:mm:ss'

    return (
        <Grid container className={classes.pt25}>
            <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.updateGroupRecipientsEvery')}:</InputLabel>
                <FormControl
                    variant="standard"
                    className={clsx(classes.selectInputFormControl, classes.w50)}
                >
                    <Select
                        variant='standard'
                        value={data.Group?.DynamicUpdatePolicy}
                        onChange={(event: any) => { onUpdate('DynamicUpdatePolicy', event.target.value) }}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        className={clsx(classes.w100, classes.mt20)}
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300,
                                },
                            },
                        }}
                    >
                        <MenuItem value={0}>{t('common.daily2AM')}</MenuItem>
                        <MenuItem value={1}>{t('common.weekly2AM')}</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.UpdatedOn')}:</InputLabel>
                <div className={clsx(classes.pt10)}>
                    <>{moment(data?.Group?.DynamicLastUpdate).format(dateFormat)}</>
                </div>
            </Grid>
            <Grid item xs={4} sm={4} md={4} className={clsx(classes.p10)}>
                <InputLabel className={classes.fBlack}>{t('common.numberOfClientsInGroup')}:</InputLabel>
                <div className={clsx(classes.pt10)}>
                    {data?.Group?.Recipients?.toLocaleString()}
                </div>
            </Grid>
        </Grid>
    )
}

export default UpdateGroup;