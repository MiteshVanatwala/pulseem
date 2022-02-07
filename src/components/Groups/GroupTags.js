import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { Box } from '@material-ui/core';
import { RiCloseFill } from "react-icons/ri";
import { setSelectedGroups } from '../../redux/reducers/groupSlice';
import clsx from 'clsx';

const GroupTags = ({ classes,
    title = 'mainReport.ChooseLinks',
    onShowModal = () => null,
    style = null
}) => {
    const { t } = useTranslation();
    const { selectedGroups } = useSelector((state) => state.group);
    const dispatch = useDispatch();

    const handleRemoveGroup = (e, groupId) => {
        e.stopPropagation();
        e.preventDefault();
        const newList = selectedGroups.filter((g) => { return g.GroupID !== groupId });
        dispatch(setSelectedGroups(newList));
    }

    return (<Box className={classes.rightForm} style={{ ...style }}>
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
    </Box>)
}

export default GroupTags;