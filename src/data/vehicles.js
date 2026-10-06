export const vehicles = [
  { id: 'kicks', brand: 'Nissan', model: 'Kicks', detail: 'Exclusive CVT · 2024', year: 2024, transmission: 'Automática', km: 12000, price: 28900000, tone: 'ochre', mark: 'NK' },
  { id: 'frontier', brand: 'Nissan', model: 'Frontier', detail: 'X-Gear 4x4 · 2023', year: 2023, transmission: 'Manual', km: 38000, price: 42500000, tone: 'blue', mark: 'NF' },
  { id: 'versa', brand: 'Nissan', model: 'Versa', detail: 'Advance CVT · 2024', year: 2024, transmission: 'Automática', km: 8000, price: 24700000, tone: 'red', mark: 'NV' },
  { id: 'corolla', brand: 'Toyota', model: 'Corolla', detail: 'XEI CVT · 2022', year: 2022, transmission: 'Automática', km: 45000, price: 31800000, tone: 'blue', mark: 'TC' },
  { id: 'hilux', brand: 'Toyota', model: 'Hilux', detail: 'SRV 4x4 · 2021', year: 2021, transmission: 'Manual', km: 72000, price: 45200000, tone: 'ochre', mark: 'TH' },
  { id: 'yaris', brand: 'Toyota', model: 'Yaris', detail: 'XLS Pack · 2020', year: 2020, transmission: 'Manual', km: 98000, price: 17900000, tone: 'red', mark: 'TY' },
  { id: 'cronos', brand: 'Fiat', model: 'Cronos', detail: 'Drive 1.3 · 2023', year: 2023, transmission: 'Manual', km: 31000, price: 19500000, tone: 'ochre', mark: 'FC' },
  { id: 'pulse', brand: 'Fiat', model: 'Pulse', detail: 'Drive CVT · 2024', year: 2024, transmission: 'Automática', km: 5000, price: 26300000, tone: 'blue', mark: 'FP' },
  { id: 'gol', brand: 'Volkswagen', model: 'Gol Trend', detail: 'Trendline · 2019', year: 2019, transmission: 'Manual', km: 128000, price: 12400000, tone: 'red', mark: 'VG' },
  { id: 'taos', brand: 'Volkswagen', model: 'Taos', detail: 'Highline Tiptronic · 2023', year: 2023, transmission: 'Automática', km: 22000, price: 38700000, tone: 'blue', mark: 'VT' },
  { id: 'onix', brand: 'Chevrolet', model: 'Onix', detail: 'Premier AT · 2022', year: 2022, transmission: 'Automática', km: 54000, price: 21600000, tone: 'ochre', mark: 'CO' },
  { id: 'cruze', brand: 'Chevrolet', model: 'Cruze', detail: 'LTZ Turbo · 2021', year: 2021, transmission: 'Automática', km: 67000, price: 27400000, tone: 'red', mark: 'CC' },
].map((vehicle) => ({ ...vehicle, name: `${vehicle.brand} ${vehicle.model}` }))
