import { useDispatch } from "react-redux";
import { sendToTeamChannel } from "../../redux/reducers/ConnectorsSlice";

export const PostMessageToTeams = async (title, message) => {
    const dispatch = useDispatch();
    try {
        const data = {
            activityTitle: title,
            text: message,
        };

        dispatch(sendToTeamChannel(data))
        //return `${response.status} - ${response.statusText}`;
    } catch (err) {
        return err;
    }
}