
'use server';
/**
 * @fileOverview An AI flow to generate product descriptions.
 *
 * - generateDescription - A function that generates a product description based on product details.
 * - GenerateDescriptionInput - The input type for the generateDescription function.
 * - GenerateDescriptionOutput - The return type for the generateDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  category: z.enum(['Burger', 'Pizza', 'Drinks', 'Dessert', 'Biryani', 'Kebab', 'Set Menu', 'Pasta', 'Soup', 'Salad']).describe('The category of the product.'),
  keywords: z.string().optional().describe('Optional keywords to include in the description.'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated product description, approximately 20-30 words long.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;


export async function generateDescription(input: GenerateDescriptionInput): Promise<GenerateDescriptionOutput> {
  return generateDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDescriptionPrompt',
  input: { schema: GenerateDescriptionInputSchema },
  output: { schema: GenerateDescriptionOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are a food marketing expert. Generate a delicious, enticing, and brief product description (around 20-30 words) for a food item.

Product Name: {{{productName}}}
Category: {{{category}}}
{{#if keywords}}
Keywords to include: {{{keywords}}}
{{/if}}

Generate a description that makes the customer crave this item.
`,
});

const generateDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
