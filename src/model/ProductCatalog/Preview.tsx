import noImagePreview from '../../assets/images/no-image-preview.jpg';
import clsx from 'clsx';
import { PreviewTypes } from './Types';
import { Direction, Structure } from '../../config/enum';

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
}: PreviewTypes) => {
  const renderCategory = () => {
    if (category !== 0) {
      return (<div className={clsx(classes.bodyStyle)}>#{category}#</div>)
    }
    return <></>
  }
  return (
    <div
      className={
        clsx(classes.card, classes.w100, classes.mb10, classes.mr10, direction === Direction.RightToLeft ? classes.directionRTL : '')
      }
    >
      {
        isImageVisible && (
          <div
            className={clsx(classes.imageBlock, structure === Structure.Horizontal ? classes.dInlineBlock : classes.dBlock, structure === Structure.Vertical ? classes.w100 : '')}
          >
            <img src={noImagePreview} className={clsx(structure === Structure.Vertical ? classes.wAuto : classes.w100)} alt='' />
          </div>
        )
      }
      <div
        className={
          clsx(classes.contentBlock, structure === Structure.Horizontal ? classes.dInlineBlock : classes.dBlock, structure === Structure.Vertical ? classes.w100 : '')
        }
      >
        {isNameVisible && <div className={clsx(classes.nameStyle)}>{name}</div>}
        {isDescriptionVisible && <div className={clsx(classes.bodyStyle)}>{description}</div>}
        {isPriceVisible && <div className={clsx(classes.bodyStyle)}>{price}</div>}
        {/* {eventType && <div className={clsx(classes.bodyStyle)}>#{eventType}#</div>} */}
        {/* {renderCategory()} */}
        {isButtonVisible && <input type='button' value={buttonText} className={clsx(classes.buttonStyle)} />}
      </div>
    </div>
  )
}

export default Preview
