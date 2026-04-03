const siteSettingsSchema = {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'featuredLaneIdentifier',
      title: 'Featured Lane Identifier',
      type: 'string',
      description: 'Default featured lane for the homepage authority block.',
      initialValue: 'ZPE-IMC',
    },
    {
      name: 'allowedRepos',
      title: 'Allowed Repos',
      type: 'array',
      description: 'Optional governance layer. Leave empty to allow all discovered public ZPE repos.',
      of: [{ type: 'string' }],
    },
    {
      name: 'lastSyncTimestamp',
      title: 'Last Sync Timestamp',
      type: 'datetime',
      readOnly: true,
    },
  ],
};

export default siteSettingsSchema;
