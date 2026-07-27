import { Lato } from 'next/font/google'

const lato = Lato({ subsets: ['latin'], weight: ['400', '700'] })

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={lato.className}>{children}</div>
}
