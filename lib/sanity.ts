import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, useCdn } from "./env";
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
    apiVersion: apiVersion,
    dataset: dataset,
    projectId: projectId,
    useCdn: useCdn
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}
