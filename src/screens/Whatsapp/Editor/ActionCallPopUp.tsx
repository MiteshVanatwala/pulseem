import { BaseSyntheticEvent, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  MenuItem,
  TextField,
  IconButton,
} from "@material-ui/core/";
import DeleteIcon from "@material-ui/icons/Delete";
import { Stack, Typography } from "@mui/material";
import { ClassesType } from "../../Classes.types";

// type fvaluesType = {
//   index: string;
//   actionType: string;
//   phoneButtonText: string;
//   countryList: string;
//   phoneNumber: string;
// }[];

const ActionCallPopUp = ({ classes }: ClassesType) => {
  const [open, setOpen] = useState<boolean>(false);
  const [values, setValues] = useState<string[]>([]);
  const [maxFields, setMaxFields] = useState<number>(0);

  const names = ["Phone Number", "Website"];
  const CHARACTER_LIMIT = 20;
  const [scndvalues, setScndValues] = useState<string>("");
  const [isAction, setIsAction] = useState<string>("Phone Number");

  // const [inputFields, setInputFields] = useState([
  //   {
  //     actionType: "",
  //     phoneButtonText: "",
  //     countryList: "",
  //     phoneNumber: "",
  //   },
  //   {
  //     actionType: "",
  //     phoneButtonText: "",
  //     countryList: "",
  //     phoneNumber: "",
  //   },
  // ]);
  const [actionType, setActionType] = useState<string[]>([]);
  const [phoneButtonText, setPhoneButtonText] = useState<string[]>([]);
  const [countryList, setCountryList] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<number>(0);

  const handleChange = (event: BaseSyntheticEvent) => {
    setScndValues(event.target.value);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleClickOpen = () => {
    setOpen(true);
    setMaxFields(0);
    setValues([]);
  };
  const addValue = () => {
    if (maxFields < 2) {
      setValues([...values, ""]);
      setMaxFields(maxFields + 1);
    } else {
      alert("You cant add more!!");
    }
  };
  const handleValueChange = (e: BaseSyntheticEvent, index: number) => {
    const updatedValues = values.map((value, i) => {
      if (i === index) {
        return e.target.value;
      } else {
        return value;
      }
    });
    setValues(updatedValues);
    console.log(updatedValues);
  };
  const deleteValue = (jump: any) => {
    jump ? setMaxFields(1) : setMaxFields(0);
    setValues(values.filter((j) => j !== jump));
  };

  console.log(values);
  // const handleChangeInput = (e: BaseSyntheticEvent, index: number) => {
  //   const fvalues = [...inputFields];
  //   fvalues[index].actionType = e.target.value;
  //   fvalues[index].phoneButtonText = e.target.value;
  //   fvalues[index].countryList = e.target.value;
  //   fvalues[index].phoneNumber = e.target.value;
  //   setInputFields(fvalues);
  // };

  const onActionTypeChange = (e: BaseSyntheticEvent, index: number) => {
    const updatedValues = values.map((value, i) => {
      if (i === index) {
        return e.target.value;
      } else {
        return value;
      }
    });
    setValues(updatedValues);
  };

  const onPhoneButtonTextChange = (e: BaseSyntheticEvent, index: number) => {
    const updatedValues = values.map((value, i) => {
      if (i === index) {
        return e.target.value;
      } else {
        return value;
      }
    });
    setValues(updatedValues);
  };

  // const onCountryChange = (e: BaseSyntheticEvent, index: number) => {
  //   console.log(index, e.target.value);
  // };

  // const onPhoneNumberChange = (e: BaseSyntheticEvent, index: number) => {
  //   console.log(index, e.target.value);
  // };

  const handleSubmit = () => {};

  // function generateFields() {
  //   let listOfFields = [];
  //   for (let i = 1; i <= 2; i++) {
  //     listOfFields.push(generateInputField());
  //   }
  //   return listOfFields;
  // }

  // function generateInputField() {
  //   return (

  //   );
  // }

  return (
    <form onSubmit={handleSubmit}>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Call To Action
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title">Call to Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create up to 2 buttons that let customers respond to your messages
            or take action
          </DialogContentText>
          {/* {generateFields()} */}
          {/* {inputFields.map((inputField, index) => { */}
          {values.map((jump, index) => (
            <Box key={"jump" + index}>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
                spacing={1}
              >
                <Grid item xs={12} spacing={1}>
                  <Stack direction="row" spacing={2}>
                    <Grid item style={{ width: "100%" }}>
                      <Typography>Type of Action</Typography>
                      <TextField
                        name="actionType"
                        required
                        autoFocus
                        variant="outlined"
                        margin="dense"
                        select
                        id="selectAction"
                        type="text"
                        // placeholder={translator(
                        //   "whatsapp.selectSavedTemplatePlaceholder"
                        // )}
                        // className={
                        //   isCampaign
                        //     ? clsx(classes.buttonField, classes.error)
                        //     : clsx(classes.buttonField, classes.success)
                        // }11
                        onChange={(e) => onActionTypeChange(e, index)}
                        value={jump || ""}
                        fullWidth
                      >
                        {names.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* {isAction === "Phone Number" ? ( */}
                    <Grid item style={{ width: "100%" }}>
                      <Typography>Button Text</Typography>
                      <TextField
                        name="phoneButtonText"
                        // label="Button Text"
                        placeholder="Call Us"
                        inputProps={{
                          maxlength: CHARACTER_LIMIT,
                        }}
                        helperText={`${scndvalues.length}/${CHARACTER_LIMIT}`}
                        onChange={(e) => onPhoneButtonTextChange(e, index)}
                        margin="dense"
                        variant="outlined"
                        value={jump || ""}
                        fullWidth
                      />
                    </Grid>
                    {/* ) : ( */}
                    {/* <Grid item style={{ width: "100%" }}>
                      <Typography>Button Text</Typography>
                      <TextField
                        name="websiteButtonText"
                        // label="Button Text"
                        placeholder="Visit Our Website"
                        inputProps={{
                          maxlength: CHARACTER_LIMIT,
                        }}
                        value={scndvalues}
                        helperText={`${scndvalues.length}/${CHARACTER_LIMIT}`}
                        onChange={handleChange}
                        margin="dense"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid> */}
                    {/* )} */}
                    {/* {isAction === "Phone Number" ? ( */}
                    <Grid item style={{ width: "100%" }}>
                      <Typography>Country</Typography>
                      {/* <TextField
                        variant="outlined"
                        autoFocus
                        margin="dense"
                        label="Value"
                        value={jump || ""}
                        onChange={(e) => handleValueChange(index, e)}
                        fullWidth
                      /> */}

                      <TextField
                        name="countryList"
                        required
                        autoFocus
                        variant="outlined"
                        margin="dense"
                        select
                        id="selectSavedTemplate"
                        type="text"
                        // placeholder={translator(
                        //   "whatsapp.selectSavedTemplatePlaceholder"
                        // )}
                        // className={
                        //   isCampaign
                        //     ? clsx(classes.buttonField, classes.error)
                        //     : clsx(classes.buttonField, classes.success)
                        // }
                        onChange={(e) => handleValueChange(e, index)}
                        value={jump || ""}
                        fullWidth
                      >
                        <MenuItem value="+972 Israel">+972 Israel</MenuItem>
                      </TextField>
                    </Grid>
                    {/* ) : null} */}

                    {isAction === "Phone Number" ? (
                      <Grid item style={{ width: "100%" }}>
                        <Typography>Phone Number</Typography>
                        <TextField
                          name="phoneNumber"
                          // label="Button Text"
                          type="number"
                          placeholder="Phone Number"
                          inputProps={{
                            maxlength: CHARACTER_LIMIT,
                          }}
                          value={jump || ""}
                          helperText={`${scndvalues.length}/${CHARACTER_LIMIT}`}
                          onChange={(e) => handleValueChange(e, index)}
                          margin="dense"
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                    ) : null}
                    <Grid item xs={2}>
                      <Typography>Remove</Typography>
                      <div
                        className="font-icon-wrapper"
                        // onClick={() => deleteValue(jump)}
                      >
                        <IconButton aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          ))}
        </DialogContent>

        <Button onClick={addValue} color="primary">
          Add
        </Button>

        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="secondary">
            Exit
          </Button>
          <Button
            onClick={handleClose}
            variant="contained"
            style={{ backgroundColor: "green", color: "white" }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default ActionCallPopUp;
