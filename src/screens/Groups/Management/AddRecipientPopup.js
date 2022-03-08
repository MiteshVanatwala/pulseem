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

const AddRecipientPopup = ({ classes, isOpen = false, onClose, setLoader, onCreateGroupResponse, windowSize }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const DEFAULT_RECIPIENT_DATA = {
        ClientID: null,
        FirstName: '',
        LastName: '',
        Email: '',
        Cellphone: '',
        Status: null,
        SmsStatus: null,
        Telephone: '',
        Address: '',
        City: '',
        State: '',
        Country: '',
        Zip: '',
        Company: '',
        BirthDate: '',
        ReminderDate: '',
        LastSendDate: '',
        CreationDate: '',
        FailedSendingCounter: null,
        IsWebService: false,
        LastEmailOpened: '',
        LastEmailClicked: '',
        BestEmailOpenTime: null,
        ExtraDate1: '',
        ExtraDate2: '',
        ExtraDate3: '',
        ExtraDate4: '',
        ExtraField1: '',
        ExtraField2: '',
        ExtraField3: '',
        ExtraField4: '',
        ExtraField5: '',
        ExtraField6: '',
        ExtraField7: '',
        ExtraField8: '',
        ExtraField9: '',
        ExtraField10: '',
        ExtraField11: '',
        ExtraField12: '',
        ExtraField13: '',
        GroupIds: []
    }
    const [addRecipientData, setAddRecipientData] = useState(DEFAULT_RECIPIENT_DATA);


    const PERSONAL_DETAILS_FORM = <SimpleGrid
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
                        value={addRecipientData.FirstName}
                        className={clsx(classes.plr10, classes.plr10, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setAddRecipientData({
                                ...addRecipientData,
                                FirstName: e.target.value,
                            });
                        }}
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
                        value={addRecipientData.LastName}
                        className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setAddRecipientData({
                                ...addRecipientData,
                                LastName: e.target.value,
                            });
                        }}
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
                        value={addRecipientData.Email}
                        className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setAddRecipientData({
                                ...addRecipientData,
                                Email: e.target.value,
                            });
                        }}
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
                        value={addRecipientData.Cellphone}
                        className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setAddRecipientData({
                                ...addRecipientData,
                                Cellphone: e.target.value,
                            });
                        }}
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
                        value={addRecipientData.Telephone}
                        className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setAddRecipientData({
                                ...addRecipientData,
                                Telephone: e.target.value,
                            });
                        }}
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
                        value={addRecipientData.Company}
                        className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setAddRecipientData({
                                ...addRecipientData,
                                Company: e.target.value,
                            });
                        }}
                    />,
                    gridSize: { xs: 12, sm: 8 }
                }
                ]}
            />
        },
        ]}
    />

    const LOCATION_DETAILS_FORM = <SimpleGrid
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
                            value={addRecipientData.Address}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    Address: e.target.value,
                                });
                            }}
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
                            value={addRecipientData.City}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    City: e.target.value,
                                });
                            }}
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
                            value={addRecipientData.State}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    State: e.target.value,
                                });
                            }}
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
                            value={addRecipientData.Country}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    Country: e.target.value,
                                });
                            }}
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
                            value={addRecipientData.Zip}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    Zip: e.target.value,
                                });
                            }}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        }
        ]}
    />

    const DATES_FORM = <SimpleGrid
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
                            value={addRecipientData.BirthDate}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    BirthDate: e.target.value,
                                });
                            }}
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
                            value={addRecipientData.ReminderDate}
                            className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                            autoComplete="off"
                            onChange={(e) => {
                                e.preventDefault();
                                setAddRecipientData({
                                    ...addRecipientData,
                                    ReminderDate: e.target.value,
                                });
                            }}
                        />,
                        gridSize: { xs: 12, sm: 8 }
                    }
                ]}
            />

        },
        ]}
    />

    const EXTRA_DETAILS_FORM = <SimpleGrid
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
                                value={addRecipientData.ExtraDate1}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraDate1: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraDate2}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraDate2: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraDate3}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraDate3: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraDate4}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraDate4: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField1}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField1: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField2}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField2: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraDate3}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraDate3: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField4}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField4: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField5}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField5: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField6}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField6: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField7}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField7: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField8}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField8: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField9}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField9: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField10}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField10: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField11}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField11: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField12}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField12: e.target.value,
                                    });
                                }}
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
                                value={addRecipientData.ExtraField13}
                                className={clsx(classes.plr10, classes.textField, classes.minWidth252)}
                                autoComplete="off"
                                onChange={(e) => {
                                    e.preventDefault();
                                    setAddRecipientData({
                                        ...addRecipientData,
                                        ExtraField13: e.target.value,
                                    });
                                }}
                            />,
                            gridSize: { xs: 12, sm: 8 }
                        }
                    ]}

                />
            },

        ]}
    />

    const ACTIVE_TAB_DATA = {
        '0': {
            index: 0,
            label: 'Personal Details',
            content: PERSONAL_DETAILS_FORM,
        },
        '1': {
            index: 1,
            label: 'Location',
            content: LOCATION_DETAILS_FORM,
        },
        '2': {
            index: 2,
            label: 'Date',
            content: DATES_FORM,
            LastSendDate: addRecipientData.LastSendDate,
            CreationDate: addRecipientData.CreationDate,
            LastEmailOpened: addRecipientData.LastEmailOpened,
            LastEmailClicked: addRecipientData.LastEmailClicked,
        },
        '3': {
            index: 3,
            label: 'Extra fields',
            content: EXTRA_DETAILS_FORM
        },
        '4': {
            index: 4,
            label: 'Add recipient to group/s',
            content: 'Groups',
            GroupIds: addRecipientData.GroupIds
        }
    }

    const [activeTab, setActiveTab] = useState(ACTIVE_TAB_DATA['0'])



    const ActiveForm = (formProps) => {
        return (
            <Accordion
                expanded={activeTab.index === formProps.index}
                onClick={() => {
                    if (formProps.index === activeTab.index)
                        setActiveTab({ index: null })
                    else
                        setActiveTab(ACTIVE_TAB_DATA[formProps.index])
                }}
            >
                <AccordionSummary
                    expandIcon={""}
                    aria-controls="panel1a-content"
                    id="panel1a-header"

                >
                    <Typography>{formProps.label} {formProps.index} {activeTab.index === formProps.index ? <GrFormSubtract /> : <GrFormAdd />}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        {activeTab.content}
                    </Typography>

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
                Object.keys(ACTIVE_TAB_DATA).map((key) => ActiveForm(ACTIVE_TAB_DATA[key]))
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
                        value={newGroupData.GroupName}
                        className={clsx(classes.textField, classes.minWidth252)}
                        autoComplete="off"
                        onChange={(e) => {
                            e.preventDefault();
                            setNewGroupData({
                                ...newGroupData,
                                GroupName: e.target.value,
                            });
                        }}
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