
'use server';
/**
 * @fileOverview An AI flow to generate a themed collection of food items.
 *
 * - generateCollection - A function that generates a food collection theme.
 * - GenerateCollectionOutput - The return type for the generateCollection function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProducts } from '@/lib/services/product-service';

const GenerateCollectionOutputSchema = z.object({
  title: z.string().describe('A catchy and creative title for the food collection, like "Weekend Brunch Favorites" or "Spicy Food Challenge".'),
  description: z.string().describe('A short, enticing description of the collection, about 1-2 sentences long.'),
});
export type GenerateCollectionOutput = z.infer<typeof GenerateCollectionOutputSchema>;


export async function generateCollection(): Promise<GenerateCollectionOutput> {
  return generateCollectionFlow();
}

const prompt = ai.definePrompt({
  name: 'generateCollectionPrompt',
  output: { schema: GenerateCollectionOutputSchema },
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are a creative food curator for an online marketplace in Bangladesh called "Chefs' BD". 
Your task is to create a themed collection of food based on the current list of available product categories.

Consider factors like the time of day, weather, or current events in Bangladesh to come up with a creative theme.
For example: "Monsoon Munchies", "Spicy Food Challenge", "Weekend Brunch Favorites", "Sweet Tooth Cravings".

Based on the categories below, generate a creative title and a short, enticing description (1-2 sentences) for a food collection.

Available product categories:
{{#each categories}}
- {{{this}}}
{{/each}}
`,
});

const generateCollectionFlow = ai.defineFlow(
  {
    name: 'generateCollectionFlow',
    outputSchema: GenerateCollectionOutputSchema,
  },
  async () => {
    // Get unique categories from all products
    const products = await getProducts();
    const categories = [...new Set(products.map(p => p.category))];

    const { output } = await prompt({ categories });
    return output!;
  }
);
