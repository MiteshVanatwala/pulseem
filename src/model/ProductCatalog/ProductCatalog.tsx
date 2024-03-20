import React, { useEffect, useState } from 'react'
import Preview from './Preview'
import times from 'lodash/times';
import {
  Box,
  Grid,
  RadioGroup,
  Radio,
  Dialog as BaseDialog, FormControlLabel, MenuItem, Checkbox, Button, Input, FormControl
} from '@material-ui/core'
import clsx from 'clsx';
import { range } from 'lodash';
import { PulButton, PulColItem, PulDivider, PulHead, PulImage, PulPara, PulRow } from '../../screens/HtmlCampaign/helper/Template';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import { ProductCatalogTypes } from './Types';
import { Direction, EventTypes, Items, Structure } from '../../config/enum';
import { useSelector } from 'react-redux';
import { StateType } from '../../Models/StateTypes';
import Select from '@mui/material/Select';
import { IoIosArrowDown } from 'react-icons/io';
import { DynamicProductGrid, NO_IMAGE_URL } from '../../helpers/Constants';

const ProductCatalog = ({ classes, isOpen = true, save }: ProductCatalogTypes) => {
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
  const [structure, setStructure] = useState(Structure.Vertical);
  const [eventType, setEventType] = useState(EventTypes.Purchase);
  const [category, setCategory] = useState(0);
  const [maxProducts, setMaxProducts] = useState(4);
  const [productOrder, setProductOrder] = useState(Structure.Horizontal);
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { productCategories } = useSelector((state: StateType) => state.product);
  const [direction, setDirection] = useState(isRTL ? Direction.RightToLeft : Direction.LeftToRight);

  useEffect(() => {
    if (productOrder === Structure.Vertical) {
      setStructure(productOrder);
      setMaxProducts(4);
    } else {
      setMaxProducts(2);
    }
  }, [productOrder]);

  useEffect(() => {
    setMaxProducts(structure === Structure.Vertical ? 4 : 2);
  }, [structure])

  useEffect(() => {
    setButtonText(t('campaigns.buyNow'));
  }, []);

  const onHandleSave = () => {
    let dynamicRow = Object.assign({}, PulRow);
    dynamicRow['container']['style']['direction'] = direction;
    dynamicRow['container']['style']['product-block-container'] = '1';
    dynamicRow['content']['style']['direction'] = direction;
    dynamicRow['metadata']["EventType"] = eventType.toString(); //getEventName(eventType);
    dynamicRow['metadata']["ProductCategory"] = category;
    dynamicRow['metadata']["NumOfProdcuts"] = uptoProducts;
    dynamicRow['metadata']["direction"] = direction.toUpperCase();
    dynamicRow['metadata']["order"] = productOrder;
    dynamicRow['metadata']["category"] = category ? productCategories.find((cat: any) => cat.CategoryId == category)?.CategoryName : t('campaigns.allCategories');
    var productJSON: any = getProductJSON();
    if (uptoProducts > 0) {
      if (productOrder === Structure.Horizontal) {
        for (let ind = 0; ind < uptoProducts; ind++) {
          dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
        }
      } else if (productOrder === Structure.Vertical) {
        var modules: any = [];
        for (let ind = 0; ind < uptoProducts; ind++) {
          for (let indJ = 0; indJ < productJSON.length; indJ++) {
            modules = modules.concat(productJSON[indJ]['modules']);
          }
          if (ind < uptoProducts - 1) modules = modules.concat(PulDivider);
        }

        if (structure === Structure.Vertical) {
          productJSON[0]['modules'] = modules;
          dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
        } else {
          for (let ind = 0; ind < uptoProducts; ind++) {
            dynamicRow['columns'] = dynamicRow['columns'].concat(productJSON);
            dynamicRow['columns'] = dynamicRow['columns'].concat(PulDivider as any);
          }
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
      const imageCol = DynamicProductGrid[`Item_${uptoProducts}`].image;
      const contentCol = DynamicProductGrid[`Item_${uptoProducts}`].content;
      var productCol: any = JSON.parse(JSON.stringify(PulColItem));
      productCol['uuid'] = uuidv4();
      if (isImageVisible) {
        let image = Object.assign({}, PulImage);
        image['uuid'] = uuidv4();
        image['descriptor']['image']['src'] = NO_IMAGE_URL;
        // let image = Object.assign({}, PulProductImage);
        // image['uuid'] = uuidv4();
        // image['descriptor']['paragraph']['html'] = '#productsrc#';
        image['descriptor']['style']['text-align'] = direction === 'ltr' ? 'right' : 'left';
        productCol['modules'].push(image);
        productCol['grid-columns'] = imageCol;
        productJSON.push(productCol);
      }

      var productCol: any = Object.assign({}, PulColItem);
      productCol['uuid'] = uuidv4();
      const moduleItems = [];
      if (isNameVisible) {
        let head = Object.assign({}, PulHead);
        head['uuid'] = uuidv4();
        head['descriptor']['heading']['text'] = '#name#';
        head['descriptor']['heading']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(head);
      }

      if (isDescriptionVisible) {
        let desc = JSON.parse(JSON.stringify(PulPara));
        desc['uuid'] = uuidv4();
        desc['descriptor']['paragraph']['html'] = '#description#';
        desc['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(desc);
      }

      if (isPriceVisible) {
        let price = JSON.parse(JSON.stringify(PulPara));
        price['uuid'] = uuidv4();
        price['descriptor']['paragraph']['html'] = '#price#';
        price['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(price);
      }

      if (isFilterByEventType) {
        let event = JSON.parse(JSON.stringify(PulPara));
        event['uuid'] = uuidv4();
        event['descriptor']['paragraph']['style']['pulseem-hide'] = '1';
        event['descriptor']['paragraph']['html'] = getEventName(eventType);
        event['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        event['descriptor']['computedStyle']['hideContentOnHtml'] = true;
        moduleItems.push(event);
      }

      if (isFilterIsByProductCategory) {
        let cat = JSON.parse(JSON.stringify(PulPara));
        cat['uuid'] = uuidv4();
        cat['descriptor']['paragraph']['style']['pulseem-hide'] = '1';
        cat['descriptor']['paragraph']['html'] = category ? productCategories.find((cat: any) => cat.CategoryId == category)?.CategoryName : t('campaigns.allCategories');
        cat['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        cat['descriptor']['computedStyle']['hideContentOnHtml'] = true;
        moduleItems.push(cat);
      }

      if (isButtonVisible) {
        let button = Object.assign({}, PulButton);
        button['uuid'] = uuidv4();
        button['descriptor']['button']['label'] = buttonText;
        button['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(button);
      }

      if (isImageVisible) productCol['grid-columns'] = contentCol;
      productCol['modules'] = moduleItems;
      productJSON.push(productCol);
    } else {
      let productCol: any = Object.assign({}, PulColItem);
      productCol['uuid'] = uuidv4();
      productCol['grid-columns'] = 12 / uptoProducts;
      let moduleItems = [];
      // moduleItems.push(PulProductContainerStart);
      if (isImageVisible) {
        let image = Object.assign({}, PulImage);
        image['uuid'] = uuidv4();
        image['descriptor']['image']['src'] = NO_IMAGE_URL;
        // let image = Object.assign({}, PulProductImage);
        // image['uuid'] = uuidv4();
        // image['descriptor']['paragraph']['html'] = '#productsrc#';
        image['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        image['descriptor']['style']['padding-left'] = '20px';
        image['descriptor']['style']['padding-right'] = '20px';
        image['descriptor']['computedStyle']['class'] = `left fixedwidth`;
        moduleItems.push(image);
      }

      if (isNameVisible) {
        let head = Object.assign({}, PulHead);
        head['uuid'] = uuidv4();
        head['descriptor']['heading']['text'] = '#name#';
        head['descriptor']['heading']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(head);
      }

      if (isDescriptionVisible) {
        let desc = JSON.parse(JSON.stringify(PulPara));
        desc['uuid'] = uuidv4();
        desc['descriptor']['paragraph']['html'] = '#description#';
        desc['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(desc);
      }

      if (isPriceVisible) {
        let price = JSON.parse(JSON.stringify(PulPara));
        price['uuid'] = uuidv4();
        price['descriptor']['paragraph']['html'] = '#price#';
        price['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(price);
      }

      if (isFilterByEventType) {
        let event = JSON.parse(JSON.stringify(PulPara));
        event['uuid'] = uuidv4();
        event['descriptor']['paragraph']['html'] = getEventName(eventType);
        event['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        event['descriptor']['paragraph']['style']['pulseem-hide'] = '1';
        event['descriptor']['computedStyle']['hideContentOnHtml'] = true;
        moduleItems.push(event);
      }

      if (isFilterIsByProductCategory) {
        let cat = JSON.parse(JSON.stringify(PulPara));
        cat['uuid'] = uuidv4();
        cat['descriptor']['paragraph']['html'] = category ? productCategories.find((cat: any) => cat.CategoryId == category)?.CategoryName : t('campaigns.allCategories');
        cat['descriptor']['paragraph']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        cat['descriptor']['paragraph']['style']['pulseem-hide'] = '1';
        cat['descriptor']['computedStyle']['hideContentOnHtml'] = true;
        moduleItems.push(cat);
      }

      if (isButtonVisible) {
        let button = Object.assign({}, PulButton);
        button['uuid'] = uuidv4();
        button['descriptor']['button']['label'] = buttonText || t('campaigns.buttonText');
        button['descriptor']['style']['text-align'] = direction === 'ltr' ? 'left' : 'right';
        moduleItems.push(button);
      }
      // moduleItems.push(PulProductContainerEnd);
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
    return range(1, maxProducts + 1).map((item: number) => <MenuItem key={`${item}`} value={`${item}`}>{item}</MenuItem>)
  }

  const previewContainerHeight = window.innerHeight - 400;

  const getEventName = (eventType: number) => {
    let event = t('campaigns.allEvents');
    switch (eventType) {
      case 1:
        event = t('campaigns.purchase');
        break;

      case 2:
        event = t('campaigns.cartAbandonment');
        break;
    }
    return event;
  }

  return (
    <BaseDialog
      open={isOpen}
      className={clsx(classes.dialogContainers)}
      disableEnforceFocus
    >
      <div className='product-block' style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <Box>
          <h2 className={clsx(classes.mt0)}>{t('campaigns.setupDynamicProduct')}</h2>
          <Grid container spacing={5}>
            <Grid item md={5}>
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
                    <FormControl
                      variant="standard"
                      className={clsx(classes.selectInputFormControl)}
                      style={{ verticalAlign: 'baseline' }}
                    >
                      <Select
                        variant="standard"
                        value={uptoProducts}
                        onChange={(event: any) => setUptoProducts(event.target.value)}
                        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                        style={{ width: '100%' }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                              direction: isRTL ? 'rtl' : 'ltr'
                            },
                          },
                        }}
                      >
                        {getProductNumbers()}
                      </Select>
                    </FormControl>
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
                  <FormControl
                    variant="standard"
                    className={clsx(classes.dBlock, classes.selectInputFormControl, classes.ml25)}
                  >
                    <Select
                      variant="standard"
                      autoWidth
                      displayEmpty
                      IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                      value={eventType}
                      onChange={(event: any) => setEventType(event.target.value)}
                      style={{ width: '100%' }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            direction: isRTL ? 'rtl' : 'ltr'
                          },
                        },
                      }}
                    >
                      <MenuItem value={EventTypes.All}>{t('campaigns.allEvents')}</MenuItem>
                      {/* <MenuItem value={EventTypes.Page}>{t('campaigns.pageView')}</MenuItem> */}
                      <MenuItem value={EventTypes.Purchase}>{t('campaigns.purchase')}</MenuItem>
                      <MenuItem value={EventTypes.CartAbandon}>{t('campaigns.cartAbandonment')}</MenuItem>
                    </Select>
                  </FormControl>
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
                  <FormControl
                    variant="standard"
                    className={clsx(classes.dBlock, classes.selectInputFormControl, classes.ml25)}
                  >
                    <Select
                      variant="standard"
                      id='category'
                      IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                      value={category}
                      onChange={(event: any) => setCategory(event.target.value)}
                      style={{ width: '100%' }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            direction: isRTL ? 'rtl' : 'ltr'
                          },
                        },
                      }}
                    >
                      <MenuItem key='0' value={0}>{t('campaigns.allCategories')}</MenuItem>
                      {
                        productCategories?.map((item: any) => <MenuItem key={item.CategoryId} value={item.CategoryId}>{item.CategoryName}</MenuItem>)
                      }
                    </Select>
                  </FormControl>
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
                className={clsx(classes.dBlock, classes.borderAround, classes.pl10, classes.pr10)}
                placeholder={t('campaigns.buyNow')}
                defaultValue={buttonText}
                onChange={(event: any) => setButtonText(event.target.value)}
              ></Input>
            </Grid>
            <Grid item md={7}>
              <h4 className={clsx(classes.bold, classes.pt5, classes.noMargin, classes.pb10)}>{t('campaigns.productStructure')}:</h4>
              <Grid container spacing={5}>
                <Grid item md={4}>
                  <FormControl
                    variant="standard"
                    className={clsx(classes.dBlock, classes.selectInputFormControl)}
                  >
                    <Select
                      variant="standard"
                      id='category'
                      value={structure}
                      onChange={(event: any) => setStructure(event.target.value)}
                      IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                      style={{ width: '100%' }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            direction: isRTL ? 'rtl' : 'ltr'
                          },
                        },
                      }}
                    >
                      <MenuItem key={Structure.Horizontal} value={Structure.Horizontal}>{t('campaigns.horizontal')}</MenuItem>
                      <MenuItem key={Structure.Vertical} value={Structure.Vertical}>{t('campaigns.vertical')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item md={4}>
                  <FormControl
                    variant="standard"
                    className={clsx(classes.dBlock, classes.selectInputFormControl)}
                  >
                    <Select
                      variant="standard"
                      id='direction'
                      value={direction}
                      onChange={(event: any) => setDirection(event.target.value)}
                      IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                      style={{ width: '100%' }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            direction: isRTL ? 'rtl' : 'ltr'
                          },
                        },
                      }}
                    >
                      <MenuItem key={Direction.LeftToRight} value={Direction.LeftToRight}>{t('campaigns.leftToRight')}</MenuItem>
                      <MenuItem key={Direction.RightToLeft} value={Direction.RightToLeft}>{t('campaigns.rightToLeft')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {
                isSingleOrMultiple === Items.Multiple && (
                  <>
                    <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.productOrder')}:</h4>
                    <Grid container spacing={5}>
                      <Grid item md={4}>
                        <FormControl
                          variant="standard"
                          className={clsx(classes.dBlock, classes.selectInputFormControl)}
                        >
                          <Select
                            variant="standard"
                            id='productOrder'
                            value={productOrder}
                            onChange={(event: any) => setProductOrder(event.target.value)}
                            IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
                            style={{ width: '100%' }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 300,
                                  direction: isRTL ? 'rtl' : 'ltr'
                                },
                              },
                            }}
                          >
                            <MenuItem key={Structure.Horizontal} value={Structure.Horizontal}>{t('campaigns.horizontal')}</MenuItem>
                            <MenuItem key={Structure.Vertical} value={Structure.Vertical}>{t('campaigns.vertical')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </>
                )
              }

              <h4 className={clsx(classes.bold, classes.pt5, classes.mb10)}>{t('campaigns.preview')}:</h4>
              <div className='preview' style={{ display: productOrder === Structure.Horizontal ? 'flex' : 'block', height: previewContainerHeight, minHeight: previewContainerHeight, maxHeight: previewContainerHeight, overflowY: 'auto', overflowX: 'hidden' }}>
                {
                  [
                    times(uptoProducts, (i) => {
                      return (
                        <Preview
                          classes={classes}
                          width={productOrder === Structure.Horizontal ? 100 / uptoProducts : 100}
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
                          eventType={isFilterByEventType ? getEventName(eventType) : ''}
                          category={isFilterIsByProductCategory ? productCategories.find((cat: any) => cat.CategoryId == category)?.CategoryName || t('campaigns.allCategories') : ''}
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
