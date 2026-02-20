import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "HyperPerms Web Editor - Visual Permission Manager",
  description: "Manage Hytale server permissions visually in your browser. No downloads required. Edit groups, users, and permissions with our intuitive interface.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
