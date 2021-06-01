import { GatsbyNode, CreatePagesArgs, Actions } from 'gatsby'
import path from 'path'
import { SearchItem } from 'src/types/SearchItem'
import { Tag } from 'src/types/Tag'

const languages = ['en', 'es']
const defaultLang = 'en'
const english = require(`../content/i18n/en.json`)
const spanish = require(`../content/i18n/es.json`)


export const createPages: GatsbyNode['createPages'] = async (args: CreatePagesArgs) => {
  console.log('createPages', languages, 'default', defaultLang)

  await createContentPages(args)
  await createBlogPages(args)
  await createNewsPages(args)
  await createDipPages(args)
  // await createTagPages(args)
  await createSearchPage(args)
}

async function createContentPages({ actions, graphql, reporter }: CreatePagesArgs) {
  const result: any = await graphql(`
    query {
      allMarkdownRemark(filter: { fields: { collection: { eq: "pages" } } }) {
        nodes {
          fields {
            lang
            slug
          }
          frontmatter {
            title
            template
            url
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running Content Pages query.`)
    return
  }

  result.data.allMarkdownRemark.nodes.forEach((node: any) => {
    if (node.url) return // No reason to create pages for external news

    createDynamicPage(actions, node.fields.slug, node.frontmatter.template, node.fields.lang)
  })
}

async function createNewsPages({ actions, graphql, reporter }: CreatePagesArgs) {
  const result: any = await graphql(`
    query {
      news: allMarkdownRemark(filter: { fields: { collection: { eq: "news" } } }) {
        nodes {
          fields {
            slug
            lang
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running DIP query.`)
    return
  }

  result.data.news.nodes.forEach((node: any) => {
    createDynamicPage(actions, node.fields.slug, 'news-item', node.fields.lang)
  })
}

async function createDipPages({ actions, graphql, reporter }: CreatePagesArgs) {
  const result: any = await graphql(`
    query {
      dips: allMarkdownRemark(filter: { fields: { collection: { eq: "dips" } } }, sort: { fields: frontmatter___DIP }) {
        nodes {
          fields {
            slug
            lang
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running DIP query.`)
    return
  }

  result.data.dips.nodes.forEach((node: any) => {
    createDynamicPage(actions, node.fields.slug, 'dip', node.fields.lang)
  })
}

async function createBlogPages({ actions, graphql, reporter }: CreatePagesArgs) {
  const result: any = await graphql(`
    query {
      blogs: allMarkdownRemark(
        filter: { fields: { collection: { eq: "blogs" } } }
        sort: { fields: frontmatter___DIP }
      ) {
        nodes {
          frontmatter {
            title
          }
          fields {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running Blog query.`)
    return
  }

  result.data.blogs.nodes.forEach((node: any) => createDynamicPage(actions, node.fields.slug, 'blog', defaultLang))
}

async function createTagPages({ actions, graphql, reporter }: CreatePagesArgs) {
  const result: any = await graphql(`
    query {
      taggedPages: allMarkdownRemark(filter: { frontmatter: { tagCount: { gt: 0 } } }) {
        nodes {
          frontmatter {
            tags
          }
          fields {
            slug
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running Tags query.`)
    return
  }

  let tags: string[] = []
  result.data.taggedPages.nodes.forEach((node: any) => {
    tags = tags.concat(node.frontmatter.tags)
  })
  tags = [...new Set(tags)]

  tags.forEach((tag: string) => {
    createDynamicPage(actions, `/en/tags/${tag}/`, 'tag', 'en', tag)
    createDynamicPage(actions, `/es/tags/${tag}/`, 'tag', 'es', tag)
  })
}

async function createSearchPage({ actions, graphql, reporter }: CreatePagesArgs) {
  const result: any = await graphql(`
    query {
      items: allMarkdownRemark(filter: { fields: { collection: { in: ["archive", "faq", "news", "pages"] } } }) {
        nodes {
          fields {
            id
            slug
            lang
            collection
          }
          frontmatter {
            title
            description
            tagItems {
              id
              slug
              lang
              title
            }
          }
          html
        }
      }
      blogs: allFeedDevconBlog(limit: 10) {
        nodes {
          id
          guid
          title
          description
          pubDate
          link
          efblog {
            image
          }
          content {
            encoded
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild(`Error while running search query.`)
    return
  }

  const { createPage } = actions
  
  const blogs: Array<SearchItem> = result.data?.blogs?.nodes?.map((i: any) => {
    return {
      id: i.id,
      slug: i.guid,
      lang: 'en',
      type: 'blog',
      title: i.title,
      description: i.description,
      body: i.content.encoded,
      tags: []
    } as SearchItem
  })

  languages.forEach((language: string) => {
    let data: Array<SearchItem> = result.data?.items?.nodes
      ?.filter((i: any) => i.fields.lang === language)
      .map((i: any) => {
        return {
          id: i.fields.id,
          slug: i.fields.slug,
          lang: i.fields.lang,
          type: i.fields.collection,
          title: i.frontmatter.title,
          description: i.frontmatter.description,
          body: i.html,
          tags: i.frontmatter.tagItems.filter((i: Tag) => i.lang === language).map((i: Tag) => i.title),
        } as SearchItem
      })
    data.push(...blogs)

    createPage({
      path: `/${language}/search/`,
      component: path.resolve(`./src/components/domain/page-templates/search.tsx`),
      context: {
        slug: `/${language}/search/`,
        language: language,
        allSearchData: data,
        intl: {
          language: language,
          languages: languages,
          messages: language === 'es' ? spanish : english,
          routed: true,
          redirect: false,
        },
      },
    })
  })
}


function createDynamicPage(actions: Actions, slug: string, template: string, lang: string, tag: string = ''): void {
  if (template === 'none') return

  // console.log("Creating page", slug, 'with template:', template, lang);
  const { createPage } = actions

  createPage({
    path: slug,
    component: path.resolve(`./src/components/domain/page-templates/${template}.tsx`),
    context: {
      slug: slug,
      tag: tag,
      lang: lang,
      language: lang, // Merge with lang (language is better because gatsby-intl-plugin writes to the language key)
      intl: {
        language: lang,
        languages: languages,
        messages: lang === 'es' ? spanish : english,
        routed: true,
        redirect: false,
      },
    },
  })
}
