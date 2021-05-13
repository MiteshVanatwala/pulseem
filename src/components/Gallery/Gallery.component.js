import React, { useState, useEffect, useRef } from 'react';
import {
    Typography, Button, TextField, Grid, Box, Divider, GridList, GridListTile, GridListTileBar, ListSubheader
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { CreateFolder, getFileGallery, PostImageFile, DeleteGalleryFile } from '../../redux/reducers/commonSlice';
import clsx from 'clsx';
import './Gallery.styles.css';
import moment from 'moment'
import 'moment/locale/he'
import InfoIcon from '@material-ui/icons/Info';
import FolderOpen from '@material-ui/icons/FolderOpen';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import FolderIcon from '@material-ui/icons/Folder';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';


const Gallery = ({ classes, callbackSelectFile }) => {
    const dispatch = useDispatch();
    const { language } = useSelector(state => state.core)
    const { t } = useTranslation();
    const { isRTL } = useSelector(state => state.core);
    const [showFolderCreation, setFolderCreationVisibility] = React.useState(false);
    const [folders, setFolders] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState('main');
    const [gallery, setGallery] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedNode, setSelectedNode] = React.useState([]);
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

        setGallery(f);
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
                backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
                color: 'var(--tree-view-color)',
            },
            '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
                backgroundColor: 'transparent',
            },
        },
        content: {
            color: theme.palette.text.secondary,
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
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
        expanded: {},
        selected: {},
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
            marginRight: theme.spacing(1),
        },
        labelText: {
            fontWeight: 'inherit',
            flexGrow: 1,
        },
    }));

    const createFolder = () => { }
    const deleteFile = () => { }
    const folderImages = () => { }
    const renderFolders = () => {
        if (folders != null) {
            return (
                <TreeView
                    className={classes.root}
                    defaultExpanded={['0']}
                    defaultCollapseIcon={<ArrowDropDownIcon />}
                    defaultExpandIcon={<ArrowRightIcon />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                >
                    {folders.map((f, index) => {
                        return (
                            <StyledTreeItem
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                                nodeId={index}
                                labelText={`${f.FolderName == "main" ? "ראשי" : f.FolderName} (${f.files ? f.files.length : 0})`}
                                labelIcon={FolderIcon}
                                color={f.FolderName == selectedFolder ? '#48a148' : '#000'}
                                selected={selectedNode == index}
                                onClick={hendleSelectedFolder(f.FolderName, index)}
                            >
                            </StyledTreeItem>
                        )
                    })}
                </TreeView>
            );
        }
    }

    const handleFolderVisibility = () => {
        setFolderCreationVisibility(!showFolderCreation);
    }
    const hendleSelectedFolder = (folder, nodeId) => () => {
        setSelectedFolder(folder);
        setSelectedNode(nodeId)
    }
    const handleSelectFile = (fileUrl) => () => {
        setSelectedFile(fileUrl);
    }
    const onConfirm = () => {
        callbackSelectFile(selectedFile);
    }
    const renderFiles = () => {
        if (!folders) {
            return;
        }
        const currentFolder = folders.filter((f) => { return f.FolderName == selectedFolder })[0];

        if (currentFolder.files) {
            return (
                <GridList cellHeight={180} className={classes.gridList} spacing={4} style={{flexGrow: 1, maxWidth: 600,}}>
                    {currentFolder.files.map((f) => {
                        const filePath = `http://siteapi.pulseem.com/ClientImages/7878/${f.FolderName == "main" ? "" : f.FolderName.replace('main\\', '')}/${f.FileName}`;
                        return (<GridListTile key={f.FileName} className={classes.tile} cols={1} onClick={handleSelectFile(filePath)}>
                            <img src={filePath} alt={f.FileName} />
                            <GridListTileBar title={f.FileName} className={classes.imageInfo} />
                        </GridListTile>)
                    })}
                </GridList>
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

    return (
        <div className={classes.root}>
            <Grid container style={{ minHeight: 400 }}>
                <Grid item xs={3}>
                    {renderFolders()}
                </Grid>
                <Grid item xs={1}>
                    <Divider orientation="vertical" variant="middle"></Divider>
                </Grid>
                <Grid item xs={8}>
                    {renderFiles()}
                </Grid>
            </Grid>
        </div>
    );
}

export default Gallery;