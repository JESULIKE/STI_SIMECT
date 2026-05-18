// ═══════════════════════════════════════════════════════════
// STORE — Kit de Herramientas STI SIMECT
// Gestiona la memoria persistente del estudiante entre fases.
// ═══════════════════════════════════════════════════════════
import { defineStore } from 'pinia'

export interface Fact {
  id: string
  phase: 'F1' | 'F2' | 'F3'
  text: string
  source: string
  data: string
  starred: boolean
  createdAt: number
}

export interface MetaEntry {
  planning: string
  monitoring: string
  control: string
}

export interface FallacyKey {
  generalizacion: boolean
  adHominem: boolean
  pendiente: boolean
  falsaCausa: boolean
  apelacionEmocion: boolean
  hombresPaja: boolean
}

export interface KitState {
  isOpen: boolean
  activeTab: 'notebook' | 'meta' | 'fallacies' | 'judgment' | 'progress'
  facts: Fact[]
  meta: { f1: MetaEntry; f2: MetaEntry; f3: MetaEntry }
  fallacies: FallacyKey
  judgment: {
    position: string
    evidence: string
    counterpoint: string
    implications: string
    reflection: string
  }
  skills: Record<string, boolean>
  closingNote: string
}

const STORAGE_KEY = 'simect_kit_v2'

const defaultMeta = (): MetaEntry => ({ planning: '', monitoring: '', control: '' })
const defaultFallacies = (): FallacyKey => ({
  generalizacion: false, adHominem: false, pendiente: false,
  falsaCausa: false, apelacionEmocion: false, hombresPaja: false
})

export const useKitStore = defineStore('kit', {
  state: (): KitState => ({
    isOpen: false,
    activeTab: 'notebook',
    facts: [],
    meta: { f1: defaultMeta(), f2: defaultMeta(), f3: defaultMeta() },
    fallacies: defaultFallacies(),
    judgment: { position: '', evidence: '', counterpoint: '', implications: '', reflection: '' },
    skills: {
      'f1_facts': false, 'f1_arguments': false,
      'f2_credibility': false, 'f2_fallacies': false, 'f2_toulmin': false,
      'f3_judgment': false, 'f3_perspectives': false,
      'meta_cycles': false, 'meta_growth': false,
    },
    closingNote: '',
  }),

  getters: {
    factsCount: (s) => s.facts.length,
    starredFacts: (s) => s.facts.filter(f => f.starred),
    fallaciesCount: (s) => Object.values(s.fallacies).filter(Boolean).length,
    metaEntriesCount: (s) => {
      let count = 0
      const phases: Array<'f1' | 'f2' | 'f3'> = ['f1', 'f2', 'f3']
      phases.forEach(ph => {
        if (s.meta[ph].planning.trim().split(/\s+/).length >= 5) count++
        if (s.meta[ph].monitoring.trim().split(/\s+/).length >= 5) count++
        if (s.meta[ph].control.trim().split(/\s+/).length >= 5) count++
      })
      return count
    },
    skillsCount: (s) => Object.values(s.skills).filter(Boolean).length,
    totalSkills: (s) => Object.keys(s.skills).length,
    overallProgress: (s): number => {
      const factsScore = Math.min((s.facts.length / 5) * 20, 20)
      const fallScore = Math.min((Object.values(s.fallacies).filter(Boolean).length / 3) * 20, 20)
      const judgeScore = (() => {
        const j = s.judgment
        const filled = [j.position, j.evidence, j.counterpoint, j.implications].filter(v => v.trim().split(/\s+/).length >= 5).length
        return Math.round((filled / 4) * 20)
      })()
      const metaScore = Math.min(((s as any).metaEntriesCount / 9) * 20, 20)
      const skillScore = Math.round((Object.values(s.skills).filter(Boolean).length / Object.keys(s.skills).length) * 20)
      return Math.min(factsScore + fallScore + judgeScore + metaScore + skillScore, 100)
    },
    judgmentPreview: (s): string => {
      const parts: string[] = []
      if (s.judgment.position.trim()) parts.push(`Considero que ${s.judgment.position.trim()}`)
      if (s.judgment.evidence.trim()) parts.push(`Lo sustento en: ${s.judgment.evidence.trim().slice(0, 100)}`)
      if (s.judgment.counterpoint.trim()) parts.push(`Sin embargo: ${s.judgment.counterpoint.trim().slice(0, 80)}`)
      if (s.judgment.implications.trim()) parts.push(`Esto implica: ${s.judgment.implications.trim().slice(0, 80)}`)
      return parts.join(' · ') || ''
    }
  },

  actions: {
    toggle() { this.isOpen = !this.isOpen },
    open() { this.isOpen = true },
    close() { this.isOpen = false },
    setTab(tab: KitState['activeTab']) { this.activeTab = tab },

    addFact(fact: Omit<Fact, 'id' | 'starred' | 'createdAt'>) {
      this.facts.push({ ...fact, id: `f${Date.now()}`, starred: false, createdAt: Date.now() })
      this.persist()
    },
    deleteFact(id: string) {
      this.facts = this.facts.filter(f => f.id !== id)
      this.persist()
    },
    toggleStar(id: string) {
      const f = this.facts.find(f => f.id === id)
      if (f) { f.starred = !f.starred; this.persist() }
    },
    updateMeta(phase: 'f1' | 'f2' | 'f3', field: keyof MetaEntry, value: string) {
      this.meta[phase][field] = value
      this.persist()
    },
    toggleFallacy(key: keyof FallacyKey) {
      this.fallacies[key] = !this.fallacies[key]
      this.persist()
    },
    updateJudgment(field: keyof KitState['judgment'], value: string) {
      this.judgment[field] = value
      this.persist()
    },
    toggleSkill(key: string) {
      this.skills[key] = !this.skills[key]
      this.persist()
    },
    updateClosingNote(value: string) {
      this.closingNote = value
      this.persist()
    },

    persist() {
      if (typeof localStorage === 'undefined') return
      try {
        const data = { facts: this.facts, meta: this.meta, fallacies: this.fallacies, judgment: this.judgment, skills: this.skills, closingNote: this.closingNote }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {}
    },
    load() {
      if (typeof localStorage === 'undefined') return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const data = JSON.parse(raw)
        if (data.facts) this.facts = data.facts
        if (data.meta) this.meta = { ...this.meta, ...data.meta }
        if (data.fallacies) this.fallacies = { ...this.fallacies, ...data.fallacies }
        if (data.judgment) this.judgment = { ...this.judgment, ...data.judgment }
        if (data.skills) this.skills = { ...this.skills, ...data.skills }
        if (data.closingNote) this.closingNote = data.closingNote
      } catch {}
    },
    reset() {
      this.facts = []
      this.meta = { f1: defaultMeta(), f2: defaultMeta(), f3: defaultMeta() }
      this.fallacies = defaultFallacies()
      this.judgment = { position: '', evidence: '', counterpoint: '', implications: '', reflection: '' }
      this.skills = Object.fromEntries(Object.keys(this.skills).map(k => [k, false]))
      this.closingNote = ''
      this.persist()
    }
  }
})
