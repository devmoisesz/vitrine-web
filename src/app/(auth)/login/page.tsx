"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  authenticate,
  authenticateWithGoogle,
} from "@/features/auth/api/authenticate";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (configuration: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
type LoginForm = z.infer<typeof loginSchema>;

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.06 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function getPasswordStatus(password: string) {
  if (!password) return null;
  const score = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  if (score >= 4)
    return {
      label: "Senha forte",
      width: "w-full",
      hint: "Ótima escolha para manter sua conta protegida.",
    };
  if (score >= 3)
    return {
      label: "Senha boa",
      width: "w-2/3",
      hint: "Adicione um símbolo ou mais caracteres para reforçar.",
    };
  return {
    label: "Reforce sua senha",
    width: "w-1/3",
    hint: "O mínimo é 6 caracteres; letras maiúsculas, números e símbolos deixam sua senha mais segura.",
  };
}

function safeReturnPath() {
  const query = new URLSearchParams(window.location.search);
  const destination = query.get("redirect") ?? query.get("next");
  return destination?.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const passwordStatus = getPasswordStatus(
    useWatch({ control, name: "password" }),
  );

  function finishAuthentication() {
    router.replace(safeReturnPath());
    router.refresh();
  }
  async function onSubmit(values: LoginForm) {
    setFormError(null);
    try {
      await authenticate(values);
      finishAuthentication();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar. Tente novamente.",
      );
    }
  }
  async function onGoogleCredential(response: { credential: string }) {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await authenticateWithGoogle(response.credential);
      finishAuthentication();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar com Google. Tente novamente.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }
  function initializeGoogle() {
    if (!googleClientId || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: onGoogleCredential,
    });
    setGoogleReady(true);
  }
  function signInWithGoogle() {
    setFormError(null);
    if (!googleClientId) {
      setFormError("O login com Google ainda não foi configurado.");
      return;
    }
    if (!googleReady || !window.google) {
      setFormError(
        "O Google está sendo preparado. Tente novamente em instantes.",
      );
      return;
    }
    window.google.accounts.id.prompt();
  }

  return (
    <main className="flex min-h-screen bg-white px-5 py-10 text-black sm:items-center sm:justify-center">
      {googleClientId ? (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={initializeGoogle}
        />
      ) : null}
      <motion.section
        data-slot="login-form"
        className="mx-auto w-full max-w-[26rem]"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
      >
        <motion.div
          variants={staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
        >
          <motion.div
            variants={staggerItem}
            className="mb-10 text-center sm:mb-12"
          >
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em]">
              Vitrine Web
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Boas-vindas de volta
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Entre para acompanhar seus pedidos e montar seu carrinho.
            </p>
          </motion.div>
          <form
            className="space-y-5"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <motion.div variants={staggerItem} className="space-y-2">
              <label className="text-sm font-bold" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                aria-invalid={errors.email ? "true" : undefined}
                {...register("email")}
              />
              <AnimatePresence initial={false}>
                {errors.email ? (
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className="text-xs font-medium"
                    role="alert"
                  >
                    {errors.email.message}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>
            <motion.div variants={staggerItem} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-bold" htmlFor="password">
                  Senha
                </label>
                <span className="text-xs text-gray-500">
                  Sua senha nunca é exibida.
                </span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pr-12"
                  aria-invalid={errors.password ? "true" : undefined}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 px-0"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <AnimatePresence initial={false}>
                {errors.password ? (
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    className="text-xs font-medium"
                    role="alert"
                  >
                    {errors.password.message}
                  </motion.p>
                ) : null}
              </AnimatePresence>
              {passwordStatus ? (
                <div
                  data-slot="password-status"
                  className="space-y-1.5 pt-1"
                  aria-live="polite"
                >
                  <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full bg-black transition-all ${passwordStatus.width}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="font-bold text-black">
                      {passwordStatus.label}.
                    </span>{" "}
                    {passwordStatus.hint}
                  </p>
                </div>
              ) : null}
            </motion.div>
            <AnimatePresence initial={false}>
              {formError ? (
                <motion.p
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  className="rounded-lg border border-black px-3 py-2.5 text-sm"
                  role="alert"
                >
                  {formError}
                </motion.p>
              ) : null}
            </AnimatePresence>
            <motion.div
              variants={staggerItem}
              whileHover={
                reduceMotion || isSubmitting || googleLoading
                  ? undefined
                  : { scale: 1.01 }
              }
              whileTap={
                reduceMotion || isSubmitting || googleLoading
                  ? undefined
                  : { scale: 0.99 }
              }
              transition={{ duration: 0.2 }}
            >
              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={isSubmitting || googleLoading}
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      className="inline-flex"
                      animate={reduceMotion ? undefined : { rotate: 360 }}
                      transition={{
                        duration: 0.75,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    >
                      <LoaderCircle />
                    </motion.span>{" "}
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </motion.div>
          </form>
          <motion.div
            variants={staggerItem}
            className="my-7 flex items-center gap-3 text-xs text-gray-500 before:h-px before:flex-1 before:bg-gray-200 after:h-px after:flex-1 after:bg-gray-200"
          >
            ou
          </motion.div>
          <motion.div
            variants={staggerItem}
            whileHover={
              reduceMotion || isSubmitting || googleLoading
                ? undefined
                : { scale: 1.01 }
            }
            whileTap={
              reduceMotion || isSubmitting || googleLoading
                ? undefined
                : { scale: 0.99 }
            }
            transition={{ duration: 0.2 }}
          >
            <Button
              className="w-full"
              variant="secondary"
              size="lg"
              disabled={isSubmitting || googleLoading}
              onClick={signInWithGoogle}
            >
              {googleLoading ? (
                <motion.span
                  className="inline-flex"
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{
                    duration: 0.75,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                >
                  <LoaderCircle />
                </motion.span>
              ) : (
                <GoogleMark />
              )}
              Continuar com Google
            </Button>
          </motion.div>
          <motion.div variants={staggerItem}>
            <p className="mt-8 text-center text-sm text-gray-500">
              Ainda não tem uma conta?{" "}
              <Link
                className="font-bold text-black underline underline-offset-4"
                href="/cadastro"
              >
                Criar conta
              </Link>
            </p>
            <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
              <LockKeyhole aria-hidden="true" className="size-3.5" /> Seus dados
              são protegidos.
            </p>
          </motion.div>
        </motion.div>
      </motion.section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.14c1.84-1.69 2.92-4.19 2.92-7.75Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.79c-.87.59-1.99.94-3.29.94-2.53 0-4.68-1.71-5.45-4.01H3.3v2.88A9.72 9.72 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.55 13.53a5.85 5.85 0 0 1 0-3.06V7.59H3.3a9.74 9.74 0 0 0 0 8.82l3.25-2.88Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.46c1.42 0 2.69.49 3.69 1.44l2.77-2.77C16.81 3.58 14.61 2.25 12 2.25A9.72 9.72 0 0 0 3.3 7.59l3.25 2.88C7.32 8.17 9.47 6.46 12 6.46Z"
      />
    </svg>
  );
}
