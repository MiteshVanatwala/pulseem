import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { RiCloseFill } from "react-icons/ri";
import clsx from 'clsx';
import React from 'react';
import { useSelector } from 'react-redux';


const PulseemTags = ({
    title,
    style,
    tagStyle,
    classes,
    icon = null,
    items = null,
    onShowModal = null,
    handleRemove = null
}) => {
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    return <Box className={classes.rightForm} style={{ ...style, position: 'relative' }}>
        <Box
            style={{ minHeight: 30, maxHeight: 40, position: 'relative' }}
            className={clsx(classes.sidebar, classes.contactGroupDiv, classes.dFlex)}
            onClick={() => onShowModal()}
        >
            {(!items || items.length <= 0) && <Box style={{ alignSelf: 'center', fontSize: 15 }}>{t(title)}</Box>}
            {items && items.length > 0 ? (
                <Box className={classes.mappedGroup} style={{ maxWidth: '90%' }}>
                    {items.map((item, index) => {
                        return (
                            <Box key={index} className={clsx(classes.selectedGroupsDiv)}>
                                <span className={clsx(classes.ellipsisText, classes.nameGroup)} title={item.Name} style={{ ...tagStyle }}>
                                    {item.Name}
                                </span>
                                <RiCloseFill
                                    className={classes.groupCloseicn}
                                    onClick={(event) => {
                                        handleRemove(event, item.ID);
                                    }}
                                />
                            </Box>
                        );
                    })}
                </Box>
            ) : null}

        </Box>
        {icon && <Box style={{
            alignItems: "center",
            position: 'absolute',
            right: !isRTL ? 15 : 'auto',
            left: !isRTL ? 'auto' : 15,
            fontSize: 26,
            cursor: 'pointer'
        }}
            onClick={() => onShowModal()}
        >{icon}</Box>}
    </Box>
}

export default PulseemTags;