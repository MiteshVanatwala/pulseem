import { Box, makeStyles } from "@material-ui/core";
import {
  CopyIcon,
  DeleteIcon,
  AutomationIcon,
  PreviewIcon,
  AddRecipient,
  AddRecipients,
  EditIcon,
  DeleteRecipient,
  DeleteEmail,
  DeletePhone,
  SettingIcon,
  ResetIcon
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
    type: 2,
    comp: DeleteIcon,
  },
  automation: {
    type: 2,
    comp: AutomationIcon,
  },
  preview: {
    type: 2,
    comp: PreviewIcon,
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
    type: 2,
    comp: AddRecipient,
  },
  addRecipients: {
    type: 2,
    comp: AddRecipients,
  },
  reset: {
    type: 2,
    comp: ResetIcon,
  },
  settings: {
    type: 2,
    comp: SettingIcon,
  },
  alert: {
    type: 2,
    comp: "i",
  },
};

const useStyles = makeStyles((theme) => ({
  box: {
    width: 25,
    height: 'auto',
    color: "#000000",
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    "& img": {
      maxWidth: '100%',
    },
    "& svg": {
      maxWidth: 25,
      maxHeight: 25,
      fontSize: 24,
    },
  },
}));

const IconWrapper = ({ iconName = "", onClick, ...props }) => {
  const classes = useStyles();
  const icon = Icons[iconName || "default"];
  return (
    <Box
      className={`${classes.box} ${props.className ?? ""}`}
      classes={props.classes}
      onClick={onClick}
      style={{ paddingBlock: 12 }}
    >
      {icon.type === 1 ? <img src={icon.url} alt={icon.url} /> : <icon.comp width={18} height={20} />}
    </Box>
  );
};

export default IconWrapper;
