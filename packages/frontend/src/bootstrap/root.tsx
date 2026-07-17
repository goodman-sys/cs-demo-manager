import React, { StrictMode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { MotionConfig } from 'motion/react';
import { store } from 'csdm/ui/store/store';
import { AppLoader } from './app-loader';
import { LocaleProvider } from './locale-provider';
import { ArgumentsProvider } from 'csdm/ui/bootstrap/arguments-provider';
import { SettingsProvider } from 'csdm/ui/bootstrap/settings-provider';
import { WebSocketProvider } from './web-socket-provider';
import { DialogProvider } from 'csdm/ui/components/dialogs/dialog-provider';
import { ToastsProvider } from 'csdm/ui/components/toasts/toasts-provider';
import { SettingsOverlayProvider } from 'csdm/ui/settings/settings-overlay-provider';
import { APP_ELEMENT_ID } from 'csdm/ui/shared/element-ids';

function App() {
  return (
    <ReduxProvider store={store}>
      <MotionConfig reducedMotion="user">
        <LocaleProvider>
          <ArgumentsProvider>
            <ToastsProvider>
              <SettingsProvider>
                <WebSocketProvider>
                  <DialogProvider inertElementId={APP_ELEMENT_ID}>
                    <SettingsOverlayProvider>
                      <AppLoader />
                    </SettingsOverlayProvider>
                  </DialogProvider>
                </WebSocketProvider>
              </SettingsProvider>
            </ToastsProvider>
          </ArgumentsProvider>
        </LocaleProvider>
      </MotionConfig>
    </ReduxProvider>
  );
}

export function Root() {
  if (REACT_STRICT_MODE_ENABLED) {
    return (
      <StrictMode>
        <App />
      </StrictMode>
    );
  }

  return <App />;
}
