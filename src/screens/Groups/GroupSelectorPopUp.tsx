import { Box, Button, Checkbox, Divider, TextField, Typography } from "@material-ui/core";
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
    const [isRequired, setIsRequired] = useState<boolean>(false);

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
    useEffect(() => {
        if (subAccountAllGroups?.length > 0) {
            setShowLoader(false);
        }
    }, [subAccountAllGroups])

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
            case 422: {
                setGroupNameExist(true);
                break;
            }
        }
        setShowLoader(false);
    }

    const onGroupSelect = (a: any, groups: any, eventType: any, item: any) => {

        let tempSelection: any[] = [...newSelection];

        if (eventType === 'clear') {
            tempSelection = [];
        }
        else {
            if (tempSelection?.indexOf(item.option.GroupID) > -1) {
                tempSelection = tempSelection?.filter((gid: any) => { return gid !== item.option.GroupID });
            }
            else {
                tempSelection = groups?.map((x: any) => x.GroupID);
            }
        }

        setNewSelection(tempSelection);
    }

    const renderGroupList = () => {
        return (
            <Autocomplete
                multiple
                placeholder={t(title)}
                className={classes.autoComplete}
                id="groups-selection"
                options={subAccountAllGroups}
                disableCloseOnSelect
                isOptionEqualToValue={(option, value) => {
                    return option?.GroupID === value.GroupID;
                }}
                value={subAccountAllGroups?.reduce((prevVal: any, newVal: any) => {
                    if (newSelection.indexOf(newVal.GroupID) !== -1) {
                        return [...prevVal, { GroupID: newVal.GroupID, GroupName: newVal.GroupName }]
                    }
                    else {
                        return [...prevVal]
                    }
                }, [])}
                getOptionLabel={(group: any) => group.GroupName}
                renderOption={(props, group, { selected }) => {
                    return (
                        <li {...props} style={{ direction: isRTL ? 'rtl' : 'ltr', maxWidth: '100%' }}>
                            <Checkbox
                                style={{ marginRight: 8 }}
                                checked={newSelection?.indexOf(group.GroupID) > -1}
                            />
                            {group.GroupName}
                        </li>
                    )
                }}
                onChange={onGroupSelect}
                style={{ width: 400 }}
                renderInput={(params) => (
                    // @ts-ignore
                    <TextField {...params}
                        placeholder={t('group.typeGroupNameAutocomplete')}
                        className={clsx(classes.bottomShadow, classes.tagSelected, classes.sidebar, isRequired && classes.error)} style={{ maxHeight: 45 }}></TextField>
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
            if (newSelection.length === 0) {
                setIsRequired(true);
                return false;
            }
            onConfirm(newSelection);
        },
        renderButtons: false,
        showDefaultButtons: true,
        children: subAccountAllGroups && <Box className={classes.dFlex} style={{ width: '100%', flexDirection: 'column' }}>
            <Box>{t(title)}</Box>
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
                </Box>
            </Box>
            {groupNameExist ? <Box>
                <span style={{ marginTop: "8px", color: "red", fontSize: "14px", display: 'block' }}>{t("sms.groupNameExists").replace("#groupName#", inputGroup)}</span>
            </Box> : null}
        </Box>,
        paperStyle: classes.packageDialogPpaper
    }

    return (<>
        {subAccountAllGroups && <BaseDialog classes={classes} {...options} disableBackdropClick={true} />}
        <Loader isOpen={showLoader} showBackdrop={true} zIndex={999999999} />
    </>
    );
}

export default GroupSelectorPopUp;