import asyncHandler from '../utils/asyncHandler.js';
import { getChatResponse } from '../utils/aiService.js';

export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Message text is required.' });
  }

  const reply = await getChatResponse(message);
  res.json({ reply });
});
