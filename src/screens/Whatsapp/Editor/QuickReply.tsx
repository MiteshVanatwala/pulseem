import {
    Button,
    Grid,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    DialogContentText,
    Typography,
    TextField,
    DialogActions,
} from "@material-ui/core";
import { BaseSyntheticEvent, useState } from "react";
import uniqid from "uniqid";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CloseIcon from "@material-ui/icons/Close";
import { quickReplyButtonProps, quickReplyProps } from "./WhatsappCreator.types";
import { useTranslation } from "react-i18next";

const QuickReply = ({ classes, isQuickReplyOpen, closeQuickReply }: quickReplyProps) => {
    const { t: translator } = useTranslation();
    const handleSubmit = () => { };
    const initialQuickButtons = [
        {
            id: uniqid(),
            value: ''
        }
    ]
    const [quickButtons, setQuickButtons] = useState<quickReplyButtonProps[]>(initialQuickButtons)
    const addMore = () => {
        const button = {
            id: uniqid(),
            value: ''
        }
        setQuickButtons([...quickButtons, button])
    }
    const onButtonTextChange = (e: BaseSyntheticEvent, button: quickReplyButtonProps) => {
        const updatedQuickButtons = quickButtons.map((b) => b.id === button.id ? { ...b, value: e.target.vale } : b)
        setQuickButtons(updatedQuickButtons);
    }
    const onDeleteButton = (button: quickReplyButtonProps) => {
        const updatedQuickButtons = quickButtons.filter((b) => b.id !== button.id)
        setQuickButtons(updatedQuickButtons);
    }
    return (
        <form onSubmit={handleSubmit}>
            <Dialog
                open={isQuickReplyOpen}
                onClose={closeQuickReply}
                aria-labelledby="form-dialog-title"
                fullWidth
                maxWidth="md"
                className={classes.quickReplayDialog}
            >
                <DialogTitle id="form-dialog-title" className={classes.quickReplayDialogHeader}>
                    {translator('whatsapp.quickReply.title')}
                    <IconButton
                        aria-label="close"
                        onClick={closeQuickReply}
                        className={classes.quickReplayDialogClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className={classes.quickReplayDialogHeaderDescription}>
                        {translator('whatsapp.quickReply.titleDescription')}
                    </DialogContentText>
                    {quickButtons?.map((button) => (
                        <Grid container alignItems="center">
                            <Grid item key={button.id}>
                                <Typography>{'Button Text'}</Typography>
                                <TextField
                                    className={classes.buttonField}
                                    name={'quickreply'}
                                    defaultValue={button?.value}
                                    onChange={(e) =>
                                        onButtonTextChange(e, button)
                                    }
                                />
                            </Grid>
                            <DeleteOutlinedIcon
                                className={classes.quickReplyDelete}
                                onClick={() => onDeleteButton(button)}
                            />
                        </Grid>
                    ))}
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={addMore}
                            disabled={quickButtons?.length >= 3 ? true : false}
                        >
                            {translator('whatsapp.quickReply.addMore')}
                        </Button>
                        <Button onClick={closeQuickReply} variant="contained" color="secondary">
                            {translator('whatsapp.quickReply.exit')}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            style={{ backgroundColor: "green", color: "white" }}
                        >
                            {translator('whatsapp.quickReply.save')}
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

        </form>
    );
};

export default QuickReply;