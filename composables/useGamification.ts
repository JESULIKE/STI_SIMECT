import { useStudentStore } from '../stores/student'
import { useConfetti } from './useConfetti'

export function useGamification() {
  const studentStore = useStudentStore()
  const { triggerBadge, triggerLevelUp, triggerPhaseComplete } = useConfetti()

  // Esta función puede invocarse desde la UI para mostrar una insignia si el motor lo manda
  const processNewBadges = (badges: string[]) => {
    if (!badges || badges.length === 0) return
    
    badges.forEach(badge => {
      studentStore.addBadge(badge)
    })
    
    // Animación general de badge
    triggerBadge()
    
    // Podría disparar un Toast notification aquí
  }

  // Animación de subida de nivel
  const processLevelUp = () => {
    triggerLevelUp()
  }

  return {
    processNewBadges,
    processLevelUp,
    triggerPhaseComplete // Expuesto por si se necesita directo
  }
}
