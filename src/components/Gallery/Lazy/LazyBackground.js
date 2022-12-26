import { useState } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Box } from '@material-ui/core'

const LazyBackground = (props) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    function loadImg(options, callback) {
        var seconds = 0,
            maxSeconds = 10,
            complete = false,
            done = false;

        if (options.maxSeconds) {
            maxSeconds = options.maxSeconds;
        }

        function tryImage() {
            if (done) { return; }
            if (seconds >= maxSeconds) {
                callback({ err: 'timeout' });
                done = true;
                return;
            }
            if (complete && img.complete) {
                if (img.width && img.height) {
                    callback({ img: img });
                    done = true;
                    return;
                }
                callback({ err: '404' });
                done = true;
                return;
            } else if (img.complete) {
                complete = true;
            }
            seconds++;
            callback.tryImage = setTimeout(tryImage, 1000);
        }
        var img = new Image();
        img.onload = tryImage();
        img.src = options.src;
        tryImage();
    }
    loadImg({ src: props.url, maxSeconds: 10 }, function (status) {
        if (status.err) {
            console.error(props.url, status.err);
            setImageError(true);
            return;
        }
        else
            setImageLoaded(true);
    });

    const bgObject = { backgroundImage: `url('${props.url}')` }
    if (props?.style) {
        Object.assign(bgObject, ...props?.style);
    }
    else {
        bgObject["background-size"] = "cover";
    }
    if (imageError) {
        return <Box className="responsive-bg" style={bgObject} title={props?.title}> {props.children}</Box>
    }
    return imageLoaded ? (
        <Box className="responsive-bg" style={bgObject} title={props?.title}> {props.children}</Box >
    ) : (<Skeleton variant="rect" width="100%" height={props?.height ?? 130} />);
}

export default LazyBackground;