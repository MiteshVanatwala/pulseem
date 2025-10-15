import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import clsx from 'clsx';
import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { getUserCreditCards } from '../../redux/reducers/TiersSlice';

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
  const dispatch = useDispatch();
  const { userCreditCards } = useSelector((state: any) => state.tiers);
  const { isRTL } = useSelector((state: any) => state.core);

  // Extract credit cards data from the API response
  const creditCards = userCreditCards?.Data || [];

  useEffect(() => {
    dispatch(getUserCreditCards() as any);
  }, [dispatch]);

  const handleAddCard = () => {
    onAddCard?.();
  };

  return (
    <Box>
      {/* Credit Cards Table */}
      {creditCards && creditCards.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('billing.creditCardManagement.cardNumber')}</TableCell>
                <TableCell>{t('billing.creditCardManagement.cardType')}</TableCell>
                <TableCell>{t('billing.creditCardManagement.expires')}</TableCell>
                <TableCell>{t('billing.creditCardManagement.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creditCards.map((card: any, index: number) => (
                <TableRow key={card.CardId || index} hover>
                  <TableCell>
                    <Typography 
                      variant="body1" 
                      style={{ 
                        direction: 'ltr', 
                        fontWeight: 'bold'
                      }}
                    >
                      {card.MaskedNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {card.CardType || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {card.ExpDate || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {card.IsDefault ? (
                      <Chip 
                        label={t('billing.creditCardManagement.defaultCard')} 
                        color="primary" 
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {t('billing.creditCardManagement.secondaryCard')}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {/* Add New Card Button Row */}
              {/* <TableRow>
                <TableCell colSpan={5} style={{ textAlign: 'center', padding: 20 }}>
                  <Button
                    className={clsx(classes.btn, classes.btnRounded)}
                    onClick={handleAddCard}
                    startIcon={<MdAdd />}
                    variant="outlined"
                    color="primary"
                  >
                    {t('billing.creditCardManagement.addNewCard')}
                  </Button>
                </TableCell>
              </TableRow> */}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* No Cards State */
        <Box 
          className={classes.dFlex} 
          style={{ 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: 40,
            textAlign: 'center',
            border: '2px dashed #ccc',
            borderRadius: 8
          }}
        >
          <Typography variant="h6" color="textSecondary" style={{ marginBottom: 16 }}>
            {t('billing.creditCardManagement.noCards')}
          </Typography>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 24 }}>
            {t('billing.creditCardManagement.noCardsDescription')}
          </Typography>
          {/* <Button
            className={clsx(classes.btn, classes.btnRounded)}
            onClick={handleAddCard}
            startIcon={<MdAdd />}
            variant="contained"
            color="primary"
          >
            {t('billing.creditCardManagement.addFirstCard')}
          </Button> */}
        </Box>
      )}
    </Box>
  );
};

export default CreditCardManagement;
