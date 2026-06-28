import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import BottomNav from './BottomNav'
import PageTransition from '../PageTransition'

export default function AppShell({
  currentUserId,
  notifCount = 0,
  showRightSidebar = true,
  children,
}: {
  currentUserId: string
  notifCount?: number
  showRightSidebar?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="flex max-w-[1400px] mx-auto">
        <LeftSidebar notifCount={notifCount} />

        <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 pb-24 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>

        {showRightSidebar && <RightSidebar currentUserId={currentUserId} />}
      </div>

      <BottomNav notifCount={notifCount} />
    </div>
  )
}
