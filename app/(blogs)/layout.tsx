import Link from "next/link"

import { blogsConfig } from "@/config/blog"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { ModeToggle } from "../../components/mode-toggle"
import { getCurrentUser } from "@/lib/session"
import { UserAccountNav } from "@/components/user-account-nav"

interface BlogsLayoutProps {
  children: React.ReactNode
}

export default async function BlogsLayout({
  children,
}: BlogsLayoutProps) {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background container z-40 justify-center">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={blogsConfig.mainNav} />
          <nav className="flex items-center space-x-2 md:space-x-4">
            {!user ? (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "px-4"
                )}
              >
                Login
              </Link>
            ) : (
              <UserAccountNav
                user={{
                  name: user.name,
                  image: user.image,
                  email: user.email,
                }}
              />
            )}
            <ModeToggle />
          </nav>
        </div>
      </header>
      
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}