const React = window.unlayer.React
function getCookie(cname) {
  try {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
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
      }
    }
  },
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return `<div style="font-weight: bold; text-align: ${values.alignment};">
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
        return `<div style="font-weight: bold; text-align: ${values.alignment};">
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
        return `<div style="font-weight: bold; text-align: ${values.alignment};">
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
