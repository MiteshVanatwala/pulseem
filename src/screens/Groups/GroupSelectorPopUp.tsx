import { Box, Button, Checkbox, Divider, Grid, Input, ListItemText, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { BaseDialog } from "../../components/DialogTemplates/BaseDialog";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getGroupsBySubAccountId } from "../../redux/reducers/groupSlice";
import { useEffect, useState } from "react";
import { Loader } from "../../components/Loader/Loader";
import clsx from 'clsx';
import { createGroup } from "../../redux/reducers/groupSlice";
import { DEFAULT_NEW_GROUP } from "../../helpers/Constants";
import { Autocomplete } from "@mui/material";
import { MdOutlineCheckBox } from "react-icons/md";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";


interface GroupSelection {
    classes: any;
    title: any | never;
    onCancel: any | never;
    onClose: any | never;
    onConfirm: any;
    isOpen: boolean;
    selectedGroups: Array<number> | never | any;
}

const GroupSelectorPopUp = ({
    classes,
    title = 'integrations.selectGroup',
    selectedGroups = [],
    onCancel = () => { },
    onClose = () => { },
    onConfirm = () => { },
    isOpen
}: GroupSelection) => {
    const { t } = useTranslation();
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { isRTL } = useSelector((state: any) => state.core);
    const dispatch = useDispatch();
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [newSelection, setNewSelection] = useState<any[]>(selectedGroups)
    const [inputGroup, setInputGroup] = useState<string>('');
    const [groupNameExist, setGroupNameExist] = useState<boolean>(false);

    const getGroups = async () => {
        setShowLoader(true);
        await dispatch(getGroupsBySubAccountId()) as any;
        setShowLoader(false);
    }
    useEffect(() => {
        if (subAccountAllGroups?.length <= 0) {
            getGroups();
        }
    });

    const handleCreateGroup = async () => {
        const newGroupTemplate = DEFAULT_NEW_GROUP;
        newGroupTemplate.GroupName = inputGroup;
        setShowLoader(true);
        // @ts-ignore
        const response = await dispatch(createGroup(newGroupTemplate)) as any;

        switch (response?.payload?.StatusCode) {
            case 201: {
                getGroups().then(() => {
                    const newGroupId: number = parseInt(response?.payload?.Message);
                    let tempSelection: any[] = [...newSelection];

                    tempSelection.push(newGroupId);
                    setNewSelection(tempSelection);
                    setInputGroup('');
                })
                break;
            }
        }
        setShowLoader(false);
    }

    const onGroupSelect = (a: any, groups: any, eventType: any, item: any) => {
        let tempSelection: any[] = [...newSelection];

        if (tempSelection?.indexOf(item.option.GroupID) > -1) {
            tempSelection = tempSelection?.filter((g: any) => { return g.GroupID !== item.GroupID });
        }
        else {
            tempSelection = groups?.map((x: any) => x.GroupID);
        }

        setNewSelection(tempSelection);
    }

    const renderGroupList = () => {
        return (
            <Autocomplete
                multiple
                className={classes.autoComplete}
                id="groups-selection"
                options={subAccountAllGroups}
                disableCloseOnSelect
                value={subAccountAllGroups.reduce((prevVal: any, newVal: any) => {
                    if (newSelection.indexOf(newVal.GroupID) !== -1) {
                        return [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }]
                    }
                    else {
                        return [...prevVal]
                    }
                }, [])}
                getOptionLabel={(group: any) => group.GroupName}
                renderOption={(props, group, { selected }) => (
                    <li {...props} style={{ direction: isRTL ? 'rtl' : 'ltr', maxWidth: '100%' }}>
                        <Checkbox
                            icon={<MdOutlineCheckBoxOutlineBlank />}
                            checkedIcon={<MdOutlineCheckBox />}
                            style={{ marginRight: 8 }}
                            checked={newSelection?.indexOf(group.GroupID) > -1}
                        />
                        {group.GroupName}
                    </li>
                )}
                onChange={onGroupSelect}
                style={{ width: 500 }}
                renderInput={(params) => (
                    <TextField {...params} label={t('integrations.selectGroup')} placeholder={t('integrations.selectGroup')} />
                )}
            />
        );
    }

    const options = {
        open: isOpen,
        title: t(title),
        onCancel,
        onClose,
        onConfirm: () => {
            onConfirm(newSelection);
        },
        renderButtons: false,
        showDefaultButtons: true,
        children: subAccountAllGroups && <Box className={classes.dFlex} style={{ width: '100%', flexDirection: 'column' }}>
            <Box>{renderGroupList()}</Box>
            <Divider />
            <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 25 }}>- {t('common.or')} -</Box>
            <Box className={classes.pt15}>
                <Typography>{t('dashboard.createGroup')}</Typography>
                <Box className={classes.dFlex}>
                    <TextField
                        placeholder={t('smsReport.groupName')}
                        variant='outlined'
                        size='small'
                        value={inputGroup}
                        onChange={(e) => setInputGroup(e.target.value)}
                        className={clsx(classes.w100, classes.textField)}
                    />
                    <Button className={clsx(classes.btn, classes.btnRounded, classes.mlr10, !inputGroup || inputGroup === '' ? classes.disabled : null)} onClick={handleCreateGroup}>
                        {t("mainReport.save")}
                    </Button>
                    {groupNameExist ? <span style={{ marginTop: "8px", color: "red", fontSize: "12px", display: 'block' }}>{t("sms.groupNameExists").replace("#groupName#", groupValue)}</span> : null}
                </Box>
            </Box>
        </Box>,
        paperStyle: classes.packageDialogPpaper
    }

    return (<>
        {subAccountAllGroups && <BaseDialog classes={classes} {...options} disableBackdropClick={true} />}
        <Loader isOpen={showLoader} showBackdrop={true} />
    </>
    );
}

export default GroupSelectorPopUp;