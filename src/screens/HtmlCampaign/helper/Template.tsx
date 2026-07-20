import { v4 as uuidv4 } from 'uuid';

const paragraphDescriptor = {
  "paragraph": {
    "html": "",
    "style": {
      "color": "#000000",
      "font-size": "14px",
      "font-family": "inherit",
      "font-weight": "400",
      "line-height": "120%",
      "text-align": "left",
      "direction": "ltr",
      "letter-spacing": "0px"
    },
    "computedStyle": {
      "linkColor": "#0068a5",
      "paragraphSpacing": "16px"
    }
  },
  "style": {
    "padding-top": "5px",
    "padding-right": "20px",
    "padding-bottom": "5px",
    "padding-left": "20px"
  },
  "mobileStyle": {},
  "computedStyle": {
    "hideContentOnAmp": false,
    "hideContentOnHtml": false,
    "hideContentOnDesktop": false,
    "hideContentOnMobile": false
  }
};

export const PulImage = {
  "uuid": "",
  "type": "mailup-bee-newsletter-modules-image",
  "descriptor": {
    "image": {
      "alt": "",
      "src": "",
      "href": "",
      "percWidth": "100",
      "style": {
        "width": "100%",
        "text-align": "left"
      },
      "width": "100%",
    },
    "style": {
      "width": "100%",
      "padding-top": "0px",
      "padding-right": "0px",
      "padding-bottom": "0px",
      "padding-left": "0px",
      "text-align": "left"
    },
    "computedStyle": {
      "class": "right fixedwidth",
      "width": "100%",
      "hideContentOnMobile": false
    },
    "mobileStyle": {}
  },
  "align": "right",
  "autoWidth": "50%",
  "locked": false
}

export const PulProductImage = {
  "type": "mailup-bee-newsletter-modules-paragraph",
  "descriptor": JSON.parse(JSON.stringify(paragraphDescriptor)),
  "uuid": "",
  "locked": false
}

export const PulHead = {
  "uuid": "",
  "type": "mailup-bee-newsletter-modules-heading",
  "descriptor": {
    "heading": {
      "title": "h1",
      "text": "",
      "style": {
        "color": "#555555",
        "font-size": "16px",
        "font-family": "inherit",
        "link-color": "#E01253",
        "line-height": "100%",
        "text-align":  "left",
        "direction": "ltr",
        "font-weight": "700",
        "letter-spacing": "0px",
      }
    },
    "style": {
      "width": "100%",
      "text-align": "left",
      "padding-top": "10px",
      "padding-right": "20px",
      "padding-bottom": "10px",
      "padding-left": "20px"
    },
    "mobileStyle": {},
    "computedStyle": {
      "width": 52,
      "height": 42
    }
  },
  "align": "left",
  "locked": false
};

export const PulPara = {
  "type": "mailup-bee-newsletter-modules-paragraph",
  "descriptor": JSON.parse(JSON.stringify(paragraphDescriptor)),
  "uuid": "",
  "locked": false
};

export const PulDivider = {
  "type": "mailup-bee-newsletter-modules-divider",
  "descriptor": {
    "divider": {
      "style": {
        "border-top": "1px solid #BBBBBB",
        "width": "100%"
      }
    },
    "style": {
      "padding-top": "20px",
      "padding-right": "10px",
      "padding-bottom": "20px",
      "padding-left": "10px"
    },
    "mobileStyle": {},
    "computedStyle": {
      "align": "center",
      "hideContentOnMobile": false
    }
  },
  "locked": false
};

export const PulButton = {
  "uuid": "82c35cf4-2619-4217-ac66-c22463c83b22",
  "type": "mailup-bee-newsletter-modules-button",
  "descriptor": {
    "button": {
      "label": "",
      "href": "#URL#",
      "pul_id": "1",
      "style": {
        "font-family": "inherit",
        "font-size": "16px",
        "font-weight": "400",
        "background-color": "#3AAEE0",
        "border-radius": "4px",
        "border-top": "0px solid transparent",
        "border-right": "0px solid transparent",
        "border-bottom": "0px solid transparent",
        "border-left": "0px solid transparent",
        "color": "#ffffff",
        "line-height": "200%",
        "padding-top": "5px",
        "padding-right": "10px",
        "padding-bottom": "5px",
        "padding-left": "10px",
        "width": "auto",
        "max-width": "100%",
        "margin-left": "10px",
        "margin-right": "10px",
      }
    },
    "style": {
      "text-align": "left",
      "padding-top": "10px",
      "padding-right": "10px",
      "padding-bottom": "10px",
      "padding-left": "10px"
    },
    "mobileStyle": {},
    "computedStyle": {
      "width": 87,
      "height": 42,
      "hideContentOnMobile": false
    }
  },
  "align": "left",
  "locked": false
};

export const PulColItem = {
  "uuid": "",
  "style": {},
  "modules": [],
  "grid-columns": 12,
  "locked": false
}

export const PulRow = {
  "columns": [],
  "type": "Dynamic-Products",
  "name": "Dynamic-Products",
  "synced": false,
  "metadata": {
    "name": "Product Catalog",
    "tags": "Product Catalog",
    "uuid": "",
    "EventType": "",
    "ProductCategory": 0,
    "NumOfProdcuts": 0,
    "direction": "ltr",
    "order": "",
    "category": ""
  },
  "container": {
    "style": {
      "background-color": "transparent",
      "background-image": "none",
      "background-repeat": "no-repeat",
      "background-position": "top left",
      "direction": "rtl",
      "product-block-container": ""
    }
  },
  "content": {
    "style": {
      "background-color": "#ffffff",
      "color": "#000000",
      "width": "1000px",
      "background-image": "none",
      "background-repeat": "no-repeat",
      "background-position": "top left",
      "border-top": "0px solid transparent",
      "border-right": "0px solid transparent",
      "border-bottom": "0px solid transparent",
      "border-left": "0px solid transparent",
      "border-radius": "0px",
      "direction": "ltr",
    },
    "computedStyle": {
      "rowColStackOnMobile": true,
      "rowReverseColStackOnMobile": false,
      "verticalAlign": "top",
      "hideContentOnMobile": false,
      "hideContentOnDesktop": false
    }
  },
  "uuid": "",
  "locked": false
};

export const PulProductContainerStart = {
  "type": "mailup-bee-newsletter-modules-html",
  "descriptor": {
    "html": {
      "html": "<!-- productcontainer start -->",
    },
    "style": {
      "width": "100%",
      "display": "none"
    }
  },
  "uuid": "",
  "locked": false
}

export const PulProductContainerEnd = {
  "type": "mailup-bee-newsletter-modules-html",
  "descriptor": {
    "html": {
      "html": "<!-- productcontainer end -->",
    },
    "style": {
      "width": "100%",
      "display": "none"
    }
  },
  "uuid": "",
  "locked": false
}

export const PulDynamicProductDetail = {
  "type": "mailup-bee-newsletter-modules-paragraph",
  "descriptor": {
    "paragraph": {
      "html": "",
      "style": {
        "display": "none"
      },
    },
  },
  "uuid": "",
  "locked": false
}

/**
 * buildTierGraphRow — a GENUINE one-column-empty BEE row (byte-for-byte the shape
 * DefaultContent(...).defaultTemplate.page.rows[0] produces in helper/Config.tsx)
 * holding a native image module whose src is the tier-graph link.
 *
 * IMPORTANT: we build a clean row literal, NOT a clone of PulRow. PulRow is a
 * 'Dynamic-Products' / 'Product Catalog' row carrying `synced`, product `metadata`,
 * a `product-block-container` marker and product-ish container/content — mutating
 * a few of its fields leaves a "Frankenstein" row whose extra keys BEE can silently
 * reject on load/reload (onError is a no-op), which breaks "Add to email". A real
 * one-column-empty row has NO metadata/name/synced keys — exactly this shape.
 * The image renders full-width & fluid (center autowidth + style width/max-width:100%); `width`
 * sets a px cap on descriptor.image.width (the graph's natural width).
 */
export const buildTierGraphRow = (url: string, width: number, alt: string) => {
  const img = JSON.parse(JSON.stringify(PulImage)); // native BEE image module (Template.tsx:34)
  img.descriptor.image.src = url;
  img.descriptor.image.alt = alt;                   // t('campaigns.tierGraph.imgAlt')
  img.descriptor.image.href = '';                   // NO <a> wrapper — ever
  img.uuid = uuidv4();

  // Force FULL-WIDTH responsive display. PulImage defaults to `align:right` + `right fixedwidth`
  // + `autoWidth:50%`, which BEE rendered at ~15% (small, right-aligned). Switch to centered
  // `autowidth` at 100% so the graph fills the email column at full width on every client.
  img.align = 'center';
  img.autoWidth = '100%';
  img.descriptor.image.percWidth = '100';
  img.descriptor.image.width = (width && width > 0 ? Math.round(width) : 600) + 'px';
  img.descriptor.image.style = { width: '100%', 'max-width': '100%' };
  img.descriptor.style = { ...(img.descriptor.style || {}), width: '100%' };
  img.descriptor.computedStyle = {
    ...(img.descriptor.computedStyle || {}),
    class: 'center autowidth',
    width: '100%',
  };

  return {
    type: 'one-column-empty',
    container: {
      style: {
        'background-color': 'transparent',
        'background-image': 'none',
        'background-repeat': 'no-repeat',
        'background-position': 'top left',
      },
    },
    content: {
      style: {
        'background-color': 'transparent',
        color: '#000000',
        width: '600px',
        'background-image': 'none',
        'background-repeat': 'no-repeat',
        'background-position': 'top left',
      },
      computedStyle: {
        rowColStackOnMobile: true,
        rowReverseColStackOnMobile: false,
      },
    },
    columns: [
      {
        'grid-columns': 12,
        modules: [img],
        style: {
          'background-color': 'transparent',
          'padding-top': '5px',
          'padding-right': '0px',
          'padding-bottom': '5px',
          'padding-left': '0px',
          'border-top': '0px solid transparent',
          'border-right': '0px solid transparent',
          'border-bottom': '0px solid transparent',
          'border-left': '0px solid transparent',
        },
        uuid: uuidv4(),
      },
    ],
    uuid: uuidv4(),
  };
};