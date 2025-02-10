import { writeFile } from 'fs/promises';

export async function writeAsyncIterableToFile(
  asyncIterable: AsyncIterable<Uint8Array>,
  filePath: string
) {
  const chunks = [];
  for await (const chunk of asyncIterable) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  await writeFile(filePath, buffer);
} 