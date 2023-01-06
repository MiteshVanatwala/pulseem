import * as React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import clsx from 'clsx';

const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 34,
    height: 20,
    padding: 0,
    display: 'flex',
    overflow: 'unset',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(11px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        '&.Mui-checked': {
            transform: 'translateX(13px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                background: theme.palette.mode === 'dark' ? '#177ddc' : 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
                border: '1px solid #fff'
            },
            '& .MuiSwitch-thumb': {
                background: '#fff',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 14,
        height: 14,
        margin: 1,
        borderRadius: 6,
        background: 'linear-gradient(90deg, #FF0076 1.31%, #FF0054 33.07%, #FF4D2A 134.74%)',
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 20,
        height: 20,
        opacity: 1,
        backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : '#fff',
        boxSizing: 'border-box',
        border: '1px solid #FF0076'
    },
}));

const PulseemSwitch = ({ classes, id, switchType, margin = 1, onChange = (par) => { }, checked = true, isRTL = true, ...props }) => {
    switch (switchType) {
        case "ios": {
            return (<IOSSwitch sx={{ m: margin }} checked={checked} onChange={onChange} {...props} />)
        }
        default: {
            return (<Switch
                className={
                    isRTL
                        ? clsx(classes.reactSwitchHe, "react-switch")
                        : clsx(classes.reactSwitch, "react-switch")
                }
                checked={checked}
                onChange={onChange}
                onColor="#28a745"
                checkedIcon={false}
                uncheckedIcon={false}
                handleDiameter={30}
                height={20}
                width={48}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                id={id}
            />)
        }
    }
}

export default PulseemSwitch;