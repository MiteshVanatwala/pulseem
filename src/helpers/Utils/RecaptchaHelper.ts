export const injectRecaptchaScript = (htmlData: string, enableRecaptcha: boolean, siteKey: string): string => {
  if (!enableRecaptcha || !siteKey) {
    return htmlData;
  }

  const recaptchaScript = `<script src="https://www.google.com/recaptcha/api.js" async defer></script>`;
  
  // Inject script before closing </head> tag
  if (htmlData.includes('</head>')) {
    return htmlData.replace('</head>', `${recaptchaScript}\n</head>`);
  }
  
  // If no </head> tag, inject at the beginning
  return recaptchaScript + htmlData;
};
