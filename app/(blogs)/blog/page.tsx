import Image from "next/image"
import Link from "next/link"
import { compareDesc } from "date-fns"
import { allPosts, allCategories, allAuthors } from "contentlayer/generated"

import { formatDate } from "@/lib/utils"
import { client, urlFor } from "@/lib/sanity"
import { BlogCard } from "@/lib/interface"
import { DocsSidebarNav } from "@/components/sidebar-nav"
import { docsConfig } from "@/config/blog"
import { SidebarNavItem } from "@/types"

export const metadata = {
  title: "Blog",
}

async function getPosts() {
  const query = `
    *[_type == 'post'] | order(_createdAt desc) {
        title,
            description,
            "currentSlug": slug.current,
            mainImage,
            publishedAt

    }`
  const data = await client.fetch(query);
  return data;
}

function getSidebarNavItems(): SidebarNavItem[] {
  return [{
    title: "Category",
    items: allCategories.map(cat => {
      return {
        title: cat.title,
        href: "/category/" + cat.slugAsParams,
      }
    }),
  }, {
    title: "Author",
    items: allAuthors.map(author => {
      return {
        title: author.title,
        href: "/author/" + author.slugAsParams,
      }
    }),
  }]
}

export default async function BlogPage() {
  const localPosts = allPosts.filter((post) => post.published).sort((a, b) => {
    return compareDesc(new Date(a.date), new Date(b.date))
  })

  const sidebarItems = getSidebarNavItems()

  console.log(sidebarItems)

  return (

    <div className="container max-w-5xl py-4 lg:py-8">
      <div className="flex-1 md:grid md:grid-cols-[180px_1fr] md:gap-10 lg:grid-cols-[200px_1fr] lg:gap-12">
        <aside className="fixed z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <DocsSidebarNav items={sidebarItems} />
        </aside>
        <div title="category details">
          <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
            <div className="flex-1 space-y-4">
              <h1 className="font-heading inline-block text-4xl tracking-tight lg:text-5xl">
                Blog
              </h1>
              <p className="text-muted-foreground text-xl">
                Learnings, experiences, and growth.
              </p>
            </div>
          </div>
          <hr className="my-8" />

          {localPosts?.length ? (
            <div className="grid gap-10 sm:grid-cols-2">
              {localPosts.map((post, index) => (
                <article
                  key={post._id}
                  className="group relative flex flex-col space-y-2"
                >
                  {post.image && (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={804}
                      height={452}
                      className="bg-muted rounded-md border transition-colors"
                      priority={index <= 1}
                    />
                  )}
                  <h2 className="text-2xl font-extrabold">{post.title}</h2>
                  {post.description && (
                    <p className="text-muted-foreground">{post.description}</p>
                  )}
                  {post.date && (
                    <p className="text-muted-foreground text-sm">
                      {formatDate(post.date)}
                    </p>
                  )}
                  <Link href={post.slug} className="absolute inset-0">
                    <span className="sr-only">View Article</span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p>No posts published.</p>
          )}
        </div>
      </div>
    </div>
  )
}
