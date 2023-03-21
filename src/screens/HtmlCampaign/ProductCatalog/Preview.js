import noImagePreview from '../../../assets/images/no-image-preview.jpg';

const card = {
  backgroundColor: '#fff',
  borderRadius: '5px',
  // border: 'solid 0.5px #d9d9d9',
  marginBottom: '10px',
  marginRight: '10px',
  display: 'inline-table',
  width: '100%',
};

const imageBlock = {
  width: '35%',
  display: 'inline-block',
  // backgroundColor: '#f4f4f4',
  minHeight: '100px',
  height: '100%',
};

const imageStyle = {
  width: '100%'
}

const imageHorizontalStyle = {
  width: 'auto'
}

const contentBlock = {
  width: '65%',
  display: 'inline-block',
  verticalAlign: 'top',
  paddingTop: '10px',
  paddingBottom: '10px',
};

const nameStyle = {
  fontSize: '1rem',
  paddingBottom: '10px',
  fontWeight: 'bold',
  paddingLeft: '10px',
};

const descriptionStyle = {
  fontSize: '0.8rem',
  paddingBottom: '10px',
  paddingLeft: '10px',
};

const priceStyle = {
  fontSize: '0.8rem',
  paddingBottom: '10px',
  paddingLeft: '10px',
};

const buttonStyle = {
  backgroundColor: '#38afe1',
  color: '#fff',
  width: 'initial',
  padding: '5px 10px',
  borderRadius: '5px',
  fontWeight: '500',
  marginLeft: '10px',
};

const directionRTL = {
  direction: 'rtl',
};

const verticalCard = {
  display: 'block',
  width: '100%'
}

const width100Percent = {
  width: '100%',
}

const Preview = ({
  isImageVisible,
  isNameVisible,
  isDescriptionVisible,
  isPriceVisible,
  isButtonVisible,
  imageURL,
  name,
  description,
  price,
  buttonText,
  structure,
  direction,
  width,
}) => {
  return (
    <div
      className='product-block-preview'
      style={{...card, ...(direction === 'rtl' && { ...directionRTL }), width: `${width}%`}}
    >
      {
        isImageVisible && (
          <div
            style={{
              ...imageBlock,
              ...(structure === 'vertical' && {...width100Percent})
            }}
          >
            <img src={noImagePreview} style={structure === 'vertical' ? imageHorizontalStyle : imageStyle} />
          </div>
        )
      }
      <div
        style={{...contentBlock, ...(structure === 'vertical' && {...verticalCard})}}
      >
        {isNameVisible && <div style={nameStyle}>{name}</div>}
        {isDescriptionVisible && <div style={descriptionStyle}>{description}</div>}
        {isPriceVisible && <div style={priceStyle}>{price}</div>}
        {isButtonVisible && <input type='button' value={buttonText || 'I want it'} style={buttonStyle} />}
      </div>
    </div>
  )
}

export default Preview
