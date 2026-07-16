import React, { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { SelectOption } from 'csdm/ui/components/inputs/select';
import { Select } from 'csdm/ui/components/inputs/select';
import { TextInput } from 'csdm/ui/components/inputs/text-input';
import { SettingsView } from 'csdm/ui/settings/settings-view';
import { SettingsEntry } from 'csdm/ui/settings/settings-entry';
import { useSettings } from 'csdm/ui/settings/use-settings';
import { useUpdateSettings } from 'csdm/ui/settings/use-update-settings';
import { useShowToast } from 'csdm/ui/components/toasts/use-show-toast';
import { Button, ButtonVariant } from 'csdm/ui/components/buttons/button';
import type { AiSettings as AiSettingsType } from 'csdm/node/settings/settings';

type AiProvider = AiSettingsType['provider'];
type AiLanguage = AiSettingsType['language'];

export function AiSettings() {
  const { t } = useLingui();
  const showToast = useShowToast();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  const [provider, setProvider] = useState<AiProvider>(settings.ai.provider);
  const [apiKey, setApiKey] = useState(settings.ai.apiKey);
  const [model, setModel] = useState(settings.ai.model);
  const [customEndpoint, setCustomEndpoint] = useState(settings.ai.customEndpoint);
  const [language, setLanguage] = useState<AiLanguage>(settings.ai.language);

  /* oxlint-disable lingui/no-unlocalized-strings */
  const providerOptions: SelectOption<AiProvider>[] = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'custom', label: t({ message: 'Custom' }) },
  ];

  const languageOptions: SelectOption<AiLanguage>[] = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
  ];
  /* oxlint-enable lingui/no-unlocalized-strings */

  const hasChanges =
    provider !== settings.ai.provider ||
    apiKey !== settings.ai.apiKey ||
    model !== settings.ai.model ||
    customEndpoint !== settings.ai.customEndpoint ||
    language !== settings.ai.language;

  const onSave = async () => {
    try {
      await updateSettings({
        ai: {
          provider,
          apiKey,
          model,
          customEndpoint,
          language,
        },
      });
      showToast({
        id: 'ai-settings-saved',
        content: <Trans>Settings saved</Trans>,
        type: 'success',
      });
    } catch {
      showToast({
        id: 'ai-settings-error',
        content: <Trans>An error occurred</Trans>,
        type: 'error',
      });
    }
  };

  return (
    <SettingsView>
      <SettingsEntry
        title={<Trans context="Settings title">Provider</Trans>}
        description={<Trans>AI service provider</Trans>}
        interactiveComponent={
          <Select options={providerOptions} value={provider} onChange={(value) => setProvider(value)} />
        }
      />
      <SettingsEntry
        title={<Trans context="Settings title">API Key</Trans>}
        description={<Trans>Authentication key for the AI provider</Trans>}
        interactiveComponent={
          <TextInput
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={t({
              context: 'Input placeholder',
              message: 'API key',
            })}
          />
        }
      />
      <SettingsEntry
        title={<Trans context="Settings title">Model</Trans>}
        description={<Trans>AI model to use</Trans>}
        interactiveComponent={
          <TextInput
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder={t({
              context: 'Input placeholder',
              message: 'Model name',
            })}
          />
        }
      />
      {provider === 'custom' && (
        <SettingsEntry
          title={<Trans context="Settings title">Custom Endpoint</Trans>}
          description={<Trans>Custom API endpoint URL</Trans>}
          interactiveComponent={
            <TextInput
              value={customEndpoint}
              onChange={(event) => setCustomEndpoint(event.target.value)}
              placeholder={t({
                context: 'Input placeholder',
                message: 'https://api.example.com/v1',
              })}
            />
          }
        />
      )}
      <SettingsEntry
        title={<Trans context="Settings title">Language</Trans>}
        description={<Trans>Language used for AI responses</Trans>}
        interactiveComponent={
          <Select options={languageOptions} value={language} onChange={(value) => setLanguage(value)} />
        }
      />
      <div className="mt-16 flex justify-end">
        <Button onClick={onSave} variant={ButtonVariant.Primary} isDisabled={!hasChanges}>
          <Trans context="Button">Save</Trans>
        </Button>
      </div>
    </SettingsView>
  );
}
