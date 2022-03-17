import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { Box, Checkbox, TextField } from '@material-ui/core';
import { RiCloseFill } from "react-icons/ri";
import { setSelectedGroups } from '../../redux/reducers/groupSlice';
import clsx from 'clsx';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';


const GroupTags = ({ classes,
    title = 'mainReport.ChooseLinks',
    onShowModal = () => null,
    style = null,
    dropDownProps = {
        selectedGroups: [],
        onChange: () => false
    },
    ...props
}) => {
    const { t } = useTranslation();
    const { selectedGroups, groupData } = useSelector((state) => state.group);
    const dispatch = useDispatch();

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;



    const handleRemoveGroup = (e, groupId) => {
        e.stopPropagation();
        e.preventDefault();
        const newList = selectedGroups.filter((g) => { return g.GroupID !== groupId });
        dispatch(setSelectedGroups(newList));
    }

    const CheckBoxPanel = () => (
        <Box className={classes.rightForm} style={{ ...style }}>
            <Box
                style={{ minHeight: 40, maxHeight: 40 }}
                className={clsx(classes.sidebar, classes.contactGroupDiv, classes.dFlex)}
                onClick={() => onShowModal()}
            >
                {(!selectedGroups || selectedGroups.length <= 0) && <Box style={{ alignSelf: 'center', fontSize: 15 }}>{t(title)}</Box>}
                {selectedGroups && selectedGroups.length > 0 ? (
                    <Box className={classes.mappedGroup} style={{ maxWidth: '100%' }}>
                        {selectedGroups.map((item, index) => {
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
            id="tags-outlined"
            // style={{ height: 100 }}
            debug={true}
            className={classes.autoCompleteTag}
            disableCloseOnSelect
            options={groupData?.Groups ?? []}
            getOptionLabel={(option) => option?.GroupName}
            defaultValue={groupData?.Groups?.reduce((prevVal, newVal) => {
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
                    label="Groups"
                    placeholder="Select Groups"
                />
            )}
        />
    )

    return props.dropdown ? DropDownPanel() : CheckBoxPanel()
}

export default GroupTags;