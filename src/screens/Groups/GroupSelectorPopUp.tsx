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
                    const newArr: any[] = [...newSelection];

                    newArr.push(newGroupId);
                    setNewSelection(newArr);
                    setInputGroup('');
                })
                break;
            }
        }
        setShowLoader(false);
    }

    const options = {
        open: isOpen,
        title: t(title),
        onCancel,
        onClose,
        onConfirm,
        renderButtons: false,
        showDefaultButtons: true,
        children: subAccountAllGroups && <>
            <Typography>{t(title)}</Typography>
            <Select
                value={newSelection}
                multiple
                onChange={(event: any, val: any) => {
                    const arr: string[] = event.target.value;
                    setNewSelection(arr);
                }}
                input={<Input />}
                renderValue={() => {
                    const selected: string[] = subAccountAllGroups?.filter((group: any) => {
                        if (newSelection?.indexOf(group.GroupID) > -1) {
                            return group.GroupName;
                        }
                    });

                    if (selected) {
                        // @ts-ignore
                        return selected.map((g) => { return g.GroupName }).join(',');
                    }

                    return selected;
                }}
            >
                <MenuItem key={0}>{t('integrations.selectGroup')}</MenuItem>
                {subAccountAllGroups?.map((g: any) => {
                    return <MenuItem key={g.GroupName} value={g.GroupID}>
                        <Checkbox checked={newSelection.indexOf(g.GroupID) > -1} />
                        <ListItemText primary={g.GroupName} />
                    </MenuItem>
                })}
            </Select>
            <Divider />
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
        </>,
        paperStyle: classes.packageDialogPpaper
    }

    return (<>
        {subAccountAllGroups && <BaseDialog classes={classes} {...options} />}
        <Loader isOpen={showLoader} showBackdrop={true} />
    </>
    );
}

export default GroupSelectorPopUp;