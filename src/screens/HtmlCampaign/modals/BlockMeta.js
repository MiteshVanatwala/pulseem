import { useState } from "react";
import clsx from "clsx";
import { TextField, Box } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { FaRegSave } from 'react-icons/fa'
import "moment/locale/he";
import { Dialog } from "../../../components/managment/Dialog";

export const BlockMeta = ({
    classes,
    isOpen,
    onClose,
    onSubmit
}) => {
    const { t } = useTranslation();
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');

    const confirm = () => {
        return new Promise((resolve) => {
            const retVal = {
                category: category,
                tags: tags
            }
            resolve(onSubmit(retVal));
        })
    }

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    }
    const handleTagsChange = (e) => {
        setTags(e.target.value);
    }
    return !isOpen ? (<></>) :
        (
            <>
                <Dialog
                    classes={classes}
                    customContainerStyle={classes.dialogZindex}
                    open={true}
                    title={t('campaigns.saveBlock')}
                    icon={<div className={classes.dialogIconContent}>
                        <FaRegSave />
                    </div>}
                    showDivider={isOpen}
                    onClose={onClose}
                    onCancel={onClose}
                    onConfirm={confirm}
                    contentStyle={classes.testSendDialog}
                    reduceTitle
                    style={{ minWidth: 240, zIndex: '100 !important' }}
                    cancelText="common.Cancel"
                    confirmText="common.Ok"
                >
                    <Box className={clsx(classes.contentBox, classes.mt10, classes.mb25)}>
                        <Box>
                            <TextField
                                variant="outlined"
                                size="small"
                                value={category}
                                className={clsx(classes.textField, classes.minWidth252)}
                                placeholder={t("common.GroupName")}
                                onChange={handleCategoryChange}
                                label="קטגוריה"
                            >
                            </TextField>
                        </Box>
                        <Box className={classes.mt20}>
                            <TextField
                                variant="outlined"
                                size="small"
                                value={tags}
                                className={clsx(classes.textField, classes.minWidth252)}
                                placeholder={t("common.GroupName")}
                                onChange={handleTagsChange}
                                helperText="יש להפריד באמצעות פסיק"
                                label="תגיות"
                            ></TextField>
                        </Box>
                    </Box>
                </Dialog>
            </>
        );
}