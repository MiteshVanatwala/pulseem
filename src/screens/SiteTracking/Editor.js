import { useEffect, useState } from 'react';
import DefaultScreen from '../DefaultScreen'
import { Loader } from '../../components/Loader/Loader'
const SiteTrackingEditor = ({ classes, ...props }) => {
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setShowLoader(false);
        }, 1000);
    });

    const PageSettings = () => {
        return <>Hello site tracking</>
    }

    return <DefaultScreen
        currentPage='SiteTracking'
        classes={classes}
        containerClass={classes.management}>
            <PageSettings />
        <Loader isOpen={showLoader} />
    </DefaultScreen>
}

export default SiteTrackingEditor;