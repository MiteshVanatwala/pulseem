import LazyBackground from './Lazy/LazyBackground';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Typography, Grid, Box } from '@material-ui/core'
import { PulseemFolderType } from '../../model/PulseemFields/Fields';
import IconWrapper from '../icons/IconWrapper'
import {
    Word,
    File,
    Excel,
    Pdf,
    Ppt,
    Txt
} from '../../assets/images/managment/index';
import clsx from 'clsx';

export const Image = ({
    classes,
    onSelectFile = () => { },
    onDelete = () => { },
    imgSrc,
    imgKey,
    fileIndex,
    selectedFile,
    imgFile,
    fileExtension = null,
    folderType = PulseemFolderType.CLIENT_IMAGES }) => {

    const getFileIcon = () => {
        switch (fileExtension.toLowerCase()) {
            case 'xlsv':
            case 'xlsx':
            case 'xls':
            case 'csv': {
                return Excel;
            }
            case 'docx':
            case 'doc': {
                return Word;
            }
            case 'pdf': {
                return Pdf;
            }
            case 'ppt': {
                return Ppt;
            }
            case 'txt': {
                return Txt;
            }
            default: {
                return File;
            }
        }
    }
    const imageEnter = (fileId) => () => {
        const elem = document.getElementById(fileId);
        if (elem)
            document.getElementById(fileId).style.opacity = 1;
    }
    const imageLeave = (fileId) => () => {
        const elem = document.getElementById(fileId);
        if (elem)
            document.getElementById(fileId).style.opacity = 0;
    }

    return (
        <Grid item lg={4} md={6} xs={12} key={fileIndex}
            onMouseEnter={imageEnter(`file_${fileIndex}`)}
            onMouseLeave={imageLeave(`file_${fileIndex}`)}
            id={fileIndex}
            style={{ padding: "6px 10px" }}
        >
            <Box className="select-image" onClick={onSelectFile(imgSrc, imgKey)}>
                <Box className="img-container" style={{ border: selectedFile === imgKey ? "1px solid #000" : null }}>
                    {folderType === PulseemFolderType.CLIENT_IMAGES ?
                        (<LazyBackground url={imgSrc}>
                            <button
                                id={`file_${fileIndex}`}
                                className={clsx(classes.absTopRight)}
                                style={{ border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                                onClick={onDelete(imgFile)}
                            >X</button>
                        </LazyBackground>) : (
                            <LazyBackground url={getFileIcon()} style={[{ backgroundSize: 'auto !important' }]}>
                                <button
                                    id={`file_${fileIndex}`}
                                    className={clsx(classes.absTopRight)}
                                    style={{ border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                                    onClick={onDelete(imgFile)}
                                >X</button>
                            </LazyBackground>
                        )
                    }
                    <Box title={imgFile.FileName} className="image-info">
                        <Typography className="elipsis-text" style={{ fontSize: 14 }}>
                            {imgFile.FileName}
                        </Typography>
                        {selectedFile === imgKey &&
                            <AiOutlineCheckCircle style={{ color: 'green', fontSize: 24, padding: '0 10px', width: 40 }} />
                        }
                    </Box>
                </Box>
            </Box>
        </Grid>
    )
}

