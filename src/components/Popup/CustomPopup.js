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
    makeStyles,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Input
} from '@material-ui/core';



import { GrGroup } from 'react-icons/gr'
import { BsInfoSquare } from 'react-icons/bs'

import { useTheme } from '@material-ui/core/styles';

// const useStyles = makeStyles({
//     dialog: {
//         "& div": {
//             padding: 20
//         }
//     },
//     box: {
//         padding: 10,
//         border: '2px #0371ad solid'
//     },
//     iconBox: {
//         top: 0,
//         left: 0,
//         padding: 10,
//         background: '#0371ad',
//         borderRadius: '0% 0% 100% 0% / 0% 0% 100% 0%',
//         maxWidth: 'max-content',
//         overflow: 'overlay',
//         color: '#fff',
//         position: 'absolute',
//     },
//     title: {
//         marginLeft: 30,
//         '& h2': { fontSize: (props) => props.titleSize || 35 }
//     },
//     contentBox: {
//         display: 'flex',
//         '& *': {
//             alignSelf: 'center'
//         },
//         '& .MuiTextField-root': {
//             // paddingRight: 0,
//             '& .MuiOutlinedInput-root ': {
//                 padding: 0,
//                 '& .MuiOutlinedInput-input': {
//                     padding: 5
//                 }
//             },

//         },
//         // '& .MuiOutlinedInput-input': {
//         //     fontSize: 16
//         //   }
//     }
// })

export default function CustomPopup({ isOpen, className, children, handleClose, ...props }) {
    // const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    // const localClasses = useStyles({
    //     titleSize: titleSize
    // });
    // console.log(localClasses.title)
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    // const handleClickOpen = () => {
    //     setOpen(true);
    // };

    // const handleClose = () => {
    //     setOpen(false);
    // };

    return (
        <div>
            <Dialog
                fullScreen={fullScreen}
                open={isOpen}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                className={className}
            >
                {children}
            </Dialog>
        </div>
    );
}
