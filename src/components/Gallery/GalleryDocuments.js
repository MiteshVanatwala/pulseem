import { AiOutlineCloudUpload } from 'react-icons/ai';
import { Button, Grid, Box } from '@material-ui/core'
import { Image } from './Image'
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { deleteGalleryFile, uploadFile } from '../../redux/reducers/gallerySlice';
import { PulseemFolderType } from '../../model/PulseemFields/Fields';
import { Loader } from '../Loader/Loader';

export const GalleryDocuments = ({
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

    const documentsPerScroll = 100;
    const [docs, setDocs] = useState([]);
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [fileToUpload, setFileToUpload] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [galleryReady, setGalleryReady] = useState(false);
    const [isReInit, setReinit] = useState(false);
    const hiddenFileInput = React.useRef(null);
    const [showLoader, setLoader] = useState(false);
    const { uploadProgress } = useSelector(state => state.gallery);


    useEffect(() => {
        if (fileToUpload != null && isFilePicked) {
            setLoader(true);
            setIsFilePicked(false);
            setFileToUpload(null);
            const formData = new FormData();
            formData.append('File', fileToUpload);
            if (fileToUpload.size > 1048576) {
                onToast({ severity: 'error', color: 'error', message: t('common.maxDocumentSize'), showAnimtionCheck: false })
                setFileToUpload(null);
                return;
            }
            new Promise(resolve => {
                const formData = new FormData();
                formData.append("file", fileToUpload);
                formData.append("FolderName", selectedFolder);
                formData.append("FolderType", PulseemFolderType.DOCUMENT);
                resolve(formData);
            }).then(async (result) => {
                await dispatch(uploadFile(result));
                setLoader(false);
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
    const deleteDocument = (fileModel) => async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const fModel = { ...fileModel };
        fModel.FolderName = fileModel.FolderName.replace('main\\', '');
        fModel.FolderType = PulseemFolderType.DOCUMENT;
        await dispatch(deleteGalleryFile(fModel));
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
                setDocs(null);
            }
            else {
                const currentFeed = [...folder.files].slice(scrollIndex * documentsPerScroll, (scrollIndex + 1) * documentsPerScroll);
                if (folder.files.length < 100) {
                    setDocs(folder.files)
                }
                else {
                    if (scrollIndex > 0) {
                        if (folder.files.length > docs.length) {
                            setDocs([...docs, ...currentFeed]);
                        }
                        else {
                            onReachToLimit();
                        }
                    }
                    else {
                        setDocs(currentFeed);
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
                        accept=".doc,.docx,.pdf,.rtf,.xls,.xlsv,.csv,.txt,.jpg,.jpeg,.ppt" />
                    <Box className="img-container drag-here">
                        <AiOutlineCloudUpload style={{ fontSize: 30 }} />
                        {t('common.chooseFile')}
                    </Box>
                </Button>
            </Grid>
            {
                docs && docs.map((f, index) => {
                    const fileKey = f.FileName;
                    // const fileKey = `${f.FolderName.replace('\\', '')}_${index}`;
                    const fileExtension = f.FileURL.split('.')[f.FileURL.split('.').length - 1];
                    return <Image
                        classes={classes}
                        onSelectFile={onSelectFile}
                        onDelete={deleteDocument}
                        imgSrc={f.FileURL}
                        imgKey={fileKey}
                        fileIndex={index}
                        selectedFile={selectedFile}
                        imgFile={f}
                        key={`g_${index}`}
                        folderType={PulseemFolderType.DOCUMENT}
                        fileExtension={fileExtension}
                    />
                })
            }
            <Loader isOpen={showLoader} progress={uploadProgress} message={t("common.uploadInProgress")} />
        </Grid>)
    }
    return <></>
}
