import { Box, makeStyles } from "@material-ui/core";
import {
  CopyIcon,
  DeleteIcon,
  AutomationIcon,
  PreviewIcon,
  AddRecipient,
  AddRecipients,
  Reset,
  SettingsIcon,
  EditIcon,
  DeleteRecipient,
  DeleteEmail,
  DeletePhone
} from "../../assets/images/managment/index";
import NotAvailable from "../../assets/images/notAvailable.png";

const Icons = {
  default: {
    type: 1,
    url: NotAvailable,
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
  edit: {
    type: 1,
    url: EditIcon
  },
  deleteRecipient: {
    type: 1,
    url: DeleteRecipient
  },
  deleteEmail: {
    type: 1,
    url: DeleteEmail
  },
  deletePhone: {
    type: 1,
    url: DeletePhone
  },
  addRecipient: {
    type: 1,
    url: AddRecipient,
  },
  addRecipients: {
    type: 1,
    url: AddRecipients,
  },
  reset: {
    type: 1,
    url: Reset,
  },
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
      {icon.type === 1 ? <img src={icon.url} alt={icon.url} /> : icon.comp}
    </Box>
  );
};

export default IconWrapper;
