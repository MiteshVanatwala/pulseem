// Manual reCAPTCHA Integration
// Creators add reCAPTCHA script directly in BEE Editor's custom code block
// No automatic injection - script is part of the page design

export const recaptchaManualIntegrationGuide = `
MANUAL reCAPTCHA v3 INTEGRATION:

1. Open BEE Editor
2. Add a Custom HTML/Code Block
3. Paste this script:

<script src="https://www.google.com/recaptcha/api.js"></script>
<script>
window.addEventListener('load', function() {
  grecaptcha.ready(function() {
    grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'}).then(function(token) {
      window.recaptchaToken = token;
      var hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = 'g-recaptcha-response';
      hiddenInput.value = token;
      document.body.appendChild(hiddenInput);
    });
  });
});
</script>

4. Replace YOUR_SITE_KEY with your actual reCAPTCHA site key
5. Save the page
6. BEE exports HTML with the script included
7. Backend stores and serves the HTML
8. When end user visits, script runs automatically
`;
