import { redirect } from 'next/navigation'

export default function Home() {
  // The proxy already redirects unauthenticated users to /login,
  // so reaching this page means the user is signed in.
  redirect('/dashboard')
}
