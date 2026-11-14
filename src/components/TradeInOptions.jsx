function TradeInOptions({ value, onChange }) {
  return (
    <div className="trade-choice" role="radiogroup" aria-label="Permuta">
      <label className={value === 'no' ? 'choice-selected' : ''}>
        <input type="radio" name="tradeIn" value="no" checked={value === 'no'} onChange={onChange} />
        No tengo permuta
      </label>
      <label className={value === 'yes' ? 'choice-selected' : ''}>
        <input type="radio" name="tradeIn" value="yes" checked={value === 'yes'} onChange={onChange} />
        Sí, quiero entregar un vehículo
      </label>
    </div>
  )
}

export default TradeInOptions
