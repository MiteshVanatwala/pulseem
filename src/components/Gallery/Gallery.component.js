import React, { useState, useEffect } from 'react';
import {
    Typography, Button, TextField, Grid, Box, Divider
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createFolder, getFileGallery } from '../../redux/reducers/gallerySlice';
import clsx from 'clsx';
import './Gallery.styles.css';
import moment from 'moment'
import 'moment/locale/he'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import FolderIcon from '@material-ui/icons/Folder';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';
import InputAdornment from '@material-ui/core/InputAdornment';
import { PulseemFolderType } from '../../model/PulseemFields/Fields';

import Toast from '../Toast/Toast.component';
import { GalleryImages } from './GalleryImages'
import { GalleryDocuments } from './GalleryDocuments'
import { MdArrowBackIos, MdArrowForwardIos } from 'react-icons/md';

const Gallery = ({
    classes,
    isConfirm,
    callbackSelectFile,
    folderType = PulseemFolderType.CLIENT_IMAGES,
    multiSelect = false,
    selected,
    forceReload = false }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [folders, setFolders] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [scrollIndex, setScrollIndex] = useState(0);
    const [selectedFile, setSelectedFile] = useState(multiSelect ? selected : null);
    const [toastMessage, setToastMessage] = useState(null);
    const [selectedNode, setSelectedNode] = useState('k_0');
    const [selectedFileURL, setSelectedFileURL] = useState(multiSelect ? [] : null);
    const [selectedFolder, setSelectedFolder] = useState('main');
    const [folderCreationState, setShowFolderCreation] = useState(false);
    const { windowSize, language, isRTL } = useSelector(state => state.core)
    const { gallery } = useSelector(state => state.gallery)

    const renderToast = () => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 3000);
            return (
                <Toast data={toastMessage} />
            );
        }
        return null;
    }

    moment.locale(language);

    const initGallery = async (forceInit) => {
        if (!gallery || forceInit || forceReload) {
            await dispatch(getFileGallery(folderType));
        }
    }

    useEffect(() => {
        if (gallery) {
            const f = Object.keys(gallery);
            const tmpFolders = [];
            f.forEach((folder, index) => {
                const folderFiles = [...gallery[folder]];
                const folderName = index === 0 ? "main" : folder;
                var files = folderFiles.sort((a, b) => {
                    return new Date(b?.CreatedDate) - new Date(a?.CreatedDate);
                });
                tmpFolders.push({ FolderName: folderName, files: files });
            });
            setFolders(tmpFolders);
        }
    }, [gallery])

    useEffect(() => {
        initGallery(true);
    }, [])

    const useTreeItemStyles = makeStyles((theme) => ({
        root: {
            color: theme.palette.text.secondary,
            '&:hover > $content': {
                backgroundColor: theme.palette.action.hover,
            },
            '&:focus > $content, &$selected > $content': {
                backgroundColor: 'rgba(0,0,0,.1)'
            },
            '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
                backgroundColor: 'transparent',
            },
        },
        content: {
            color: theme.palette.text.secondary,
            paddingRight: theme.spacing(1),
            fontWeight: theme.typography.fontWeightMedium,
            '$expanded > &': {
                fontWeight: theme.typography.fontWeightRegular,
            },
        },
        group: {
            marginLeft: 0,
            '& $content': {
                paddingLeft: theme.spacing(2),
            },
        },
        selected: {
            color: 'transparent'
        },
        label: {
            fontWeight: 'inherit',
            color: 'inherit',
        },
        labelRoot: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.5, 0),
        },
        labelIcon: {
            color: '#48a148',
            marginRight: theme.spacing(1),
            backgroundColor: 'transparent'
        },
        labelSubIcon: {
            color: '#0371ad',
            marginRight: theme.spacing(1),
            backgroundColor: 'transparent'
        },
        labelLastIcon: {
            color: '#3498DB',
            marginRight: theme.spacing(1),
            backgroundColor: 'transparent'
        },
        labelText: {
            fontWeight: 'inherit',
            flexGrow: 1
        },
    }));

    const renderFolders = () => {
        if (folders != null) {
            return (
                <TreeView
                    key={selectedNode}
                    className={classes.root}
                    defaultCollapseIcon={<ArrowDropDownIcon />}
                    defaultExpandIcon={<ArrowRightIcon />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    onNodeSelect={handleSelectNodeFolder}
                    selected={selectedNode}

                >
                    {folders.map((f, index) => {
                        return (
                            <StyledTreeItem
                                title={f.FolderName === "main" ? (isRTL ? "ראשי" : "Main") : f.FolderName}
                                key={`k_${index}`}
                                style={{ direction: isRTL ? 'rtl' : 'ltr', paddingInlineStart: f.FolderName.split('\\').length * 7 }}
                                nodeId={`k_${index}`}
                                labelText={`${f.FolderName === "main" ? (isRTL ? "ראשי" : "Main") : f.FolderName} (${f.files ? f.files.length : 0})`}
                                labelIcon={FolderIcon}
                                bgColor="transparent"
                            >
                            </StyledTreeItem>
                        )
                    })}
                </TreeView>
            );
        }
    }
    const handleSelectNodeFolder = (event, nodeIds) => {
        setSelectedNode(nodeIds);
        const i = nodeIds.replace('k_', '');
        setSelectedFolder(folders[i].FolderName);
        setScrollIndex(0);
    }
    const handleSelectFile = (fileUrl, fileIndex) => () => {
        setSelectedFile(multiSelect ?
            (
                selectedFile?.indexOf(fileIndex) === -1 ?
                    [...selectedFile, fileIndex] : selectedFile.filter(obj => obj !== fileIndex)
            )
            : fileIndex);
        setSelectedFileURL(multiSelect ?
            (
                selectedFileURL?.indexOf(fileUrl) === -1 ?
                    [...selectedFileURL, fileUrl] : selectedFileURL.filter(obj => obj !== fileUrl)
            )
            : fileUrl);
    }

    useEffect(() => {
        if (isConfirm) {
            // callbackSelectFile(encodeURI(selectedFileURL));
            callbackSelectFile(multiSelect ? selectedFileURL.join(',') : selectedFileURL);
        }

    }, [isConfirm])

    const [referenceNode, setReferenceNode] = useState();

    const handleScroll = (event) => {
        var node = event.target;
        const bottom = node.scrollHeight - node.scrollTop === node.clientHeight;
        if (bottom) {
            setScrollIndex(scrollIndex + 1);
        }
    }

    const removeScrollHanlder = () => {
        if (referenceNode) {
            referenceNode.removeEventListener('scroll', handleScroll);
        }
    }

    const paneDidMount = (node) => {
        if (node) {
            node.addEventListener('scroll', handleScroll);
            setReferenceNode(node);
        }
    };

    function StyledTreeItem(props) {
        const classes = useTreeItemStyles();
        const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

        return (
            <TreeItem
                label={
                    <div className={classes.labelRoot}>
                        <LabelIcon className={other?.title.split('\\').length > 2 ? classes.labelLastIcon : other?.title.split('\\').length === 2 ? classes.labelSubIcon : classes.labelIcon} />
                        <Typography variant="body2" className={classes.labelText}>
                            {labelText}
                        </Typography>
                        <Typography variant="caption" color="inherit">
                            {labelInfo}
                        </Typography>
                    </div>
                }
                style={{
                    '--tree-view-color': color,
                    '--tree-view-bg-color': bgColor,
                }}
                classes={{
                    root: classes.root,
                    content: classes.content,
                    expanded: classes.expanded,
                    selected: classes.selected,
                    group: classes.group,
                    label: classes.label,
                }}
                {...other}
            />
        );
    }
    StyledTreeItem.propTypes = {
        bgColor: PropTypes.string,
        color: PropTypes.string,
        labelIcon: PropTypes.elementType.isRequired,
        labelSubIcon: PropTypes.elementType.isRequired,
        labelInfo: PropTypes.string,
        labelText: PropTypes.string.isRequired,
    };

    const renderCreateFolder = () => {
        const handleCreateFolderRow = () => {
            setShowFolderCreation(!folderCreationState);
        }
        const handleFolderName = (event) => {
            setFolderName(event.target.value)
        }
        const createNewFolder = async (event) => {
            event.preventDefault();
            const folderExists = folders?.filter(f => f.FolderName === folderName).length > 0;
            if (!folderExists) {
                await dispatch(createFolder({ FolderName: folderName, FolderType: folderType }));
                initGallery(true);
                handleCreateFolderRow();
                setFolderName('');
            }
            else {
                setToastMessage({ severity: 'error', color: 'error', message: t('common.folderAlreadyExists'), showAnimtionCheck: false });
            }
        }
        return (
            <Box>
                {!folderCreationState && <Button
                    className={clsx(
                        classes.btn,
                        classes.btnRounded
                    )}
                    endIcon={isRTL ? <MdArrowBackIos /> : <MdArrowForwardIos />}
                    color="primary"
                    onClick={handleCreateFolderRow}>
                    {t('common.createFolder')}

                </Button>
                }
                <Box className={!folderCreationState ? classes.hidden : null}>
                    <Grid container>
                        <Grid item xs={8}>
                            <TextField
                                placeholder={t('common.createFolder')}
                                id="createFolder"
                                required
                                margin="dense"
                                onChange={handleFolderName}
                                style={{ borderBottom: '1px solid' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FolderIcon style={{ color: '#48a148' }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Grid item xs={12}>
                                <Button
                                    variant='contained'
                                    size='medium'
                                    className={clsx(
                                        classes.actionButton,
                                        classes.actionButtonLightGreen,
                                        classes.backButton,
                                        folderName !== '' ? null : classes.disabled
                                    )}
                                    style={{ margin: '8px' }}
                                    onClick={createNewFolder}>
                                    {t('common.save')}
                                </Button>
                                <Button onClick={handleCreateFolderRow}>{t("common.cancel")}</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }
    const renderUploadNotice = () => {
        function createMarkup() {
            return { __html: t("common.uploadNotice") };
        }
        return (
            <label dangerouslySetInnerHTML={createMarkup()}></label>
        );
    }

    return (
        <div className={classes.root} style={{
            minWidth: 'calc(50vw - 15px)'
        }}>
            <Divider style={{ margin: '15px 0' }} />
            <Grid container className={classes.galleryGrid}>
                <Grid item md={3} xs={12} className={clsx(classes.sidebar, classes.folders)}>
                    {renderFolders()}
                </Grid>
                <Grid item md={9} xs={12} className={clsx(classes.sidebar, classes.gallery)}
                    onScroll={handleScroll} ref={paneDidMount}>
                    {
                        (folders && folderType === PulseemFolderType.CLIENT_IMAGES) ? <GalleryImages
                            classes={classes}
                            folder={folders.find((f) => { return f.FolderName === selectedFolder })}
                            onReInitGallery={() => { initGallery(true) }}
                            selectedFolder={selectedFolder}
                            scrollIndex={scrollIndex}
                            isRTL={isRTL}
                            selectedFile={selectedFile}
                            onSelectFile={handleSelectFile}
                            onToast={setToastMessage}
                            onReachToLimit={removeScrollHanlder} />
                            :
                            (folders && folderType === PulseemFolderType.DOCUMENT) ? <GalleryDocuments
                                classes={classes}
                                folder={folders.find((f) => { return f.FolderName === selectedFolder })}
                                onReInitGallery={() => { initGallery(true) }}
                                selectedFolder={selectedFolder}
                                scrollIndex={scrollIndex}
                                isRTL={isRTL}
                                selectedFile={selectedFile}
                                onSelectFile={handleSelectFile}
                                onToast={setToastMessage}
                                onReachToLimit={removeScrollHanlder} />
                                :
                                <></>
                    }
                </Grid>
            </Grid>
            <Divider style={{ margin: '15px 0' }} />
            <Grid container>
                <Grid item md={folderType === PulseemFolderType.CLIENT_IMAGES ? 6 : 12} xs={12}>
                    {renderCreateFolder()}
                </Grid>
                {folderType === PulseemFolderType.CLIENT_IMAGES && <Grid item md={6} xs={12} style={{ paddingTop: windowSize === "xs" ? 10 : null, paddingBottom: windowSize === "xs" ? 10 : null, display: 'flex', justifyContent: 'flex-end' }}>
                    {renderUploadNotice()}
                </Grid>}
            </Grid>
            {renderToast()}
        </div>
    );
}

export default Gallery;
