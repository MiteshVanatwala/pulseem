import "moment/locale/he";
import { BaseDialog } from "./BaseDialog";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

import { Verification_Dialog_Popup, POPUP_OBJECT_TYPE } from "../../helpers/Types/Verification";


const GenericVerification = ({
  isOpen = false,
  onClose = () => { },
  children = {
    step: 1,
    title: "any",
    icon: null,
    content: null,
    renderButtons: null
  },
  classes
}: Verification_Dialog_Popup) => {
  if (!isOpen)
    return <></>;

  return (
    <BaseDialog
      classes={classes}
      open={isOpen}
      onClose={onClose}
      onCancel={onClose}
      {...children}
    >
      {children.content}
    </BaseDialog>
  );
};

export default GenericVerification;
