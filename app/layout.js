// app/layout.js
import './globals.css'

export const metadata = {
  title: 'BaseDrop Scout',
  description: 'Check Base ecosystem airdrop readiness (read-only, no wallet connect)',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
