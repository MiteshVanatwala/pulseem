import { useEffect, useState } from "react";
import clsx from 'clsx';
import { Box } from '@material-ui/core'
import { FaCheck } from "react-icons/fa";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
import { HiOutlineUserGroup } from "react-icons/hi";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedGroups } from '../../redux/reducers/groupSlice';


const useStyleNew = makeStyles((theme) => ({
    root: {
        padding: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "100%",
        border: "1px solid #efefef",
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    iconButton: {
        padding: 10,
    },
}));


export const GroupDialog = ({ classes,
    title,
    groups,
    allowSelectAll = false,
    groupsSelected = [],
    onConfirm = () => null,
    onClose = () => null
}) => {
    const [search, setSearch] = useState("");
    const { selectedGroups } = useSelector((state) => state.group);
    const btnStyle = useStyleNew();
    const { t } = useTranslation();
    const { windowSize } = useSelector(state => state.core);
    const [selectAll, setSelectAll] = useState(false);
    const dispatch = useDispatch();
    const [newSelection, setNewSelection] = useState([]);

    const onBeforeClose = () => {
        dispatch(setSelectedGroups(selectedGroups));
        setNewSelection(selectedGroups);
        setSelectAll(false);
        onClose();
    }
    const onBeforeConfirm = () => {
        dispatch(setSelectedGroups(newSelection));
        setSelectAll(false);
        onConfirm();
    }

    useEffect(() => {
        setNewSelection(groupsSelected);
    }, [groupsSelected]);


    const handleSelect = (id) => {
        let tempArr = [];
        const isExist = newSelection.length > 0 && newSelection.filter((g) => { return g.GroupID === id }).length > 0;
        if (isExist) {
            tempArr = newSelection.filter((g) => { return g.GroupID !== id });
            setNewSelection(tempArr);
        }
        else {
            const newItem = groups.filter((g) => { return g.GroupID === id })[0];
            setNewSelection([...newSelection, newItem]);
        }
    };

    const handleSelectAll = () => {
        if (!selectAll) {
            setNewSelection(groups);
        }
        else {
            setNewSelection([]);
        }
        setSelectAll(!selectAll);
    }

    return {
        title: title,
        showDivider: true,
        icon: (
            <HiOutlineUserGroup
                style={{ fontSize: 30, color: "#fff" }}
            />
        ),
        content: (
            <Box className={clsx(classes.dialogBox, classes.dialogCustomSize)}>
                <Paper component="form" className={btnStyle.root}>
                    <IconButton
                        type="submit"
                        className={btnStyle.iconButton}
                        aria-label="search"
                    >
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        className={btnStyle.input}
                        placeholder={t("mainReport.searchSms")}
                        inputProps={{ "aria-label": "Search" }}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                        value={search}
                    />
                </Paper>
                <Box style={{ marginTop: 20 }}>
                    {allowSelectAll && <Box className={classes.searchCon} onClick={() => handleSelectAll()}>
                        <span
                            style={{ marginInlineEnd: windowSize !== "xs" ? "25px" : "10px" }}
                            className={
                                selectAll ? classes.greenDoc : classes.blueDoc
                            }
                        >
                            {selectAll ? (
                                <FaCheck className={clsx(classes.green)} />
                            ) : (
                                <HiOutlineUserGroup />
                            )}
                        </span>
                        <div
                            className={classes.selectGroupDiv}
                        >
                            <span className={classes.ellipsisText}>{t("common.SelectAll")}</span>
                        </div>
                    </Box>}
                    {groups && groups.length > 0 && groups
                        .filter((val) => {
                            if (search == "") {
                                return val;
                            } else if (
                                val.GroupName.toLowerCase().includes(
                                    search.toLowerCase()
                                )
                            ) {
                                return val;
                            }
                        })
                        .map((item, idx) => {
                            const itemChecked = newSelection.length > 0 && newSelection.filter((g) => { return g.GroupID === item.GroupID }).length > 0
                            return (
                                <div key={idx} className={classes.searchCon} onClick={() => {
                                    handleSelect(item.GroupID);
                                }}>
                                    <span
                                        style={{ marginInlineEnd: windowSize !== "xs" ? "25px" : "10px" }}
                                        className={
                                            itemChecked ? classes.greenDoc : classes.blueDoc
                                        }
                                    >
                                        {itemChecked ? (
                                            <FaCheck className={clsx(classes.green)} />
                                        ) : (
                                            <HiOutlineUserGroup />
                                        )}
                                    </span>
                                    <div
                                        className={classes.selectGroupDiv}
                                    >
                                        <span className={classes.ellipsisText}>{item.GroupName}</span>
                                        <span style={{ whiteSpace: 'nowrap' }}>{item.Recipients} {item.Recipients === 1 ? t("sms.recipient") : t("sms.recipients")}</span>
                                    </div>
                                </div>
                            );
                        })}
                </Box>
            </Box>
        ),
        showDefaultButtons: true,
        onCancel: () => { onBeforeClose() },
        onClose: () => { onBeforeClose() },
        onConfirm: () => { onBeforeConfirm() }
    }
}