import { Box, MenuItem, Select, Typography } from "@material-ui/core";
import { ColorPalettes } from "../../helpers/UI/ColorPalettes";

const ColorPaletteView = ({ selected, onSelected }: any) => {
  return <Select onChange={(e: any) => {
    console.log(e.target.value);
    onSelected(e.target.value)

  }} value={selected}>
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