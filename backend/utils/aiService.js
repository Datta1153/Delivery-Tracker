import OpenAI from 'openai';

// simple wrapper around the OpenAI client; expecting OPENAI_API_KEY in env
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Send a user message to the GPT model and return the text reply.
 * Uses a very lightweight conversational payload so that it can be
 * called on every chat request without much cost.
 */
export const getChatResponse = async (message) => {
  if (!message) return '';
  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
    max_tokens: 150,
    temperature: 0.7,
  });
  return response.choices?.[0]?.message?.content || '';
};
