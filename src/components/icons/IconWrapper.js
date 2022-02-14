import { Box, makeStyles } from '@material-ui/core'
import React from 'react'
import { CopyIcon, DeleteIcon, AutomationIcon, PreviewIcon } from '../../assets/images/managment/index'
import NotAvailable from '../../assets/images/notAvailable.png'

const Icons = {
    default: {
        type: 1,
        url: NotAvailable
    },
    copy: {
        type: 1,
        url: CopyIcon
    },
    delete: {
        type: 1,
        url: DeleteIcon
    },
    automation: {
        type: 1,
        url: AutomationIcon
    },
    preview: {
        type: 1,
        url: PreviewIcon
    },
    alert: {
        type: 2,
        comp: "i"
    },
}

const useStyles = makeStyles((theme) => ({
    box: {
        fontSize: 32,
        width: 40,
        height: 40,
        color: '#000000',
        '& img': {
            maxWidth: '100%'
        }
    }
}));

const IconWrapper = ({ iconName = '', ...props }) => {
    const classes = useStyles()
    const icon = Icons[iconName || 'default'];
    return (
        <Box className={`${classes.box} ${props.className ?? ''}`} classes={props.classes}>
            {
                icon.type === 1 ?
                    <img src={icon.url} alt={icon.url} />
                    :
                    icon.comp
            }
        </Box>
    )
}

export default IconWrapper