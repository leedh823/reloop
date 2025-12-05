import { ButtonHTMLAttributes, ReactNode } from 'react'
import Link, { LinkProps } from 'next/link'

interface BaseButtonProps {
  className?: string
  disabled?: boolean
}

interface ButtonProps extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  rounded?: 'lg' | 'full'
}

interface ButtonLinkProps extends BaseButtonProps, Omit<LinkProps, 'href' | 'children'> {
  children: ReactNode
  href: string
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  rounded?: 'lg' | 'full'
}

const baseClasses = {
  primary: {
    lg: 'bg-reloop-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors',
    full: 'bg-reloop-blue text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors',
  },
  secondary: {
    lg: 'bg-[#111111] text-white border border-[#2A2A2A] px-6 py-3 rounded-lg font-semibold hover:bg-[#1c1c1c] transition-colors',
    full: 'bg-[#111111] text-white border border-[#2A2A2A] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#1c1c1c] transition-colors',
  },
}

export function PrimaryButton({
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  rounded = 'lg',
  ...props
}: ButtonProps) {
  const baseClass = baseClasses.primary[rounded]
  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClass} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  rounded = 'lg',
  ...props
}: ButtonProps) {
  const baseClass = baseClasses.secondary[rounded]
  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  return (
    <button
      className={`${baseClass} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export function PrimaryButtonLink({
  children,
  href,
  className = '',
  fullWidth = false,
  rounded = 'lg',
  ...props
}: ButtonLinkProps) {
  const baseClass = baseClasses.primary[rounded]
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <Link
      href={href}
      className={`${baseClass} ${widthClass} inline-block text-center ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}

export function SecondaryButtonLink({
  children,
  href,
  className = '',
  fullWidth = false,
  rounded = 'lg',
  ...props
}: ButtonLinkProps) {
  const baseClass = baseClasses.secondary[rounded]
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <Link
      href={href}
      className={`${baseClass} ${widthClass} inline-block text-center ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}

