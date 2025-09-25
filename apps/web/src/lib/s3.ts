export async function uploadToS3(file: File, folder: string): Promise<string> {
  return `/uploads/${folder}/${file.name}`;
}

export function getS3Url(key: string): string {
  return key;
}
