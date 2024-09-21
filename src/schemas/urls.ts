import { z } from 'zod';

export const urlSchema = z.object({
    url: z.string().url().max(2048) // Max URL length supported by most browsers
});

export type URLInput = z.infer<typeof urlSchema>;
