export function toHandle(name: string | null | undefined): string {
  if (!name) return 'dev'
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 14) || 'dev'
}
