import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@material-ui/core';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

interface EmbedCodeGeneratorProps {
  widgetId?: string;
}

// Token colors approximating the mockup's dark code theme.
const C = {
  comment: '#6a9955',
  string: '#ce9178',
  keyword: '#569cd6',
  ident: '#9cdcfe',
  plain: '#d4d4d4',
};

const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ widgetId }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const siteId = widgetId || 'YOUR_SITE_ID';

  // Plain-text snippet used for copy-to-clipboard.
  const snippet = `<!-- Pulseem Chat Widget -->
<script>
  (function(p,u,l,s,e,m){
    p['PulseemObject']=e;p[e]=p[e]||function(){
    (p[e].q=p[e].q||[]).push(arguments)};
    m=u.createElement(s);m.async=1;m.src='https://cdn.pulseem.com/widget/v1/pulseem.js';
    u.getElementsByTagName(l)[0].appendChild(m);
  })(window,document,'script','pulseem');
  pulseem('init', '${siteId}');
</script>
<!-- End Pulseem Chat Widget -->`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const s = (text: string, color: string) => <span style={{ color }}>{text}</span>;

  return (
    <Box p={3} bgcolor="#ffffff" borderRadius={12} border="1px solid #e5e7eb" boxShadow="0 4px 20px rgba(0,0,0,0.04)">
      <Typography variant="h6" style={{ fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
        {t('common.widget_installation', 'Installation')}
      </Typography>
      <Typography variant="body2" style={{ color: '#6b7280', marginBottom: 16 }}>
        {t('common.widget_installation_desc', 'Add this code to your website just before the closing </body> tag.')}
      </Typography>

      <Box position="relative" bgcolor="#1e1e1e" borderRadius={8} p={2} pt={2.5} style={{ overflowX: 'auto' }}>
        <Button
          size="small"
          onClick={handleCopy}
          startIcon={copied ? <CheckCircleOutlineIcon fontSize="small" /> : <FileCopyOutlinedIcon fontSize="small" />}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            textTransform: 'none',
            backgroundColor: '#374151',
            color: copied ? '#4ade80' : '#e5e7eb',
            padding: '2px 10px',
            fontSize: '0.75rem',
          }}
        >
          {copied ? t('common.widget_copied', 'Copied') : t('common.widget_copy_code', 'Copy Code')}
        </Button>

        <Box
          component="pre"
          style={{
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            fontSize: '0.72rem',
            lineHeight: 1.55,
            margin: 0,
            whiteSpace: 'pre',
            color: C.plain,
          }}
        >
          {s('<!-- Pulseem Chat Widget -->', C.comment)}{'\n'}
          {s('<script>', C.keyword)}{'\n'}
          {'  (function(p,u,l,s,e,m){\n'}
          {'    p['}{s("'PulseemObject'", C.string)}{']=e;p[e]=p[e]||function(){\n'}
          {'    (p[e].q=p[e].q||[]).push(arguments)};\n'}
          {'    m=u.createElement(s);m.async=1;m.src='}{s("'https://cdn.pulseem.com/widget/v1/pulseem.js'", C.string)}{';\n'}
          {'    u.getElementsByTagName(l)[0].appendChild(m);\n'}
          {'  })(window,document,'}{s("'script'", C.string)}{','}{s("'pulseem'", C.string)}{');\n'}
          {'  '}{s('pulseem', C.ident)}{'('}{s("'init'", C.string)}{', '}{s(`'${siteId}'`, C.string)}{');\n'}
          {s('</script>', C.keyword)}{'\n'}
          {s('<!-- End Pulseem Chat Widget -->', C.comment)}
        </Box>
      </Box>
    </Box>
  );
};

export default EmbedCodeGenerator;
