import React, { useState, useEffect, useMemo } from "react";
import clsx from "clsx";
import {
    Typography,
    // DeBody,
    Grid,
    Button,
    TextField,
    Box,
    Checkbox,
    FormControlLabel,
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    makeStyles
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { DateField } from '../../../components/managment/index'

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/he";
import { GrGroup, GrFormAdd, GrFormSubtract } from "react-icons/gr";
import {
    addRecipient,
} from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { DEFAULT_RECIPIENT_DATA, ADD_RECIPIENT_TABS, ADD_RECIPIENT_REQUIRED_ERRORS } from "../../../model/Groups/Contants";
import GroupTags from "../../../components/Groups/GroupTags";


const useStyles = makeStyles({
    contentBox: {
        "height": '30vh'
    },

});

const AddRecipientPopup = ({ classes,
    isOpen = false,
    onClose,
    setLoader,
    onCreateGroupResponse,
    windowSize,
    Groups = [],
    selectedGroups,
    selectGroup,
    setToastMessage,
    ToastMessages,
    onAddRecipient = () => null
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const localClasses = useStyles()

    const { extraData } = useSelector((state) => state.sms);
    const [addRecipientData, setAddRecipientData] = useState(DEFAULT_RECIPIENT_DATA);
    const [accountExtraFields, setAccountExtraFields] = useState(null);
    const [activeTab, setActiveTab] = useState(0)
    const [errors, setErrors] = useState({
        Email: '',
        Cellphone: ''
    })
    const dateFormat = "yyyy-MM-dd HH:mm:ss";

    const handleAddREcipientResponse = (response) => {
        switch (response.payload.StatusCode) {
            case 201: {
                setToastMessage(ToastMessages.RECIPIENT_ADDED);
                break;
            }
            case 400: {
                setToastMessage(ToastMessages.RECIPIENT_INPUT_INCORRECT);
                break;
            }
            case 401: {
                setToastMessage(ToastMessages.GROUP_INVALID_API);
                break;
            }
            case 405: {
                setToastMessage(ToastMessages.GROUP_ERROR);
                break;
            }
            default: {

            }
        }
    }

    const handleBlur = (e) => {
        if (!e.target.value) {
            setErrors({ ...errors, [e.target.name]: t(ADD_RECIPIENT_REQUIRED_ERRORS[e.target.name]) })
        }
        if (e.target.name === "Email") {
            if (!e.target.value.match(
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )) {
                setErrors({ ...errors, Email: t(ADD_RECIPIENT_REQUIRED_ERRORS.Email) })
            }
        }
    }

    const handleChange = (e, dateField = null, isExtraData = false) => {
        if (dateField) {
            const { date, field } = dateField;
            setAccountExtraFields({
                ...accountExtraFields, [field]: moment(date, dateFormat)
            });
        }
        else {
            if (Object.keys(errors).indexOf(e.target.name) !== -1 && errors[e.target.name]) {
                setErrors({ ...errors, [e.target.name]: '' });
            }

            else if (isExtraData) {
                setAccountExtraFields({
                    ...accountExtraFields, [e.target.name]: e.target.value
                });
            }
            else {
                setAddRecipientData({
                    ...addRecipientData, [e.target.name]: e.target.value
                })
            }
        }

    }

    const handleSubmit = async () => {
        const data = {
            ClientsData: addRecipientData,
            GroupIds: [...selectedGroups]
        }
        const tempError = { ...errors }

        if (!data.ClientsData.Email &&
            !data.ClientsData.Cellphone) {
            if (!data.ClientsData.Email || !data.ClientsData.Email.match(
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )) {
                tempError.Email = t(ADD_RECIPIENT_REQUIRED_ERRORS.Email)
            }
            if (!data.ClientsData.Cellphone) {
                tempError.Cellphone = t(ADD_RECIPIENT_REQUIRED_ERRORS.Cellphone)
            }

            setErrors({ ...tempError })

            return;
        }
        try {
            const clientsData = [];
            //addRecipientData.ExtraFields = { ...accountExtraFields }
            clientsData.push({ ...addRecipientData, ...accountExtraFields });

            const request = {
                ClientsData: clientsData,
                GroupIds: [...selectedGroups]
            }
            const response = await dispatch(addRecipient(request))
            handleAddREcipientResponse(response)
            onAddRecipient();
        }
        catch (err) {
            console.log('errr:', err)
        }

    }



    const PERSONAL_DETAILS_FORM = () => <SimpleGrid
        gridArr={[{
            content: <SimpleGrid
                gridArr={[{
                    content: <Typography className={classes.plr10}>{t("common.first_name")}</Typography>,
                    gridSize: { xs: 12, sm: 4 }
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="FirstName"
                        value={addRecipientData.FirstName}
                        className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                        error={errors.FirstName}
                        helperText={errors.FirstName}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        {
            content: <SimpleGrid

                gridArr={[{
                    content: <Typography className={classes.plr10}>{t("common.last_name")}</Typography>,
                    gridSize: { xs: 12, sm: 4 }
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="LastName"
                        value={addRecipientData.LastName}
                        className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                        error={errors.LastName}
                        helperText={errors.LastName}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        {
            content: <SimpleGrid

                gridArr={[{
                    content: <Typography className={classes.plr10}>{t("common.email")}</Typography>,
                    gridSize: { xs: 12, sm: 4 }
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="Email"
                        value={addRecipientData.Email}
                        className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                        error={errors.Email}
                        helperText={errors.Email}
                        onBlur={handleBlur}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        {
            content: <SimpleGrid

                gridArr={[{
                    content: <Typography className={classes.plr10}>{t("common.cellphone")}</Typography>,
                    gridSize: { xs: 12, sm: 4 }
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="Cellphone"
                        value={addRecipientData.Cellphone}
                        className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            if (e.target.value.match(/^\d+$/)) {
                                handleChange(e)
                            }
                        }}
                        error={errors.Cellphone}
                        helperText={errors.Cellphone}
                        onBlur={handleBlur}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        {
            content: <SimpleGrid

                gridArr={[{
                    content: <Typography className={classes.plr10}>{t("common.telephone")}</Typography>,
                    gridSize: { xs: 12, sm: 4 }
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="Telephone"
                        value={addRecipientData.Telephone}
                        className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        {
            content: <SimpleGrid

                gridArr={[{
                    content: <Typography className={classes.plr10}>{t("common.company")}</Typography>,
                    gridSize: { xs: 12, sm: 4 }
                },
                {
                    content: <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="Company"
                        value={addRecipientData.Company}
                        className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        ]}
    />

    const LOCATION_DETAILS_FORM = () => <SimpleGrid
        gridArr={[{
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.address")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Address"
                            value={addRecipientData.Address}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}

            />
        },
        {
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.city")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="City"
                            value={addRecipientData.City}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        },
        {
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.state")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="State"
                            value={addRecipientData.State}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        },
        {
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.country")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Country"
                            value={addRecipientData.Country}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        },
        {
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.zip")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="Zip"
                            value={addRecipientData.Zip}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        }
        ]}
    />

    const DATES_FORM = () => <SimpleGrid
        gridArr={[{
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.birth_date")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="BirthDate"
                            value={addRecipientData.BirthDate}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}

            />
        },
        {
            content: <SimpleGrid
                gridArr={[
                    {
                        content: <Typography className={classes.plr10}>{t("common.reminder_date")}</Typography>,
                        gridSize: { xs: 12, sm: 4 }
                    },
                    {
                        content: <TextField
                            id="outlined-basic"
                            label=""
                            variant="outlined"
                            name="ReminderDate"
                            value={addRecipientData.ReminderDate}
                            className={clsx(classes.plr10, classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={handleChange}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        },
        ]}
    />

    const EXTRA_DETAILS_FORM = () => {
        let extraFields = Object.keys(extraData).filter((key, index) => { return Object.values(extraData)[index] && Object.values(extraData)[index] !== '' });
        const json = extraFields.map((ef) => {
            return {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography className={classes.plr10}>{extraData[ef]}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: ef.toLowerCase().indexOf('date') > -1 ? <DateField
                                classes={classes}
                                value={accountExtraFields && accountExtraFields[ef] ? accountExtraFields[ef] : null}
                                onChange={e => handleChange(e, { date: e, field: ef }, true)}
                                toolbarDisabled={false}
                            /> : <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name={ef}
                                value={addRecipientData[extraData[ef]]}
                                className={clsx(classes.NoPaddingtextField, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={e => handleChange(e, null, true)}
                            />,
                            gridSize: { xs: 12, sm: 8 }
                        }
                    ]}

                />
            };
        })

        return extraData && <SimpleGrid
            gridArr={json}
        />
    }

    const GROUPS_FORM = () => (
        <div className={classes.fullWidth}>
            <GroupTags
                classes={classes}
                title={'siteTracking.typeGroupName'}
                // onShowModal={onShowGroups}
                style={{ width: windowSize === 'xs' ? 320 : 460 }}
                dropdown
                dropDownProps={{
                    onChange: (e, val) => {
                        const idArr = val.reduce((prevVal, newVal) => [...prevVal, newVal.GroupID], [])
                        selectGroup(idArr)
                    },
                    selectedGroups: selectedGroups
                }
                }
            />
        </div>)



    const ActiveForm = (label, index) => {
        return (
            <Accordion
                expanded={activeTab === index}
                className={classes.noBoxShadow}
                key={index}
            >
                <AccordionSummary
                    expandIcon={""}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    onClick={() => {
                        if (index === activeTab)
                            setActiveTab({ index: null })
                        else
                            setActiveTab(index)
                    }}
                >
                    {/* <IconContext.Provider value={{ color: "#0371ad" }}> */}
                    <Typography>{t(label)}

                        {activeTab === index ?
                            <GrFormSubtract size={24} color='#0371ad' style={{ position: 'absolute' }} /> :
                            <GrFormAdd size={24} color='#0371ad' style={{ position: 'absolute' }} />
                        }
                    </Typography>
                    {/* </IconContext.Provider> */}
                </AccordionSummary>
                <AccordionDetails>
                    {index === 0 && PERSONAL_DETAILS_FORM()}
                    {index === 1 && LOCATION_DETAILS_FORM()}
                    {index === 2 && DATES_FORM()}
                    {index === 3 && EXTRA_DETAILS_FORM()}
                    {index === 4 && GROUPS_FORM()}
                </AccordionDetails>
            </Accordion>
        )
    }


    return (
        <Dialog
            classes={classes}
            open={isOpen}
            // title={t("group.createNew")}
            title={t('recipient.recipientAddPopUpTitle')}
            icon={<div className={classes.dialogIconContent}>
                {'\uE0D5'}
            </div>}
            showDivider={true}
            onClose={onClose}
            onCancel={onClose}
            onConfirm={handleSubmit}
            renderButtons={() => (
                <Grid container spacing={2} className={classes.linePadding}>
                    <Grid
                        item
                        xs={windowSize === "xs" && 12}
                        sm={4}
                        className={classes.txtCenter}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogCancelButton,
                                classes.fullWidth,
                                classes.whiteSpaceNoWrap
                            )}
                            onClick={onClose}
                        >
                            {t("group.cancel")}
                        </Button>
                    </Grid>
                    <Grid
                        item
                        xs={windowSize === "xs" && 12}
                        sm={4}
                        className={classes.txtCenter}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(
                                classes.dialogButton,
                                classes.dialogConfirmButton,
                                classes.fullWidth,
                                classes.whiteSpaceNoWrap,
                                classes.textCapitalize
                            )}

                            onClick={handleSubmit}
                        // onClick={() => {
                        //     const result = handleAddRecipient(addRecipientData);
                        //     if (result) {
                        //         setAddRecipientData(DEFAULT_RECIPIENT_DATA);
                        //     }
                        // }}
                        >
                            {t("group.ok")}
                        </Button>
                    </Grid>
                    <Grid
                        item
                        xs={windowSize === "xs" && 12}
                        sm={4}
                        className={classes.txtCenter}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            className={clsx(
                                classes.fullWidth,
                                classes.dialogButton,
                                classes.dialogConfirmButton,
                                classes.actionButtonLightGreen,
                                classes.whiteSpaceNoWrap,
                            )}
                        // onClick={
                        //TODO: ADD ADD Recipient Functionality
                        //     () => setDialogType({
                        //     type: 'restore',
                        //     data: smsDeletedData
                        // })
                        // }
                        >
                            {t("recipient.addAnotherRecipient")}
                        </Button>
                    </Grid>

                </Grid>
            )}
            customContainerStyle=""
            cancelText="common.Cancel"
            confirmText="common.Ok"
        >
            <Box className={localClasses.contentBox}>
                {
                    ADD_RECIPIENT_TABS.map((label, index) => ActiveForm(label, index))
                    // Array.from({ length: 5 }, (val, i) => ActiveForm(i))
                }
            </Box>

        </Dialog>
    );
};

export default AddRecipientPopup;