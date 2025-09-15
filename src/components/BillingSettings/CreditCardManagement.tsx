import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';

interface CreditCardManagementProps {
  classes: any;
  onAddCard?: () => void;
  onEditCard?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

const CreditCardManagement: React.FC<CreditCardManagementProps> = ({
  classes,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  const { t } = useTranslation();
  const { creditCards } = useSelector((state: any) => state.payment);
  const { isRTL } = useSelector((state: any) => state.core);

  const handleAddCard = () => {
    onAddCard?.();
  };

  const handleEditCard = (cardId: string) => {
    onEditCard?.(cardId);
  };

  const handleDeleteCard = (cardId: string) => {
    onDeleteCard?.(cardId);
  };

  return (
    <Box>
      <Typography variant="h6" className={classes.managementTitle} style={{ marginBottom: 20 }}>
        {t('billing.creditCardManagement.title')}
      </Typography>

      {/* Add New Card Button */}
      <Box style={{ marginBottom: 20 }}>
        <Button
          className={clsx(classes.btn, classes.btnRounded)}
          onClick={handleAddCard}
          startIcon={<MdAdd />}
          variant="contained"
          color="primary"
        >
          {t('billing.creditCardManagement.addNewCard')}
        </Button>
      </Box>

      {/* Credit Cards List */}
      <Grid container spacing={2}>
        {creditCards && creditCards.length > 0 ? (
          creditCards.map((card: any, index: number) => (
            <Grid item xs={12} sm={6} md={4} key={card.CardId || index}>
              <Card className={classes.creditCardItem} elevation={2}>
                <CardContent>
                  <Box className={classes.dFlex} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" style={{ marginBottom: 8 }}>
                        {t('billing.creditCardManagement.cardNumber')}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        style={{ 
                          direction: 'ltr', 
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          marginBottom: 12
                        }}
                      >
                        **** **** **** {card.LastDigits}
                      </Typography>
                      
                      {card.CardType && (
                        <Typography variant="body2" color="textSecondary">
                          {card.CardType}
                        </Typography>
                      )}
                      
                      {card.ExpiryDate && (
                        <Typography variant="body2" color="textSecondary">
                          {t('billing.creditCardManagement.expires')}: {card.ExpiryDate}
                        </Typography>
                      )}
                      
                      {card.IsDefault && (
                        <Typography 
                          variant="body2" 
                          style={{ 
                            color: '#4caf50', 
                            fontWeight: 'bold',
                            marginTop: 8
                          }}
                        >
                          {t('billing.creditCardManagement.defaultCard')}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box className={classes.dFlex} style={{ flexDirection: 'column', gap: 8 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditCard(card.CardId)}
                        title={t('common.edit')}
                      >
                        <MdEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCard(card.CardId)}
                        title={t('common.delete')}
                        style={{ color: '#f44336' }}
                      >
                        <MdDelete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box 
              className={classes.dFlex} 
              style={{ 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: 40,
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" color="textSecondary" style={{ marginBottom: 16 }}>
                {t('billing.creditCardManagement.noCards')}
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
                {t('billing.creditCardManagement.noCardsDescription')}
              </Typography>
              <Button
                className={clsx(classes.btn, classes.btnRounded)}
                onClick={handleAddCard}
                startIcon={<MdAdd />}
                variant="contained"
                color="primary"
              >
                {t('billing.creditCardManagement.addFirstCard')}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Additional Information */}
      <Box style={{ marginTop: 30, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Typography variant="body2" color="textSecondary">
          <strong>{t('billing.creditCardManagement.note')}:</strong>{' '}
          {t('billing.creditCardManagement.securityNote')}
        </Typography>
      </Box>
    </Box>
  );
};

export default CreditCardManagement;
