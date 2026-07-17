import React, { useContext, useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Loading } from 'csdm/ui/bootstrap/loading';
import { App } from 'csdm/ui/bootstrap/app';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { Status } from 'csdm/common/types/status';
import { LoadingError } from 'csdm/ui/bootstrap/loading-error';
import { WebSocketContext } from './web-socket-provider';

export function AppLoader() {
  const client = useContext(WebSocketContext);
  const dispatch = useDispatch();
  const { t } = useLingui();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>(Status.Loading);

  useEffect(() => {
    if (status !== Status.Loading || client === null) {
      return;
    }

    const initializeApplication = async () => {
      try {
        const payload = await client.send({
          name: RendererClientMessageName.InitializeApplication,
        });

        dispatch(initializeAppSuccess(payload));
        setStatus(Status.Success);
      } catch (error) {
        let errorMessage = t`An error occurred while loading the application.`;
        if (typeof error === 'string') {
          errorMessage = error;
        }
        setError(errorMessage);
        setStatus(Status.Error);
      }
    };

    void initializeApplication();
  }, [t, client, dispatch, status]);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred while loading the application.</Trans>} error={error} />;
  }

  return <App />;
}
