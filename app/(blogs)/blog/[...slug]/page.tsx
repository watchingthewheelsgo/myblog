import { notFound } from "next/navigation"

import "@/styles/mdx.css"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { nextAppUrl } from "@/lib/env"
import { AuthorInfo } from "@/lib/interface"
import { client } from "@/lib/sanity"
import { absoluteUrl, cn, formatDate } from "@/lib/utils"

import { TextareaForm } from "@/components/comment"
import { Mdx } from "@/components/mdx-components"
import { DashboardTableOfContents } from "@/components/toc"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/session"
import { getTableOfContents } from "@/lib/toc"
import { allAuthors, allPosts, Post } from "contentlayer/generated"
import { toast } from "@/hooks/use-toast"
import { env } from "@/env.mjs"
import { compareDesc } from "date-fns/compareDesc"

export const revalidate = 3600; // revalidate at most 1 hour

type Params = Promise<{ slug: string[] }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


async function getPostFromParams(params: Params) {
  const { slug } = await params
  const slugs = slug.join("/")
  const post = allPosts.find((post) => post.slugAsParams === slugs)

  if (!post) {
    null
  }
  return post
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slugAsParams.split("/"),
  }))
}


// interface PostPageProps {
//   params: {
//     slug: string
//   }
// }

// async function getPostFromParams(slug: string) {

//   const query = `
//   *[_type == 'post' && slug.current == '${slug}'] {
//         title,
//         description,
//         author,
//         "currentSlug": slug.current,
//         mainImage,
//         publishedAt,
//         body
//     }[0]`
//   const data = await client.fetch(query)
//   return data;
// }



async function getAllAuthors(): Promise<AuthorInfo[]> {
  const query = `
    *[_type == 'author'] {
    name,
    "currentSlug": slug.current,
    image,
    github,
    twitter,
    "id": _id
    }`
  const data = await client.fetch(query)
  return data;
}

export async function generateMetadata(props: {
  params: Params
  searchParams: SearchParams
}): Promise<Metadata> {
  // const post: FullBlog = await getPostFromParams(slug)

  const post = await getPostFromParams(props.params)

  if (!post) {
    return {}
  }

  const url = nextAppUrl

  const ogUrl = new URL(`${url}/api/og`)
  ogUrl.searchParams.set("heading", post.title)
  ogUrl.searchParams.set("type", "Blog Post")
  ogUrl.searchParams.set("mode", "dark")

  return {
    title: post.title,
    description: post.description,
    authors: post.authors.map((author) => ({
      name: author,
    })),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: absoluteUrl(post.slug),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogUrl.toString()],
    },
  }
}

async function getComments(post: Post): Promise<any[]> {
  const url = env.NEXT_PUBLIC_APP_URL
  const response = await fetch(`${url}/api/comments?post=${post.slugAsParams}`)

  if (!response?.ok) {
    return []
  }
  const comments = response.json()

  return comments
}

function getNextPost(post: Post) {
  const nextPost = allPosts.sort((a, b) => {
    return compareDesc(new Date(a.date), new Date(b.date))
  }).filter((p) => p.date < post.date).find((p) => p.slugAsParams != post.slugAsParams)

  return nextPost
}

export default async function PostPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const post = await getPostFromParams(props.params)

  if (!post) {
    notFound()
  }

  const nextPost = getNextPost(post)

  const authors = post.authors.map((author) =>
    allAuthors.find(({ slug }) => slug === `/authors/${author}`)
  )
  const toc = await getTableOfContents(post.body.raw)

  const user = await getCurrentUser()

  const comments = await getComments(post)

  const orderedComments = comments.sort((a, b) => {
    return compareDesc(new Date(a.createdAt), new Date(b.createdAt))
  })
  return (
    <article className="container relative max-w-3xl py-6 lg:gap-2 lg:py-10 xl:grid xl:grid-cols-[1fr_300px]">
      <Link
        href="/blog"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-[-200px] top-14 hidden xl:inline-flex"
        )}
      >
        <Icons.chevronLeft className="mr-2 size-4" />
        See all posts
      </Link>
      <div>
        <div>
          {post.date && (
            <time
              dateTime={post.date}
              className="text-muted-foreground block text-sm"
            >
              Published on {formatDate(post.date)}
            </time>
          )}
          <h1 className="font-heading mt-2 inline-block text-4xl leading-tight lg:text-5xl">
            {post.title}
          </h1>
          {authors?.length ? (
            <div className="mt-4 flex space-x-4">
              {authors.map((author) =>
                author ? (
                  <Link
                    key={author._id}
                    href={`https://x.com/${author.twitter}`}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Image
                      src={author.avatar}
                      alt={author.title}
                      width={42}
                      height={42}
                      className="rounded-full bg-white"
                    />
                    <div className="flex-1 text-left leading-tight">
                      <p className="font-medium">{author.title}</p>
                      <p className="text-muted-foreground text-[12px]">
                        @{author.twitter}
                      </p>
                    </div>
                  </Link>
                ) : null
              )}
            </div>
          ) : null}
        </div>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={720}
            height={405}
            className="bg-muted my-8 rounded-md border transition-colors"
            priority
          />
        )}
        <Mdx code={post.body.code} />
        <hr className="mt-12" />
        <div className="flex justify-between py-2 lg:py-4">
          <Link href="/blog" className={cn(buttonVariants({ variant: "ghost" }))}>
            <Icons.chevronLeft className="mr-2 size-4" />
            See all posts
          </Link>
          {
            nextPost ? (
              <Link href={`/blog/${nextPost.slugAsParams}`} className={cn(buttonVariants({ variant: "ghost" }))}>
                <Icons.chevronRight className="mr-2 size-4" />
                Next post - <span className="font-bold">{ nextPost.title.slice(0, 20)}...</span>
              </Link>
            ) : (
              <div className={cn(buttonVariants({ variant: "ghost" }))}>
                <Icons.chevronRight className="mr-2 size-4" />
                Next post - <span className="font-bold">More to find...</span>
              </div>
            )
          }
        </div>
        <hr className="mb-2" />
        <div aria-label="user comments" className="mx-auto w-full max-w-2xl space-y-6 py-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Comments</h2>
            <p className="text-gray-500 dark:text-gray-400">Share your thoughts and feedback.</p>
          </div>
          <TextareaForm user={user} post={post} comments={orderedComments} />
        </div>

      </div>
      <div className="ml-10 mt-4 hidden text-sm xl:block">
        <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
          <DashboardTableOfContents toc={toc} />
        </div>
      </div>
    </article>
  )
}
