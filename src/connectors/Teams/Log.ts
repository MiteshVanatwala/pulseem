import { useDispatch } from "react-redux";
import { sendToTeamChannel } from "../../redux/reducers/ConnectorsSlice";

export interface TeamsMessage {
    MethodName: string;
    ComponentName: string;
    Text: string;
}
const dispatch = useDispatch();

export const Log = async (message: TeamsMessage) => {
    // Add environment dependency
    try {
        dispatch(sendToTeamChannel({
            activityTitle: `Component: ${message.ComponentName} | Method: ${message.MethodName}`,
            text: message.Text,
        }))
    } catch (err) {
        return err;
    }
}