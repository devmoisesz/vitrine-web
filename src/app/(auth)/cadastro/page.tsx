'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { GoogleMark } from '@/components/ui/google-mark'
import { Input } from '@/components/ui/input'
import { authenticate, authenticateWithGoogle } from '@/features/auth/api/authenticate'
import { registerAccount } from '@/features/auth/api/register-account'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  passwordConfirmation: z.string().min(1, 'Confirme sua senha.'),
}).refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
  message: 'As senhas precisam ser iguais.',
  path: ['passwordConfirmation'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirmation: '' },
  })
  const password = useWatch({ control, name: 'password' })

  async function onSubmit({ name, email, password }: RegisterForm) {
    setFormError(null)
    try {
      await registerAccount({ name, email, password })
      await authenticate({ email, password })
      router.replace('/')
      router.refresh()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível criar sua conta. Tente novamente.')
    }
  }

  async function onGoogleCredential(response: { credential: string }) {
    setFormError(null)
    setGoogleLoading(true)
    try {
      await authenticateWithGoogle(response.credential)
      router.replace('/')
      router.refresh()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível entrar com Google. Tente novamente.')
    } finally {
      setGoogleLoading(false)
    }
  }

  function initializeGoogle() {
    if (!googleClientId || !window.google) return
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: onGoogleCredential })
    setGoogleReady(true)
  }

  function signInWithGoogle() {
    setFormError(null)
    if (!googleClientId) {
      setFormError('O login com Google ainda não foi configurado.')
      return
    }
    if (!googleReady || !window.google) {
      setFormError('O Google está sendo preparado. Tente novamente em instantes.')
      return
    }
    window.google.accounts.id.prompt()
  }

  return (
    <main className="flex min-h-screen bg-white px-5 py-10 text-black sm:items-center sm:justify-center">
      {googleClientId ? <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} /> : null}
      <section data-slot="register-form" className="mx-auto w-full max-w-[26rem]">
        <div className="mb-10 text-center sm:mb-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em]">Vitrine Web</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Crie sua conta</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">Salve suas escolhas, monte seu carrinho e acompanhe seus pedidos.</p>
        </div>

        <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-bold" htmlFor="name">Nome completo</label>
            <Input id="name" autoComplete="name" placeholder="Como podemos chamar você?" aria-invalid={errors.name ? 'true' : undefined} {...register('name')} />
            {errors.name ? <p className="text-xs font-medium" role="alert">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold" htmlFor="email">E-mail</label>
            <Input id="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" aria-invalid={errors.email ? 'true' : undefined} {...register('email')} />
            {errors.email ? <p className="text-xs font-medium" role="alert">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold" htmlFor="password">Senha</label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" className="pr-12" aria-invalid={errors.password ? 'true' : undefined} {...register('password')} />
              <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 px-0" aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff /> : <Eye />}</Button>
            </div>
            {errors.password ? <p className="text-xs font-medium" role="alert">{errors.password.message}</p> : null}
            {password ? <p className="text-xs text-gray-500">Use pelo menos 6 caracteres.</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold" htmlFor="passwordConfirmation">Confirme sua senha</label>
            <div className="relative">
              <Input id="passwordConfirmation" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" className="pr-12" aria-invalid={errors.passwordConfirmation ? 'true' : undefined} {...register('passwordConfirmation')} />
              <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 px-0" aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'} onClick={() => setShowConfirmation((visible) => !visible)}>{showConfirmation ? <EyeOff /> : <Eye />}</Button>
            </div>
            {errors.passwordConfirmation ? <p className="text-xs font-medium" role="alert">{errors.passwordConfirmation.message}</p> : null}
          </div>

          {formError ? <p className="rounded-lg border border-black px-3 py-2.5 text-sm" role="alert">{formError}</p> : null}

          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting || googleLoading}>
            {isSubmitting ? <><LoaderCircle className="animate-spin" /> Criando sua conta...</> : 'Criar conta'}
          </Button>
        </form>

        <div className="my-7 flex items-center gap-3 text-xs text-gray-500 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200">ou</div>

        <Button className="w-full" variant="secondary" size="lg" disabled={isSubmitting || googleLoading} onClick={signInWithGoogle}>
          {googleLoading ? <LoaderCircle className="animate-spin" /> : <GoogleMark />}
          Continuar com Google
        </Button>

        <p className="mt-8 text-center text-sm text-gray-500">Já tem uma conta? <Link className="font-bold text-black underline underline-offset-4" href="/login">Entrar</Link></p>
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-gray-500"><LockKeyhole aria-hidden="true" className="size-3.5" /> Seus dados são protegidos.</p>
      </section>
    </main>
  )
}
