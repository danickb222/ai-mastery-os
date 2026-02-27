import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CallOpenAIOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface CallOpenAIResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function callOpenAI(
  options: CallOpenAIOptions
): Promise<CallOpenAIResult> {
  const {
    systemPrompt,
    userPrompt,
    model = 'gpt-4o-2024-08-06',
    temperature = 0.2,
    maxTokens = 4000,
    responseFormat = 'json_object',
  } = options;

  const startTime = Date.now();

  try {
    console.log('[OpenAI] Starting request', {
      model,
      temperature,
      responseFormat,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
    });

    const response = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: responseFormat === 'json_object' ? { type: 'json_object' } : undefined,
    });

    const content = response.choices[0]?.message?.content || '';
    const usage = response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        }
      : undefined;

    const duration = Date.now() - startTime;

    console.log('[OpenAI] Request completed', {
      duration: `${duration}ms`,
      contentLength: content.length,
      usage,
    });

    return { content, usage };
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[OpenAI] Request failed', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
