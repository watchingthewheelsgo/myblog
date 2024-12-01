import * as z from "zod"
import { db } from "@/lib/db"

const commentFetchByPostSchema = z.object({
  post: z.string()
})

const commentCreateSchema = z.object({
  content: z.string(),
  post: z.string(),
  userId: z.string()
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const values = commentFetchByPostSchema.parse(Object.fromEntries(url.searchParams))

    const comments = await db.comment.findMany({
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: true
      },
      where: {
        post: values.post,
      },
    })

    return new Response(JSON.stringify(comments))
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = commentCreateSchema.parse(json)

    const post = await db.comment.create({
      data: {
        content: body.content,
        post: body.post,
        authorId: body.userId,
      },
      select: {
        id: true,
      },
    })

    return new Response(JSON.stringify(body))
  } catch (error) {
    console.log(error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

