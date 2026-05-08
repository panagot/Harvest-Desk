import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { useDesk } from '../context/DeskContext'

export function DashboardLayout() {
  const { mockMode, loading, load, banner, dismissBanner } = useDesk()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar mockMode={mockMode} loading={loading} onRefresh={() => void load()} />

      {banner && (
        <div className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <p className="flex-1 text-sm text-zinc-900">{banner}</p>
            <button
              type="button"
              onClick={dismissBanner}
              className="shrink-0 rounded-md p-1 text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-900"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Outlet />

      <Footer />
    </div>
  )
}
