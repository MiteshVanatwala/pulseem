import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Grid,
  makeStyles,
  Divider
} from '@material-ui/core';
import { pink } from '@material-ui/core/colors';
import { AnthropicUserRequest } from '../../../Models/AI/Anthropic';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { requestTemplate } from '../../../redux/reducers/AISlice';
import { logout } from '../../../helpers/Api/PulseemReactAPI';
import { setIsLoader } from '../../../redux/reducers/coreSlice';

// Custom styles using makeStyles
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 800,
    margin: '0 auto',
    //direction: 'rtl', // RTL direction for Hebrew
    // fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  textArea: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#333',
    // textAlign: 'right',
  },
  submitButton: {
    backgroundColor: pink[500],
    color: 'white',
    '&:hover': {
      backgroundColor: pink[700],
    },
    borderRadius: 25,
    padding: '8px 20px',
    marginTop: theme.spacing(2),
    height: 40
  },
  checkboxLabel: {
    fontSize: '1rem',
  },
  checkboxDesc: {
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  optionBox: {
    backgroundColor: '#f9f9f9',
    padding: theme.spacing(2),
    borderRadius: 4,
  },
  icon: {
    marginInlineEnd: 5,
    color: '#ff7777',
  },
}));

const AITemplateCreator = ({ campaignId, onUpdate }: any) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [model, setModel] = useState<AnthropicUserRequest>({
    campaignId: campaignId,
    maxToken: 16384,
    messageRequest: ''
  });

  const handleTextChange = (e: any) => {
    setModel({
      ...model,
      messageRequest: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    dispatch(setIsLoader(true));
    const response: any = await dispatch(requestTemplate(model));

    switch (response?.payload?.StatusCode) {
      case 201: {
        onUpdate('success');
        break;
      }
      case 401: {
        logout();
        break;
      }
      case 500: {
        alert('error occured');
      }
    }

    dispatch(setIsLoader(false));
  };

  return (
    <Box className={classes.root}>
      <form onSubmit={handleSubmit}>
        {/* Text area input */}
        <TextField
          className={classes.textArea}
          multiline
          rows={4}
          variant="outlined"
          value={model.messageRequest}
          onChange={handleTextChange}
          placeholder={`${t('AI.popup.placeholder')} 🥰`}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />

        {/* Options section */}
        <Paper className={classes.optionBox} elevation={0}>
          <Typography className={classes.sectionTitle}>
            {t('AI.popup.tips.title')}
          </Typography>
          <Divider style={{ marginBottom: 15 }} />
          <Grid container spacing={2}>
            {/* First column */}
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <span className={classes.icon}>🎨</span>
                <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                  {t('AI.popup.tips.toneTitle')}
                </Typography>
              </Box>
              <Typography className={classes.checkboxDesc}>
                {t('AI.popup.tips.toneDesc')}
              </Typography>
              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <span className={classes.icon}>📝</span>
                  <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                    {t('AI.popup.tips.specificTitle')}
                  </Typography>
                </Box>
                <Typography className={classes.checkboxDesc}>
                  {t('AI.popup.tips.specificDesc')}
                </Typography>
              </Box>
            </Grid>

            {/* Second column */}
            <Grid item xs={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <span className={classes.icon}>👗</span>
                <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                  {t('AI.popup.tips.elementsTitle')}
                </Typography>
              </Box>
              <Typography className={classes.checkboxDesc}>
                {t('AI.popup.tips.elementsDesc')}
              </Typography>

              <Box mt={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <span className={classes.icon}>🎯</span>
                  <Typography variant="body2" className={classes.checkboxLabel} style={{ fontWeight: 'bold' }}>
                    {t('AI.popup.tips.structureTitle')}
                  </Typography>
                </Box>
                <Typography className={classes.checkboxDesc}>
                  {t('AI.popup.tips.structureDesc')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Submit button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            className={classes.submitButton}
            endIcon={<span>✨</span>}
          >
            {t('AI.popup.createDesign')}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AITemplateCreator;