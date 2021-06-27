import React, { useEffect, useState } from 'react';
import { FormControl, Select, MenuItem } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const DropdownYears = ({ classes, isRTL, onChange = () => null }) => {
    const currentYear = moment().format('YYYY');
    const [years, setYears] = useState(null);
    const [selectedYear, setSelectedYear] = useState(0);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const getExpirationYears = () => {
        const yearsArray = [{ ID: 0, Name: t("common.chooseYear") }];
        for (let i = 1; i <= 10; i++) {
            yearsArray.push({ ID: parseInt(currentYear) + i, Name: parseInt(currentYear) + i });
        }
        setYears(yearsArray);
    }

    useEffect(getExpirationYears, [dispatch]);

    const onYearSelected = (e) => {
        const v = e.target.value;
        setSelectedYear(v);
        onChange(v);
    }

    return (
        <FormControl variant="outlined" className={classes.formControl} style={{ width: '100%' }}>
            <Select
                style={{ width: "100%" }}
                onChange={onYearSelected}
                value={selectedYear}
            >
                {years !== null && years.map((y) => {
                    return (
                        <MenuItem key={y.ID} value={y.ID} style={{ direction: isRTL ? "rtl" : "ltr" }}>{y.Name}</MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}

export default DropdownYears;