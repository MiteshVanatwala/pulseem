import { useState } from 'react';
import {
    Typography, ListItemAvatar, Avatar, Grid, ListItem, ListItemText, ListItemSecondaryAction, List, TextField, FormControl, Input, InputAdornment, Box, Select, MenuItem, Button
} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import 'moment/locale/he'
import clsx from 'clsx';
import { HiUserGroup } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { MdClear } from 'react-icons/md';
import './Groups.styles.css';
import { BsDot } from "react-icons/bs";
import {
    BsFilter
} from 'react-icons/bs';



const Groups = ({ classes,
    list,
    bsDot,
    isSms,
    selectedList,
    innerHeight = null,
    isNotifications,
    noSelectionText,
    showSortBy = true,
    showFilter = true,
    isCampaign = false,
    showSelectAll = true,
    callbackSelectedGroups = () => null,
    callbackUpdateGroups = () => null,
    callbackSelectAll = () => null,
    callbackReciFilter = () => null,
    callbackShowTestGroup = () => null,
    uniqueKey = null
}) => {
    const { windowSize } = useSelector(state => state.core)
    const { t } = useTranslation();
    const [groupNameSearch, setGroupNameSearch] = useState('');
    const [clearInput, setClearInput] = useState(false);
    const [groupHover, setIsHover] = useState(null);
    const [showTestGroups, setShowTestGroups] = useState(false);

    const handleShowTestGroup = () => {
        callbackShowTestGroup(showTestGroups);
        setShowTestGroups(!showTestGroups);
    }
    const handleSearch = (event) => {
        setClearInput(event.target.value !== '');
        setGroupNameSearch(event.target.value);
    }
    const resetSearch = (event) => {
        document.querySelector('#searchGroup').value = '';
        setGroupNameSearch('');
        setClearInput(false);
    }
    const onSelectGroup = (group) => {
        callbackSelectedGroups(group);
    }

    const onTagChange = (event, value) => {
        callbackUpdateGroups(value);
    }

    const defaultProps = {
        options: selectedList,
        getOptionLabel: (group) => { if (group) { return group.GroupName } }
    };

    const renderGroups = () => {
        const groupIdKey = isNotifications ? "Id" : "GroupID";
        const groupRecipientsKey = isNotifications ? "Members" : "Recipients";
        return list.filter((g) => {
            return g?.GroupName?.toLowerCase().includes(groupNameSearch?.toLowerCase()) || '';
        }).map((group) => {
            const isExist = selectedList.map((group) => { return group[groupIdKey] }).includes(group[groupIdKey]);
            return (<ListItem id={group[groupIdKey]} key={group[groupIdKey]} onClick={() => onSelectGroup(group)} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setIsHover(group[groupIdKey])}
                onMouseLeave={() => setIsHover(null)}
                className={groupHover === group[groupIdKey] ? classes.hoverListItem : null}
            >

                <ListItemAvatar>
                    <Avatar
                        className={clsx(classes.listIcon, classes.transparentBg, isExist ? classes.green : classes.blue, isExist ? classes.borderGreen : classes.borderPrimary)}>
                        {isExist ?
                            (<FaCheck className={clsx(classes.green)} />)
                            :
                            (<HiUserGroup className={clsx(classes.colrPrimary)} />)
                        }
                    </Avatar>
                </ListItemAvatar>
                <ListItemText className={'groupText'} title={group.GroupName}
                    primary={group.GroupName}
                />
                <ListItemSecondaryAction className={'groupText'}>
                    {group[groupRecipientsKey].toLocaleString()} {group[groupRecipientsKey] !== 1 ? t("notifications.recipients") : t("notifications.recipient")}
                </ListItemSecondaryAction>
            </ListItem>)
        })
    }

    const renderCampaigns = () => {
        return list?.filter((c) => {
            return c.Name.toLowerCase().includes(groupNameSearch.toLowerCase());
        }).map((campaign) => {
            const isExist = selectedList.map((c) => { return c.SMSCampaignID }).includes(campaign.SMSCampaignID);
            return (<ListItem id={campaign.SMSCampaignID} key={campaign.SMSCampaignID} onClick={() => onSelectGroup(campaign)} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setIsHover(campaign.SMSCampaignID)}
                onMouseLeave={() => setIsHover(null)}
                className={groupHover === campaign.SMSCampaignID ? classes.hoverListItem : null}
            >
                <ListItemAvatar>
                    <Avatar
                        className={clsx(classes.listIcon, classes.transparentBg, isExist ? classes.green : classes.blue, isExist ? classes.borderGreen : classes.borderPrimary)}>
                        {isExist ?
                            (<FaCheck className={clsx(classes.green)} />)
                            :
                            (<HiUserGroup className={clsx(classes.colrPrimary)} />)
                        }
                    </Avatar>
                </ListItemAvatar>
                <ListItemText className={'groupText'} title={campaign.Name}
                    primary={campaign.Name}
                />
            </ListItem>)
        })
    }

    const renderSelectAll = () => {
        const allSelected = list.length === selectedList.length;

        return (<ListItem id="liSelectAll" key="liSelectAll" onClick={() => onSelectAllGroup()} style={{ cursor: 'pointer' }}>
            <ListItemAvatar>
                <Avatar
                    className={clsx(classes.listIcon, classes.transparentBg, allSelected ? classes.green : classes.blue, allSelected ? classes.borderGreen : classes.borderPrimary)}>
                    {allSelected ?
                        (<FaCheck className={clsx(classes.green)} />)
                        :
                        (<HiUserGroup className={clsx(classes.colrPrimary)} />)
                    }
                </Avatar>
            </ListItemAvatar>
            <ListItemText className={'groupText'} title={t("notifications.selectAll")}
                primary={t("notifications.selectAll")}
            />
        </ListItem>)
    }

    const onSelectAllGroup = () => {
        callbackSelectAll();
    }

    const groupSortOptions = [
        {
            value: "Group Name",
            text: t("notifications.sort_by_group"),
        },
        {
            value: "Creation Date",
            text: t("notifications.sort_by_creation"),
        },
        {
            value: "Update Date",
            text: t("notifications.sort_by_updated"),
        },
    ];

    const [sortBySelected, setSortBy] = useState('Group Name');
    const [sortDirection, setSortDirection] = useState('asc');
    const renderSortItems = () => {
        return groupSortOptions.map((sortBy) => {
            return (<MenuItem key={sortBy.value} value={sortBy.value}>{sortBy.text}</MenuItem>)
        });
    }
    const handleSortBySelected = (event) => {
        setSortBy(event.target.value);
        sortBy(event.target.value, sortDirection);
    }
    const handleSortDirection = () => {
        const selected = sortDirection === 'asc' ? 'desc' : 'asc';
        setSortDirection(selected);
        sortBy(sortBySelected, selected);
    }

    const sortBy = (sortBy, direction) => {
        if (list) {
            if (sortBy === "Group Name") {
                direction === 'asc'
                    ? list.sort((a, b) =>
                        a.GroupName.toUpperCase() < b.GroupName.toUpperCase()
                            ? -1
                            : Number(
                                a.GroupName.toUpperCase() > b.GroupName.toUpperCase()
                            )
                    )
                    : list.sort((a, b) =>
                        b.GroupName.toUpperCase() < a.GroupName.toUpperCase()
                            ? -1
                            : Number(
                                b.GroupName.toUpperCase() > a.GroupName.toUpperCase()
                            )
                    );
            } else if (sortBy === "Update Date" && list[0] && list[0].UpdateDate) {
                direction === 'asc'
                    ? list.sort((a, b) =>
                        a.UpdateDate !== null && b.UpdateDate !== null
                            ? Date.parse(a.UpdateDate) - Date.parse(b.UpdateDate)
                            : -1
                    )
                    : list.sort((a, b) =>
                        a.UpdateDate !== null && b.UpdateDate !== null
                            ? Date.parse(b.UpdateDate) - Date.parse(a.UpdateDate)
                            : -1
                    );
            }
            else if (sortBy === "Creation Date") {
                if (isSms) {
                    direction === 'asc'
                        ? list.sort((a, b) =>
                            a.CreationDate !== null && b.CreationDate !== null
                                ? Date.parse(a.CreationDate) - Date.parse(b.CreationDate)
                                : -1
                        )
                        : list.sort((a, b) =>
                            a.CreationDate !== null && b.CreationDate !== null
                                ? Date.parse(b.CreationDate) - Date.parse(a.CreationDate)
                                : -1
                        );
                }
                else {
                    direction === 'asc'
                        ? list.sort((a, b) =>
                            a.CreatedDate !== null && b.CreatedDate !== null
                                ? Date.parse(a.CreatedDate) - Date.parse(b.CreatedDate)
                                : -1
                        )
                        : list.sort((a, b) =>
                            a.CreatedDate !== null && b.CreatedDate !== null
                                ? Date.parse(b.CreatedDate) - Date.parse(a.CreatedDate)
                                : -1
                        );
                }
            }
        }
    }

    return (
        <Box className={classes.groupsContainer} key={uniqueKey}>
            {
                windowSize === 'xs' && <Grid item xs={12}>
                    <FormControl className={clsx(classes.margin, classes.searchInput)}>
                        <Input
                            autoComplete='off'
                            onChange={handleSearch}
                            placeholder={t('notifications.buttons.search')}
                            id="searchGroup"
                            startAdornment={
                                <InputAdornment position="start" autoComplete="off">
                                    <BsSearch />
                                </InputAdornment>
                            }
                            endAdornment={clearInput &&
                                <InputAdornment position="start" onClick={resetSearch}>
                                    <MdClear style={{ cursor: 'pointer' }} />
                                </InputAdornment>
                            }

                        />
                    </FormControl>
                </Grid>
            }
            <Grid item xs={12} className={clsx(classes.flex, classes.groupFilterRow)} style={{ whiteSpace: windowSize !== 'xs' ? 'noWrap' : 'normal' }}>
                {windowSize !== 'xs' && <FormControl className={clsx(classes.margin, classes.searchInput)}>
                    <Input
                        autoComplete='off'
                        onChange={handleSearch}
                        placeholder={t('notifications.buttons.search')}
                        id="searchGroup"
                        startAdornment={
                            <InputAdornment position="start" >
                                <BsSearch />
                            </InputAdornment>
                        }
                        endAdornment={clearInput &&
                            <InputAdornment position="start" onClick={resetSearch}>
                                <MdClear style={{ cursor: 'pointer' }} />
                            </InputAdornment>
                        }

                    />
                </FormControl>}
                {showSortBy && <Box className={classes.filterButtonsContainer}>
                    {selectedList.length > 0 && showFilter ? <Button className={clsx(classes.formControl, classes.dropDown)} onClick={callbackReciFilter} style={{ height: "36px", color: "#ff3343", fontWeight: "600", textTransform: "capitalize" }}>
                        {windowSize !== 'xs' && <BsFilter style={{ fontSize: "22px", color: "#ff3343" }} />} {bsDot ? <BsDot style={{ position: "absolute", left: "8px", top: "-6px", fontSize: "28px" }} /> : null} {t("mainReport.recipientFilter")}

                    </Button> : null}
                    {isSms && <Button variant="outlined"
                        className={clsx(classes.formControl, showTestGroups ? classes.buttonActiveGreen : classes.twoLineButton)}
                        onClick={() => handleShowTestGroup()}
                    >{t("sms.showTestGroups")}</Button>}
                    <FormControl className={clsx(classes.formControl, classes.dropDown)}>
                        <Select
                            id="groupOrder"
                            value={sortBySelected}
                            onChange={handleSortBySelected}
                        >
                            {renderSortItems()}
                        </Select>
                    </FormControl>
                    <Button style={{ margin: selectedList.length > 0 && showFilter && windowSize === 'xs' ? '5px 0px' : null }} className={clsx(classes.formControl, classes.dropDown, classes.controlField)} onClick={() => { handleSortDirection() }}>
                        {sortDirection === 'asc' ? <BiSortDown /> : <BiSortUp />}
                    </Button>
                </Box>
                }
            </Grid>
            {isCampaign ? (<Autocomplete
                {...defaultProps}
                multiple
                id="multiple-limit-tags"
                value={selectedList}
                getOptionSelected={(option, value) => option.Name === value.Name}
                getOptionLabel={(campaign) => campaign.Name}
                defaultValue={[]}
                open={false}
                popupIcon={false}
                onChange={onTagChange}
                renderInput={(params) => selectedList.length > 0 ? (
                    <TextField {...params} className={clsx(classes.bottomShadow, classes.tagSelected, classes.sidebar)} style={{ maxHeight: 45 }}></TextField>
                ) : (
                    <Typography className={clsx(classes.bottomShadow, classes.noSelection)}>{noSelectionText !== '' ? noSelectionText : t('notifications.noGroupsSelected')}</Typography>
                )
                }
            />) :
                (<Autocomplete
                    {...defaultProps}
                    multiple
                    id="multiple-limit-tags"
                    value={selectedList}
                    getOptionSelected={(option, value) => option.GroupName === value.GroupName}
                    getOptionLabel={(group) => group.GroupName}
                    defaultValue={[]}
                    open={false}
                    popupIcon={false}
                    onChange={onTagChange}
                    renderInput={(params) => selectedList.length > 0 ? (
                        <TextField {...params} className={clsx(classes.bottomShadow, classes.tagSelected, classes.sidebar)} style={{ maxHeight: 45 }}></TextField>
                    ) : (
                        <Typography className={clsx(classes.bottomShadow, classes.noSelection)}>{noSelectionText !== '' ? noSelectionText : t('notifications.noGroupsSelected')}</Typography>
                    )
                    }
                />)
            }
            <div className={clsx(classes.demo, classes.sidebar)} style={{ maxHeight: innerHeight, minHeight: innerHeight, overflow: 'auto' }}>
                <List key={uniqueKey}>
                    {showSelectAll && renderSelectAll()}
                    {isCampaign ? renderCampaigns() : renderGroups()}
                </List>
            </div>
        </Box>
    )
}

export default Groups;