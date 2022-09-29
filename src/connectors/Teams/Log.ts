import { useDispatch } from "react-redux";
import { sendToTeamChannel } from "../../redux/reducers/ConnectorsSlice";

export interface TeamsMessage {
    MethodName: string;
    ComponentName: string;
    Text: string;
}
export const Log = (message: TeamsMessage) => {
    const dispatch = useDispatch();
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