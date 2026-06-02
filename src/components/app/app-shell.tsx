'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/bottom-nav'
import { DesktopSidebar } from '@/components/layout/desktop-sidebar'
import { useIsDesktop } from '@/lib/use-is-desktop'
import { Icon } from '@/components/ui/icon'
import { DEFAULT_WIDGETS, WIDGETS } from '@/lib/data'
import { HomeScreen } from '@/components/screens/home'
import { CollectionScreen } from '@/components/screens/collection'
import { IrisDetailScreen } from '@/components/screens/iris-detail'
import { GardenScreen, GardenDetailScreen } from '@/components/screens/garden'
import { CrossesScreen, CrossDetailScreen, CompareScreen } from '@/components/screens/crosses'
import { SearchScreen } from '@/components/screens/search'
import { SettingsScreen } from '@/components/screens/settings'
import { CustomizeDashboardScreen } from '@/components/screens/customize'
import { ImportScreen } from '@/components/screens/import'
import { CalendarScreen } from '@/components/screens/calendar'
import { OnboardingFlow } from '@/components/screens/onboarding'
import { EmptyHome } from '@/components/screens/empty'
// Flows (sheets)
import { AddIrisFlow } from '@/components/flows/add-iris'
import { AddLocationFlow } from '@/components/flows/add-location'
import { QuickNoteFlow } from '@/components/flows/quick-note'
import { AddPhotoFlow } from '@/components/flows/add-photo'
import { StageSheet } from '@/components/flows/stage-sheet'
import { EvaluationFlow } from '@/components/flows/evaluation'
import { EvalHistorySheet } from '@/components/flows/eval-history'
import { RecordFloweringFlow } from '@/components/flows/record-flowering'
import { RecordPollinationFlow } from '@/components/flows/record-pollination'
import { AddSeedlingsFlow } from '@/components/flows/add-seedlings'
import { PhotoViewer } from '@/components/flows/photo-viewer'
import { Toast } from '@/components/ui/shared'

// ─── Types ────────────────────────────────────────────────────
type Tab = 'home' | 'collection' | 'crosses' | 'garden'
const TAB_VIEWS: Tab[] = ['home', 'collection', 'crosses', 'garden']

interface StackFrame {
  view: string
  params: Record<string, any>
}

interface SheetState {
  kind: string
  [key: string]: any
}

// ─── Connectivity Banner ──────────────────────────────────────
type ConnState = 'online' | 'offline' | 'syncing' | 'synced'

function ConnectivityBanner() {
  const [connState, setConnState] = useState<ConnState>('online')
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleOffline = () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setConnState('offline')
    }

    const handleOnline = () => {
      setConnState('syncing')
      syncTimerRef.current = setTimeout(() => {
        setConnState('synced')
        hideTimerRef.current = setTimeout(() => {
          setConnState('online')
        }, 3000)
      }, 1800)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  if (connState === 'online') return null

  const bannerStyles: Record<ConnState, { bg: string; color: string; borderColor: string }> = {
    online:  { bg: 'transparent', color: 'transparent', borderColor: 'transparent' },
    offline: { bg: 'var(--clay-bg)', color: 'var(--clay)', borderColor: 'var(--clay-line)' },
    syncing: { bg: 'var(--amber-bg)', color: 'var(--amber)', borderColor: 'var(--amber-line)' },
    synced:  { bg: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-line)' },
  }

  const style = bannerStyles[connState]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '8px 16px', fontSize: 13.5, fontWeight: 500,
      background: style.bg, color: style.color,
      borderBottom: `1px solid ${style.borderColor}`,
      transition: 'all .2s',
    }}>
      {connState === 'offline' && (
        <>
          <Icon name="x" size={15} stroke="var(--clay)" sw={2.2} />
          Offline · Changes will sync later.
        </>
      )}
      {connState === 'syncing' && (
        <>
          <span style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid var(--amber)', borderTopColor: 'transparent',
            display: 'inline-block', animation: 'spin 0.7s linear infinite',
          }} />
          Syncing changes…
        </>
      )}
      {connState === 'synced' && (
        <>
          <Icon name="check" size={15} stroke="var(--green)" sw={2.4} />
          All changes synced
        </>
      )}
    </div>
  )
}

// ─── App Header ───────────────────────────────────────────────
interface AppHeaderProps {
  tab: Tab
  user: any
  onSettings: () => void
}

function AppHeader({ tab, user, onSettings }: AppHeaderProps) {
  const initial =
    user?.user_metadata?.name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?'

  const tabTitles: Record<Tab, { title: string; sub?: string }> = {
    home:       { title: '' },
    collection: { title: 'Collection' },
    crosses:    { title: 'Crosses', sub: 'Breeding programme' },
    garden:     { title: 'Garden', sub: 'Your garden' },
  }

  const meta = tabTitles[tab]

  const stickyHeader: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 30,
    background: 'var(--bg)', borderBottom: '1px solid var(--line)',
    padding: '12px 18px 10px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }

  if (tab === 'home') {
    return (
      <div style={stickyHeader}>
        <span className="h-display" style={{ fontSize: 20, letterSpacing: -0.01 }}>
          Pod<span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500, marginLeft: '0.18em', marginRight: '0.28em' }}>&amp;</span>Pollen
        </span>
        <button
          onClick={onSettings}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          aria-label="Open settings"
        >
          <span style={{
            width: 40, height: 40, borderRadius: 999,
            background: 'var(--accent-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--accent-line)',
            color: 'var(--accent)', fontWeight: 700, fontSize: 15,
          }}>
            {initial}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div style={stickyHeader}>
      <div>
        <div style={{
          fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
          fontWeight: 700, fontSize: 22, color: 'var(--ink)', letterSpacing: -0.01, lineHeight: 1.1,
        }}>
          {meta.title}
        </div>
        {meta.sub && (
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 1 }}>{meta.sub}</div>
        )}
      </div>
    </div>
  )
}

// ─── Settings Header ──────────────────────────────────────────
interface SettingsHeaderProps {
  onBack: () => void
}

function SettingsHeader({ onBack }: SettingsHeaderProps) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: 'var(--bg)', borderBottom: '1px solid var(--line)',
      padding: '12px 18px 10px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <button
        onClick={onBack}
        style={{ cursor: 'pointer', padding: 0,
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface)', border: '1px solid var(--line)',
        } as React.CSSProperties}
        aria-label="Go back"
      >
        <Icon name="back" size={20} stroke="var(--ink-2)" sw={2} />
      </button>
      <span style={{
        fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
        fontWeight: 700, fontSize: 22, color: 'var(--ink)', letterSpacing: -0.01,
      }}>
        Settings
      </span>
    </div>
  )
}

// Desktop page titles for the main content column
const DESKTOP_TITLES: Record<string, { title: string; sub?: string }> = {
  collection: { title: 'Collection' },
  crosses:    { title: 'Crosses', sub: 'Breeding programme' },
  garden:     { title: 'Your garden' },
  settings:   { title: 'Settings' },
}

// ─── App Shell ────────────────────────────────────────────────
export function AppShell() {
  const router = useRouter()
  const supabase = createClient()
  const isDesktop = useIsDesktop()

  // ── Core state ──────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('home')
  const [stack, setStack] = useState<StackFrame[]>([])
  const [sheet, setSheet] = useState<SheetState | null>(null)
  const [toastMsg, setToastMsg] = useState('')
  const [widgets, setWidgets] = useState<string[]>(DEFAULT_WIDGETS)
  const [onboardingDone, setOnboardingDone] = useState(true) // optimistic — check in effect
  const [user, setUser] = useState<any>(null)

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Derived ──────────────────────────────────────────────────
  const view = stack.length > 0 ? stack[stack.length - 1].view : tab
  const params = stack.length > 0 ? stack[stack.length - 1].params : {}

  // ── Bootstrap ────────────────────────────────────────────────
  useEffect(() => {
    // Load user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
    })

    // Widget persistence
    try {
      const stored = localStorage.getItem('bl_widgets')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) setWidgets(parsed)
      }
    } catch {
      // ignore parse errors
    }

    // Onboarding check
    const onboarded = localStorage.getItem('bl_onboarded')
    if (!onboarded) {
      // Show onboarding (no iris check for now — just check the flag)
      setOnboardingDone(false)
    }
  }, [])

  // Persist widgets on change
  useEffect(() => {
    try {
      localStorage.setItem('bl_widgets', JSON.stringify(widgets))
    } catch {
      // ignore
    }
  }, [widgets])

  // ── Navigation ───────────────────────────────────────────────
  const onTab = (k: string) => {
    if (k === 'search') {
      setStack([{ view: 'search', params: {} }])
      return
    }
    setTab(k as Tab)
    setStack([])
  }

  const go = (viewOrDelta: string | number, p: Record<string, any> = {}) => {
    if (viewOrDelta === -1) {
      setStack(prev => prev.slice(0, -1))
      return
    }
    const v = viewOrDelta as string
    // If it's a tab view with no extra params, switch tab instead of pushing
    if ((TAB_VIEWS as string[]).includes(v) && Object.keys(p).length === 0) {
      onTab(v)
      return
    }
    setStack(prev => [...prev, { view: v, params: p }])
  }

  // ── Sheet helpers ────────────────────────────────────────────
  const openAdd = () => setSheet({ kind: 'add' })
  const openLocation = () => setSheet({ kind: 'location' })
  const openNote = (iris?: any) => setSheet({ kind: 'note', iris })
  const openPhoto = (iris?: any) => setSheet({ kind: 'photo', iris })
  const closeSheet = () => setSheet(null)

  // ── Toast ────────────────────────────────────────────────────
  const toast = (msg: string) => {
    setToastMsg(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 2400)
  }

  // ── Onboarding complete ──────────────────────────────────────
  const handleOnboardingComplete = (recommendedWidgets?: string[]) => {
    localStorage.setItem('bl_onboarded', '1')
    setOnboardingDone(true)
    if (recommendedWidgets && recommendedWidgets.length > 0) {
      setWidgets(recommendedWidgets)
    }
  }

  // ── Sign out ─────────────────────────────────────────────────
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  // ── Screen renderer ──────────────────────────────────────────
  const renderScreen = () => {
    const commonProps = { go, wide: isDesktop }

    switch (view) {
      case 'home':
        return (
          <HomeScreen
            {...commonProps}
            widgets={widgets}
            openNote={openNote}
            openPhoto={openPhoto}
            openAdd={openAdd}
            userName={user?.user_metadata?.name}
          />
        )
      case 'collection':
        return (
          <CollectionScreen
            {...commonProps}
            openAdd={openAdd}
            params={params as { cross?: string }}
          />
        )
      case 'crosses':
        return (
          <CrossesScreen
            {...commonProps}
            openAdd={openAdd}
            openNewCross={() => setSheet({ kind: 'pollination' })}
          />
        )
      case 'garden':
        return (
          <GardenScreen
            {...commonProps}
            openAdd={openAdd}
            openLocation={openLocation}
            toast={toast}
          />
        )
      case 'detail':
        return (
          <IrisDetailScreen
            {...commonProps}
            id={params.id}
            openNote={openNote}
            openPhoto={openPhoto}
            openStage={(iris: any, stage: string) => setSheet({ kind: 'stage', iris, stage })}
            openEval={(iris: any) => setSheet({ kind: 'evaluate', iris })}
            openEvalHistory={(iris: any) => setSheet({ kind: 'evalHistory', iris })}
            openFlowering={(iris: any) => setSheet({ kind: 'flowering', iris })}
            openPollination={(iris: any) => setSheet({ kind: 'pollination', iris })}
            openPhotoViewer={(photos: any[], index: number) => setSheet({ kind: 'photoViewer', photos, index })}
            openEdit={(iris: any) => setSheet({ kind: 'add', editIris: iris })}
            toast={toast}
          />
        )
      case 'gardenDetail':
        return (
          <GardenDetailScreen
            {...commonProps}
            id={params.id}
          />
        )
      case 'crossDetail':
        return (
          <CrossDetailScreen
            {...commonProps}
            id={params.id}
            openAddSeedlings={(cross: any) => setSheet({ kind: 'seedlings', cross })}
          />
        )
      case 'compare':
        return (
          <CompareScreen
            {...commonProps}
            ids={params.ids}
          />
        )
      case 'search':
        return (
          <SearchScreen
            {...commonProps}
          />
        )
      case 'settings':
        return (
          <SettingsScreen
            {...commonProps}
            user={user}
            toast={toast}
            onSignOut={handleSignOut}
            onImport={() => go('import')}
          />
        )
      case 'customize':
        return (
          <CustomizeDashboardScreen
            {...commonProps}
            widgets={widgets}
            setWidgets={(w: string[]) => { setWidgets(w) }}
            toast={toast}
          />
        )
      case 'import':
        return (
          <ImportScreen
            {...commonProps}
            toast={toast}
          />
        )
      case 'calendar':
        return (
          <CalendarScreen
            {...commonProps}
          />
        )
      default:
        return null
    }
  }

  // ── Header logic (mobile) ────────────────────────────────────
  const showHeader = stack.length === 0 && view !== 'settings'
  const showSettingsHeader = view === 'settings'

  // ── Desktop title for the content column ─────────────────────
  const desktopTitle =
    stack.length === 0 ? DESKTOP_TITLES[tab] : (view === 'settings' ? DESKTOP_TITLES.settings : undefined)

  // ── Overlays shared by both layouts ──────────────────────────
  const overlays = (
    <>
      {/* Add / edit iris */}
      <AddIrisFlow
        open={sheet?.kind === 'add'}
        presetCross={sheet?.presetCross}
        editIris={sheet?.editIris}
        onClose={closeSheet}
        onSaved={(name: string) => { closeSheet(); toast(sheet?.editIris ? `"${name}" updated` : `"${name}" added`) }}
      />

      {/* Add location */}
      <AddLocationFlow
        open={sheet?.kind === 'location'}
        onClose={closeSheet}
        onSaved={(d: { name: string }) => { closeSheet(); toast(`"${d.name}" added`) }}
      />

      {/* Quick note */}
      <QuickNoteFlow
        open={sheet?.kind === 'note'}
        iris={sheet?.iris}
        onClose={closeSheet}
        onSaved={(type: string) => { closeSheet(); toast(`${type} note saved`) }}
      />

      {/* Add photo */}
      <AddPhotoFlow
        open={sheet?.kind === 'photo'}
        iris={sheet?.iris}
        onClose={closeSheet}
        onSaved={(cat: string) => { closeSheet(); toast(`${cat} photo added`) }}
      />

      {/* Stage sheet */}
      <StageSheet
        open={sheet?.kind === 'stage'}
        iris={sheet?.iris}
        stage={sheet?.stage}
        onClose={closeSheet}
      />

      {/* Evaluation */}
      <EvaluationFlow
        open={sheet?.kind === 'evaluate'}
        iris={sheet?.iris}
        onClose={closeSheet}
        onSaved={(r: { avg?: number }) => { closeSheet(); toast(`Evaluation saved · ${r.avg ? r.avg.toFixed(1) : '—'} avg`) }}
      />

      {/* Evaluation history */}
      <EvalHistorySheet
        open={sheet?.kind === 'evalHistory'}
        iris={sheet?.iris}
        onClose={closeSheet}
        onEdit={(rec: any) => setSheet({ kind: 'evaluate', iris: sheet?.iris, edit: rec })}
      />

      {/* Record flowering */}
      <RecordFloweringFlow
        open={sheet?.kind === 'flowering'}
        iris={sheet?.iris}
        onClose={closeSheet}
        onSaved={(date: string) => { closeSheet(); toast(`Flowering recorded · ${date}`) }}
      />

      {/* Record pollination */}
      <RecordPollinationFlow
        open={sheet?.kind === 'pollination'}
        iris={sheet?.iris}
        onClose={closeSheet}
        onSaved={(other: string) => { closeSheet(); toast(`Cross created with ${other}`) }}
      />

      {/* Add seedlings (batch, from a cross) */}
      <AddSeedlingsFlow
        open={sheet?.kind === 'seedlings'}
        cross={sheet?.cross}
        onClose={closeSheet}
        onSaved={(n: number) => { closeSheet(); toast(`${n} seedling${n === 1 ? '' : 's'} added`) }}
      />

      {/* Photo viewer */}
      <PhotoViewer
        open={sheet?.kind === 'photoViewer'}
        photos={sheet?.photos || []}
        startIndex={sheet?.index || 0}
        onClose={closeSheet}
        onAction={(action: string, photo: any, payload?: any) => {
          if (action === 'delete') { closeSheet(); toast('Photo deleted') }
          else if (action === 'category') toast(`Category changed to ${payload}`)
        }}
      />

      {/* Onboarding overlay */}
      {!onboardingDone && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Toast */}
      <Toast msg={toastMsg} />
    </>
  )

  // ── Desktop layout (sidebar) ─────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
        <ConnectivityBanner />
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <DesktopSidebar
            tab={tab}
            activeView={view}
            onTab={onTab}
            onAdd={openAdd}
            onSettings={() => go('settings')}
            user={user}
          />
          <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <div style={{ maxWidth: 1020, margin: '0 auto', padding: '0 16px 40px' }}>
              {desktopTitle && (
                <div style={{ padding: '26px 4px 10px' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, system-ui, sans-serif', fontWeight: 600, fontSize: 30, color: 'var(--ink)', lineHeight: 1.1 }}>{desktopTitle.title}</div>
                  {desktopTitle.sub && <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 3 }}>{desktopTitle.sub}</div>}
                </div>
              )}
              {renderScreen()}
            </div>
          </main>
        </div>
        {overlays}
      </div>
    )
  }

  // ── Mobile layout (bottom nav) ───────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ConnectivityBanner />
      {showHeader && <AppHeader tab={tab} user={user} onSettings={() => go('settings')} />}
      {showSettingsHeader && <SettingsHeader onBack={() => go(-1)} />}
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {renderScreen()}
      </div>
      <BottomNav tab={tab} onTab={onTab} onAdd={openAdd} />
      {overlays}
    </div>
  )
}
