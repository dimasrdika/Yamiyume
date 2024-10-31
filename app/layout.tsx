import './globals.css'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from '@/components/Navigation'
import { Providers } from '@/redux/provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp' })

export const metadata = {
  title: 'Yume Anime List',
  description: 'Explore and manage your anime collections',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body  className={`${inter.variable} ${notoSansJP.variable} font-sans bg-white dark:bg-[#021526] text-black dark:text-white`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navigation />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}