import confetti from 'canvas-confetti'

export function useConfetti() {
  const triggerLevelUp = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ca8a04', '#fde047', '#eab308'] // Dorados/Amarillos
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ca8a04', '#fde047', '#eab308']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const triggerBadge = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#166534', '#4ade80', '#22c55e'] // Verdes
    })
  }

  const triggerPhaseComplete = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#166534', '#4ade80'] // Naranja y Verde
    })
  }

  return {
    triggerLevelUp,
    triggerBadge,
    triggerPhaseComplete
  }
}
