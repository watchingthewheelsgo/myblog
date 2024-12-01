import Image from "next/image"
import { DocsSidebarNav } from "@/components/sidebar-nav"
import { cn, formatDate, formatSlug } from "@/lib/utils"
import { SidebarNavItem } from "@/types"
import { allAuthors, allCategories, allPosts, Category, Post } from "contentlayer/generated"
import Link from "next/link"
import { notFound } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

type Params = Promise<{ slug: string[] }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>


async function getCategoryFromParams(params: Params): Promise<Category | undefined> {
    const { slug } = await params
    const slugs = slug.join("/")
    return allCategories.find((cat) => cat.slugAsParams == slugs)
}

async function getMacthedPostFromParams(params: Params) {
    const { slug } = await params
    const slugs = slug.join("/")
    const posts: Post[] = allPosts.filter((post) =>
        post.categories.find((postcat) => formatSlug(postcat) == slugs))

    if (!posts) {
        null
    }
    return posts
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


export async function generateStaticParams() {
    return allCategories.map((cat) => ({
        slug: cat.slugAsParams.split("/")
    }))
}



export default async function PostPage(props: {
    params: Params
    searchParams: SearchParams
}) {
    const curCategory = await getCategoryFromParams(props.params)
    if (!curCategory) {
        notFound()
    }

    const posts = await getMacthedPostFromParams(props.params)

    const sidebarItems = getSidebarNavItems()

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
                                {curCategory.title}
                            </h1>
                            <p className="text-muted-foreground text-xl">
                                {curCategory.description}
                            </p>
                        </div>
                    </div>
                    <hr className="my-8" />

                    {posts?.length ? (
                        <div className="grid gap-10 sm:grid-cols-2">
                            {posts.map((post, index) => (
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