import React, { useState, useEffect, useMemo } from "react";
import DefaultScreen from "../../DefaultScreen";
import clsx from "clsx";
import {
    Typography,
    Divider,
    TableBody,
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
} from "@material-ui/core";
// import {ExpandMoreIcon} from '@mui/i'
import { SearchIcon, ExportIcon } from "../../../assets/images/managment/index";
import { CSVLink } from "react-csv";
import {
    TablePagination,
    SearchField,
} from "../../../components/managment/index";

import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import ClearIcon from "@material-ui/icons/Clear";
import moment from "moment";
import "moment/locale/he";
import { Loader } from "../../../components/Loader/Loader";
import { setRowsPerPage } from "../../../redux/reducers/coreSlice";
import { setCookie } from "../../../helpers/cookies";
import CustomTooltip from "../../../components/Tooltip/CustomTooltip";
import DataTable from "../../../components/Table/DataTable";
// import { ExcelData, StaticData } from "../tempConstants";
import { GrGroup, GrFormAdd, GrFormSubtract } from "react-icons/gr";
import { exportFile } from "../../../helpers/exportFromJson";
import { preferredOrder } from "../../../helpers/exportHelper";
import RenderRow from "./RenderRow";
import RenderPhoneRow from "./RenderPhoneRow";
import Toast from '../../../components/Toast/Toast.component';
import {
    getGroups,
    deleteGroups,
    createGroup,
} from "../../../redux/reducers/groupSlice";
import { Dialog } from "../../../components/managment/Dialog";
import SimpleGrid from "../../../components/Grids/SimpleGrid";
import { DEFAULT_RECIPIENT_DATA, ADD_RECIPIENT_TABS } from "../../../model/Groups/Contants";


const AddRecipientPopup = ({ classes, isOpen = false, onClose, setLoader, onCreateGroupResponse, windowSize }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();


    const [addRecipientData, setAddRecipientData] = useState(DEFAULT_RECIPIENT_DATA);
    const [groupIds, setGroupIds] = useState([]);


    const handleChange = (e) => {
        setAddRecipientData({
            ...addRecipientData, [e.target.name]: e.target.value
        })
        console.log("Data:", addRecipientData, e.target.name, e.target.value);
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

    const EXTRA_DETAILS_FORM = () => <SimpleGrid
        gridArr={[
            {
                content: <SimpleGrid
                    gridArr={[
                        {
                            content: <Typography className={classes.plr10}>{t("common.ExtraDate1")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraDate1"
                                value={addRecipientData.ExtraDate1}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraDate2")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraDate2"
                                value={addRecipientData.ExtraDate2}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraDate3")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraDate3"
                                value={addRecipientData.ExtraDate3}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraDate4")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraDate4"
                                value={addRecipientData.ExtraDate4}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField1")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField1"
                                value={addRecipientData.ExtraField1}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField2")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField2"
                                value={addRecipientData.ExtraField2}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraDate3")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraDate3"
                                value={addRecipientData.ExtraDate3}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField4")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField4"
                                value={addRecipientData.ExtraField4}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField5")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField5"
                                value={addRecipientData.ExtraField5}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField6")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField6"
                                value={addRecipientData.ExtraField6}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField7")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField7"
                                value={addRecipientData.ExtraField7}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField8")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField8"
                                value={addRecipientData.ExtraField8}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField9")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField9"
                                value={addRecipientData.ExtraField9}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField10")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField10"
                                value={addRecipientData.ExtraField10}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField11")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField11"
                                value={addRecipientData.ExtraField11}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField12")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField12"
                                value={addRecipientData.ExtraField12}
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
                            content: <Typography className={classes.plr10}>{t("common.ExtraField13")}</Typography>,
                            gridSize: { xs: 12, sm: 4 }
                        },
                        {
                            content: <TextField
                                id="outlined-basic"
                                label=""
                                variant="outlined"
                                name="ExtraField13"
                                value={addRecipientData.ExtraField13}
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

    const [activeTab, setActiveTab] = useState(0)

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
                    <Typography>{label} {activeTab === index ? <GrFormSubtract /> : <GrFormAdd />}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {index === 0 && PERSONAL_DETAILS_FORM()}
                    {index === 1 && LOCATION_DETAILS_FORM()}
                    {index === 2 && DATES_FORM()}
                    {index === 3 && EXTRA_DETAILS_FORM()}
                </AccordionDetails>
            </Accordion>
        )
    }

    const handleAddRecipient = async (data) => {
        try {
            onClose()
            // setLoader(true);
            // const response = await dispatch(createGroup(data));
            // setLoader(false);
            // onCreateGroupResponse();
        } catch (err) {
            return false;
        }
    };


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
            onConfirm={() => {
                const result = handleAddRecipient(addRecipientData);
                if (result) {
                    setAddRecipientData(DEFAULT_RECIPIENT_DATA);
                }
            }}
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
                            onClick={() => {
                                const result = handleAddRecipient(addRecipientData);
                                if (result) {
                                    setAddRecipientData(DEFAULT_RECIPIENT_DATA);
                                }
                            }}
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
                                classes.whiteSpaceNoWrap
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
            {
                ADD_RECIPIENT_TABS.map((label, index) => ActiveForm(label, index))
                // Array.from({ length: 5 }, (val, i) => ActiveForm(i))
            }

            {/* <Box
                className={clsx(
                    classes.customDialogContentBox,
                    // classes.flex,
                    classes.mt4,
                    // classes.responsiveFlex
                )}
            > */}







            {/* <Box className={classes.flex1} style={{ marginInlineEnd: 10 }}>
                    <Typography>Group Name:</Typography>
                </Box>
                <Box className={classes.flex2} style={{ marginInlineEnd: 10 }}>
                    <TextField
                        id="outlined-basic"
                        label=""
                        variant="outlined"
                        name="GroupName"
                        value={newGroupData.GroupName}
                        className={clsx(classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={handleChange}
                    />
                </Box>
                <Box
                    className={clsx(
                        classes.flex1,
                        classes.flex,
                        classes.responsiveFlex
                    )}
                >
                    <FormControlLabel
                        control={
                            <Checkbox name="testGroup" size="small" color="primary" />
                        }
                        label="Test Group"
                    />
                    <CustomTooltip
                        isSimpleTooltip={false}
                        interactive={true}
                        classes={{
                            tooltip: clsx(classes.tooltipBlack, classes.tooltipPlacement),
                            arrow: classes.fBlack,
                        }}
                        arrow={true}
                        style={{ fontSize: 18, fontWeight: "bold" }}
                        placement={"top"}
                        title={
                            <Typography noWrap={false}>
                                {t("group.testGroupInfo")}
                            </Typography>
                        }
                        text={t("group.testGroupInfo")}
                    >
                        <span>
                            <BsInfoCircleFill />
                        </span>
                    </CustomTooltip>
                </Box> */}
            {/* </Box> */}
        </Dialog>
    );
};

export default AddRecipientPopup;