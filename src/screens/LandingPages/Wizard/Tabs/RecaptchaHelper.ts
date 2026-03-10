export const injectRecaptchaScript = (htmlContent: string | null | undefined, enableRecaptcha: boolean, recaptchaSiteKey: string): string => {
  if (!htmlContent || !enableRecaptcha || !recaptchaSiteKey) {
    return htmlContent || '';
  }

  const recaptchaScript = `<script src="https://www.google.com/recaptcha/api.js" async defer></script>`;
  
  if (htmlContent.includes('google.com/recaptcha/api.js')) {
    return htmlContent;
  }

  if (htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `${recaptchaScript}\n</head>`);
  }

  return recaptchaScript + htmlContent;
};
