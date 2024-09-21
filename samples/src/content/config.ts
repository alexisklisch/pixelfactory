import { defineCollection, z } from "astro:content"
import { readdir, readFile } from "node:fs/promises"
import { basename, join } from 'node:path'

const jsonCollection = defineCollection({
  loader: async () => {
    const dir = join(process.cwd(), '/src/content/designs')
    const files = await readdir(dir)

    const entries = await Promise.all(
      files.map(async (file) => {
        const content = await readFile(join(dir, file), 'utf-8')
        const json = JSON.parse(content)

        return {
          id: basename(file, 'json'),
          ...json
        }
      })
    )
    return entries
  }
})

export const collections = {
  designs: jsonCollection
}