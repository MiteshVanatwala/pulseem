import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
    Typography, ListItemAvatar, Avatar, Grid, ListItem, ListItemText,
    Box, MenuItem, Button, FormControl, Input, InputAdornment, TextField
} from '@material-ui/core';
import Select from '@mui/material/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { HiUserGroup } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa';
import { BsSearch, BsDot, BsFilter } from 'react-icons/bs';
import { BiSortDown, BiSortUp } from 'react-icons/bi';
import { MdClear } from 'react-icons/md';
import { debounce } from 'lodash'; // Add lodash for debouncing

const ITEM_HEIGHT = 54; // Height of each list item in pixels

const Groups = ({
    classes,
    list,
    bsDot,
    isSms,
    selectedList,
    innerHeight,
    isNotifications,
    noSelectionText,
    showSortBy = true,
    showFilter = true,
    isCampaign = false,
    showSelectAll = true,
    callbackSelectedGroups,
    callbackUpdateGroups,
    callbackSelectAll,
    callbackReciFilter,
    callbackShowTestGroup,
    uniqueKey,
    groupCompareKey = ''
}) => {
    const { windowSize, isRTL } = useSelector(state => state.core);
    const { t } = useTranslation();

    const [groupNameSearch, setGroupNameSearch] = useState('');
    const [clearInput, setClearInput] = useState(false);
    const [groupHover, setIsHover] = useState(null);
    const [showTestGroups, setShowTestGroups] = useState(false);
    const [sortBySelected, setSortBy] = useState('Group Name');
    const [sortDirection, setSortDirection] = useState('asc');

    // Debounced search to prevent excessive filtering
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            setGroupNameSearch(searchTerm);
        }, 300),
        []
    );

    const handleSearch = (event) => {
        const value = event.target.value;
        setClearInput(value !== '');
        debouncedSearch(value);
    };

    // Memoized filtered and sorted list
    const processedList = useMemo(() => {
        if (!list || list.length === 0) return [];

        let tempList = [...list];

        // Apply search filter
        if (groupNameSearch.trim()) {
            const searchTerm = groupNameSearch.trim().toLowerCase();
            tempList = tempList.filter((item) => {
                const name = isCampaign ? item.Name : item.GroupName;
                return name.toLowerCase().includes(searchTerm);
            });
        }

        // Apply sorting
        if (sortBySelected === "Group Name" && !isCampaign) {
            tempList.sort((a, b) => {
                const aName = a.GroupName.trim().toUpperCase();
                const bName = b.GroupName.trim().toUpperCase();
                return sortDirection === 'asc'
                    ? aName.localeCompare(bName)
                    : bName.localeCompare(aName);
            });
        } else if (sortBySelected === "Update Date" && tempList[0]?.UpdateDate) {
            tempList.sort((a, b) => {
                const aDate = a.UpdateDate ? Date.parse(a.UpdateDate) : 0;
                const bDate = b.UpdateDate ? Date.parse(b.UpdateDate) : 0;
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            });
        } else if (sortBySelected === "Creation Date") {
            tempList.sort((a, b) => {
                const dateKey = isSms ? 'CreationDate' : 'CreatedDate';
                const aDate = a[dateKey] ? Date.parse(a[dateKey]) : 0;
                const bDate = b[dateKey] ? Date.parse(b[dateKey]) : 0;
                return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
            });
        }

        return tempList;
    }, [list, groupNameSearch, sortBySelected, sortDirection, isCampaign, isSms]);

    const resetSearch = useCallback(() => {
        document.querySelector('#searchGroup').value = '';
        setGroupNameSearch('');
        setClearInput(false);
        debouncedSearch.cancel();
    }, [debouncedSearch]);

    // Ensure selectedList is always an array to prevent reduce errors
    const safeSelectedList = Array.isArray(selectedList) ? selectedList : [];

    const onSelectGroup = useCallback((group) => {
        callbackSelectedGroups(group);
    }, [callbackSelectedGroups]);

    const onTagChange = useCallback((event, value) => {
        // Ensure value is an array before passing to callback
        const safeValue = Array.isArray(value) ? value : [];
        callbackUpdateGroups(safeValue, event);
    }, [callbackUpdateGroups]);

    // Virtual list item renderer
    const ListItemRenderer = useCallback(({ index, style }) => {
        if (index === 0 && showSelectAll) {
            // Render "Select All" item
            const allSelected = processedList.length === safeSelectedList.length;

            return (
                <div style={style}>
                    <ListItem
                        onClick={() => callbackSelectAll()}
                        style={{ cursor: 'pointer', height: ITEM_HEIGHT }}
                        className="group-container"
                    >
                        <ListItemAvatar>
                            <Avatar className={clsx(
                                classes.listIcon,
                                allSelected ? classes.redBg : classes.transparentBg,
                                allSelected ? classes.white : classes.blue,
                                allSelected ? classes.borderRed : classes.borderPrimary
                            )}>
                                {allSelected ?
                                    <FaCheck className={classes.white} /> :
                                    <HiUserGroup className={classes.colrPrimary} />
                                }
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            className={clsx('groupText', !isRTL && classes.textLeft)}
                            title={t("notifications.selectAll")}
                            primary={t("notifications.selectAll")}
                        />
                    </ListItem>
                </div>
            );
        }

        const actualIndex = showSelectAll ? index - 1 : index;
        const item = processedList[actualIndex];

        if (!item) return <div style={style}></div>;

        if (isCampaign) {
            return <CampaignItemRenderer
                style={style}
                item={item}
                selectedList={safeSelectedList}
                isSms={isSms}
                onSelectGroup={onSelectGroup}
                classes={classes}
                isRTL={isRTL}
                groupHover={groupHover}
                setIsHover={setIsHover}
            />;
        } else {
            return <GroupItemRenderer
                style={style}
                item={item}
                selectedList={safeSelectedList}
                onSelectGroup={onSelectGroup}
                classes={classes}
                isRTL={isRTL}
                groupHover={groupHover}
                setIsHover={setIsHover}
                isNotifications={isNotifications}
                groupCompareKey={groupCompareKey}
                t={t}
            />;
        }
    }, [processedList, safeSelectedList, showSelectAll, isCampaign, isSms, onSelectGroup, classes, isRTL, groupHover, isNotifications, groupCompareKey, t, callbackSelectAll]);

    const totalItems = processedList.length + (showSelectAll ? 1 : 0);

    const groupSortOptions = [
        { value: "Group Name", text: t("notifications.sort_by_group") },
        { value: "Creation Date", text: t("notifications.sort_by_creation") },
        { value: "Update Date", text: t("notifications.sort_by_updated") },
    ];

    const handleSortBySelected = (event) => {
        setSortBy(event.target.value);
    };

    const handleSortDirection = () => {
        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return (
        <Box className={classes.groupsContainer} key={uniqueKey}>
            {/* Search and Filter Controls */}
            {windowSize === 'xs' && (
                <Grid item xs={12}>
                    <FormControl className={clsx(classes.margin, classes.searchInput)}>
                        <Input
                            autoComplete='off'
                            onChange={handleSearch}
                            placeholder={t('notifications.buttons.search')}
                            id="searchGroup"
                            startAdornment={
                                <InputAdornment position="start">
                                    <BsSearch />
                                </InputAdornment>
                            }
                            endAdornment={clearInput && (
                                <InputAdornment position="start" onClick={resetSearch}>
                                    <MdClear style={{ cursor: 'pointer' }} />
                                </InputAdornment>
                            )}
                        />
                    </FormControl>
                </Grid>
            )}

            <Grid item xs={12} className={clsx(classes.flex, classes.groupFilterRow)}>
                {windowSize !== 'xs' && (
                    <FormControl className={clsx(classes.margin, classes.searchInput)}>
                        <Input
                            autoComplete='off'
                            onChange={handleSearch}
                            placeholder={t('notifications.buttons.search')}
                            id="searchGroup"
                            startAdornment={
                                <InputAdornment position="start">
                                    <BsSearch />
                                </InputAdornment>
                            }
                            endAdornment={clearInput && (
                                <InputAdornment position="start" onClick={resetSearch}>
                                    <MdClear style={{ cursor: 'pointer' }} />
                                </InputAdornment>
                            )}
                        />
                    </FormControl>
                )}

                {showSortBy && (
                    <Box className={classes.filterButtonsContainer}>
                        {safeSelectedList.length > 0 && showFilter && (
                            <Button
                                className={clsx(classes.formControl, classes.dropDown, classes.mt1)}
                                onClick={callbackReciFilter}
                                style={{ height: "36px", fontWeight: "600", textTransform: "capitalize" }}
                            >
                                {windowSize !== 'xs' && <BsFilter style={{ fontSize: "22px", color: "#ff3343" }} />}
                                {bsDot && <BsDot style={{ position: "absolute", left: "8px", top: "-6px", fontSize: "28px" }} />}
                                {t("mainReport.recipientFilter")}
                            </Button>
                        )}

                        {isSms && (
                            <Button
                                variant="outlined"
                                className={clsx(classes.formControl, classes.ml5, classes.mt1, showTestGroups ? classes.buttonActiveRed : classes.twoLineButton)}
                                onClick={() => {
                                    callbackShowTestGroup && callbackShowTestGroup(showTestGroups);
                                    setShowTestGroups(!showTestGroups);
                                }}
                            >
                                {t("sms.showTestGroups")}
                            </Button>
                        )}

                        <FormControl className={clsx(classes.dropDown, classes.mt1)}>
                            <Select
                                variant="standard"
                                value={sortBySelected}
                                onChange={handleSortBySelected}
                                className={clsx(classes.paddingSides10)}
                                style={{
                                    color: 'inherit',
                                    fontFamily: 'Assistant',
                                    lineHeight: 1.3
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 300,
                                            direction: isRTL ? 'rtl' : 'ltr'
                                        },
                                    },
                                }}
                            >
                                {groupSortOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.text}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            className={clsx(classes.mt1, classes.formControl, classes.dropDown)}
                            onClick={handleSortDirection}
                            style={{ margin: safeSelectedList.length > 0 && showFilter && windowSize === 'xs' ? '5px 0px' : null }}
                        >
                            {sortDirection === 'asc' ? <BiSortDown /> : <BiSortUp />}
                        </Button>
                    </Box>
                )}
            </Grid>

            {/* Selected Groups Display */}
            {isCampaign ? (
                <Autocomplete
                    multiple
                    value={safeSelectedList}
                    options={safeSelectedList}
                    getOptionSelected={(option, value) => option.Name === value.Name}
                    getOptionLabel={(campaign) => campaign.Name || ''}
                    defaultValue={[]}
                    open={false}
                    popupIcon={false}
                    onChange={onTagChange}
                    renderInput={(params) => safeSelectedList.length > 0 ? (
                        <TextField {...params} className={clsx(classes.bottomShadow, classes.tagSelected, classes.sidebar)} style={{ maxHeight: 45 }} />
                    ) : (
                        <Typography className={clsx(classes.bottomShadow, classes.noSelection)}>
                            {noSelectionText || t('notifications.noGroupsSelected')}
                        </Typography>
                    )}
                />
            ) : (
                <Autocomplete
                    multiple
                    value={safeSelectedList}
                    options={safeSelectedList}
                    getOptionSelected={(option, value) => option.GroupName === value.GroupName}
                    getOptionLabel={(group) => group.GroupName || ''}
                    defaultValue={[]}
                    open={false}
                    popupIcon={false}
                    onChange={onTagChange}
                    renderInput={(params) => safeSelectedList.length > 0 ? (
                        <TextField {...params} className={clsx(classes.bottomShadow, classes.tagSelected, classes.sidebar)} style={{ maxHeight: 45 }} />
                    ) : (
                        <Typography className={clsx(classes.bottomShadow, classes.noSelection)}>
                            {noSelectionText || t('notifications.noGroupsSelected')}
                        </Typography>
                    )}
                />
            )}

            {/* Virtual List */}
            <div className={clsx(classes.demo, classes.sidebar)} style={{ height: innerHeight }}>
                <List
                    height={innerHeight}
                    itemCount={totalItems}
                    itemSize={ITEM_HEIGHT}
                    overscanCount={5} // Render a few extra items for smooth scrolling
                >
                    {ListItemRenderer}
                </List>
            </div>
        </Box>
    );
};

// Separate components for better performance
const GroupItemRenderer = React.memo(({
    style, item, selectedList, onSelectGroup, classes, isRTL,
    groupHover, setIsHover, isNotifications, groupCompareKey, t
}) => {
    const groupIdKey = groupCompareKey === '' ? (isNotifications ? "Id" : "GroupID") : groupCompareKey;
    const groupRecipientsKey = isNotifications ? "Members" : "Recipients";
    const isExist = selectedList?.some(group => group[groupIdKey] === item[groupIdKey]);

    return (
        <div style={style}>
            <ListItem
                onClick={() => onSelectGroup(item)}
                style={{ cursor: 'pointer', height: ITEM_HEIGHT }}
                onMouseEnter={() => setIsHover(item[groupIdKey])}
                onMouseLeave={() => setIsHover(null)}
                className={clsx(groupHover === item[groupIdKey] ? classes.hoverListItem : null, 'group-container')}
            >
                <ListItemAvatar className={classes.itemAvatar}>
                    <Avatar className={clsx(
                        classes.listIcon,
                        isExist ? classes.redBg : classes.transparentBg,
                        isExist ? classes.white : classes.blue,
                        isExist ? classes.borderRed : classes.borderPrimary
                    )}>
                        {isExist ?
                            <FaCheck className={classes.white} /> :
                            <HiUserGroup className={classes.colrPrimary} />
                        }
                    </Avatar>
                </ListItemAvatar>
                <Box dir={isRTL ? "rtl" : "ltr"} width="100%">
                    <ListItemText
                        className={clsx('groupText', !isRTL && classes.textLeft)}
                        title={item.GroupName}
                        primary={item.GroupName}
                    />
                </Box>
                <Box dir={isRTL ? "rtl" : "ltr"} width="100%">
                    <Box className={clsx('groupText', classes.itemAvatar, isRTL ? classes.textLeft : classes.textRight)}>
                        {item[groupRecipientsKey].toLocaleString()} {' '}
                        {item[groupRecipientsKey] !== 1 ? t("notifications.recipients") : t("notifications.recipient")}
                    </Box>
                </Box>
            </ListItem>
        </div>
    );
});

const CampaignItemRenderer = React.memo(({
    style, item, selectedList, isSms, onSelectGroup, classes, isRTL, groupHover, setIsHover
}) => {
    const idKey = isSms ? 'SMSCampaignID' : 'CampaignID';
    const isExist = selectedList?.some(c => c[idKey] === item[idKey]);

    return (
        <div style={style}>
            <ListItem
                onClick={() => onSelectGroup(item)}
                style={{ cursor: 'pointer', height: ITEM_HEIGHT }}
                onMouseEnter={() => setIsHover(item[idKey])}
                onMouseLeave={() => setIsHover(null)}
                className={groupHover === item[idKey] ? classes.hoverListItem : null}
            >
                <ListItemAvatar>
                    <Avatar className={clsx(
                        classes.listIcon,
                        isExist ? classes.redBg : classes.transparentBg,
                        isExist ? classes.white : classes.blue,
                        isExist ? classes.borderRed : classes.borderPrimary
                    )}>
                        {isExist ?
                            <FaCheck className={classes.white} /> :
                            <HiUserGroup className={classes.colrPrimary} />
                        }
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    className={clsx('groupText', !isRTL && classes.textLeft)}
                    title={item.Name}
                    primary={item.Name}
                />
            </ListItem>
        </div>
    );
});

export default React.memo(Groups);