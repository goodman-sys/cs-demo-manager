import React, { useRef, useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { useWebSocketClient } from 'csdm/ui/hooks/use-web-socket-client';
import { useDispatch } from 'csdm/ui/store/use-dispatch';
import { useSelector } from 'csdm/ui/store/use-selector';
import {
  coachingReportStarted,
  selectCoachingReport,
  selectIsGeneratingReport,
} from 'csdm/ui/analysis/analysis-reducer';
import { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';

type Props = {
  steamId: string;
  checksum?: string;
};

export function CoachingReport({ steamId, checksum }: Props) {
  const { t } = useLingui();
  const dispatch = useDispatch();
  const client = useWebSocketClient();
  const report = useSelector(selectCoachingReport);
  const isGenerating = useSelector(selectIsGeneratingReport);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reportRef.current) {
      reportRef.current.scrollTop = reportRef.current.scrollHeight;
    }
  }, [report]);

  const handleGenerate = () => {
    dispatch(coachingReportStarted());
    void client.send({
      name: RendererClientMessageName.GenerateCoachingReport,
      payload: { steamId, checksum },
    });
  };

  return (
    <div className="flex flex-col gap-12">
      <button
        className="rounded-8 bg-blue-500 px-16 py-8 text-body-strong text-white hover:bg-blue-600 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? t(msg`正在生成报告...`) : t(msg`生成教练报告`)}
      </button>
      {report && (
        <div
          ref={reportRef}
          className="max-h-[400px] overflow-y-auto rounded-8 border border-gray-200 p-16 text-body whitespace-pre-wrap dark:border-gray-700 dark:text-gray-300"
        >
          {report}
        </div>
      )}
    </div>
  );
}
