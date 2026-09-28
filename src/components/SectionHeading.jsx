function SectionHeading({ number, title, description }) {
  return (
    <div className="section-heading">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default SectionHeading
