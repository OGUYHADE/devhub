'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { HomeIcon, SearchIcon, BellIcon, GlobeIcon, UserIcon } from '../icons'

export default function BottomNav({ notifCount = 0 }: { notifCount?: number }) {
  const pathname = usePathname()

  const items = [
    { href: '/', label: 'ホーム', Icon: HomeIcon },
    { href: '/search', label: '探す', Icon: SearchIcon },
    { href: '/notifications', label: '通知', Icon: BellIcon, badge: notifCount },
    { href: '/plaza', label: '広場', Icon: GlobeIcon },
    { href: '/profile', label: 'プロフィール', Icon: UserIcon },
  ]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-dark-surface/95 backdrop-blur-xl border-t border-dark-border/50">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(({ href, label, Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition',
                active ? 'text-accent-purple' : 'text-slate-500'
              )}
              aria-label={label}
            >
              <span className="relative">
                <Icon size={22} />
                {!!badge && badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-accent-purple text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
