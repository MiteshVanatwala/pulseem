import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { Button, Box, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(2),
    backgroundColor: '#fff',
    borderRadius: theme.shape.borderRadius,
    // boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: 'fit-content',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  cancelButton: {
    marginRight: theme.spacing(1),
  },
  okButton: {
    backgroundColor: '#ff3e55',
    color: 'white',
    '&:hover': {
      backgroundColor: '#e0354a',
    },
  }
}));

interface ColorPickerProps {
  initialColor?: string;
  onSelectColor: (color: string) => void;
  onCancel?: () => void;
}

const PulseemColorPicker: React.FC<ColorPickerProps> = ({
  initialColor = '#B200B6',
  onSelectColor,
  onCancel
}) => {
  const classes = useStyles();
  const [color, setColor] = useState(initialColor);
  const { t } = useTranslation();

  const handleChange = (newColor: any) => {
    setColor(newColor.hex);
  };

  const handleOk = () => {
    onSelectColor(color);
  };

  return (
    <Box className={classes.container}>
      <ChromePicker
        color={color}
        onChange={handleChange}
        disableAlpha={false}
      />

      <Box className={classes.buttonContainer}>
        <Button
          className={classes.okButton}
          variant="contained"
          onClick={handleOk}
        >
          {t('common.addNew')}
        </Button>
        <Button
          className={classes.cancelButton}
          variant="outlined"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>

      </Box>
    </Box>
  );
};

export default PulseemColorPicker;