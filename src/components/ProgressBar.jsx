function ProgressBar({ financing, step }) {
  return (
    <div className="progress" aria-label="Progreso del formulario">
      <span className={step >= 1 ? 'progress-active' : ''} />
      <span className={financing && step >= 2 ? 'progress-active' : ''} />
      <small>{financing ? `Paso ${step} de 2` : 'Información inicial'}</small>
    </div>
  )
}

export default ProgressBar
