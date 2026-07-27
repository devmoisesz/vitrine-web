import type { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'

export const buttonVariants = tv({
  base: ['inline-flex cursor-pointer items-center justify-center rounded-lg border font-medium transition-colors', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2', 'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'],
  variants: {
    variant: { primary: 'border-black bg-black text-white hover:bg-gray-800', secondary: 'border-gray-200 bg-white text-black hover:bg-gray-50', ghost: 'border-transparent bg-transparent text-gray-500 hover:text-black' },
    size: { sm: 'h-9 gap-1.5 px-3 text-xs [&_svg]:size-3.5', md: 'h-11 gap-2 px-4 text-sm [&_svg]:size-4', lg: 'h-12 gap-2.5 px-6 text-base [&_svg]:size-4' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
  return <button type="button" data-slot="button" data-disabled={disabled ? '' : undefined} className={twMerge(buttonVariants({ variant, size }), className)} disabled={disabled} {...props}>{children}</button>
}
