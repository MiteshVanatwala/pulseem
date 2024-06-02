import { IconButton } from "@material-ui/core";

export interface IconSet {
    ID?: number | never;
    Icon: any;
    OnClick: any;
    Title: string;
    Enabled: boolean;
}

const IconSwitch = ({ icons }: any) => {
    return <>
        {icons?.map((icon: IconSet, idx: number) => {
            return <IconButton
                style={{ opacity: icon.Enabled ? 1 : '.4' }}
                aria-label={icon.Title}
                key={icon.ID}
                onClick={icon.OnClick}
                title={icon.Title}
                //@ts-ignore
                size="large"
            >
                {icon.Icon}
            </IconButton>
        })}
    </>
}

export default IconSwitch;