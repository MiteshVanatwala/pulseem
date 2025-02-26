import { Box, Button, Checkbox, FormControl, ListItemText, MenuItem, Select, TextField } from "@material-ui/core";
import { StateType } from "../../../../Models/StateTypes";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import clsx from 'clsx';
import { useTranslation } from "react-i18next";
import { getProductURLS } from "../../../../redux/reducers/productSlice";
import { useEffect, useState } from "react";

const SelectProductUrl = ({ classes, data, onUpdate, disabled }: any) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { productUrls } = useSelector((state: StateType) => state.product)
  const { t } = useTranslation();
  const dispatch = useDispatch();


  const getUrls = async () => {
    await dispatch(getProductURLS());
  }

  useEffect(() => {
    getUrls();
  }, [])

  const handleSearchTerm = (e: any) => {
    setSearchTerm(e.target.value);
  }

  return <>
    <FormControl
      variant="standard"
      className={clsx(classes.selectInputFormControl, classes.w100, classes.ellipsisText)}
    >
      <Select
        displayEmpty={true}
        labelId="pages"
        id="pages"
        multiple
        placeholder={t('group.selectePages')}
        inputProps={{
          placeholder: t('group.selectePages'),
          class: (!data || data?.length === 0) ? classes.selectPlaceholderInput : classes.dNone

        }}
        renderValue={(e: any) => {
          const selectedCategories = productUrls?.filter((item: any) => {
            return data?.indexOf(item?.ID?.toString()) > -1;
          })
          return <>{selectedCategories?.map((c: any) => { return c?.URL })?.join(',')}</>
        }}
        disabled={disabled}
        variant='standard'
        value={data || []}
        onChange={(event: any) => onUpdate(event.target.value)}
        IconComponent={() => <IoIosArrowDown size={20} className={classes.dropdownIconComponent} />}
        className={clsx(classes.w100, classes.mt10)}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: isRTL ? 'right' : 'left'
          },
          getContentAnchorEl: null,
          PaperProps: {
            style: {
              maxHeight: 300,
              direction: isRTL ? 'rtl' : 'ltr'
            },
          },
        }}
      >
        <Box style={{ padding: 5 }}>
          <TextField
            variant="outlined"
            type="text"
            onChange={handleSearchTerm}
            value={searchTerm} placeholder={t('common.searchInput')}></TextField>
        </Box>
        {productUrls.filter((pc: any) => {
          return searchTerm === '' || pc.URL?.toLowerCase()?.indexOf(searchTerm?.toLowerCase()) > -1
        })?.map((item: any) => {
          return (<MenuItem key={item?.ID?.toString()} value={item?.ID?.toString()}>
            <Checkbox checked={data?.indexOf(item?.ID?.toString()) > -1} />
            <ListItemText primary={item?.URL} />
          </MenuItem>)
        })}
      </Select>
    </FormControl>
    {
      (data?.length > 0) && <Button
        style={{ border: 'none' }}
        className={clsx(classes.textRed, classes.f13, classes.p5, classes.floatRight)}
        onClick={() => onUpdate(null)}>
        {t("recipient.reset")}
      </Button>
    }
  </>
}

export default SelectProductUrl;