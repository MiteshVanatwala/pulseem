import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Box,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@material-ui/core";
import { DialogTitle, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Close } from "@material-ui/icons";
import { getUsersList } from "../../../redux/reducers/WhatsappSlice";
import axios from "axios";
import store from "../../../redux/store";

type AlertModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const AlertModal = ({
  isOpen,
  handleClose,
  title,
  subtitle,
  children,
}: AlertModalProps) => {
  // const [isOpen, setIsOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [isConfirm, setIsConfirm] = useState<boolean>(true);

  const dispatch = useDispatch();
  // console.log(dispatch(getUsersList()));
  const user = useSelector(
    (state: ReturnType<typeof store.getState>) => state.whatsapp.usersList
  );
  console.log(user);

  // const handleClickOpen = () => {
  //   setIsOpen(true);
  // };

  // const handleClose = () => {
  //   setIsOpen(false);
  // };

  /* <Button variant="outlined" onClick={handleClickOpen}>
    Open responsive dialog
  </Button> */

  useEffect(() => {
    dispatch(getUsersList());
  }, []);

  return (
    <Dialog
      fullScreen={fullScreen}
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        {!isConfirm ? "Use Google's location service?" : "Confirm the action"}
        {title}
      </DialogTitle>
      <Box position="absolute" top={0} right={0}>
        <IconButton>
          <Close onClick={handleClose} />
        </IconButton>
      </Box>
      <DialogContent>
        <DialogContentText>
          {!isConfirm
            ? "Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running."
            : "Do you really want to delete all the data?"}
          {subtitle}
        </DialogContentText>
        {children}
      </DialogContent>
      <DialogActions>
        {!isConfirm ? (
          <Button
            variant="contained"
            color="primary"
            autoFocus
            onClick={handleClose}
          >
            Ok
          </Button>
        ) : (
          <>
            <Button color="primary" variant="contained">
              Cancel
            </Button>
            <Button color="secondary" variant="contained">
              Confirm
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AlertModal;
