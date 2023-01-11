import { useEffect, useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Box } from '@material-ui/core'
import { CiImageOff } from 'react-icons/ci';

const LazyBackground = (props) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const loadImage = () => {
        var image = new Image();
        image.src = props.url;

        image.onload = () => {
            setImageLoaded(true);
        }
        image.onerror = () => {
            setImageError(true);
        }
    }

    useEffect(() => {
        loadImage();
    }, []);

    const bgObject = { backgroundImage: `url('${props.url}')` }
    if (props?.style) {
        Object.assign(bgObject, props?.style);
    }
    else {
        bgObject["background-size"] = "cover";
    }

    if (imageError) {
        return <CiImageOff style={{ width: '100%', height: '100%', padding: 15 }} />
    }

    return imageLoaded ? (
        <Box className="responsive-bg" style={bgObject} title={props?.title}> {props.children}</Box >
    ) : (<Skeleton variant="rect" width="100%" height={props?.height ?? 130} />);
}

export default LazyBackground;