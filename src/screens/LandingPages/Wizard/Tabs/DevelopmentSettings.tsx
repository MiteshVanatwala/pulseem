import { Box, Grid, Typography } from "@material-ui/core";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { PlaceHolders } from "../../../../helpers/Constants";

const DevelopmentSettings = ({ classes, data, onUpdate }: any) => {
    const { t: translator } = useTranslation();

    return (<Grid container spacing={3} className={clsx(classes.p15, classes.pt2rem)}>
        <Grid item md={12}>
            <Box>
                <Typography title={translator("landingPages.CSSDesign")} className={classes.alignDir}>
                    {translator("landingPages.CSSDesign")}
                </Typography>
                <textarea
                    placeholder={PlaceHolders.CSS_STYLE}
                    maxLength={1000}
                    id="yourMessage"
                    className={clsx(classes.textarea, classes.sidebar)}
                    // style={{ textAlign: alignment }}
                    onChange={(e: any) => onUpdate({ ...data, cssStyle: e.target.value })}
                    value={data.cssStyle}
                ></textarea>
            </Box>
        </Grid>
    </Grid>)
}

export default DevelopmentSettings;