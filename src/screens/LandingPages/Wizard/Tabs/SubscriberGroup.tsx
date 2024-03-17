import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Box, Grid, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import Groups from '../../../../components/Groups/GroupsHandler/Groups';
import { Group } from '../../../../Models/Groups/Group';

const SubscriberGroup = ({ classes, data, onUpdate, onShowTestGroups, errors }: any) => {
    const { subAccountAllGroups } = useSelector((state: any) => state.group);
    const { testGroups } = useSelector((state: any) => state.sms);
    const [showTestGroups, setShowTestGroups] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<any>([]);
    const [allGroupsSelected, setAllGroupsSelected] = useState(false);

    const callbackUpdateGroups = (groups: any) => {
        const found = selectedGroups.map((group: Group) => { return group.GroupID; }).includes(groups.GroupID);
        const groupList: Group[] = found
            ? selectedGroups.filter((g: Group) => g.GroupID !== groups.GroupID)
            : [...selectedGroups, groups];
        setSelectedGroups(groupList);
        onUpdate({ ...data, GroupIDs: groupList.map(g => g.GroupID.toString()) })
    }

    const callbackSelectAll = () => {
        let groupList: Group[] = [];
        if (!allGroupsSelected) {
            groupList = showTestGroups ? [...testGroups, ...subAccountAllGroups] : [...subAccountAllGroups];
        } else {
            groupList = [];
        }
        setSelectedGroups(groupList);
        setAllGroupsSelected(!allGroupsSelected);
        onUpdate({ ...data, GroupIDs: groupList.map(g => g.GroupID.toString()) })
    }

    const onRemoveGroup = (leftGroups: Group[]) => {
        if (leftGroups && leftGroups?.length > 0) {
            setSelectedGroups(leftGroups);
            onUpdate({ ...data, GroupIDs: leftGroups.map(g => g.GroupID.toString()) })
        }
        else {
            setSelectedGroups([]);
            onUpdate({ ...data, GroupIDs: [] })
        }
    }

    useEffect(() => {
        if (data && data?.GroupIDs?.length > 0 && subAccountAllGroups.length > 0) {
            const selected = data.GroupIDs.map((x: any) => { return subAccountAllGroups.find((s: any) => s.GroupID === parseInt(x.trim())) })
            setSelectedGroups(selected);
        }
    }, [data, subAccountAllGroups]);

    return (
        <Grid container spacing={3} className={clsx(classes.p15)}>
            <Grid item md={12} xs={12}>
                <Box>
                    <Groups
                        classes={classes}
                        list={
                            subAccountAllGroups
                        }
                        // @ts-ignore
                        showTestGroups={false}
                        // test={showTestGroups}
                        selectedList={selectedGroups}
                        //@ts-ignore
                        callbackSelectedGroups={callbackUpdateGroups}
                        //@ts-ignore
                        callbackSelectAll={callbackSelectAll}
                        //@ts-ignore
                        callbackShowTestGroup={() => onShowTestGroups(!showTestGroups)}
                        callbackUpdateGroups={onRemoveGroup}
                        showSortBy={true}
                        showFilter={false}
                        showSelectAll={true}
                        isFilterSelected={false}
                        bsDot={null}
                        isNotifications={false}
                        isSms={false}
                        isCampaign={false}
                        noSelectionText={''}
                        //@ts-ignore
                        innerHeight={325}
                    />
                    <Box className='textBoxWrapper'>
                        <Typography className={clsx(errors.group ? classes.errorText : 'MuiFormHelperText-root', classes.f14)}>
                            {errors.group ?? errors.group}
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    )
}

export default SubscriberGroup;