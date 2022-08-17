
import { Tooltip, Typography, ClickAwayListener } from "@material-ui/core";

import clsx from "clsx";
import React from 'react'
import { useTranslation } from 'react-i18next';
import { makeStyles } from "@material-ui/core/styles";
import Emoj from "../../assets/images/smile.png";
import { Box } from '@material-ui/core';
import EmojiPicker from "emoji-picker-react";

const useStyles = makeStyles((theme) => ({
    customWidth: {
        maxWidth: 200,
        backgroundColor: "black",
        fontSize: "14px",
        textAlign: 'center'
    },
    root: {
        position: 'relative',
        '& .emoji-picker-react': {
            width: 0,
            height: 0,
            zIndex: 1500,
            left: '60% !important'
        },
        '&:hover': {
            '& .emoji-picker-react': {
                width: 318,
                height: 278,
                transition: 'all .5s',

            }
        }
    }
}));

const CustomEmojiPicker = ({
    onSelectEmoji = (val) => val
}) => {
    const styles = useStyles();
    const { t } = useTranslation();

    const onEmojiClick = (event, emojiObject) => {
        onSelectEmoji(emojiObject.emoji);
    };

    return (
        <Box className={styles.root}>
            {/* <Box> */}

            <Tooltip
                disableFocusListener
                title={t("mainReport.emoji")}
                classes={{ tooltip: styles.customWidth }}
                placement="top-start"
                arrow
            >
                <img
                    alt="emoji picker"
                    src={Emoj}
                    style={{
                        marginInlineEnd: "8px",
                        widht: 35,
                        height: 35,
                        marginTop: 10
                    }}
                // onClick={() => {
                //     console.group("EMOJI")
                // }}
                />
            </Tooltip>

            <EmojiPicker
                className={clsx(styles.pickerBox, 'picker-box-root')}
                onEmojiClick={onEmojiClick}
                groupNames={{
                    smileys_people: t("emoji.smiles"),
                    animals_nature: t("emoji.nature"),
                    food_drink: t("emoji.foodAndDrinks"),
                    travel_places: t("emoji.places"),
                    activities: t("emoji.activities"),
                    objects: t("emoji.objects"),
                    symbols: t("emoji.symbols"),
                    recently_used: t("emoji.recently"),
                }}
                groupVisibility={{
                    flags: false,
                    recently_used: false
                }}
            />
        </Box>
    )
}

export default CustomEmojiPicker