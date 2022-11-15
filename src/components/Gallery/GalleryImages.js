import { AiOutlineCloudUpload } from 'react-icons/ai';
import { Button, Grid, Box } from '@material-ui/core'
import { Image } from './Image'
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { postFile, deleteGalleryFile } from '../../redux/reducers/gallerySlice';
import { PulseemFolderType } from '../../model/PulseemFields/Fields';

export const GalleryImages = ({
    classes,
    isRTL,
    folder,
    onToast = () => null,
    scrollIndex,
    selectedFile,
    selectedFolder,
    onSelectFile = () => null,
    onReInitGallery = () => null,
    onReachToLimit = () => null,
}) => {

    const imagesPerScroll = 100;
    const [images, setImages] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [galleryReady, setGalleryReady] = useState(false);
    const [isReInit, setReinit] = useState(false);
    const hiddenFileInput = React.useRef(null);


    useEffect(() => {
        if (fileToUpload != null && isFilePicked) {
            setIsFilePicked(false);
            setFileToUpload(null);
            const formData = new FormData();
            formData.append('File', fileToUpload);
            if (fileToUpload.size > 1048576) {
                onToast({ severity: 'error', color: 'error', message: t('common.maxImageSize'), showAnimtionCheck: false })
                setFileToUpload(null);
                return;
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
                    FolderName: selectedFolder,
                    FolderType: PulseemFolderType.CLIENT_IMAGES
                }
                await dispatch(postFile(fileModel));
                setReinit(true);
                onReInitGallery();
            });
        }
    }, [fileToUpload]);

    const changeHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setFileToUpload(event.target.files[0]);
        setIsFilePicked(true);
        return false;
    };
    const deleteImage = (fileModel) => async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const file = { ...fileModel };
        file.FolderName = fileModel.FolderName.replace('main\\', '');
        file.FolderType = PulseemFolderType.CLIENT_IMAGES;
        await dispatch(deleteGalleryFile(file));
        setReinit(true);
        onReInitGallery();
    }
    const handleUploadClick = () => {
        hiddenFileInput.current.click();
    };
    // END Gallery Functions

    useEffect(() => {
        if (folder && folder.files) {
            if (folder.files.length === 0) {
                setImages(null);
            }
            else {
                const currentFeed = [...folder.files].slice(scrollIndex * imagesPerScroll, (scrollIndex + 1) * imagesPerScroll);
                if (folder.files.length < 100) {
                    setImages(folder.files)
                }
                else {
                    if (scrollIndex > 0) {
                        if (folder.files.length > images.length) {
                            setImages([...images, ...currentFeed]);
                        }
                        else {
                            onReachToLimit();
                        }
                    }
                    else {
                        setImages(currentFeed);
                    }
                }
            }
            setGalleryReady(true);
        }
    }, [scrollIndex, selectedFolder, folder]);

    if (galleryReady) {
        return (<Grid container
            direction="row"
            alignItems="flex-start"
            style={{ width: '100%', padding: '0 25px', borderRight: isRTL ? '1px solid #ccc' : '', borderLeft: isRTL ? '' : '1px solid #ccc', height: '100%' }}>
            <Grid item xs={12}>{selectedFolder === "main" && isRTL ? "ראשי" : selectedFolder}</Grid>
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
                images && images.map((f, index) => {
                    // const imgKey = `${f.FolderName.replace('\\', '')}_${index}`;
                    const imgKey = f.FileName;
                    return (
                        <Image
                            classes={classes}
                            onSelectFile={onSelectFile}
                            onDelete={deleteImage}
                            imgSrc={f.FileURL}
                            imgKey={imgKey}
                            fileIndex={index}
                            selectedFile={selectedFile}
                            imgFile={f}
                            key={`g_${index}`}
                        />

                    )
                })
            }
        </Grid>)
    }
    return <></>
}
