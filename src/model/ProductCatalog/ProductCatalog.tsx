import React, { useEffect, useState } from 'react'
import Preview from './Preview'
import times from 'lodash/times';
import {
  Box,
  Grid,
  RadioGroup,
  Radio,
  Dialog as BaseDialog, FormControlLabel, Select, MenuItem, Checkbox, Button, Input
} from '@material-ui/core'
import clsx from 'clsx';
import { range } from 'lodash';
import { PulButton, PulColItem, PulDivider, PulHead, PulImage, PulPara, PulPrice, PulRow } from '../../screens/HtmlCampaign/helper/Template';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import { ProductCatalogTypes } from './Types';
import { Direction, Items, Structure } from '../../config/enum';

const ProductCatalog = ({classes, isOpen = true, save}: ProductCatalogTypes) => {
  const { t } = useTranslation();
  const [isSingleOrMultiple, setSingleOrMultiple] = useState(Items.Single);
  const [uptoProducts, setUptoProducts] = useState(1);
  const [isFilterByEventType, setFilterIsByEventType] = useState(true);
  const [isFilterIsByProductCategory, setFilterIsByProductCategory] = useState(true);
  const [isImageVisible, setImageVisibility] = useState(true);
  const [isNameVisible, setNameVisibility] = useState(true);
  const [isDescriptionVisible, setDescriptionVisibility] = useState(true);
  const [isPriceVisible, setPriceVisibility] = useState(true);
  const [isButtonVisible, setButtonVisibility] = useState(true);
  const [buttonText, setButtonText] = useState('');
  const [structure, setStructure] = useState(Structure.Horizontal);
  const [direction, setDirection] = useState('ltr');
  const [eventType, setEventType] = useState('purchase');
  const [category, setCategory] = useState('page');
  const [maxProducts, setMaxProducts] = useState(4);
  const [productOrder, setProductOrder] = useState(Structure.Horizontal);

  useEffect(() => {
    if (productOrder === 'vertical') {
      setStructure(productOrder);
      setMaxProducts(10);
    } else {
      setMaxProducts(4);
    }
  }, [productOrder]);

  useEffect(() => {
    setButtonText(t('campaigns.buyNow'));
  }, []);

  const onHandleSave = () => {
    let dynamicRow = Object.assign({}, PulRow);
    dynamicRow['container']['style']['direction'] = direction;
    dynamicRow['content']['style']['direction'] = direction;
    var productJSON: any = getProductJSON();
    if (uptoProducts > 0) {
      if (productOrder === Structure.Horizontal) {
        for (let ind=0; ind<uptoProducts; ind++) {
          dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
        }
      } else if (productOrder === Structure.Vertical) {
        for (let ind=0; ind<uptoProducts; ind++) {
          dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
          dynamicRow['columns'] = dynamicRow['columns'].concat(PulDivider as any);
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
    if (structure === Structure.Horizontal) {
      var productCol: any = JSON.parse(JSON.stringify(PulColItem));
      productCol['uuid'] = uuidv4();
      if (isImageVisible) {
        let image = PulImage;
        image['uuid'] = uuidv4();
        image['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        productCol['modules'].push(image);
        productCol['grid-columns'] = 4;
        productJSON.push(productCol);
      }

      var productCol: any = Object.assign({}, PulColItem);
      productCol['uuid'] = uuidv4();
      const moduleItems = [];
      if (isNameVisible) {
        let head = Object.assign({}, PulHead);
        head['uuid'] = uuidv4();
        head['descriptor']['heading']['text'] = '#Name#';
        head['descriptor']['heading']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(head);
      }

      if (isDescriptionVisible) {
        let desc = Object.assign({}, PulPara);
        desc['uuid'] = uuidv4();
        desc['descriptor']['paragraph']['html'] = '#Description#';
        desc['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(desc);
      }

      if (isPriceVisible) {
        let price = Object.assign({}, PulPrice);
        price['uuid'] = uuidv4();
        price['descriptor']['paragraph']['html'] = '#Price#';
        price['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(price);
      }

      if (isButtonVisible) {
        let button = Object.assign({}, PulButton);
        button['uuid'] = uuidv4();
        button['descriptor']['button']['label'] = buttonText;
        button['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(button);
      }

      if (isImageVisible) productCol['grid-columns'] = 8;
      productCol['modules'] = moduleItems;
      productJSON.push(productCol);
    } else {
      let productCol: any = Object.assign({}, PulColItem);
      productCol['uuid'] = uuidv4();
      productCol['grid-columns'] = 12;
      let moduleItems = [];
      if (isImageVisible) {
        let image = PulImage;
        image['descriptor']['image']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        image['uuid'] = uuidv4();
        moduleItems.push(image);
      }

      if (isNameVisible) {
        let head = Object.assign({}, PulHead);
        head['uuid'] = uuidv4();
        head['descriptor']['heading']['text'] = '#Name#';
        head['descriptor']['heading']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(head);
      }

      if (isDescriptionVisible) {
        let desc = Object.assign({}, PulPara);
        desc['uuid'] = uuidv4();
        desc['descriptor']['paragraph']['html'] = '#Description#';
        desc['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(desc);
      }

      if (isPriceVisible) {
        let price = Object.assign({}, PulPrice);
        price['uuid'] = uuidv4();
        price['descriptor']['paragraph']['html'] = '#Price#';
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

  const getProductNumbers = () => {
    return range(1, maxProducts+1).map((item: number) => <MenuItem key={`${item}`} value={`${item}`}>{item}</MenuItem>)
  }
  return (
    <BaseDialog
      open={isOpen}
      className={clsx(classes.dialogContainers)}
    >
      <div className='product-block'>
        <Box>
          <Grid container spacing={5}>
            <Grid item md={5}>
              <h2 className={clsx(classes.mt0)}>{t('campaigns.setupDynamicProduct')}</h2>
              <RadioGroup row aria-label="WebViewLocation" name="WebViewLocation" defaultValue="1">
                <FormControlLabel
                  value={Items.Single}
                  className={clsx(classes.fullSize)}
                  control={<Radio
                    color="primary"
                    checked={isSingleOrMultiple === Items.Single}
                    onChange={(event: any) => {
                      setSingleOrMultiple(event.target.value);
                      setUptoProducts(1);
                    }}
                    value={Items.Single}
                    />
                  }
                  label={t('campaigns.singleProduct')}
                />
                <FormControlLabel
                  value={Items.Multiple}
                  className={clsx(classes.fullSize)}
                  control={
                    <Radio
                      color="primary"
                      checked={isSingleOrMultiple === Items.Multiple}
                      onChange={(event: any) => setSingleOrMultiple(event.target.value)}
                      value={Items.Multiple}
                    />
                  }
                  label={t("campaigns.multipleProduct")}
                />
              </RadioGroup>
              {
                isSingleOrMultiple === Items.Multiple && (
                  <div className={clsx(classes.pl30, classes.pt5)}>
                    <label className={clsx(classes.pe15)}>{t('campaigns.upto')}</label>
                    <Select
                      className={clsx(classes.borderAround, classes.txtCenter, classes.pl10)}
                      value={uptoProducts}
                      onChange={(event: any) => setUptoProducts(event.target.value)}
                    >
                      {getProductNumbers()}
                    </Select>
                    <label className={clsx(classes.pl10)}>{t('campaigns.products')}</label>
                  </div>
                )
              }

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.filter')}:</h4>
              <div className={clsx(classes.mb25)}>
                <div className={clsx(classes.pb10)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isFilterByEventType}
                        onChange={(event) => setFilterIsByEventType(event.target.checked)}
                        name="by_event_type"
                        color="primary"
                      />
                    }
                    label={t('campaigns.byEventType')}
                  />
                  <Select
                    className={clsx(classes.dBlock, classes.borderAround, classes.ml25, classes.pl10)}
                    value={eventType}
                    onChange={(event: any) => setEventType(event.target.value)}
                  >
                    <MenuItem key='all' value='all'>{t('campaigns.allEvents')}</MenuItem>
                    <MenuItem key='page' value='page'>{t('campaigns.pageView')}</MenuItem>
                    <MenuItem key='purchase' value='purchase'>{t('campaigns.purchase')}</MenuItem>
                    <MenuItem key='cart_abandon' value='cart_abandon'>{t('campaigns.cartAbandonment')}</MenuItem>
                  </Select>
                </div>

                <div className='product-type'>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isFilterIsByProductCategory}
                        onChange={(event) => setFilterIsByProductCategory(event.target.checked)}
                        name="by_product_category"
                        color="primary"
                      />
                    }
                    label={t('campaigns.byProductCategory')}
                  />
                  <Select
                    className={clsx(classes.dBlock, classes.borderAround, classes.ml25, classes.pl10)}
                    value={category}
                    onChange={(event: any) => setCategory(event.target.value)}
                  >
                    <MenuItem key='all' value='all'>{t('campaigns.allCategories')}</MenuItem>
                    <MenuItem key='page' value='page'>{t('campaigns.pageView')}</MenuItem>
                  </Select>
                </div>
              </div>

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.display')}:</h4>
              <div className={clsx(classes.mb10)}>
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isImageVisible}
                        onChange={(event) => setImageVisibility(event.target.checked)}
                        name="display"
                        color="primary"
                      />
                    }
                    label={t('campaigns.image')}
                  />
                </div>
                
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isNameVisible}
                        onChange={(event) => setNameVisibility(event.target.checked)}
                        name="display"
                        color="primary"
                        value="Name"
                      />
                    }
                    label={t('campaigns.name')}
                  />
                </div>
                
                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isDescriptionVisible}
                        onChange={(event) => setDescriptionVisibility(event.target.checked)}
                        name="display"
                        color="primary"
                        value="Description"
                      />
                    }
                    label={t('campaigns.description')}
                  />
                </div>

                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isPriceVisible}
                        onChange={(event) => setPriceVisibility(event.target.checked)}
                        name="display"
                        color="primary"
                        value="Price"
                      />
                    }
                    label={t('campaigns.price')}
                  />
                </div>

                <div className={clsx(classes.dInlineBlock, classes.pb10)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked={isButtonVisible}
                        onChange={(event) => setButtonVisibility(event.target.checked)}
                        name="display"
                        color="primary"
                        value="Button"
                      />
                    }
                    label={t('campaigns.button')}
                  />
                </div>
              </div>

              <div className={clsx(classes.mb5)}>
                {t('campaigns.buttonText')}
              </div>
              <Input
                className={clsx(classes.dBlock, classes.borderAround, classes.pl10)}
                placeholder={t('campaigns.buyNow')}
                defaultValue={buttonText}
                onChange={(event: any) => setButtonText(event.target.value)}
              ></Input>
            </Grid>
            <Grid item md={7}>
            <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.productStructure')}:</h4>
              <Grid container spacing={5}>
                <Grid item md={4}>
                  <Select
                    className={clsx(classes.dBlock, classes.borderAround, classes.pl10)}
                    value={structure}
                    onChange={(event: any) => setStructure(event.target.value)}
                  >
                    <MenuItem key={Structure.Horizontal} value={Structure.Horizontal}>{t('campaigns.horizontal')}</MenuItem>
                    <MenuItem key={Structure.Vertical} value={Structure.Vertical}>{t('campaigns.vertical')}</MenuItem>
                  </Select>
                </Grid>

                <Grid item md={4}>
                  <Select
                    className={clsx(classes.dBlock, classes.borderAround, classes.pl10)}
                    value={direction}
                    onChange={(event: any) => setDirection(event.target.value)}
                  >
                    <MenuItem key={Direction.LeftToRight} value={Direction.LeftToRight}>{t('campaigns.leftToRight')}</MenuItem>
                    <MenuItem key={Direction.RightToLeft} value={Direction.RightToLeft}>{t('campaigns.rightToLeft')}</MenuItem>
                  </Select>
                </Grid>
              </Grid>
                
              {
                isSingleOrMultiple === Items.Multiple && (
                  <>
                    <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.productOrder')}:</h4>
                    <Grid container spacing={5}>
                      <Grid item md={4}>
                        <Select
                          className={clsx(classes.dBlock, classes.borderAround, classes.pl10)}
                          value={productOrder}
                          onChange={(event: any) => setProductOrder(event.target.value)}
                        >
                          <MenuItem key={Structure.Horizontal} value={Structure.Horizontal}>{t('campaigns.horizontal')}</MenuItem>
                          <MenuItem key={Structure.Vertical} value={Structure.Vertical}>{t('campaigns.vertical')}</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                  </>
                )
              }
              
              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.preview')}:</h4>
              <div className='preview' style={{ display: productOrder === Structure.Horizontal ? 'flex' : 'block' }}>
                  {
                    [
                      times(uptoProducts, (i) => {
                        return (
                          <Preview
                            classes={classes}
                            width={productOrder === Structure.Horizontal ? 100/uptoProducts : 100}
                            key={i}
                            isImageVisible={isImageVisible}
                            isNameVisible={isNameVisible}
                            isDescriptionVisible={isDescriptionVisible}
                            isPriceVisible={isPriceVisible}
                            isButtonVisible={isButtonVisible}
                            imageURL='#productsrc#'
                            name='#name#'
                            description='#description#'
                            price='#price#'
                            buttonText={buttonText}
                            structure={structure}
                            direction={direction}
                            eventType={isFilterByEventType ? eventType : ''}
                            category={isFilterIsByProductCategory ? category : ''}
                          />
                        )
                      }
                    )]
                  }
              </div>
              <div className={clsx(classes.textCenter, classes.mt25)}>
                <Button
                  onClick={onHandleSave}
                  variant='contained'
                  size='medium'
                  className={clsx(
                    classes.btn,
                    classes.btnRounded
                  )}
                  color="primary"
                >
                  {t('campaigns.addProductBlock')}
                </Button>
                <Button
                  onClick={onHandleCancel}
                  variant='contained'
                  size='medium'
                  className={clsx(classes.btn, classes.btnRounded, classes.ml10)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </Grid>
          </Grid>
        </Box>
      </div>
    </BaseDialog>
  )
}

export default ProductCatalog
