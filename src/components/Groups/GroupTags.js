import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { Box, Checkbox, Paper, TextField } from '@material-ui/core';
import { RiCloseFill } from "react-icons/ri";
import clsx from 'clsx';
import { Autocomplete } from '@material-ui/lab';
import React, { useState, useEffect } from 'react';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { setSelectedGroups } from '../../redux/reducers/groupSlice';


const GroupTags = ({ classes,
    groupSelected,
    title = 'mainReport.ChooseLinks',
    onShowModal = () => null,
    onRemoveGroup = () => null,
    style = null,
    dropDownProps = {
        selectedGroups: [],
        onChange: () => false
    },
    error = '',
    helperText = '',
    ...props
}) => {
    const { t } = useTranslation();
    const [groups, setGroups] = useState([]);
    const { selectedGroups, subAccountAllGroups } = useSelector((state) => state.group);
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const dispatch = useDispatch();

    const handleRemoveGroup = (e, groupId) => {
        e.stopPropagation();
        e.preventDefault();
        const newList = groupSelected.filter((g) => { return g !== groupId });
        onRemoveGroup(newList);
    }

    const CheckBoxPanel = () => (
        <Box className={classes.rightForm} style={{ ...style }}>
            <Box
                style={{ minHeight: 40, maxHeight: 40 }}
                className={clsx(classes.sidebar, classes.contactGroupDiv, classes.dFlex)}
                onClick={() => onShowModal()}
            >
                {(!groupSelected || groupSelected.length <= 0) && <Box style={{ alignSelf: 'center', fontSize: 15 }}>{t(title)}</Box>}
                {groupSelected && groupSelected.length > 0 ? (
                    <Box className={classes.mappedGroup} style={{ maxWidth: '100%' }}>
                        {subAccountAllGroups.filter((g) => groupSelected.indexOf(g.GroupID) > -1).map((item, index) => {
                            return (
                                <Box key={index} className={clsx(classes.selectedGroupsDiv)}>
                                    <span className={clsx(classes.ellipsisText, classes.nameGroup)}>
                                        {item.GroupName}
                                    </span>
                                    <RiCloseFill
                                        className={classes.groupCloseicn}
                                        onClick={(event) => {
                                            handleRemoveGroup(event, item.GroupID);
                                        }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                ) : null}
            </Box>
        </Box>
    )

    const DropDownPanel = () => (
        <Autocomplete
            multiple
            noOptionsText={t("group.noGroupFound")}
            id="tags-outlined"
            debug={true}
            className={classes.autoCompleteTag}
            disableCloseOnSelect
            options={subAccountAllGroups ?? []}
            getOptionLabel={(option) => option?.GroupName}
            defaultValue={subAccountAllGroups.reduce((prevVal, newVal) => {
                if (dropDownProps.selectedGroups.indexOf(newVal.GroupID) !== -1) {
                    return [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }]
                }
                else {
                    return [...prevVal]
                }
            }, [])}
            renderOption={(option, { selected }) => (
                <React.Fragment>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={dropDownProps?.selectedGroups?.indexOf(option.GroupID) !== -1}
                        color="primary"
                    />
                    {option.GroupName}
                </React.Fragment>
            )}
            onChange={dropDownProps?.onChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label={t("common.Groups")}
                    placeholder={t("siteTracking.selectGroups")}
                    error={error}
                    helperText={helperText}
                />
            )}
            PaperComponent={({ children }) => (
                <Paper className={classes.groupsAutoComplete}>{children}</Paper>
            )}
        />

    )

    return props.dropdown ? DropDownPanel() : CheckBoxPanel()
}

export default GroupTags;
