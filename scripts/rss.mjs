import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { slug } from 'github-slugger'
import { escape } from 'pliny/utils/htmlEscaper.js'
import siteMetadata from '../data/siteMetadata.js'
import tagData from '../app/tag-data.json' assert { type: 'json' }
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import { sortPosts } from 'pliny/utils/contentlayer.js'
import { marked } from 'marked' // 导入 marked

// 修改 generateRssItem 函数以转换 Markdown 为 HTML
const generateRssItem = (config, post) => {
  const contentHtml = marked(post.body.raw) // 将 Markdown 转换为 HTML
  return `
    <item>
      <guid>${config.siteUrl}/blog/${post.slug}</guid>
      <title>${escape(post.title)}</title>
      <link>${config.siteUrl}/blog/${post.slug}</link>
      ${post.summary && `<description>${escape(post.summary)}</description>`}
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${config.email} (${config.author})</author>
      ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
      <content:encoded><![CDATA[
        ${contentHtml}
      ]]></content:encoded>
    </item>
  `
}

// 修改 generateRss 函数，添加命名空间声明
const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`

// 生成RSS的主函数
async function generateRSS(config, allBlogs, page = 'feed.xml') {
  const publishPosts = allBlogs.filter((post) => post.draft !== true)
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts))
    writeFileSync(`./public/${page}`, rss)
  }

  // RSS for each tag
  if (publishPosts.length > 0) {
    for (const tag of Object.keys(tagData)) {
      const filteredPosts = allBlogs.filter((post) => post.tags.map((t) => slug(t)).includes(tag))
      const rss = generateRss(config, filteredPosts, `tags/${tag}/${page}`)
      const rssPath = path.join('public', 'tags', tag)
      mkdirSync(rssPath, { recursive: true })
      writeFileSync(path.join(rssPath, page), rss)
    }
  }
}

// 调用生成RSS的函数
const rss = () => {
  generateRSS(siteMetadata, allBlogs)
  console.log('RSS feed generated...')
}
export default rss
