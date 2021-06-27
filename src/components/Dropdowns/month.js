import { React, useState } from 'react';
import { FormControl, Select, MenuItem } from '@material-ui/core';
import { useTranslation } from 'react-i18next'

const DropdownMonthes = (
    { classes, isNumeric = true, isRTL, onChange = () => null, ...props }
) => {
    const { t } = useTranslation();
    const [selectedMonth, setselectedMonth] = useState(0);
    const monthes = [
        { ID: 0, Name: t('common.chooseMonth') },
        { ID: 1, Name: t('common.january') },
        { ID: 2, Name: t('common.february') },
        { ID: 3, Name: t('common.march') },
        { ID: 4, Name: t('common.april') },
        { ID: 5, Name: t('common.may') },
        { ID: 6, Name: t('common.june') },
        { ID: 7, Name: t('common.july') },
        { ID: 8, Name: t('common.august') },
        { ID: 9, Name: t('common.september') },
        { ID: 10, Name: t('common.october') },
        { ID: 11, Name: t('common.november') },
        { ID: 12, Name: t('common.december') }];


    const onMonthSelected = (e) => {
        const v = e.target.value;
        setselectedMonth(v);
        onChange(v);
    }
    return (
        <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%' }}>
            <Select
                style={{ width: "100%" }}
                onChange={onMonthSelected}
                value={selectedMonth}
                id={props.id}
            >
                {isNumeric ? (
                    monthes.map((n) => {
                        return (
                            <MenuItem key={n.ID} value={n.ID} style={{ direction: isRTL ? "rtl" : "ltr" }}>{n.ID}</MenuItem>
                        );
                    })
                ) : (
                    monthes.map((n) => {
                        return (
                            <MenuItem key={n.ID} value={n.ID} style={{ direction: isRTL ? "rtl" : "ltr" }}>{n.Name}</MenuItem>
                        );
                    })
                )}
            </Select>
        </FormControl>
    );
}

export default DropdownMonthes;