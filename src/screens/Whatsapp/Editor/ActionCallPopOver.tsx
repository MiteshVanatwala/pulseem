import { BaseSyntheticEvent, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import {
  callToActionFieldProps,
  callToActionProps,
  callToActionRowProps,
} from "./WhatsappCreator.types";
import { ClassesType } from "../../Classes.types";
import uniqid from "uniqid";
import { useTranslation } from "react-i18next";

const ActionCallPopOver = ({ isCallToActionOpen, closeCallToAction }: any) => {
  const { t: translator } = useTranslation();

  const websiteField: callToActionFieldProps[] = [
    {
      fieldName: translator("whatsapp.websiteButtonText"),
      type: "text",
      placeholder: translator("whatsapp.websiteButtonTextPlaceholder"),
      value: "",
    },
    {
      fieldName: translator("whatsapp.websiteURL"),
      type: "text",
      placeholder: translator("whatsapp.websiteURLPlaceholder"),
      value: "",
    },
  ];
  const phoneNumberField: callToActionFieldProps[] = [
    {
      fieldName: translator("whatsapp.phoneButtonText"),
      type: "text",
      placeholder: translator("whatsapp.phoneButtonTextPlaceholder"),
      value: "",
    },
    {
      fieldName: translator("whatsapp.country"),
      type: "select",
      placeholder: "Select Your Country Code",
      value: "+972 Israel",
    },
    {
      fieldName: translator("whatsapp.phoneNumber"),
      type: "tel",
      placeholder: translator("whatsapp.phoneNumberPlaceholder"),
      value: "",
    },
  ];
  const [rows, setRows] = useState<callToActionProps>([]);
  const [open, setOpen] = useState<boolean>(false);

  const addMore = () => {
    const initaialRow = {
      id: uniqid(),
      typeOfAction: "phonenumber",
      fields: phoneNumberField,
    };
    setRows([...rows, initaialRow]);
  };

  const onTypeOfActionChange = (
    e: BaseSyntheticEvent,
    row: callToActionRowProps
  ) => {
    console.log("onTypeOfActionChange::e::", e);
    console.log("onTypeOfActionChange::row::", row);
    let updatedRows = rows?.map((r: callToActionRowProps) => {
      if (row.id === r.id) {
        if (e.target.value === "phonenumber") {
          return {
            ...r,
            fields: phoneNumberField,
            typeOfAction: "phonenumber",
          };
        } else {
          return { ...r, fields: websiteField, typeOfAction: "website" };
        }
      }
      return r;
    });
    console.log("onTypeOfActionChange::updatedRows::", updatedRows);
    setRows([...updatedRows]);
  };

  const onTypeOfActionFieldChange = (
    e: BaseSyntheticEvent,
    row: callToActionRowProps,
    field: callToActionFieldProps
  ) => {
    let updatedRows: callToActionRowProps[] = rows?.map(
      (r: callToActionRowProps) => {
        if (row.id === r.id) {
          const updatedFields = r.fields.map((f: callToActionFieldProps) => {
            if (field.fieldName === f.fieldName) {
              return { ...f, value: e.target.value };
            }
            return f;
          });
          return { ...r, fields: updatedFields };
        }
        return r;
      }
    );
    setRows([...updatedRows]);
  };

  const onDeleteRow = (row: callToActionRowProps) => {
    let updatedRows = rows.filter((r: callToActionRowProps) => r.id !== row.id);
    setRows([...updatedRows]);
  };

  const handleSubmit = () => {
    console.log("Submission Values", rows);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Dialog
        open={isCallToActionOpen}
        onClose={closeCallToAction}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title">
          {translator("whatsapp.callToActionTitle")}
          <IconButton
            aria-label="close"
            onClick={closeCallToAction}
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translator("whatsapp.callToActionDialogContentText")}
          </DialogContentText>
          <Box>
            <Grid container direction="row" alignItems="flex-start" spacing={1}>
              {rows.map((row: callToActionRowProps, index: number) => (
                <Grid container spacing={3} key={"TOC" + index}>
                  <Grid item md={3}>
                    <Typography>
                      {translator("whatsapp.typeOfAction")}
                    </Typography>
                    <TextField
                      select
                      required
                      name="typeofaction"
                      placeholder="Enter Your Type Of Action"
                      variant="outlined"
                      onChange={(e) => onTypeOfActionChange(e, row)}
                      value={row.typeOfAction}
                      fullWidth
                    >
                      <MenuItem value="phonenumber">Phone Number</MenuItem>
                      <MenuItem value="website">Website</MenuItem>
                    </TextField>
                  </Grid>

                  {row?.fields.map(
                    (field: callToActionFieldProps, fIndex: number) =>
                      field.fieldName !== "Country" ? (
                        <Grid item md={3} key={"TOCF" + fIndex}>
                          <Typography>{field.fieldName}</Typography>
                          <TextField
                            required={true}
                            type={field.type}
                            name={field.fieldName}
                            inputProps={
                              field.fieldName === "Phone Number"
                                ? {
                                    maxlength: 20,
                                  }
                                : field.fieldName === "Website URL"
                                ? { maxLength: 2000 }
                                : { maxLength: 20 }
                            }
                            helperText={
                              field.fieldName === "Website URL"
                                ? `${field.value.length}/${2000}`
                                : `${field.value.length}/${20}`
                            }
                            placeholder={field.placeholder}
                            variant="outlined"
                            onChange={(e) =>
                              onTypeOfActionFieldChange(e, row, field)
                            }
                            value={field.value}
                            fullWidth
                          />
                        </Grid>
                      ) : (
                        <Grid item md={2} key={"TOCF" + fIndex}>
                          <Typography>{field.fieldName}</Typography>
                          <TextField
                            select
                            required
                            name={field.fieldName}
                            placeholder={field.placeholder}
                            variant="outlined"
                            onChange={(e) =>
                              onTypeOfActionFieldChange(e, row, field)
                            }
                            value={field.value}
                            fullWidth
                          >
                            <MenuItem value="+972 Israel">+972 Israel</MenuItem>
                            <MenuItem value="+91 India">+91 India</MenuItem>
                          </TextField>
                        </Grid>
                      )
                  )}

                  <Grid item md={1}>
                    <Typography style={{ visibility: "hidden" }}>
                      {translator("whatsapp.callToActionRemoveButton")}
                    </Typography>
                    <IconButton color="secondary">
                      <DeleteOutlineIcon onClick={() => onDeleteRow(row)} />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Box>
          <DialogActions>
            {rows.length < 2 && (
              <Button variant="contained" color="primary" onClick={addMore}>
                {translator("whatsapp.callToActionAddMoreButton")}
              </Button>
            )}
            <Button onClick={closeCallToAction} variant="contained" color="secondary">
              {translator("whatsapp.callToActionExitButton")}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={rows.length === 0 ? true : false}
              variant="contained"
              style={
                rows.length > 0
                  ? { backgroundColor: "green", color: "white" }
                  : {}
              }
            >
              {translator("whatsapp.callToActionSaveButton")}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default ActionCallPopOver;
