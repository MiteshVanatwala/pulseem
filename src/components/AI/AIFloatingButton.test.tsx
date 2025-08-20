import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import AIFloatingButton from './AIFloatingButton';
import { MuiThemeProvider } from '@material-ui/core';
import { getTheme } from '../../style/theme';

const theme = getTheme('en');

describe('AIFloatingButton', () => {
  it('renders the button', () => {
    render(
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <AIFloatingButton />
        </MuiThemeProvider>
      </Provider>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('dispatches toggleChat action on click', () => {
    render(
        <Provider store={store}>
          <MuiThemeProvider theme={theme}>
              <AIFloatingButton />
          </MuiThemeProvider>
        </Provider>
      );

    const button = screen.getByRole('button');
    const initialState = store.getState().aiChat.isOpen;

    fireEvent.click(button);

    const nextState = store.getState().aiChat.isOpen;
    expect(nextState).toBe(!initialState);

    // Click again to test toggling back
    fireEvent.click(button);
    const finalState = store.getState().aiChat.isOpen;
    expect(finalState).toBe(initialState);
  });
});
