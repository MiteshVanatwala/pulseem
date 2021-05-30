import React, { useState, useEffect, useRef } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Box } from '@material-ui/core'

const LazyBackground = (props) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const imageLoader = new Image();
    imageLoader.src = props.url;

    imageLoader.onload = () => {
        setImageLoaded(true);
    };
    imageLoader.onerror = () => {
        setImageLoaded(false);
    };

    return imageLoaded ? (
        <Box className="responsive-bg" style={{ backgroundImage: `url('${props.url}')` }}>{props.children}</Box>
    ) : (<Skeleton variant="rect" width="100%" height={130} />);
}

export default LazyBackground;