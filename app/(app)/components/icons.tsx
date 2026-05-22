// Brand icons aren't in lucide-react (removed for trademark reasons),
// so we define the ones we need as small inline SVGs with a lucide-compatible API.

export function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V9.99H6V17h2.34zM7.17 8.93a1.36 1.36 0 1 0 0-2.72 1.36 1.36 0 0 0 0 2.72zM18 17v-3.84c0-2.05-.44-3.63-2.84-3.63-1.15 0-1.92.63-2.24 1.23h-.03V9.99H10.6V17h2.34v-3.47c0-.92.17-1.8 1.3-1.8 1.12 0 1.13 1.05 1.13 1.86V17H18z" />
    </svg>
  )
}
