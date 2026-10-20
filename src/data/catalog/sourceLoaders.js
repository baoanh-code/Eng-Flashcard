const csvLoaders = import.meta.glob('../vocabulary/**/*.csv', {
  import: 'default',
  query: '?raw',
})

const tsvLoaders = import.meta.glob('../vocabulary/**/*.tsv', {
  import: 'default',
  query: '?raw',
})

export const vocabularySourceLoaders = Object.freeze({
  ...csvLoaders,
  ...tsvLoaders,
})
