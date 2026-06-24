import { AppGate } from '@/components/app/app-gate'
import { DataProvider } from '@/lib/data-context'

export default function AppPage() {
  return (
    <DataProvider>
      <AppGate />
    </DataProvider>
  )
}
