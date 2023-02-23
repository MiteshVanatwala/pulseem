import React, { useEffect, useState } from 'react'
import Preview from './Preview'
import times from 'lodash/times';
import {
  Box,
  Grid,
  Dialog as BaseDialog, makeStyles
} from '@material-ui/core'
import clsx from 'clsx';

const ProductCatalog = ({classes, isOpen = true, onClose, save}) => {
  const [isSingleOrMultiple, setSingleOrMultiple] = useState('single');
  const [uptoProducts, setUptoProducts] = useState(1);
  const [isFilterByEventType, setFilterIsByEventType] = useState(true);
  const [isFilterIsByProductCategory, setFilterIsByProductCategory] = useState(true);
  const [isImageVisible, setImageVisibility] = useState(true);
  const [isNameVisible, setNameVisibility] = useState(true);
  const [isDescriptionVisible, setDescriptionVisibility] = useState(true);
  const [isPriceVisible, setPriceVisibility] = useState(true);
  const [isButtonVisible, setButtonVisibility] = useState(true);
  const [buttonText, setButtonText] = useState('');
  const [structure, setStructure] = useState('horizontal');
  const [direction, setDirection] = useState('ltr');
  const [eventType, setEventType] = useState('purchase');
  const [category, setCategory] = useState('pv');
  const [productOrder, setProductOrder] = useState('horizontal');

  useEffect(() => {
    if (productOrder === 'vertical') setStructure(productOrder);
  }, [productOrder])

  const onHandleSave = React.useCallback(() => {
    save({
      success: true,
      newValue: 'Test',
    })
  }, []);

  const onHandleCancel = React.useCallback(() => {
    save({
      success: true,
      newValue: '',
    })
  }, []);

  const style = {
    maxWidth: '70% !important',
    width: '70% !important',
    padding: '10px !important'
  }

  const useStyles = makeStyles({
    dialogContainers: {
      width: '100%',
      '& .MuiPaper-root': {
        width: '70% !important',
        maxWidth: '70% !important',
        padding: '20px'
      }
    },
  });

  const styles = useStyles();
  return (
    <BaseDialog
      open={isOpen}
      className={clsx(styles.dialogContainers)}
      reduceTitle
    >
      <div className='product-block' style={style}>
        <Box>
          <Grid container spacing={5}>
            <Grid item md={5}>
              <h2 className={clsx(classes.mt0)}>Setup Dynamic Product</h2>
              <div onChange={event => setSingleOrMultiple(event.target.value)} value={isSingleOrMultiple}>
                <div className={clsx(classes.pt5, classes.pb10)}>
                  <input
                    value="single"
                    type="radio"
                    className='radio-btn'
                    id='single_product'
                    name="product_type"
                    defaultChecked={isSingleOrMultiple === 'single'}
                  /> 
                  <label
                    className={clsx(classes.paddingSides10)}
                    htmlFor='single_product'
                  >
                    Single Product
                  </label>
                </div>
                <div className={clsx(classes.pb10)}>
                  <input
                    value="multiple"
                    type="radio"
                    className='radio-btn'
                    id='multiple_product'
                    name="product_type"
                    defaultChecked={isSingleOrMultiple === 'multiple'}
                  />
                  <label
                    className={clsx(classes.paddingSides10)}
                    htmlFor='multiple_product'
                  >
                    Multiple Product
                  </label>
                </div>
              </div>

              {
                isSingleOrMultiple === 'multiple' && (
                  <div className={clsx(classes.pl30, classes.pt5)}>
                    <label className={clsx(classes.pe15)}>Upto</label>
                    <select
                      className={clsx(classes.p5)}
                      value={uptoProducts}
                      onChange={event => setUptoProducts(event.target.value)}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <label className={clsx(classes.pl10)}>Products</label>
                  </div>
                )
              }

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>Filter:</h4>
              <div className={clsx(classes.mb25)}>
                <div className={clsx(classes.pb10)}>
                  <input
                    type="checkbox"
                    id="by_event_type"
                    onChange={(event) => setFilterIsByEventType(event.target.checked)}
                    defaultChecked={isFilterByEventType}
                  />
                  <label className={clsx(classes.pl10)} htmlFor="by_event_type">By Event Type:</label>
                  <select
                    className={clsx(classes.dBlock, classes.mt2, classes.ml25, classes.p5, classes.w100)}
                    defaultValue={eventType}
                    onChange={event => setEventType(event.target.value)}
                  >
                    <option value="all">All Events</option>
                    <option value="page">Page View</option>
                    <option value="purchase">Purchase</option>
                    <option value="cart_abandon">Cart Abandonment</option>
                  </select>
                </div>

                <div className='product-type'>
                  <input
                    type="checkbox"
                    id="by_product_category"
                    onChange={(event) => setFilterIsByProductCategory(event.target.checked)}
                    defaultChecked={isFilterIsByProductCategory}
                  />
                  <label className={clsx(classes.pl10)} htmlFor="by_product_category">By Product Category:</label>
                  <select
                    className={clsx(classes.dBlock, classes.mt2, classes.ml25, classes.p5, classes.w100)}
                    defaultValue={category}
                    onChange={event => setCategory(event.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="pv">Page View</option>
                  </select>
                </div>
              </div>

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>Display:</h4>
              <div className={clsx(classes.mb10)}>
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <input
                    type="checkbox"
                    id="image"
                    name="display"
                    defaultChecked={isImageVisible}
                    onChange={(event) => setImageVisibility(event.target.checked)}
                  />
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="image">Image</label>
                </div>
                
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <input
                    type="checkbox"
                    id="name"
                    name="display"
                    value="Name"
                    defaultChecked={isNameVisible}
                    onChange={(event) => setNameVisibility(event.target.checked)}
                  />
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="name">Name</label>
                </div>
                
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <input
                    type="checkbox"
                    id="description"
                    name="display"
                    value="Description"
                    defaultChecked={isDescriptionVisible}
                    onChange={(event) => setDescriptionVisibility(event.target.checked)}
                  />
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="description">Description</label>
                </div>

                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <input
                    type="checkbox"
                    id="price"
                    name="display"
                    value="Price"
                    defaultChecked={isPriceVisible}
                    onChange={(event) => setPriceVisibility(event.target.checked)}
                  />
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="price">Price</label>
                </div>

                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <input
                    type="checkbox"
                    id="button"
                    name="display"
                    value="Button"
                    defaultChecked={isButtonVisible}
                    onChange={(event) => setButtonVisibility(event.target.checked)}
                  />
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="button">Button</label>
                </div>
              </div>

              <div className={clsx(classes.mb5)}>Button Text</div>
              <input className={clsx(classes.p5, classes.mb10, classes.w100)} type="text" onChange={event => setButtonText(event.target.value)} />
            </Grid>
            <Grid item md={7}>
            <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>Product Structure:</h4>
              <Grid container spacing={5}>
                <Grid item md={4}>
                  <select
                    defaultValue={structure}
                    value={structure}
                    onChange={event => setStructure(event.target.value)}
                    className={clsx(classes.p5, classes.w100)}
                  >
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                  </select>
                </Grid>

                <Grid item md={4}>
                  <select
                    defaultValue={direction}
                    onChange={event => setDirection(event.target.value)}
                    className={clsx(classes.p5, classes.w100)}
                  >
                    <option value="ltr">Left to Right</option>
                    <option value="rtl">Right to Left</option>
                  </select>
                </Grid>
              </Grid>
                
              {
                isSingleOrMultiple === 'multiple' && (
                  <>
                    <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>Product Order:</h4>
                    <Grid container spacing={5}>
                      <Grid item md={4}>
                        <select
                          className={clsx(classes.p5, classes.w100)}
                          defaultValue={productOrder}
                          onChange={event => setProductOrder(event.target.value)}
                        >
                          <option value="horizontal">Horizontal</option>
                          <option value="vertical">Vertical</option>
                        </select>
                      </Grid>
                    </Grid>
                  </>
                )
              }
              
              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>Preview:</h4>
              <div className='preview'>
                {
                  [
                    times(uptoProducts, (i) => 
                    <Preview
                      width={productOrder === 'vertical' ? 95/uptoProducts : 100}
                      key={i}
                      isImageVisible={isImageVisible}
                      isNameVisible={isNameVisible}
                      isDescriptionVisible={isDescriptionVisible}
                      isPriceVisible={isPriceVisible}
                      isButtonVisible={isButtonVisible}
                      imageURL='#ImageURL'
                      name='#Name'
                      description='#Description'
                      price='#Price'
                      buttonText={buttonText}
                      structure={structure}
                      direction={direction}
                    />
                  )]
                }
              </div>
              <div className={clsx(classes.textCenter, classes.mt25)}>
                <button
                  onClick={onHandleSave}
                  className={
                    clsx(
                      classes.pt5,
                      classes.pb5,
                      classes.paddingSides25,
                      classes.greyButtonWithRoundCorder,
                      classes.bold
                    )
                  }
                >
                  Add Product Block
                </button>

                <button
                  onClick={onHandleCancel}
                  className={
                    clsx(
                      classes.pt5,
                      classes.pb5,
                      classes.paddingSides25,
                      classes.bgLightGray,
                      classes.borderRadius30,
                      classes.bold,
                      classes.ml10
                    )
                  }
                >
                  Cancel
                </button>
              </div>
            </Grid>
          </Grid>
        </Box>
      </div>
    </BaseDialog>
  )
}

export default ProductCatalog
