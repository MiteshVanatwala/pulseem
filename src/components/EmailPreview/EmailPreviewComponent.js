import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Box } from '@material-ui/core';
import { Loader } from '../Loader/Loader';
import { getNewsletterPreview } from '../../redux/reducers/newsletterSlice';
import { formatDisplayConditionsForPreview } from '../../helpers/Utils/displayConditionPreviewUtils';

const EmailPreviewComponent = ({ campaignId, height = 400 }) => {
  const dispatch = useDispatch();
  const hostRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;

    const fetchAndRender = async () => {
      setLoading(true);
      const response = await dispatch(getNewsletterPreview(campaignId));
      const rawHtml =
        response?.payload?.Data?.AmpData ||
        response?.payload?.Data?.HTMLtoSend ||
        response?.payload?.Data?.HTML ||
        '';

      const formattedHtml = formatDisplayConditionsForPreview(rawHtml);

      if (hostRef.current) {
        let shadow = hostRef.current.shadowRoot;
        if (!shadow) {
          shadow = hostRef.current.attachShadow({ mode: 'open' });
        }
        shadow.innerHTML = formattedHtml;
      }

      setLoading(false);
    };

    fetchAndRender();
  }, [campaignId]);

  return (
    <Box style={{ position: 'relative', height, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 4, background: '#fff', direction: 'ltr' }}>
      <div ref={hostRef} style={{ width: '100%' }} onClickCapture={(e) => e.preventDefault()} />
      <Loader isOpen={loading} showBackdrop={true} />
    </Box>
  );
};

export default EmailPreviewComponent;
