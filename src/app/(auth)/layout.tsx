import { lato } from "@/app/fonts";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={lato.className}>{children}</div>;
}
