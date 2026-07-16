import { useEffect } from 'react';
import { RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { coachingReportChunk, coachingReportFinished } from 'csdm/ui/analysis/analysis-reducer';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import type { WebSocketClient } from 'csdm/ui/web-socket-client';

export function useRegisterCoachingReportListeners(client: WebSocketClient) {
  const dispatch = useDispatch();

  useEffect(() => {
    const onChunk = (chunk: string) => {
      dispatch(coachingReportChunk(chunk));
    };

    const onFinished = () => {
      dispatch(coachingReportFinished());
    };

    client.on(RendererServerMessageName.CoachingReportChunk, onChunk);
    client.on(RendererServerMessageName.CoachingReportFinished, onFinished);

    return () => {
      client.off(RendererServerMessageName.CoachingReportChunk, onChunk);
      client.off(RendererServerMessageName.CoachingReportFinished, onFinished);
    };
  });
}
