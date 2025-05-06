import { AiOutlineCloudUpload } from 'react-icons/ai';
import { Button, Grid, Box } from '@material-ui/core'
import { Image } from './Image'
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { deleteGalleryFile, uploadFiles } from '../../redux/reducers/gallerySlice';
import { PulseemFolderType } from '../../model/PulseemFields/Fields';
import { Loader } from '../Loader/Loader';
import { AllowedExentions, ImageExtensions } from '../../model/Gallery/FileExtentions';

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
    const [fileToUploads, setFileToUpload] = useState(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [galleryReady, setGalleryReady] = useState(false);
    const hiddenFileInput = useRef(null);
    const [showLoader, setLoader] = useState(false);
    const { uploadProgress } = useSelector(state => state.gallery);


    useEffect(() => {
        if (fileToUploads != null && isFilePicked) {
            setLoader(true);
            setIsFilePicked(false);
            setFileToUpload(null);
            const promises = [];
            const errorList = [];
            const formData = new FormData();
            formData.append("FolderName", selectedFolder);
            formData.append("FolderType", PulseemFolderType.DOCUMENT);
            for (var i = 0; i < fileToUploads.length; i++) {
                const fileToUpload = fileToUploads[i];

                const splitFileName = fileToUpload.name.split('.');
                const fileExtension = splitFileName[splitFileName.length - 1];

                if (!AllowedExentions.find(x => x?.toLowerCase() === fileExtension?.toLowerCase())) {
                    errorList.push(`${fileToUpload.name} - ${t('common.notAllowedExtension')}`);
                    break;
                }

                if (fileToUpload.size > 10485760) {
                    errorList.push(`${fileToUpload.name} - ${t('common.maxImageSize')}`);
                    break;
                }

                const promise = new Promise(resolve => {
                    formData.append(fileToUpload.name, fileToUpload);
                    resolve();
                });
                promises.push(promise);
            }
            if (errorList?.length > 0) {
                onToast({ severity: 'error', color: 'error', message: `${errorList.join(',')}`, showAnimtionCheck: false })
                setLoader(false);
            }
            else {
                Promise.all(promises).then(() => {
                    dispatch(uploadFiles(formData)).then((response) => {
                        const uploadedFiles = response?.payload.Message?.filter((f) => { return f.Uploaded === true });
                        const successMessage = `${uploadedFiles?.length} ${t('common.filesUploaded')}`;
                        onToast({ severity: 'success', color: 'success', message: `${successMessage}`, showAnimtionCheck: false })

                        onReInitGallery();
                        setLoader(false);
                        hiddenFileInput.current.value = null;
                    });
                })
            }
        }

    }, [fileToUploads]);

    const changeHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setFileToUpload(event.target.files);
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
                        multiple
                        ref={hiddenFileInput}
                        onChange={changeHandler}
                        hidden
                        accept=".ics,.doc,.docx,.pdf,.rtf,.xls,.xlsx,.xlsv,.csv,.txt,.jpg,.jpeg,.png,.ppt,.pptx,.mp3,.wav" />
                    <Box className="img-container drag-here">
                        <AiOutlineCloudUpload style={{ fontSize: 30 }} />
                        {t('common.chooseFile')}
                    </Box>
                </Button>
            </Grid>
            {
                docs && docs.map((f, index) => {
                    const fileKey = f.FileName;
                    const fileExtension = f?.Extension?.replace('.', '');
                    let imageType = PulseemFolderType.DOCUMENT;
                    if (ImageExtensions.find(x => x === fileExtension)?.length > 0) {
                        imageType = PulseemFolderType.CLIENT_IMAGES;
                    }
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
                        folderType={imageType}
                        fileExtension={fileExtension}
                    />
                })
            }
            <Loader isOpen={showLoader} progress={uploadProgress} message={t("common.uploadInProgress")} />
        </Grid>)
    }
    return <></>
}
