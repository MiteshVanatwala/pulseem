import React, { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Grid, Checkbox, Select, InputLabel, FormControl, OutlinedInput, MenuItem, ListItemText } from '@material-ui/core';


const PurchaseLogs = ({ classes, data }) => {
    const { isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();
    const [selectedProductId, setProductID] = useState([]);

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        console.log(value);
        setProductID(value);
    };

    return (
        <Grid container>
            <Grid item xs={12}>
                <FormControl  style={{width: '100%', marginTop: 15}}>
                    <InputLabel id="demo-multiple-checkbox-label">Purchase history</InputLabel>
                    <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        value={selectedProductId}
                        onChange={handleChange}
                        input={<OutlinedInput label="Purchase history" />}
                        renderValue={(selected) => selected}
                        MenuProps={MenuProps}
                    >
                        {data.map((d) => (
                            <MenuItem key={d.ID} value={d.ID} style={{paddingRight: 15}}>
                                <Checkbox checked={selectedProductId} />
                                <ListItemText primary={d.Name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            {/* <TableContainer>
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
            </TableContainer> */}
        </Grid>
    )
}

export default PurchaseLogs;