import { Box, Button, Checkbox, FormControl, ListItemText, MenuItem, Select, TextField } from "@material-ui/core";
import { StateType } from "../../../../Models/StateTypes";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import clsx from 'clsx';
import { useTranslation } from "react-i18next";
import { getProductURLS } from "../../../../redux/reducers/productSlice";
import { useEffect, useRef, useState } from "react";

const SelectProductUrl = ({ classes, data, onUpdate, disabled }: any) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { isRTL } = useSelector((state: StateType) => state.core);
  const { productUrls } = useSelector((state: StateType) => state.product)
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const getUrls = async () => {
    await dispatch(getProductURLS());
  }

  useEffect(() => {
    getUrls();
  }, [])

  useEffect(() => {
    if (menuOpen && inputRef.current) {
      // Use a small timeout to ensure the focus happens after any other rendering
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [menuOpen, searchTerm]);

  // Stop propagation to prevent Select from capturing events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Use a clean handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Prevent event bubbling
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle menu open/close
  const handleMenuOpen = () => {
    setMenuOpen(true);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  // Function to highlight search term in text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? <strong key={index}>{part}</strong> : <span key={index}>{part}</span>
        )}
      </span>
    );
  };

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
        open={menuOpen}
        onOpen={handleMenuOpen}
        onClose={handleMenuClose}
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
        <Box style={{ padding: 5, position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'white' }} onClick={handleInputClick}>
          <TextField
            inputRef={inputRef}
            variant="outlined"
            type="text"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.stopPropagation()}
            onBlur={(e) => e.preventDefault()}
            value={searchTerm}
            placeholder={t('common.searchInput')}
            fullWidth
            autoFocus
          />
        </Box>
        {productUrls.filter((pc: any) => {
          return searchTerm === '' || pc.URL?.toLowerCase()?.indexOf(searchTerm?.toLowerCase()) > -1
        })?.map((item: any) => {
          return (<MenuItem key={item?.ID?.toString()} value={item?.ID?.toString()}>
            <Checkbox checked={data?.indexOf(item?.ID?.toString()) > -1} />
            <ListItemText
              primary={
                searchTerm.trim() ?
                  highlightText(item?.URL, searchTerm) :
                  item?.URL
              }
            />
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