
export const getSiteTrackingStyle = (windowSize, isRTL) => ({
    startElementNoRadius: {
        "& .MuiInputBase-formControl": {
            borderTopLeftRadius: isRTL ? 0 : null,
            borderBottomLeftRadius: isRTL ? 0 : null,
            borderTopRightRadius: !isRTL ? 0 : null,
            borderBottomRightRadius: !isRTL ? 0 : null,

        }
    },
    endElementNoRadius: {
        "& .MuiInputBase-root": {
            borderTopRightRadius: isRTL ? 0 : null,
            borderBottomRightRadius: isRTL ? 0 : null,
            borderTopLeftRadius: !isRTL ? 0 : null,
            borderBottomLeftRadius: !isRTL ? 0 : null,
        }
    },
    groupSelect: {
        minWidth: 200,
        maxWidth: '100%',
        width: '100%'
    },
    groupList: {
        "& .MuiTypography-displayBlock": {
            maxWidth: 250,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }
    }

});