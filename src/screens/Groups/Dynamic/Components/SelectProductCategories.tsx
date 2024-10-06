import { Box, Button, Checkbox, FormControl, ListItemText, MenuItem, Select, TextField } from "@material-ui/core";
import { StateType } from "../../../../Models/StateTypes";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import clsx from 'clsx';
import { useTranslation } from "react-i18next";
import { getCategories } from "../../../../redux/reducers/productSlice";
import { useEffect, useState } from "react";

const SelectProductCategories = ({ classes, data, onUpdate, disabled }: any) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { productCategories } = useSelector((state: StateType) => state.product)
  const { t } = useTranslation();
  const dispatch = useDispatch();


  const getAccountCategories = async () => {
    await dispatch(getCategories());
  }

  useEffect(() => {
    getAccountCategories();
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
        labelId="category"
        id="category"
        multiple
        placeholder={t('report.ProductsReport.category')}
        inputProps={{
          placeholder: t('report.ProductsReport.category'),
          class: (!data || data?.length === 0) ? classes.selectPlaceholderInput : classes.dNone

        }}
        renderValue={(e: any) => {
          const selectedCategories = productCategories?.filter((item: any) => {
            return data?.indexOf(item?.CategoryId?.toString()) > -1;
          })
          return <>{selectedCategories?.map((c: any) => { return c?.CategoryName })?.join(',')}</>
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
        {productCategories.filter((pc: any) => {
          return searchTerm === '' || pc.CategoryName?.toLowerCase()?.indexOf(searchTerm?.toLowerCase()) > -1
        })?.map((item: any) => {
          return (<MenuItem key={item?.CategoryId?.toString()} value={item?.CategoryId?.toString()}>
            <Checkbox checked={data?.indexOf(item?.CategoryId?.toString()) > -1} />
            <ListItemText primary={item?.CategoryName} />
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

export default SelectProductCategories;