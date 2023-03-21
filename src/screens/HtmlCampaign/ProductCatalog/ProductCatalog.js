import React, { useEffect, useState } from 'react'
import Preview from './Preview'
import times from 'lodash/times';
import {
  Box,
  Grid,
  Dialog as BaseDialog, makeStyles
} from '@material-ui/core'
import clsx from 'clsx';
import { range } from 'lodash';
import { PulButton, PulColItem, PulDivider, PulHead, PulImage, PulPara, PulPrice, PulRow } from '../helper/Template';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

const ProductCatalog = ({classes, isOpen = true, onClose, save}) => {
  const { t } = useTranslation();
  const [isSingleOrMultiple, setSingleOrMultiple] = useState('single');
  const [uptoProducts, setUptoProducts] = useState(1);
  const [isFilterByEventType, setFilterIsByEventType] = useState(true);
  const [isFilterIsByProductCategory, setFilterIsByProductCategory] = useState(true);
  const [isImageVisible, setImageVisibility] = useState(true);
  const [isNameVisible, setNameVisibility] = useState(true);
  const [isDescriptionVisible, setDescriptionVisibility] = useState(true);
  const [isPriceVisible, setPriceVisibility] = useState(true);
  const [isButtonVisible, setButtonVisibility] = useState(true);
  const [buttonText, setButtonText] = useState(t('campaigns.buyNow'));
  const [structure, setStructure] = useState('horizontal');
  const [direction, setDirection] = useState('ltr');
  const [eventType, setEventType] = useState('purchase');
  const [category, setCategory] = useState('pv');
  const [maxProducts, setMaxProducts] = useState(4);
  const [productOrder, setProductOrder] = useState('horizontal');

  useEffect(() => {
    if (productOrder === 'vertical') {
      setStructure(productOrder);
      setMaxProducts(10);
    } else {
      setMaxProducts(4);
    }
  }, [productOrder])

  const onHandleSave = () => {
    let dynamicRow = Object.assign({}, PulRow);
    dynamicRow['container']['style']['direction'] = direction;
    dynamicRow['content']['style']['direction'] = direction;
    var productJSON = getProductJSON();

    if (uptoProducts > 0) {
      if (productOrder === 'horizontal') {
        for (let ind=0; ind<uptoProducts; ind++) {
          dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
        }
      } else if (productOrder === 'vertical') {
        var modules = [];
        for (let ind=0; ind<uptoProducts; ind++) {
          for (let indJ=0; indJ<productJSON.length; indJ++) {
            modules = modules.concat(productJSON[indJ]['modules']);
          }
          if (ind < uptoProducts-1) modules = modules.concat(PulDivider);
        }

        if (structure === 'vertical') {
          productJSON[0]['modules'] = modules;
          dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
        }
      }
    } else dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);

    save({
      success: true,
      row: dynamicRow,
    })
  };
  
  const getProductJSON = () => {
    const productJSON = [];
    if (structure === 'horizontal') {
      var productCol = JSON.parse(JSON.stringify(PulColItem));
      productCol['uuid'] = uuidv4();
      if (isImageVisible) {
        let image = PulImage;
        image['uuid'] = uuidv4();
        image['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        productCol['modules'].push(image);
        productCol['grid-columns'] = 4;
        productJSON.push(productCol);
      }

      var productCol = Object.assign({}, PulColItem);
      productCol['uuid'] = uuidv4();
      const moduleItems = [];
      if (isNameVisible) {
        let head = Object.assign({}, PulHead);
        head['uuid'] = uuidv4();
        head['descriptor']['heading']['text'] = '#Name';
        head['descriptor']['heading']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(head);
      }

      if (isDescriptionVisible) {
        let desc = Object.assign({}, PulPara);
        desc['uuid'] = uuidv4();
        desc['descriptor']['paragraph']['html'] = '#Description';
        desc['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(desc);
      }

      if (isPriceVisible) {
        let price = Object.assign({}, PulPrice);
        price['uuid'] = uuidv4();
        price['descriptor']['paragraph']['html'] = '#Price';
        price['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(price);
      }

      if (isButtonVisible) {
        let button = Object.assign({}, PulButton);
        button['uuid'] = uuidv4();
        button['descriptor']['button']['label'] = buttonText || 'Click';
        button['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(button);
      }

      if (isImageVisible) productCol['grid-columns'] = 8;
      productCol['modules'] = moduleItems;
      productJSON.push(productCol);
    } else {
      let productCol = Object.assign({}, PulColItem);
      productCol['uuid'] = uuidv4();
      const moduleItems = [];
      if (isImageVisible) {
        let image = PulImage;
        image['descriptor']['image']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        image['uuid'] = uuidv4();
        moduleItems.push(image);
      }

      if (isNameVisible) {
        let head = Object.assign({}, PulHead);
        head['uuid'] = uuidv4();
        head['descriptor']['heading']['text'] = '#Name';
        head['descriptor']['heading']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(head);
      }

      if (isDescriptionVisible) {
        let desc = Object.assign({}, PulPara);
        desc['uuid'] = uuidv4();
        desc['descriptor']['paragraph']['html'] = '#Description';
        desc['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(desc);
      }

      if (isPriceVisible) {
        let price = Object.assign({}, PulPrice);
        price['uuid'] = uuidv4();
        price['descriptor']['paragraph']['html'] = '#Price';
        price['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(price);
      }

      if (isButtonVisible) {
        let button = Object.assign({}, PulButton);
        button['uuid'] = uuidv4();
        button['descriptor']['button']['label'] = buttonText || t('campaigns.buttonText');
        button['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(button);
      }
      productCol['modules'] = moduleItems;
      productJSON.push(productCol);
    }

    return productJSON;
  }

  const onHandleCancel = React.useCallback(() => {
    save({
      success: true,
      row: '',
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

  const getProductNumbers = () => {
    return range(1, maxProducts+1).map(item => <option key={item}>{item}</option>)
  }

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
              <h2 className={clsx(classes.mt0)}>{t('campaigns.setupDynamicProduct')}</h2>
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
                    {t('campaigns.singleProduct')}
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
                    {t('campaigns.multipleProduct')}
                  </label>
                </div>
              </div>

              {
                isSingleOrMultiple === 'multiple' && (
                  <div className={clsx(classes.pl30, classes.pt5)}>
                    <label className={clsx(classes.pe15)}>{t('campaigns.upto')}</label>
                    <select
                      className={clsx(classes.p5)}
                      value={uptoProducts}
                      onChange={event => setUptoProducts(event.target.value)}
                    >
                      {getProductNumbers()}
                    </select>
                    <label className={clsx(classes.pl10)}>{t('campaigns.products')}</label>
                  </div>
                )
              }

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.filter')}:</h4>
              <div className={clsx(classes.mb25)}>
                <div className={clsx(classes.pb10)}>
                  <input
                    type="checkbox"
                    id="by_event_type"
                    onChange={(event) => setFilterIsByEventType(event.target.checked)}
                    defaultChecked={isFilterByEventType}
                  />
                  <label className={clsx(classes.pl10)} htmlFor="by_event_type">{t('campaigns.byEventType')}:</label>
                  <select
                    className={clsx(classes.dBlock, classes.mt2, classes.ml25, classes.p5, classes.w100)}
                    defaultValue={eventType}
                    onChange={event => setEventType(event.target.value)}
                  >
                    <option value="all">{t('campaigns.allEvents')}</option>
                    <option value="page">{t('campaigns.pageView')}</option>
                    <option value="purchase">{t('campaigns.purchase')}</option>
                    <option value="cart_abandon">{t('campaigns.cartAbandonment')}</option>
                  </select>
                </div>

                <div className='product-type'>
                  <input
                    type="checkbox"
                    id="by_product_category"
                    onChange={(event) => setFilterIsByProductCategory(event.target.checked)}
                    defaultChecked={isFilterIsByProductCategory}
                  />
                  <label className={clsx(classes.pl10)} htmlFor="by_product_category">{t('campaigns.byProductCategory')}:</label>
                  <select
                    className={clsx(classes.dBlock, classes.mt2, classes.ml25, classes.p5, classes.w100)}
                    defaultValue={category}
                    onChange={event => setCategory(event.target.value)}
                  >
                    <option value="all">{t('campaigns.allCategories')}</option>
                    <option value="pv">{t('campaigns.pageView')}</option>
                  </select>
                </div>
              </div>

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.display')}:</h4>
              <div className={clsx(classes.mb10)}>
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <input
                    type="checkbox"
                    id="image"
                    name="display"
                    defaultChecked={isImageVisible}
                    onChange={(event) => setImageVisibility(event.target.checked)}
                  />
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="image">{t('campaigns.image')}</label>
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
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="name">
                    {t('campaigns.name')}
                  </label>
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
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="description">{t('campaigns.description')}</label>
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
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="price">
                    {t('campaigns.price')}
                  </label>
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
                  <label className={clsx(classes.pl5, classes.mr10)} htmlFor="button">
                    {t('campaigns.button')}
                  </label>
                </div>
              </div>

              <div className={clsx(classes.mb5)}>
                {t('campaigns.buttonText')}
              </div>
              <input
                className={clsx(classes.p5, classes.mb10, classes.w100)}
                type="text"
                defaultValue={t('campaigns.buyNow')}
                onChange={event => setButtonText(event.target.value)} />
            </Grid>
            <Grid item md={7}>
            <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.productStructure')}:</h4>
              <Grid container spacing={5}>
                <Grid item md={4}>
                  <select
                    defaultValue={structure}
                    value={structure}
                    onChange={event => setStructure(event.target.value)}
                    className={clsx(classes.p5, classes.w100)}
                  >
                    <option value="horizontal">{t('campaigns.horizontal')}</option>
                    <option value="vertical">{t('campaigns.vertical')}</option>
                  </select>
                </Grid>

                <Grid item md={4}>
                  <select
                    defaultValue={direction}
                    onChange={event => setDirection(event.target.value)}
                    className={clsx(classes.p5, classes.w100)}
                  >
                    <option value="ltr">{t('campaigns.leftToRight')}</option>
                    <option value="rtl">{t('campaigns.rightToLeft')}</option>
                  </select>
                </Grid>
              </Grid>
                
              {
                isSingleOrMultiple === 'multiple' && (
                  <>
                    <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.productOrder')}:</h4>
                    <Grid container spacing={5}>
                      <Grid item md={4}>
                        <select
                          className={clsx(classes.p5, classes.w100)}
                          defaultValue={productOrder}
                          onChange={event => setProductOrder(event.target.value)}
                        >
                          <option value="horizontal">{t('campaigns.horizontal')}</option>
                          <option value="vertical">{t('campaigns.vertical')}</option>
                        </select>
                      </Grid>
                    </Grid>
                  </>
                )
              }
              
              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.preview')}:</h4>
              <div className='preview' style={{ display: productOrder === 'horizontal' ? 'flex' : 'block' }}>
                  {
                    [
                      times(uptoProducts, (i) => {
                        return (
                          <Preview
                            width={productOrder === 'horizontal' ? 100/uptoProducts : 100}
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
                        )
                      }
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
                  {t('campaigns.addProductBlock')}
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
                  {t('common.cancel')}
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
