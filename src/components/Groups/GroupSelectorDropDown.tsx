import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { Checkbox, Paper, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useEffect } from 'react';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { getAllGroupsBySubAccountId } from '../../redux/reducers/groupSlice';


const GroupSelectorDropDown = ({ classes,
  groupSelected,
  title = 'mainReport.ChooseLinks',
  onShowModal = () => null,
  onRemoveGroup = () => null,
  style = null,
  dropDownProps = {
    groups: {},
    selectedGroups: {},
    onChange: {}
  },
  error = '',
  helperText = '',
  containerStyle = {},
  ...props
}: any) => {
  const { t } = useTranslation();
  const { subAccountAllGroups } = useSelector((state: any) => state.group);
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const groupsToShow = dropDownProps?.groups !== null && dropDownProps?.groups?.length > 0 ? dropDownProps.groups : subAccountAllGroups;
  const handleRemoveGroup = (e: any, groupId: any) => {
    e.stopPropagation();
    e.preventDefault();
    const newList = groupSelected?.filter((g: number | any) => { return g !== groupId });
    onRemoveGroup(newList);
  }
  const handleSelectGroup = (e: any, groupId: any) => {
    e.stopPropagation();
    e.preventDefault();
    const newList = groupSelected ? [...groupSelected, groupId] : [groupId];
    dropDownProps?.onSelectGroup(newList);
  }
  const dispatch = useDispatch();

  const initGroups = async () => {
    if (!subAccountAllGroups || subAccountAllGroups?.length <= 0) {
      await dispatch(getAllGroupsBySubAccountId());
    }
  }

  useEffect(() => {
    initGroups();
  }, [])

  const DropDownPanel = () => (
    <Autocomplete
      multiple
      noOptionsText={t("group.noGroupFound")}
      id="tags-outlined"
      debug={true}
      className={classes.autoCompleteTag}
      disableCloseOnSelect
      options={groupsToShow ?? []}
      getOptionLabel={(option) => option?.GroupName}
      value={subAccountAllGroups.reduce((prevVal: any, newVal: any) => {
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
            value={option.GroupID}
            onChange={(e: any) => {
              if (!e.target.checked) {
                handleRemoveGroup(e, option.GroupID);
              }
              else {
                handleSelectGroup(e, option.GroupID)
              }
            }}
          />
          {option.GroupName}
        </React.Fragment>
      )}
      onChange={(e: any, newValue: any) => {
        // Get an array of the current group IDs from the newValue objects
        const currentGroupIds = newValue.map((item: any) => item.GroupID);

        // Check if we're adding or removing
        if (currentGroupIds.length < dropDownProps.selectedGroups.length) {
          // We're removing - find which one was removed
          const removedId = dropDownProps.selectedGroups.find(
            (id: number) => !currentGroupIds.includes(id)
          );
          if (removedId !== undefined) {
            handleRemoveGroup(e, removedId);
          }
        } else if (currentGroupIds.length > dropDownProps.selectedGroups.length) {
          // We're adding - find which one was added
          const addedId = currentGroupIds.find(
            (id: number) => !dropDownProps.selectedGroups.includes(id)
          );
          if (addedId !== undefined) {
            handleSelectGroup(e, addedId);
          }
        }
        // If lengths are equal, nothing changed, so do nothing
      }}
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
      PaperComponent={({ children }: any) => (
        <Paper className={classes.groupsAutoComplete} style={{ zIndex: 9000 }}>{children}</Paper>
      )}
    />

  )

  return DropDownPanel();
}

export default GroupSelectorDropDown;