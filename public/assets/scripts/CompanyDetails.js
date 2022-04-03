const React = window.unlayer.React

/* const CompanyDetails = ({
  fax = null,
  city = null,
  email = null,
  phone = null,
  country = null,
  address = null,
  companyName = null
}) => {
  return {
    <table>
      <tr>
        <td style={{ textAlign: 'center', padding: 5, fontSize: 14 }}>
          {email && <div>
              <div>{t("common.Mail")} <a href={`mailto:${email}`}>{email}</a></div>
          </div>}
          {phone && <div>
              <div>{t("common.Phone")}: {phone}</div>
          </div>}
          {fax && <div>
              <div>{t("common.Fax")}: {fax}</div>
          </div>}
          {companyName && <div>
              <div>{t("common.CompanyName")}: {companyName}</div>
          </div>}
          {address && <div>
              <div>{t("common.address")}: {address}</div>
          </div>}
          {city && <div>
              <div>{t("common.city")}: {city}</div>
          </div>}
          {country && <div>
              <div>{t("common.country")}: {country}</div>
          </div>}
        </td>
      </tr>
    </table>
  }
}*/

const Viewer = () => {
  return <div>I am a custom tool.</div>
}

unlayer.registerTool({
  name: 'CompanyDetails',
  label: 'Company Details',
  icon: 'fa-smile',
  supportedDisplayModes: ['web', 'email'],
  options: {},
  values: {},
  renderer: {
    Viewer: Viewer, // our React Viewer
    exporters: {
      web: function(values) {
        return "<div>I am a custom tool.</div>"
      },
      email: function(values) {
        return "<div>I am a custom tool.</div>"
      }
    },
    head: {
      css: function(values) {},
      js: function(values) {}
    }
  }
});
