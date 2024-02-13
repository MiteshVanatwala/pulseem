import { useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Box } from '@material-ui/core'

const LazyBackground = (props) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const { url = '', style = null, children = <></> } = props;

    const imageLoader = new Image();
    imageLoader.src = url;

    imageLoader.onload = () => {
        setImageLoaded(true);
    };
    imageLoader.onerror = () => {
        setImageLoaded(false);
    };

    const bgObject = { backgroundImage: `url('${url}')` }
    if (style) {
        Object.keys(style)?.forEach((key) => {
            bgObject[key] = style[key];
        });
    }
    else {
        bgObject.backgroundSize = "cover";
    }

    return imageLoaded ? (
        <Box title={props?.title} className="responsive-bg" style={bgObject}>{children}</Box>
    ) : (<Skeleton variant="rect" width="100%" height={130} />);
}

export default LazyBackground;