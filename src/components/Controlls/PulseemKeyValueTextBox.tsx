import { Button, Grid, TextField, Typography } from "@material-ui/core"
import { useTranslation } from "react-i18next"
import clsx from "clsx";

const PulseemKeyValueTextBox = ({ classes, data, onUpdate, onRemove }: any) => {
    const { t } = useTranslation();

    return <Grid container>
        {/* Key */}
        <Grid item xs={5}>
            <Typography title={t("common.typeKey")} className={classes.alignDir}>
                {t("common.typeKey")}
            </Typography>
            <TextField
                id={data?.key || 'pulseemKey'}
                label=""
                variant="outlined"
                name={'pulseemKeyName'}
                value={data?.key}
                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                autoComplete="off"
                onChange={(e: any) => onUpdate({ ...data, PageTitle: e.target.value })}
                title={data?.key}
            />
        </Grid>
        {/* Value */}
        <Grid item xs={5}>
            <Typography title={t("common.typeValue")} className={classes.alignDir}>
                {t("common.typeValue")}
            </Typography>
            <TextField
                id={data?.value || 'pulseemValue'}
                label=""
                variant="outlined"
                name={'pulseemValueName'}
                value={data?.value}
                className={clsx(classes.pl5, classes.pr10, classes.NoPaddingtextField, classes.textField, classes.w100)}
                autoComplete="off"
                onChange={(e: any) => onUpdate({ ...data, PageTitle: e.target.value })}
                title={data?.value}
            />
        </Grid>
        {/* Delete Icon */}
        {onRemove && <Grid item xs={2}>
            <Button className={clsx(classes.btnRounded)} onClick={onRemove}>
                {t('common.Delete')}
            </Button>
        </Grid>}
    </Grid>
}

export default PulseemKeyValueTextBox;