/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hwcheck.mygrow.top',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    additionalSitemaps: [
      'https://hwcheck.mygrow.top/sitemap.xml'
    ]
  },
  outDir: './out'
} 