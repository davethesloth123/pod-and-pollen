import { AppShell } from '@/components/app/app-shell'
import { DataProvider } from '@/lib/data-context'

export default function AppPage() {
  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  )
}
