import { Box, MenuItem, Select, Typography } from "@material-ui/core";
import { ColorPalettes } from "../../helpers/UI/ColorPalettes";
import { StateType } from "../../Models/StateTypes";
import { useSelector } from "react-redux";

const ColorPaletteView = ({ selected, onSelected }: any) => {
  const { isRTL, windowSize } = useSelector((state: StateType) => state.core);
  return <Select onChange={(e: any) => {
    onSelected(e.target.value)
  }}
    SelectDisplayProps={{
      style: { display: 'flex', gap: 10, alignItems: 'center', paddingInlineStart: 0 }

    }}
    value={selected}>
    {Object.keys(ColorPalettes).map((paletteName: any) => {
      return <MenuItem value={paletteName} style={{ display: 'flex', flexDirection: 'row' }}>
        <Typography>{paletteName}</Typography>
        <Box style={{ width: 200, height: 20 }}>
          {/* @ts-ignore */}
          {ColorPalettes[paletteName]?.map((color: any) => {
            return <Box style={{ width: 20, height: 20, backgroundColor: `${color}`, display: 'inline-block' }}></Box>
          })
          }
        </Box>
      </MenuItem>
    })
    }
  </Select>


}


export default ColorPaletteView;