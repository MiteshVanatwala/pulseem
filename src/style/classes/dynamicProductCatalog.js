export const dynamicProductCatalog = (isRTL) => ({
    card: {
        backgroundColor: '#fff',
        display: 'inline-table',
    },
    imageBlock: {
        width: '35%',
        minHeight: '100px',
        height: '100%',
    },
    contentBlock: {
        width: '65%',
        verticalAlign: 'top',
        paddingTop: '10px',
        paddingBottom: '10px',
    },
    nameStyle: {
        fontSize: '1rem',
        paddingBottom: '10px',
        fontWeight: 'bold',
        paddingLeft: '10px',
    },
    bodyStyle: {
        fontSize: '0.8rem',
        paddingBottom: '10px',
        paddingLeft: '10px',
    },
    buttonStyle: {
        backgroundColor: '#38afe1',
        color: '#fff',
        width: 'initial',
        padding: '5px 10px',
        borderRadius: '5px',
        fontWeight: '500',
        marginLeft: '10px',
        border: 'none',
    },
    productCatalogContainer: {
        maxWidth: '70% !important',
        width: '70% !important',
        padding: '10px !important'
    },
    dialogContainers: {
        width: '100%',
        '& .MuiPaper-root': {
          width: '70% !important',
          maxWidth: '70% !important',
          padding: '20px'
        }
    }
});