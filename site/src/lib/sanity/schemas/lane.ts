export default {
  name: 'lane',
  title: 'Lane',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'repoName', title: 'Repo Name', type: 'string' },
    { name: 'repoUrl', title: 'Repo URL', type: 'url' },
    { 
      name: 'sourceMode', 
      title: 'Source Mode', 
      type: 'string',
      options: { list: ['public_repo', 'manual_staged'] } 
    },
    { name: 'featuredOnHome', title: 'Featured on Home', type: 'boolean', initialValue: true },
    { name: 'homePriority', title: 'Home Priority', type: 'number' },
    { 
      name: 'relatedLanes', 
      title: 'Related Lanes', 
      type: 'array', 
      of: [{ type: 'reference', to: [{ type: 'lane' }] }] 
    },
    { name: 'editorialIntro', title: 'Editorial Intro', type: 'text' },
    {
      name: 'ctaPrimary',
      title: 'Primary CTA',
      type: 'object',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'url', type: 'url' },
      ]
    },
    {
      name: 'ctaSecondary',
      title: 'Secondary CTA',
      type: 'object',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'url', type: 'url' },
      ]
    },
    { name: 'cardAccentTreatment', title: 'Card Accent Treatment', type: 'string' },
  ]
}
