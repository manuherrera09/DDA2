function ProgressBar({ financing }) {
  return (
    <div className="progress" aria-label="Progreso del formulario">
      <span className="progress-active" />
      <span className={financing ? 'progress-active' : ''} />
      <small>{financing ? 'Datos personales' : 'Información inicial'}</small>
    </div>
  )
}

export default ProgressBar
