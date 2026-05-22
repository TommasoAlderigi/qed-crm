'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { DEAL_STAGES, type Deal, type DealStage } from '@/lib/supabase/types'
import { updateDealStage } from './actions'

type DealCard = Deal & {
  contact: { id: string; first_name: string | null; last_name: string | null } | null
  company: { id: string; name: string } | null
}

function formatMoney(value: number | null, currency: string) {
  if (value === null || value === 0) return ''
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value}`
  }
}

function DealCardView({ deal, dragging }: { deal: DealCard; dragging?: boolean }) {
  const contactName = deal.contact
    ? [deal.contact.first_name, deal.contact.last_name].filter(Boolean).join(' ')
    : null
  return (
    <div
      className={`bg-white rounded-md border border-slate-200 p-3 shadow-sm ${
        dragging ? 'opacity-90 rotate-1 shadow-lg' : ''
      }`}
    >
      <div className="text-sm font-medium text-slate-900 leading-snug">
        {deal.title}
      </div>
      {deal.value !== null && Number(deal.value) > 0 && (
        <div className="text-xs text-slate-600 mt-1">
          {formatMoney(Number(deal.value), deal.currency)}
        </div>
      )}
      {(contactName || deal.company) && (
        <div className="text-xs text-slate-500 mt-1 truncate">
          {[contactName, deal.company?.name].filter(Boolean).join(' · ')}
        </div>
      )}
    </div>
  )
}

function DraggableDeal({ deal }: { deal: DealCard }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: deal.id,
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
    >
      <DealCardView deal={deal} />
    </div>
  )
}

function DroppableColumn({
  stage,
  label,
  color,
  deals,
}: {
  stage: DealStage
  label: string
  color: string
  deals: DealCard[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const total = deals.reduce((s, d) => s + (Number(d.value) || 0), 0)

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-100 rounded-lg min-w-[260px] w-[260px] shrink-0 ${
        isOver ? 'ring-2 ring-slate-400' : ''
      }`}
    >
      <header className="px-3 py-2 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${color}`}>
            {label}
          </span>
          <span className="text-xs text-slate-500">{deals.length}</span>
        </div>
        {total > 0 && (
          <div className="text-xs text-slate-500 mt-1">
            {formatMoney(total, deals[0]?.currency ?? 'USD')}
          </div>
        )}
      </header>
      <div className="flex-1 p-2 space-y-2 min-h-[120px]">
        {deals.map((d) => (
          <DraggableDeal key={d.id} deal={d} />
        ))}
      </div>
    </div>
  )
}

export function Kanban({ initialDeals }: { initialDeals: DealCard[] }) {
  const [deals, setDeals] = useState(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null)
    if (!e.over) return
    const newStage = e.over.id as DealStage
    const dealId = String(e.active.id)
    const current = deals.find((d) => d.id === dealId)
    if (!current || current.stage === newStage) return

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    )

    startTransition(async () => {
      try {
        await updateDealStage(dealId, newStage)
      } catch {
        // Rollback on failure
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: current.stage } : d))
        )
      }
    })
  }

  const active = activeId ? deals.find((d) => d.id === activeId) ?? null : null

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {DEAL_STAGES.map((s) => (
          <DroppableColumn
            key={s.value}
            stage={s.value}
            label={s.label}
            color={s.color}
            deals={deals.filter((d) => d.stage === s.value)}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? <DealCardView deal={active} dragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
