import * as React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import clsx from 'clsx';

const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 47,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: 3,
        transitionDuration: '300ms',
        '&.Mui-checked': {
            transform: 'translateX(22px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
                opacity: 1,
                border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color:
                theme.palette.mode === 'light'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[600],
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 17,
        height: 17,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === 'light' ? '#8b8b8b' : '#28a745',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
    },
}));

const PulseemSwitch = ({ classes, id, switchType, props, margin = 1, onChange = () => null, checked = true, isRTL = true }) => {
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
    return <></>
}

export default PulseemSwitch;