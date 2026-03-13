export const injectRecaptchaScript = (htmlData: string, enableRecaptcha: boolean, siteKey: string): string => {
  if (!enableRecaptcha || !siteKey) {
    return htmlData;
  }

  // Add data attribute to body to mark that reCAPTCHA is enabled
  const bodyWithAttribute = htmlData.replace(
    /<body([^>]*)>/i,
    `<body$1 data-recaptcha-enabled="true" data-recaptcha-sitekey="${siteKey}">`
  );

  // Add initialization script that will inject reCAPTCHA on page load
  const initScript = `
<script>
(function() {
  function initRecaptcha() {
    const body = document.body;
    if (body && body.getAttribute('data-recaptcha-enabled') === 'true') {
      const siteKey = body.getAttribute('data-recaptcha-sitekey');
      
      // Inject reCAPTCHA script
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=' + siteKey;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      // Wait for grecaptcha to be available
      script.onload = function() {
        attachFormHandler(siteKey);
      };
    }
  }
  
  function attachFormHandler(siteKey) {
    function handleFormSubmit(e) {
      const form = e.target;
      if (!form.querySelector('input[name="g-recaptcha-response"]')) {
        e.preventDefault();
        grecaptcha.ready(function() {
          grecaptcha.execute(siteKey, {action: 'submit'}).then(function(token) {
            let input = form.querySelector('input[name="g-recaptcha-response"]');
            if (!input) {
              input = document.createElement('input');
              input.type = 'hidden';
              input.name = 'g-recaptcha-response';
              form.appendChild(input);
            }
            input.value = token;
            form.submit();
          });
        });
      }
    }
    
    const forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
      form.addEventListener('submit', handleFormSubmit);
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecaptcha);
  } else {
    initRecaptcha();
  }
})();
</script>
  `;
  
  // Check if script is already injected
  if (bodyWithAttribute.includes('data-recaptcha-enabled')) {
    // Inject before closing </body> tag
    if (bodyWithAttribute.includes('</body>')) {
      return bodyWithAttribute.replace('</body>', `${initScript}</body>`);
    }
    // Fallback: append at end
    return bodyWithAttribute + initScript;
  }
  
  return bodyWithAttribute;
};
