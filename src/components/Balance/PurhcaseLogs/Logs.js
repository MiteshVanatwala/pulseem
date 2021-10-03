import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import NumberFormat from 'react-number-format'
import { useSelector } from 'react-redux'
import { Grid, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Checkbox } from '@material-ui/core';


const PurchaseLogs = ({ classes, data }) => {
    const { isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();
    const [selected, setSelected] = useState(null);
    const switchStatus = (status) => {
        switch (status) {
            case 0: {
                return "success";
            }
            case 1: {
                return "pending";
            }
            case 2: {
                return "fail";
            }
        }
    }
    const swithCampaignName = (campaignTypeId) => {
        switch (campaignTypeId) {
            case 1: {
                return "SMS";
            }
            case 3: {
                return "Newsletter";
            }
        }
    }
    const handleClick = (event, id) => {
        if (id === selected) {
            setSelected(null);
        }
        else {
            setSelected(id);
        }
    };

    return (
        <Grid container>
            <TableContainer>
                <Table
                    className={classes.table}
                    aria-labelledby="tableTitle"
                    size='small'
                    aria-label="enhanced table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={data.ID}
                                align='center'
                                sortDirection={data.ID}
                            >
                                Clone
                            </TableCell>
                            <TableCell
                                key={data.ID}
                                align='center'
                                sortDirection={data.ID}
                            >
                                ID
                            </TableCell>
                            <TableCell
                                key={data.Status}
                                align='center'
                            >
                                Status
                            </TableCell>
                            <TableCell
                                key={data.CampaignType}
                                align='center'
                            >
                                Type
                            </TableCell>
                            <TableCell
                                key={data.Quantity}
                                align='center'
                            >
                                Quantity
                            </TableCell>
                            <TableCell
                                key={data.Price}
                                align='center'
                            >
                                Price
                            </TableCell>
                            <TableCell
                                key={data.CreatedDate}
                                align='center'
                            >
                                Order date
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => {
                            const isItemSelected = selected === row.ID;
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                                <TableRow
                                    hover
                                    onClick={(event) => handleClick(event, row.ID)}
                                    role="checkbox"
                                    aria-checked={isItemSelected}
                                    tabIndex={-1}
                                    key={row.ID}
                                    selected={isItemSelected}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isItemSelected}
                                            inputProps={{ 'aria-labelledby': labelId }}
                                        />
                                    </TableCell>
                                    <TableCell component="th" id={labelId} scope="row" padding="none">
                                        {row.ID}
                                    </TableCell>
                                    <TableCell align="center">{switchStatus(row.Status)}</TableCell>
                                    <TableCell align="center">{swithCampaignName(row.CampaignType)}</TableCell>
                                    <TableCell align="center">{row.Quantity}</TableCell>
                                    <TableCell align="center">{row.Price}</TableCell>
                                    <TableCell align="center">{row.CreatedDate}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    )
}

export default PurchaseLogs;