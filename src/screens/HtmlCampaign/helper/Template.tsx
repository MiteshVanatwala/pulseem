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
  "type": "product-catalog",
  "name": "Product Catalog",
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
      "direction": "rtl",
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