import { IconButton, Typography } from "@material-ui/core";
import CustomTooltip from "../Tooltip/CustomTooltip";
import { RenderHtml } from "../../helpers/Utils/HtmlUtils";

export interface IconSet {
    ID?: number | never;
    Icon: any;
    OnClick: any;
    Title: string;
    Enabled: boolean;
}

const IconSwitch = ({ icons, classes }: any) => {
    return <>
        {icons?.map((icon: IconSet, idx: number) => {
            // @ts-ignore
            return <CustomTooltip
                arrow
                style={{ fontSize: 16, maxWidth: '400' }}
                isSimpleTooltip={false}
                classes={classes}
                interactive={true}
                placement={'top'}
                title={<Typography className={classes.f16} noWrap={false}>{icon.Title}</Typography>}
                text={<IconButton
                    style={{ opacity: icon.Enabled ? 1 : '.2', color: icon.Enabled ? '#c91b63' : '#000' }}
                    aria-label={icon.Title}
                    key={icon.ID}
                    onClick={icon.OnClick}
                    //@ts-ignore
                    size="large"
                >
                    {icon.Icon}
                </IconButton>}
            />
        })}
    </>
}

export default IconSwitch;