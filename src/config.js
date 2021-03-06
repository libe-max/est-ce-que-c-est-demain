const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

const config = {
  meta: {
    author: 'Libé Labo',
    title: 'Est-ce que c\'est le déconfinement ?',
    url: 'https://www.liberation.fr/apps/2020/04/est-ce-que-c-est-le-deconfinement',
    description: 'Combien de jours nous séparent du déconfinement',
    image: 'https://www.liberation.fr/apps/2020/04/est-ce-que-c-est-le-deconfinement/social.jpg',
    xiti_id: 'est-ce-que-c-est-le-deconfinement',
    tweet: 'Est-ce qu\'on est bientôt déconfinés ?',
  },
  tracking: {
    active: false,
    format: 'est-ce-que-c-est-le-deconfinement',
    article: 'est-ce-que-c-est-le-deconfinement'
  },
  show_header: true,
  statics_url: process.env.NODE_ENV === 'production'
    ? 'https://www.liberation.fr/apps/static'
    : `${currentProtocol}//${currentHostname}:3003`,
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo-2.site/api'
    : `${currentProtocol}//${currentHostname}:3004/api`,
  stylesheet: 'est-ce-que-c-est-le-deconfinement.css',
  spreadsheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkd5cstwwUfeFgzBcwOuYWwPPpdiB3wkXaUHkWew8gahb9_9M_MhuWjSg928IoPjWai9aVfWG3F8H9/pub?gid=0&single=true&output=tsv'
}

module.exports = config
