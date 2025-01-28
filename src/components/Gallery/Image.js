import LazyBackground from './Lazy/LazyBackground';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Typography, Grid, Box } from '@material-ui/core'
import { PulseemFolderType } from '../../model/PulseemFields/Fields';
import { BsFiletypeMp3 } from "react-icons/bs";

import {
    Word,
    File,
    Excel,
    Pdf,
    Ppt,
    Txt
} from '../../assets/images/managment/index';
import clsx from 'clsx';
import { useSelector } from 'react-redux';

export const Image = ({
    classes,
    onSelectFile = () => { },
    onDelete = () => { },
    imgSrc,
    imgKey,
    fileIndex,
    selectedFile = "",
    imgFile,
    fileExtension = null,
    folderType = PulseemFolderType.CLIENT_IMAGES }) => {

    const { userRoles } = useSelector(state => state.core)

    const icons = {
        xlsv: Excel,
        xlsx: Excel,
        xls: Excel,
        csv: Excel,
        doc: Word,
        docx: Word,
        pdf: Pdf,
        ppt: Ppt,
        txt: Txt,
        '': File,
        mp3: File,
        wav: File
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
                <Box className="img-container" style={{ border: selectedFile && (selectedFile === imgKey || selectedFile?.indexOf(imgKey) !== -1) ? "1px solid #000" : null }}>
                    {folderType === PulseemFolderType.CLIENT_IMAGES ?
                        (<LazyBackground url={imgSrc} key={imgKey}>
                            {userRoles.AllowDelete && <button
                                id={`file_${fileIndex}`}
                                className={clsx(classes.absTopRight)}
                                style={{ border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                                onClick={onDelete(imgFile)}
                            >X</button>}
                        </LazyBackground>) : (
                            <LazyBackground url={icons[fileExtension.toLowerCase()]} style={{ backgroundSize: 'auto !important' }} key={imgKey}>
                                {userRoles.AllowDelete && <button
                                    id={`file_${fileIndex}`}
                                    className={clsx(classes.absTopRight)}
                                    style={{ border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                                    onClick={onDelete(imgFile)}
                                >X</button>}
                            </LazyBackground>
                        )
                    }
                    <Box title={imgFile.FileName} className="image-info">
                        <Typography className="elipsis-text" style={{ fontSize: 14 }}>
                            {imgFile.FileName}
                        </Typography>
                        {selectedFile && (selectedFile === imgKey || selectedFile.indexOf(imgKey) !== -1) &&
                            <AiOutlineCheckCircle style={{ color: 'green', fontSize: 24, padding: '0 10px', width: 40 }} />
                        }
                    </Box>
                </Box>
            </Box>
        </Grid>
    )
}

