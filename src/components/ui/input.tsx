import type { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

export type InputProps = ComponentProps<'input'>

export function Input({ className, ...props }: InputProps) {
  return <input data-slot="input" className={twMerge('h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-black outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-gray-500 focus-visible:border-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60', className)} {...props} />
}
