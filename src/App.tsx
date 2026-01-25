import { useState, useEffect } from 'react'

const API_URL = 'https://voltride-booking-production.up.railway.app'
const BRAND = 'VOLTRIDE'

type Tab = 'vehicles' | 'agencies' | 'categories' | 'options'

interface Agency { id: string; code: string; name: any; address: string; city: string; postalCode: string; country: string; phone: string; email: string; brand: string; openingTime: string; closingTimeSummer: string; closingTimeWinter: string; isActive: boolean; agencyType: string }
interface Category { id: string; code: string; name: any; brand: string; bookingFee: number; _count?: { vehicles: number } }
interface Vehicle { id: string; sku: string; name: any; description: any; deposit: number; hasPlate: boolean; imageUrl?: string; categoryId: string; category?: Category; pricing: any[] }
interface Option { id: string; code: string; name: any; maxQuantity: number; includedByDefault: boolean; imageUrl?: string; day1: number; day2: number; day3: number }

function App() {
  const [tab, setTab] = useState<Tab>('vehicles')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAllData() }, [])

  const loadAllData = async () => {
    try {
      const [agRes, catRes, vehRes, optRes] = await Promise.all([
        fetch(API_URL + '/api/agencies'),
        fetch(API_URL + '/api/categories'),
        fetch(API_URL + '/api/vehicles'),
        fetch(API_URL + '/api/options')
      ])
      const allAgencies = await agRes.json()
      const allCategories = await catRes.json()
      const allVehicles = await vehRes.json()
      
      // Filtrer par marque VOLTRIDE
      setAgencies(allAgencies.filter((a: Agency) => a.brand === BRAND))
      setCategories(allCategories.filter((c: Category) => c.brand === BRAND))
      const voltrideCatIds = allCategories.filter((c: Category) => c.brand === BRAND).map((c: Category) => c.id)
      setVehicles(allVehicles.filter((v: Vehicle) => voltrideCatIds.includes(v.categoryId)))
      setOptions(await optRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const getName = (obj: any, lang = 'fr') => obj?.[lang] || obj?.fr || obj?.es || ''

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center"><p className="text-xl">Chargement...</p></div>

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 p-4 text-white" style={{ background: 'linear-gradient(180deg, #0e7490 0%, #abdee6 100%)' }}>
        <div className="flex flex-col items-center gap-3 mb-8 pt-4">
          <img src="https://res.cloudinary.com/dis5pcnfr/image/upload/v1769278425/IMG-20260111-WA0001_1_-removebg-preview_zzajxa.png" className="h-16" alt="Voltride" />
          <h1 className="text-xl font-bold">Back Office</h1>
          <p className="text-sm opacity-80">Voltride</p>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'vehicles', label: 'Véhicules', icon: '🚲' },
            { id: 'categories', label: 'Catégories', icon: '📁' },
            { id: 'agencies', label: 'Agences', icon: '🏢' },
            { id: 'options', label: 'Options', icon: '⚙️' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <a href="https://trivium-launcher-production.up.railway.app" className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm">
            <span>←</span> Retour au Launcher
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {tab === 'vehicles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Véhicules Voltride</h2>
              <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{vehicles.length} véhicules</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-cyan-50 rounded-lg flex items-center justify-center">
                      {v.imageUrl ? <img src={v.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-3xl">🚲</span>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{getName(v.name)}</h3>
                      <p className="text-sm text-gray-500">{v.sku}</p>
                      <p className="text-sm text-cyan-600">{getName(v.category?.name)}</p>
                      <p className="text-sm text-gray-600">Caution: {v.deposit}€</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Catégories Voltride</h2>
              <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{categories.length} catégories</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-bold text-gray-800">{getName(c.name)}</h3>
                  <p className="text-sm text-gray-500">{c.code}</p>
                  <p className="text-sm text-cyan-600">Frais: {c.bookingFee}€</p>
                  <p className="text-sm text-gray-500">{c._count?.vehicles || 0} véhicules</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'agencies' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Agences Voltride</h2>
              <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{agencies.length} agences</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agencies.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800">{getName(a.name)}</h3>
                      <p className="text-sm text-gray-500">{a.code}</p>
                      <p className="text-sm text-gray-600">{a.address}, {a.city}</p>
                      <p className="text-sm text-gray-500">{a.phone}</p>
                    </div>
                    <span className={'px-2 py-1 rounded text-xs ' + (a.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'options' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Options</h2>
              <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{options.length} options</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {options.map(o => (
                <div key={o.id} className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-bold text-gray-800">{getName(o.name)}</h3>
                  <p className="text-sm text-gray-500">{o.code}</p>
                  <p className="text-sm text-gray-600">Max: {o.maxQuantity}</p>
                  <p className="text-sm text-cyan-600">J1: {o.day1}€ | J2: {o.day2}€ | J3: {o.day3}€</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
