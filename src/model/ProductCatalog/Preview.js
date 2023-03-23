import noImagePreview from '../../assets/images/no-image-preview.jpg';
import clsx from 'clsx';

const Preview = ({
  classes,
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
  eventType,
  category,
}) => {
  return (
    <div
      className={
        clsx(classes.card, classes.w100, classes.mb10, classes.mr10, direction === 'rtl' ? classes.directionRTL : '')
      }
    >
      {
        isImageVisible && (
          <div
            className={clsx(classes.imageBlock, structure === 'horizontal' ? classes.dInlineBlock : classes.dBlock, structure === 'vertical' ? classes.w100 : '' )}
          >
            <img src={noImagePreview} className={clsx(structure === 'vertical' ? classes.wAuto : classes.w100)} />
          </div>
        )
      }
      <div
        className={
          clsx(classes.contentBlock, structure === 'horizontal' ? classes.dInlineBlock : classes.dBlock, structure === 'vertical' ? classes.w100 : '' )
        }
      >
        {isNameVisible && <div className={clsx(classes.nameStyle)}>{name}</div>}
        {isDescriptionVisible && <div className={clsx(classes.bodyStyle)}>{description}</div>}
        {isPriceVisible && <div className={clsx(classes.bodyStyle)}>{price}</div>}
        {eventType && <div className={clsx(classes.bodyStyle)}>#{eventType}#</div>}
        {category && <div className={clsx(classes.bodyStyle)}>#{category}#</div>}
        {isButtonVisible && <input type='button' value={buttonText} className={clsx(classes.buttonStyle)} />}
      </div>
    </div>
  )
}

export default Preview
