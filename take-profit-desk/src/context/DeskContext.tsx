import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import type { DeskEvaluation, DeskPayload, DeskPolicy } from '../types'

export type PortfolioRow = {
  symbol?: string
  name?: string
  chain?: string
  value?: number
  quantity?: number
}

type DeskContextValue = {
  data: DeskPayload | null
  loading: boolean
  err: string | null
  policyDraft: DeskPolicy | null
  setPolicyDraft: Dispatch<SetStateAction<DeskPolicy | null>>
  busy: string | null
  executeSecret: string
  setExecuteSecret: (v: string) => void
  banner: string | null
  dismissBanner: () => void
  load: () => Promise<void>
  savePolicy: () => Promise<void>
  checkpoint: () => Promise<void>
  evaluateNow: () => Promise<void>
  executeSwap: () => Promise<void>
  portfolioRows: PortfolioRow[]
  pnl: Record<string, number | undefined> | undefined
  evaluation: DeskEvaluation | null | undefined
  mockMode: boolean
}

const DeskContext = createContext<DeskContextValue | null>(null)

export function DeskProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DeskPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [policyDraft, setPolicyDraft] = useState<DeskPolicy | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [executeSecret, setExecuteSecret] = useState('')
  const [banner, setBanner] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const r = await fetch('/api/desk')
      if (!r.ok) throw new Error(await r.text())
      const j = (await r.json()) as DeskPayload
      setData(j)
      setPolicyDraft(j.policy)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load desk')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const portfolioRows = useMemo(() => {
    const p = data?.portfolio as { positions?: PortfolioRow[] } | null | undefined
    return Array.isArray(p?.positions) ? p.positions : []
  }, [data])

  const pnlBlock = data?.pnl as { pnl?: Record<string, number | undefined> } | undefined

  async function savePolicy() {
    if (!policyDraft) return
    setBusy('save')
    setBanner(null)
    try {
      const r = await fetch('/api/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyDraft),
      })
      if (!r.ok) throw new Error(await r.text())
      setBanner('Policy saved successfully.')
      await load()
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(null)
    }
  }

  async function checkpoint() {
    setBusy('checkpoint')
    setBanner(null)
    try {
      const r = await fetch('/api/checkpoint', { method: 'POST' })
      if (!r.ok) throw new Error(await r.text())
      setBanner('Checkpoint recorded against current Zerion PnL totals.')
      await load()
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Checkpoint failed')
    } finally {
      setBusy(null)
    }
  }

  async function evaluateNow() {
    setBusy('eval')
    setBanner(null)
    try {
      const r = await fetch('/api/evaluate', { method: 'POST' })
      if (!r.ok) throw new Error(await r.text())
      setBanner('Evaluation appended to the agent activity log.')
      await load()
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Evaluate failed')
    } finally {
      setBusy(null)
    }
  }

  async function executeSwap() {
    setBusy('exec')
    setBanner(null)
    try {
      const r = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Execute-Secret': executeSecret,
        },
        body: JSON.stringify({}),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || JSON.stringify(j))
      setBanner(
        'Swap requested through Zerion CLI. Confirm the transaction hash in your explorer or wallet activity.',
      )
      await load()
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Execute failed')
    } finally {
      setBusy(null)
    }
  }

  const evaluation = data?.evaluation as DeskEvaluation | null | undefined
  const mockMode = data?.auth.mockMode ?? true

  const value: DeskContextValue = {
    data,
    loading,
    err,
    policyDraft,
    setPolicyDraft,
    busy,
    executeSecret,
    setExecuteSecret,
    banner,
    dismissBanner: () => setBanner(null),
    load,
    savePolicy,
    checkpoint,
    evaluateNow,
    executeSwap,
    portfolioRows,
    pnl: pnlBlock?.pnl,
    evaluation,
    mockMode,
  }

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>
}

export function useDesk() {
  const ctx = useContext(DeskContext)
  if (!ctx) throw new Error('useDesk must be used within DeskProvider')
  return ctx
}
