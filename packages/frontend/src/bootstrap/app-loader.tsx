import React, { useEffect, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { Loading } from 'csdm/ui/bootstrap/loading';
import { App } from 'csdm/ui/bootstrap/app';
import { initializeAppSuccess } from 'csdm/ui/bootstrap/bootstrap-actions';
import { Status } from 'csdm/common/types/status';
import { LoadingError } from 'csdm/ui/bootstrap/loading-error';

export function AppLoader() {
  const dispatch = useDispatch();
  const { t } = useLingui();
  const [error, setError] = useState('');
  const [status, setStatus] = useState<Status>(Status.Loading);

  useEffect(() => {
    if (status !== Status.Loading) {
      return;
    }

    const initializeApplication = async () => {
      try {
        const response = await fetch('/api/init');
        if (!response.ok) {
          throw new Error(`初始化请求失败: ${response.status}`);
        }
        const payload = await response.json();
        dispatch(initializeAppSuccess(payload));
        setStatus(Status.Success);
      } catch (error) {
        let errorMessage = t`An error occurred while loading the application.`;
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setError(errorMessage);
        setStatus(Status.Error);
      }
    };

    void initializeApplication();
  }, [t, dispatch, status]);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred while loading the application.</Trans>} error={error} />;
  }

  return <App />;
}
