import * as React from "react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import Link from "next/link"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.logo />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by{" "}
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              {siteConfig.name} <span>{siteConfig.subname}</span>
            </a>
          </p>
        </div>
        <Link href={siteConfig.links.github}>
          <Icons.gitHub className="size-5" />
        </Link>
        <Link href={siteConfig.links.twitter}>
          <Icons.twitter className="size-5" />
        </Link>

      </div>
    </footer>
  )
}
