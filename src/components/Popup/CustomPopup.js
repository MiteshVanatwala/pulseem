import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useMediaQuery,
    Box,
    makeStyles
} from '@material-ui/core';

import { GrGroup } from 'react-icons/gr'

import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles({
    dialog: {
        padding: 20
    },
    box: {
        padding: 10,
        border: '2px #0371ad solid'
    },
    iconBox: {
        padding: 20,
        background: '#0371ad',
        borderRadius: '0% 100% 0% 100% / 0% 0% 100% 100%',
        maxWidth: 'max-content',
        '& svg': { marginLeft: -10 }
    }
})

export default function CustomPopup() {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const localClasses = useStyles();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                Open responsive dialog
            </Button>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                className={localClasses.dialog}
            >
                <Box className={localClasses.iconBox}>
                    <GrGroup size={60} />
                </Box>
                <Box className={localClasses.box}>
                    <DialogTitle id="responsive-dialog-title">{"Use Google's location service?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Let Google help apps determine location. This means sending anonymous location data to
                            Google, even when no apps are running.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={handleClose} color="primary">
                            Disagree
                        </Button>
                        <Button onClick={handleClose} color="primary" autoFocus>
                            Agree
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </div>
    );
}
