import { notFound } from "next/navigation"
import { allPages } from "contentlayer/generated"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"
import { Metadata } from "next"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { absoluteUrl } from "@/lib/utils"


type Params = Promise<{ slug: string[] }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
 

async function getPageFromParams(params: Params) {
    const { slug } = await params
    const slugs = slug.join("/")
    const page = allPages.find((page) => page.slugAsParams === slugs)

    if (!page) {
        null
    }

    return page
}

export async function generateMetadata(props: {
    params: Params
    searchParams: SearchParams
  }) {
    const page = await getPageFromParams(props.params)

    if (!page) {
        return {}
    }

    const url = env.NEXT_PUBLIC_APP_URL

    const ogUrl = new URL(`${url}/api/og`)
    ogUrl.searchParams.set("heading", page.title)
    ogUrl.searchParams.set("type", siteConfig.name)
    ogUrl.searchParams.set("mode", "light")

    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description,
            type: "article",
            url: absoluteUrl(page.slug),
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: page.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: page.title,
            description: page.description,
            images: [ogUrl.toString()],
        },
    }
}

export async function generateStaticParams() {
    return allPages.map((page) => ({
        slug: page.slugAsParams.split("/"),
    }))
}

export default async function PagePage(props: {
    params: Params
    searchParams: SearchParams
  }) {

    const page = await getPageFromParams(props.params)

    if (!page) {
        notFound()
    }

    return (
        <article className="container max-w-3xl py-6 lg:py-12">
            <div className="space-y-4">
                <h1 className="font-heading inline-block text-4xl lg:text-5xl">
                    {page.title}
                </h1>
                {page.description && (
                    <p className="text-muted-foreground text-xl">{page.description}</p>
                )}
            </div>
            <hr className="my-4" />
            <Mdx code={page.body.code} />
        </article>
    )
}
