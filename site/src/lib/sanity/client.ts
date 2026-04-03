import { createClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const isSanityConfigured = Boolean(projectId);

export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-03-27',
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    })
  : null;
