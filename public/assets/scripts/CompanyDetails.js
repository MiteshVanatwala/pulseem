const React = window.unlayer.React

unlayer.registerTool({
  name: 'CompanyDetails',
  label: 'Footer',
  icon: 'fa-memo-circle-info',
  supportedDisplayModes: ['web', 'email'],
  options: {},
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return `<div style="font-weight: bold; text-align: center" contenteditable="true">
        <span style="display: ${values.data.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.data.phone} | </span>
        <span style="display: ${values.data.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.data.fax} | </span>
        <span style="display: ${values.data.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.data.email}"}>${values.data.email}</a></span>
        <br />
        <span style="display: ${values.data.company !== '' ? 'inline-block' : 'none'}">${values.data.company}</span>, 
        <span style="display: ${values.data.address !== '' ? 'inline-block' : 'none'}">${values.data.address}</span>, 
        <span style="display: ${values.data.city !== '' ? 'inline-block' : 'none'}">${values.data.city}</span>, 
        <span style="display: ${values.data.country !== '' ? 'inline-block' : 'none'}">${values.data.country}</span>
    </div>`
      }
    }), // our React Viewer
    exporters: {
      web: function (values) {
        return `<div style="font-weight: bold; text-align: center" contenteditable="true">
        <span style="display: ${values.data.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.data.phone} | </span>
        <span style="display: ${values.data.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.data.fax} | </span>
        <span style="display: ${values.data.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.data.email}"}>${values.data.email}</a></span>
        <br />
        <span style="display: ${values.data.company !== '' ? 'inline-block' : 'none'}">${values.data.company}</span>, 
        <span style="display: ${values.data.address !== '' ? 'inline-block' : 'none'}">${values.data.address}</span>, 
        <span style="display: ${values.data.city !== '' ? 'inline-block' : 'none'}">${values.data.city}</span>, 
        <span style="display: ${values.data.country !== '' ? 'inline-block' : 'none'}">${values.data.country}</span>
    </div>`
      },
      email: function (values) {
        return `<div style="font-weight: bold; text-align: center" contenteditable="true">
        <span style="display: ${values.data.phone !== '' ? 'inline-block' : 'none'}">${values.data.phoneTitle}: ${values.data.phone} | </span>
        <span style="display: ${values.data.fax !== '' ? 'inline-block' : 'none'}">${values.data.faxTitle}: ${values.data.fax} | </span>
        <span style="display: ${values.data.email !== '' ? 'inline-block' : 'none'}">${values.data.emailTitle}: <a href="mailto:${values.data.email}"}>${values.data.email}</a></span>
        <br />
        <span style="display: ${values.data.company !== '' ? 'inline-block' : 'none'}">${values.data.company}</span>, 
        <span style="display: ${values.data.address !== '' ? 'inline-block' : 'none'}">${values.data.address}</span>, 
        <span style="display: ${values.data.city !== '' ? 'inline-block' : 'none'}">${values.data.city}</span>, 
        <span style="display: ${values.data.country !== '' ? 'inline-block' : 'none'}">${values.data.country}</span>
    </div>`
      }
    },
    head: {
      css: function (values) { },
      js: function (values) { }
    }
  }
});
