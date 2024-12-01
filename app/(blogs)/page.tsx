import { Button, buttonVariants } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import { allCategories, allPosts } from "contentlayer/generated"
import { compareDesc } from "date-fns/compareDesc"
import Image from "next/image"
import Link from "next/link"
import { env } from "process"

async function getGitHubStars(url: string): Promise<string | null> {
  try {
    const response = await fetch(
      url,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.GITHUB_ACCESS_TOKEN}`,
        },
        next: {
          revalidate: 60,
        },
      }
    )

    if (!response?.ok) {
      return null
    }

    const json = await response.json()

    return parseInt(json["stargazers_count"]).toLocaleString()
  } catch (error) {
    return null
  }
}


export default async function IndexPage() {

  const orderedPosts = allPosts.filter((post) => post.published).sort((a, b) => {
    return compareDesc(new Date(a.date), new Date(b.date))
  })

  const latestPost = orderedPosts.length > 0 ? orderedPosts[0] : null

  return (
    <>
      <section className="space-y-6 pb-8 pt-4 md:pb-12 md:pt-6 lg:py-16">
        <div className="container flex max-w-5xl flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            Build a place to share knowledges, best practices and stories.
          </h1>
          <p className="text-muted-foreground max-w-3xl leading-normal sm:text-xl sm:leading-8">
            Sharing knowledge through blogging and podcasting is a powerful way to establish yourself as an expert in your field
            and build a community around your ideas.
          </p>
          <div className="space-x-4">
            <Link href="/blog" className={cn(buttonVariants({ size: "lg" }))}>
              Get Started
            </Link>
            <Link
              href="/about"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              About
            </Link>
          </div>
        </div>
      </section>

      {
        (latestPost != null) ? (
          <section
            id="highlights"
            className="container space-y-6 bg-slate-50 py-4 md:py-6 lg:py-12 dark:bg-transparent"
          >
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading  text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Highlights
              </h2>
              <p className="text-muted-foreground max-w-[85%] leading-normal sm:text-lg sm:leading-7">
                Stay ahead of the curve with our latest articles on the most exciting topics in tech.
              </p>
            </div>
            <div className="mx-auto grid gap-4 md:max-w-5xl md:grid-cols-3 md:gap-10">
              <div className="w-full md:col-span-2">
                <Link href={`/blog/${latestPost.slugAsParams}`}>
                  <Image
                    src={latestPost.image}
                    alt={latestPost.title}
                    width={764}
                    height={500}
                  />
                </Link>
              </div>
              <div className="items-center space-y-5">
                <div className="hidden space-x-4 md:flex">
                  {
                    latestPost?.categories ? (
                      latestPost.categories.slice(0, 2).map((cat, index) => (
                        <Button asChild variant="secondary" key={index}>
                          <Link href={`/category/${cat}`} > {cat}</Link>
                        </Button>
                      ))
                    ) : null
                  }
                </div>
                <div className="self-center">
                  <Link href={`/blog/${latestPost.slugAsParams}`}>
                    <h2 className="text-3xl hover:underline">
                      {latestPost.title}
                    </h2>
                    <p className="text-muted-foreground max-w-[85%] leading-normal sm:text-lg sm:leading-7">
                      {latestPost.description}
                    </p>
                  </Link>
                </div>
                <div className="self-end">
                  {formatDate(latestPost.date)}
                </div>
              </div>
            </div>
          </section>

        ) : null
      }
      <section
        id="features"
        className="container space-y-6 bg-slate-50 py-4 md:py-6 lg:py-12 dark:bg-transparent"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading  text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Categories
          </h2>
          <p className="text-muted-foreground max-w-[85%] leading-normal sm:text-lg sm:leading-7">
            Stay up-to-date with the latest trends and insights across our diverse range of topics. From Big Data to Java and
            AI, explore our categories to discover new perspectives and expertise .
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3">
          {
            allCategories.length > 0 ? (
              allCategories.map((category, index) => (
                <div className="bg-background relative overflow-hidden rounded-lg border p-2" key={index}>
                  <Link href={`/category/${category.slugAsParams}`}>
                    <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                      <Image
                        src={category.icon}
                        alt={category.title}
                        width={48}
                        height={48}
                        className="rounded-md dark:bg-white"
                      />
                      <div className="space-y-2">
                        <h3 className="font-bold">{category.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : null
          }
        </div>
      </section>
    </>
  )
}
