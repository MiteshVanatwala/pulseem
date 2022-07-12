const React = window.unlayer.React
function getCookie(cname) {
  try {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
  } catch (e) {
    console.error(e);
    return "";
  }
}

// Widgets
unlayer.registerPropertyEditor({
  name: 'radio',
  Widget: unlayer.createWidget({
    render(value, updateValue, data) {
      return `
      <div style="text-align: ${getCookie("Culture") === 'en-US' ? "left" : "right"}">
      <div class="blockbuilder-widget-label mb-2">
        <label class="blockbuilder-label-primary">
          <div class="">
            <span class="has-value same-value">${getCookie("Culture") === "en-US" ? "Direction" : "כיוון טקסט"}</span>
          </div>
        </label>
      </div>
      <div style="display: flex; justify-content: space-evenly">
        <div>
          <label for="custon_ltr">${getCookie("Culture") === "en-US" ? "Left to right" : "שמאל לימין"}</label>  <input type="radio" id="custon_ltr" name="direction" value="ltr" ${value === 'ltr' ? 'checked' : null}>
        </div>  
        <div>
          <label for="custon_rtl">${getCookie("Culture") === "en-US" ? "Right to left" : "ימין לשמאל"}</label> <input type="radio" id="custon_rtl" name="direction" value="rtl" ${value === 'rtl' ? 'checked' : null}>
        </div>
      </div>
      </div>`
    },
    mount(node, value, updateValue, data) {
      var rtl = node.querySelector('#custon_rtl');
      var ltr = node.querySelector('#custon_ltr');

      rtl.onchange = function (event) {
        updateValue(event.target.value)
      }
      ltr.onchange = function (event) {
        updateValue(event.target.value)
      }
    }
  })
});
//Header
unlayer.registerTool({
  name: 'Header',
  label: getCookie("Culture") === 'en-US' ? 'Header' : 'ראש המסמך',
  icon: 'fa-brands fa-laravel',
  supportedDisplayModes: ['web', 'email'],
  options: {
    footer: {
      title: getCookie("Culture") === 'en-US' ? "Company Details" : "פרטי החברה",
      position: 1,
      options: {
        "phone": {
          "label": getCookie("Culture") === 'en-US' ? "Phone" : "טלפון",
          "defaultValue": "",
          "widget": "text"
        },
        "fax": {
          "label": getCookie("Culture") === 'en-US' ? "Fax" : "פקס",
          "defaultValue": "",
          "widget": "text"
        },
        "email": {
          "label": getCookie("Culture") === 'en-US' ? "Email" : "דואר אלקטרוני",
          "defaultValue": "",
          "widget": "text"
        },
        "company": {
          "label": getCookie("Culture") === 'en-US' ? "Company Name" : "שם החברה",
          "defaultValue": "",
          "widget": "text"
        },
        "address": {
          "label": getCookie("Culture") === 'en-US' ? "Address" : "כתובת",
          "defaultValue": "",
          "widget": "text"
        },
        "city": {
          "label": getCookie("Culture") === 'en-US' ? "City" : "עיר",
          "defaultValue": "",
          "widget": "text"
        },
        "country": {
          "label": getCookie("Culture") === 'en-US' ? "Country" : "ארץ",
          "defaultValue": "",
          "widget": "text"
        },
      }
    },
    properties: {
      title: getCookie("Culture") === 'en-US' ? "Properties" : "מאפיינים",
      position: 2,
      options: {
        "alignment": {
          "label": getCookie("Culture") === 'en-US' ? "Text Align" : "יישור טקסט",
          "defaultValue": "center",
          "widget": "dropdown"
        },
      }
    }
  },
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return `<div style="font-weight: bold; text-align: center;">
        <span style="display: ${values.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.phone} | </span>
        <span style="display: ${values.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.fax} | </span>
        <span style="display: ${values.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.email}">${values.email}</a></span>
        <br />
        <span style="display: ${values.company !== '' ? 'inline-block' : 'none'}">${values.company},</span>
        <span style="display: ${values.address !== '' ? 'inline-block' : 'none'}">${values.address},</span>
        <span style="display: ${values.city !== '' ? 'inline-block' : 'none'}">${values.city},</span>
        <span style="display: ${values.country !== '' ? 'inline-block' : 'none'}">${values.country}</span>
    </div>`
      }
    }), // our React Viewer
    exporters: {
      web: function (values) {
        return `<div style="font-weight: bold; text-align: center">
        <span style="display: ${values.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.phone} | </span>
        <span style="display: ${values.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.fax} | </span>
        <span style="display: ${values.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.email}">${values.email}</a></span>
        <br />
        <span style="display: ${values.company !== '' ? 'inline-block' : 'none'}">${values.company},</span>
        <span style="display: ${values.address !== '' ? 'inline-block' : 'none'}">${values.address},</span>
        <span style="display: ${values.city !== '' ? 'inline-block' : 'none'}">${values.city},</span>
        <span style="display: ${values.country !== '' ? 'inline-block' : 'none'}">${values.country}</span>
    </div>`
      },
      email: function (values) {
        return `<div style="font-weight: bold; text-align: center">
        <span style="display: ${values.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.phone} | </span>
        <span style="display: ${values.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.fax} | </span>
        <span style="display: ${values.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.email}">${values.email}</a></span>
        <br />
        <span style="display: ${values.company !== '' ? 'inline-block' : 'none'}">${values.company},</span>
        <span style="display: ${values.address !== '' ? 'inline-block' : 'none'}">${values.address},</span>
        <span style="display: ${values.city !== '' ? 'inline-block' : 'none'}">${values.city},</span>
        <span style="display: ${values.country !== '' ? 'inline-block' : 'none'}">${values.country}</span>
    </div>`
      }
    },
    head: {
      css: function (values) { },
      js: function (values) { }
    }
  }
});
// Footer
unlayer.registerTool({
  name: 'Footer',
  label: getCookie("Culture") === 'en-US' ? 'Footer' : 'סיום מסמך',
  icon: 'fa-laravel',
  supportedDisplayModes: ['web', 'email'],
  options: {
    footer: {
      title: getCookie("Culture") === 'en-US' ? "Company Details" : "פרטי החברה",
      position: 1,
      options: {
        "phone": {
          "label": getCookie("Culture") === 'en-US' ? "Phone" : "טלפון",
          "defaultValue": "",
          "widget": "text"
        },
        "fax": {
          "label": getCookie("Culture") === 'en-US' ? "Fax" : "פקס",
          "defaultValue": "",
          "widget": "text"
        },
        "email": {
          "label": getCookie("Culture") === 'en-US' ? "Email" : "דואר אלקטרוני",
          "defaultValue": "",
          "widget": "text"
        },
        "company": {
          "label": getCookie("Culture") === 'en-US' ? "Company Name" : "שם החברה",
          "defaultValue": "",
          "widget": "text"
        },
        "address": {
          "label": getCookie("Culture") === 'en-US' ? "Address" : "כתובת",
          "defaultValue": "",
          "widget": "text"
        },
        "city": {
          "label": getCookie("Culture") === 'en-US' ? "City" : "עיר",
          "defaultValue": "",
          "widget": "text"
        },
        "country": {
          "label": getCookie("Culture") === 'en-US' ? "Country" : "ארץ",
          "defaultValue": "",
          "widget": "text"
        },
      }
    },
    properties: {
      title: getCookie("Culture") === 'en-US' ? "Properties" : "מאפיינים",
      position: 2,
      options: {
        "alignment": {
          "label": getCookie("Culture") === 'en-US' ? "Text Align" : "יישור טקסט",
          "defaultValue": "center",
          "widget": "dropdown"
        },
        "direction": {
          "label": getCookie("Culture") === 'en-US' ? "Text Direction" : "כיוון טקסט",
          "defaultValue": "rtl",
          "widget": "radio"
        }
      }
    }
  },
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return `<div style="font-weight: bold; text-align: ${values.alignment}; direction: ${values.direction};">
        <span style="display: ${values.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.phone} | </span>
        <span style="display: ${values.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.fax} | </span>
        <span style="display: ${values.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.email}">${values.email}</a></span>
        <br />
        <span style="display: ${values.company !== '' ? 'inline-block' : 'none'}">${values.company},</span>
        <span style="display: ${values.address !== '' ? 'inline-block' : 'none'}">${values.address},</span>
        <span style="display: ${values.city !== '' ? 'inline-block' : 'none'}">${values.city},</span>
        <span style="display: ${values.country !== '' ? 'inline-block' : 'none'}">${values.country}</span>
    </div>`
      }
    }), // our React Viewer
    exporters: {
      web: function (values) {
        return `<div style="font-weight: bold; text-align: ${values.alignment}; direction: ${values.direction};">
        <span style="display: ${values.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.phone} | </span>
        <span style="display: ${values.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.fax} | </span>
        <span style="display: ${values.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.email}">${values.email}</a></span>
        <br />
        <span style="display: ${values.company !== '' ? 'inline-block' : 'none'}">${values.company},</span>
        <span style="display: ${values.address !== '' ? 'inline-block' : 'none'}">${values.address},</span>
        <span style="display: ${values.city !== '' ? 'inline-block' : 'none'}">${values.city},</span>
        <span style="display: ${values.country !== '' ? 'inline-block' : 'none'}">${values.country}</span>
    </div>`
      },
      email: function (values) {
        return `<div style="font-weight: bold; text-align: ${values.alignment}; direction: ${values.direction};">
        <span style="display: ${values.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.phone} | </span>
        <span style="display: ${values.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.fax} | </span>
        <span style="display: ${values.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.email}">${values.email}</a></span>
        <br />
        <span style="display: ${values.company !== '' ? 'inline-block' : 'none'}">${values.company},</span>
        <span style="display: ${values.address !== '' ? 'inline-block' : 'none'}">${values.address},</span>
        <span style="display: ${values.city !== '' ? 'inline-block' : 'none'}">${values.city},</span>
        <span style="display: ${values.country !== '' ? 'inline-block' : 'none'}">${values.country}</span>
    </div>`
      }
    },
    head: {
      css: function (values) { },
      js: function (values) { }
    }
  }
});


