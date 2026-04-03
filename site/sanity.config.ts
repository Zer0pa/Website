import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schema } from './src/lib/sanity/schemas';

export default defineConfig({
  name: 'default',
  title: 'ZER0PA Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'missing',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

  basePath: '/studio',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schema.types,
  },
});
