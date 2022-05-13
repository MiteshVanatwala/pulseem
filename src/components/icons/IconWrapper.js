import { Box, makeStyles } from "@material-ui/core";
import {
    CopyIcon,
    DeleteIcon,
    AutomationIcon,
    PreviewIcon,
    // AddRecipient,
    // AddRecipients,
    // Reset,
    SettingsIcon,
} from "../../assets/images/managment/index";
// import NotAvailable from "../../assets/images/notAvailable.png";

const Icons = {
    default: {
        type: 1,
        url: '',
    },
    copy: {
        type: 1,
        url: CopyIcon,
    },
    delete: {
        type: 1,
        url: DeleteIcon,
    },
    automation: {
        type: 1,
        url: AutomationIcon,
    },
    preview: {
        type: 1,
        url: PreviewIcon,
    },
    // addRecipient: {
    //     type: 1,
    //     url: AddRecipient,
    // },
    // addRecipients: {
    //     type: 1,
    //     url: AddRecipients,
    // },
    // reset: {
    //     type: 1,
    //     url: Reset,
    // },
    settings: {
        type: 1,
        url: SettingsIcon,
    },
    alert: {
        type: 2,
        comp: "i",
    },
};

const useStyles = makeStyles((theme) => ({
    box: {
        fontSize: 32,
        width: 25,
        height: 'auto',
        color: "#000000",
        "& img": {
            maxWidth: "100%",
        },
    },
}));

const IconWrapper = ({ iconName = "", onClick = () => false, ...props }) => {
    const classes = useStyles();
    const icon = Icons[iconName || "default"];
    return (
        <Box
            className={`${classes.box} ${props.className ?? ""}`}
            classes={props.classes}
            onClick={onClick}
        >
            {icon?.type === 1 ? <img src={icon?.url} alt={icon?.url} /> : icon?.comp}
        </Box>
    );
};

export default IconWrapper;
