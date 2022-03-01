import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { RiCloseFill } from "react-icons/ri";
import clsx from 'clsx';
import { useSelector } from 'react-redux'
import React, { useState, useEffect } from 'react';

const GroupTags = ({ classes,
    groupSelected,
    title = 'mainReport.ChooseLinks',
    onShowModal = () => null,
    onRemoveGroup = () => null,
    style = null
}) => {
    const { t } = useTranslation();
    const { subAccountAllGroups } = useSelector((state) => state.group);
    const [groups, setGroups] = useState([]);

    const handleRemoveGroup = (e, groupId) => {
        e.stopPropagation();
        e.preventDefault();
        const newList = groups.filter((g) => { return g.GroupID !== groupId });
        onRemoveGroup(newList);
    }

    useEffect(() => {
        if (groupSelected && subAccountAllGroups) {
            let tmpGroups = [];
            groupSelected.forEach((grp) => {
                const findGroup = subAccountAllGroups.find((g) => { return g.GroupID === grp });
                if (findGroup) {
                    tmpGroups.push(findGroup)
                }
            });

            setGroups(tmpGroups);
        }
    }, [groupSelected])

    return (<Box className={classes.rightForm} style={{ ...style }}>
        <Box
            style={{ minHeight: 40, maxHeight: 40, width: '100%' }}
            className={clsx(classes.sidebar, classes.contactGroupDiv, classes.dFlex)}
            onClick={() => onShowModal()}
        >
            {(!groups || groups.length <= 0) && <Box style={{ alignSelf: 'center', fontSize: 15 }}>{t(title)}</Box>}
            {groups && groups.length > 0 ? (
                <Box className={classes.mappedGroup} style={{ width: '100%' }}>
                    {groups.map((item, index) => {
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
    </Box>)
}

export default GroupTags;