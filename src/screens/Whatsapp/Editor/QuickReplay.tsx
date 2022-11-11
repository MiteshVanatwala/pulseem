import { Dialog } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { WhatsappCreatorProps } from "./types";

const QuickReplay = ({ classes }: WhatsappCreatorProps) => {
    const { t: translator } = useTranslation();
    return (
        <Dialog
            classes={classes}
            open={true}>
            <h1>Demo</h1>
        </Dialog>
    );
};

export default QuickReplay;