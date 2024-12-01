"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Post } from "@/.contentlayer/generated"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { User } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter } from "next/navigation"

const FormSchema = z.object({
  comment: z
    .string()
    .min(10, {
      message: "Comments must be at least 10 characters.",
    })
    .max(200, {
      message: "Comments must not be longer than 1024 characters.",
    }),
})


export function TextareaForm({ user, post, comments }: { user: User | undefined, post: Post, comments: any[] }) {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const router = useRouter()

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!user) {
      toast({
        title: "Please login before comment :)",
      })
    } else {
      toast({
        title: "Thanks for your comments :)",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 2)}</code>
          </pre>
        ),
      })
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.comment,
          post: post.slugAsParams,
          userId: user.id
        }),
      })

      if (!response?.ok) {
        return toast({
          title: "Something went wrong.",
          description: "Your comment was not added. Please try again.",
          variant: "destructive",
        })
      }

      form.reset({ comment: "" })
      router.refresh()
      return toast({
        description: "Your comment has been added. Thank you!",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {
          comments ? (comments.map((comment, index) => (
            <div className="flex items-start gap-4" key={index}>
              <Avatar className="size-10 border">
                <AvatarImage src={comment.author.image} alt={`@${comment.author.name}`} />
                <AvatarFallback>FB</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{comment.author.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</div>
                </div>
                <div>{comment.content}</div>
              </div>
            </div>
          ))) : null
        }
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-2xl font-bold">Add a comment</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your comments are valuable here"
                    className="mt-4 h-60 resize-y"
                    {...field}
                  />
                </FormControl>
                {
                  (!user) ? (
                    <FormDescription className="text-red-600">
                      Please login before comment
                    </FormDescription>
                  ) : null
                }
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div >
  )
}
