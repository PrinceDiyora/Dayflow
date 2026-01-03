import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 pt-16">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

