import OpenAI from 'openai';
import type { ClientOptions } from 'openai';
import type { AiSettings } from 'csdm/node/settings/settings';

export function createLlmClient(settings: AiSettings): OpenAI {
  const config: ClientOptions = {
    apiKey: settings.apiKey,
  };

  if (settings.provider === 'custom') {
    config.baseURL = settings.customEndpoint;
  } else if (settings.provider === 'anthropic') {
    config.baseURL = 'https://api.anthropic.com/v1';
  }

  return new OpenAI(config);
}

export async function streamChatCompletion(
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<ReadableStream<string>> {
  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
  });

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(content);
        }
      }
      controller.close();
    },
  });
}
