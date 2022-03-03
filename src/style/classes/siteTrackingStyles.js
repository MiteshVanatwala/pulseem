
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
    },
    editorContainer: {
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column'
    },
    buttonContainer: {
        marginTop: 'auto',
        marginBottom: 70
    },
    domainAddress: {
        '& input': {
            textAlign: isRTL ? 'right' : 'left',
            direction: 'ltr'
        }
    },
    deleteButtonContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        display: 'flex',
        marginBottom: 10,
        '& .MuiButton-root:hover': {
            backgroundColor: 'transparent'
        }
    },
    arrowContainer: {
        height: windowSize !== 'xs' ? 50 : 30,
        width: '5%',
        minWidth: 80,
        display: 'flex',
        justifyContent: windowSize !== 'xs' ? 'center' : 'flex-start',
        marginTop: windowSize !== 'xs' ? 40 : 10,
        alignItems: 'center'
    },
    eventPageContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: windowSize !== 'xs' ? '50%' : 'calc(100% - 20px)'
    },
    eventGroupsContainer: {
        display: 'flex',
        width: windowSize !== 'xs' ? 460 : 'calc(100% - 20px)',
        maxWidth: 1600
    }
});