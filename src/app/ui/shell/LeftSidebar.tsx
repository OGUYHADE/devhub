'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  HomeIcon, SearchIcon, BellIcon, BookmarkIcon, LayoutIcon,
  GlobeIcon, UserIcon, SettingsIcon, PlusIcon, NewspaperIcon,
} from '../icons'

type NavItem = {
  href: string
  label: string
  Icon: (p: { size?: number; className?: string }) => React.ReactElement
  badge?: number
}

export default function LeftSidebar({ notifCount = 0 }: { notifCount?: number }) {
  const pathname = usePathname()

  const items: NavItem[] = [
    { href: '/', label: 'ホーム', Icon: HomeIcon },
    { href: '/search', label: '探す', Icon: SearchIcon },
    { href: '/notifications', label: '通知', Icon: BellIcon, badge: notifCount },
    { href: '/bookmarks', label: 'ブックマーク', Icon: BookmarkIcon },
    { href: '/board', label: '掲示板', Icon: LayoutIcon },
    { href: '/news', label: 'ニュース', Icon: NewspaperIcon },
    { href: '/plaza', label: 'みんなの広場', Icon: GlobeIcon },
    { href: '/profile', label: 'プロフィール', Icon: UserIcon },
    { href: '/settings', label: '設定', Icon: SettingsIcon },
  ]

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden md:flex flex-col sticky top-0 h-screen shrink-0 w-[72px] lg:w-[240px] bg-dark-surface/80 backdrop-blur-xl border-r border-accent-purple/10 px-2 lg:px-3 py-5">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center lg:justify-start gap-1 px-2 lg:px-3 mb-6 group">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-accent-purple">D</span>
          <span className="hidden lg:inline text-white">evHub</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ href, label, Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-4 py-3 rounded-xl transition-all duration-200',
                active ? 'nav-active bg-accent-purple/10 text-white' : 'text-slate-400 hover:bg-dark-hover hover:text-slate-200'
              )}
              title={label}
            >
              <span className="relative shrink-0">
                <Icon size={20} className={active ? 'text-accent-purple' : ''} />
                {!!badge && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-accent-purple text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className="hidden lg:block text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Compose button */}
      <Link
        href="/?compose=1"
        className="mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full py-3 px-3 lg:px-5 font-semibold text-sm transition-all duration-200 hover:glow-purple active:scale-95"
      >
        <PlusIcon size={18} />
        <span className="hidden lg:block">投稿する</span>
      </Link>
    </aside>
  )
}
