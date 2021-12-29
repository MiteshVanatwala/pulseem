/* eslint-disable no-use-before-define */

import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { Typography, Chip } from '@material-ui/core';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const CheckboxGroups = ({
    classes,
    isMultipleSelect = true,
    groups,
    selectedGroups,
    onSelect = () => null,
    ...props
}) => {
    const onInputChange = (_, __, eventType, item) => {
        onSelect(item.option, eventType === 'remove-option');
    }

    return (
        <Autocomplete
            value={selectedGroups}
            multiple={isMultipleSelect}
            includeInputInList={true}
            id="chk_groupList"
            options={groups}
            disableCloseOnSelect
            onChange={(option, selected, eventType, item) => onInputChange(option, selected, eventType, item)}
            getOptionLabel={(option) => option.GroupName}
            renderOption={(option, { selected }) => (
                <React.Fragment>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                        color="primary"
                    />
                    <Typography className={classes.ellipsisText}>{option.GroupName}</Typography>
                </React.Fragment>
            )}
            style={{ width: 500, ...props.style }}
            renderInput={(params) => {
                return (
                    <TextField
                        color="primary"
                        {...params}
                        variant="outlined"
                        placeholder={props.labelText}
                    />
                )
            }
            }
        />
    );
}

export default CheckboxGroups;