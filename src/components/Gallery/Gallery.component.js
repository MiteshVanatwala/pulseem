import React, { useState, useEffect, useRef } from 'react';
import {
    Typography, Button, TextField, Grid, Box, Divider, GridList, GridListTile, GridListTileBar, ListSubheader
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createFolder, getFileGallery, postImage, deleteGalleryFile } from '../../redux/reducers/commonSlice';
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
import { AiOutlineCheckCircle, AiOutlineCloudUpload } from 'react-icons/ai';
import InputAdornment from '@material-ui/core/InputAdornment';

const Gallery = ({ classes, isConfirm, callbackSelectFile }) => {
    const dispatch = useDispatch();
    const { language } = useSelector(state => state.core)
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    const [folders, setFolders] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState('main');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFileURL, setSelectedFileURL] = useState(null);
    const [selectedNode, setSelectedNode] = useState('k_0');
    const [folderCreationState, setShowFolderCreation] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const hiddenFileInput = React.useRef(null);


    moment.locale(language);

    const initGallery = async () => {
        const data = await dispatch(getFileGallery());
        if (data.error) {
            return;
        }

        const f = Object.keys(data.payload);
        const tmpFolders = [];
        f.forEach((folder, index) => {
            if (index == 0) {
                tmpFolders.push({ FolderName: "main", files: data.payload[folder] });
            } else {
                tmpFolders.push({ FolderName: folder.split("\\")[1], files: data.payload[folder] });
            }
        });
        setFolders(tmpFolders);
    }
    useEffect(() => {
        initGallery();
    }, [dispatch])

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
        labelText: {
            fontWeight: 'inherit',
            flexGrow: 1
        },
    }));

    const folderImages = () => { }
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
                                key={`k_${index}`}
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                nodeId={`k_${index}`}
                                labelText={`${f.FolderName == "main" ? (isRTL ? "ראשי" : "Main") : f.FolderName} (${f.files ? f.files.length : 0})`}
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
    }
    const handleSelectFile = (fileUrl, fileIndex) => () => {
        setSelectedFile(fileIndex);
        setSelectedFileURL(fileUrl);
    }

    useEffect(() => {
        if (isConfirm) {
            callbackSelectFile(encodeURI(selectedFileURL));
        }
    }, [isConfirm])
    // const onConfirm = () => {
    //     if (isConfirm) {

    //     }
    // }

    const renderFiles = () => {
        const deleteImage = (fileModel) => async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await dispatch(deleteGalleryFile(fileModel));
            initGallery();
        }
        const imageEnter = (fileId) => () => {
            document.getElementById(fileId).style.opacity = 1;
        }
        const imageLeave = (fileId) => () => {
            document.getElementById(fileId).style.opacity = 0;
        }
        const handleUploadClick = event => {
            hiddenFileInput.current.click();
        };
        const changeHandler = (event) => {
            setFileToUpload(event.target.files[0]);
            setIsFilePicked(true);
        };
        const uploadNewFile = (e) => {
            if (fileToUpload != null) {
                const formData = new FormData();
                formData.append('File', fileToUpload);
                if (fileToUpload.size > 1048576) {
                    return alert(t("max_image_size"));
                }
                new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        var binaryData = e.target.result;
                        var base64String = window.btoa(binaryData);
                        const imgBase64 =
                            "data:" + fileToUpload.type + ";base64," + base64String;
                        resolve(imgBase64);
                    };
                    reader.readAsBinaryString(fileToUpload);
                }).then(async (result) => {
                    const fileModel = {
                        FileName: fileToUpload.name,
                        Base64: result,
                        FolderName: selectedFolder
                    }

                    await dispatch(postImage(fileModel));
                    setFileToUpload(null);
                    initGallery();
                });
            }
        }

        if (!folders) {
            return;
        }
        const currentFolder = folders.find((f) => { return f.FolderName == selectedFolder });

        if (currentFolder.files) {
            return (
                <Grid container
                    direction="row"
                    alignItems="flex-start">
                    <Grid item xs={12}>{selectedFolder == "main" && isRTL ? "ראשי" : selectedFolder}</Grid>
                    <Grid item lg={4} md={6} xs={12}>
                        <Button
                            className={"select-image"}
                            onClick={handleUploadClick}
                            style={{ padding: "6px 8px", backgroundColor: 'transparent !important' }}>
                            <input type="file" name="file"
                                ref={hiddenFileInput}
                                onChange={changeHandler}
                                hidden
                                accept=".png,.jpg,.jpeg" />
                            <Box className="img-container drag-here">
                                <AiOutlineCloudUpload style={{ fontSize: 30 }} />
                                {t('common.chooseImage')}
                            </Box>
                        </Button>
                    </Grid>
                    {
                        currentFolder.files.map((f, index) => {
                            const filePath = `http://siteapi.pulseem.com/ClientImages/7878/${f.FolderName == "main" ? "" : f.FolderName.replace('main\\', '')}/${f.FileName}`;
                            return (
                                <Grid item lg={4} md={6} xs={12} key={index}
                                    onMouseEnter={imageEnter(`file_${index}`)}
                                    onMouseLeave={imageLeave(`file_${index}`)}
                                    id={index}
                                    style={{ padding: "6px 10px" }}
                                >
                                    <Box className="select-image" onClick={handleSelectFile(filePath, `${f.FolderName.replace('\\', '')}_${index}`)}>
                                        <Box className="img-container">
                                            <Box className="responsive-bg" style={{ backgroundImage: `url('${filePath}')` }}>
                                                <button
                                                    id={`file_${index}`}
                                                    className={clsx(classes.absTopRight)}
                                                    style={{ border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                                                    onClick={deleteImage(f)}
                                                >X</button>
                                            </Box>
                                            <Box title={f.FileName} className="image-info">
                                                <Typography className="elipsis-text" style={{ fontSize: 14 }}>
                                                    {f.FileName}
                                                </Typography>
                                                {selectedFile == `${f.FolderName.replace('\\', '')}_${index}` &&
                                                    <AiOutlineCheckCircle style={{ color: 'green', fontSize: 24, padding: '0 10px', width: 40 }} />
                                                }
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            )
                        })
                    }
                    { uploadNewFile()}
                </Grid >
            );
        }
    }
    function StyledTreeItem(props) {
        const classes = useTreeItemStyles();
        const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

        return (
            <TreeItem
                label={
                    <div className={classes.labelRoot}>
                        <LabelIcon color="inherit" className={classes.labelIcon} />
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
            await dispatch(createFolder(folderName));
            initGallery();
            setFolderName('');
            handleCreateFolderRow();
        }
        return (
            <Box>
                {!folderCreationState && <Button
                    variant='contained'
                    size='medium'
                    className={clsx(
                        classes.actionButton,
                        classes.actionButtonLightBlue,
                        classes.backButton
                    )}
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
                                        folderName != '' ? null : classes.disabled
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
        <div className={classes.root}>
            <Divider style={{ margin: '15px 0' }} />
            <Grid container style={{ minHeight: 400 }}>
                <Grid item xs={3} className="scroll">
                    {renderFolders()}
                </Grid>
                <Grid item xs={1}>
                    <Divider orientation="vertical" variant="middle"></Divider>
                </Grid>
                <Grid item xs={8} className="scroll">
                    {renderFiles()}
                </Grid>
            </Grid>
            <Divider style={{ margin: '15px 0' }} />
            <Grid container>
                <Grid item xs={8}>
                    {renderCreateFolder()}
                </Grid>
                <Grid item xs={4}>
                    {renderUploadNotice()}
                </Grid>
            </Grid>
        </div>
    );
}

export default Gallery;