import { useState, useEffect } from 'react'

const API_URL = 'https://api-voltrideandmotorrent-production.up.railway.app'
const BRAND = 'VOLTRIDE'

type Tab = 'vehicles' | 'agencies' | 'categories' | 'options' | 'widget' | 'operator' | 'comptabilite'

interface Agency { id: string; code: string; name: any; address: string; city: string; postalCode: string; country: string; phone: string; email: string; brand: string; openingTime: string; closingTimeSummer: string; closingTimeWinter: string; isActive: boolean; agencyType: string }
interface Category { id: string; code: string; name: any; brand: string; bookingFee: number; _count?: { vehicles: number } }
interface Vehicle { id: string; sku: string; name: any; description: any; deposit: number; hasPlate: boolean; imageUrl?: string; categoryId: string; category?: Category; pricing: any[] }
interface Option { id: string; code: string; name: any; maxQuantity: number; includedByDefault: boolean; imageUrl?: string; day1: number; day2: number; day3: number; day4: number; day5: number; day6: number; day7: number }

function App() {
  const [tab, setTab] = useState<Tab>('vehicles')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)

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
      
      setAgencies(allAgencies.filter((a: Agency) => a.brand === BRAND))
      setCategories(allCategories.filter((c: Category) => c.brand === BRAND))
      const voltrideCatIds = allCategories.filter((c: Category) => c.brand === BRAND).map((c: Category) => c.id)
      setVehicles(allVehicles.filter((v: Vehicle) => voltrideCatIds.includes(v.categoryId)))
      setOptions(await optRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSave = async (type: string, data: any) => {
    const isEdit = !!editItem?.id
    const url = isEdit ? `${API_URL}/api/${type}/${editItem.id}` : `${API_URL}/api/${type}`
    try {
      await fetch(url, { 
        method: isEdit ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...data, brand: BRAND }) 
      })
      setShowModal(null)
      setEditItem(null)
      loadAllData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return
    try {
      await fetch(`${API_URL}/api/${type}/${id}`, { method: 'DELETE' })
      loadAllData()
    } catch (e) { console.error(e) }
  }

  const getName = (obj: any, lang = 'fr') => obj?.[lang] || obj?.fr || obj?.es || ''

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center"><p className="text-xl">Chargement...</p></div>

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 p-4 text-white relative" style={{ background: 'linear-gradient(180deg, #0e7490 0%, #abdee6 100%)' }}>
        <div className="flex flex-col items-center gap-3 mb-8 pt-4">
          <img src="https://res.cloudinary.com/dis5pcnfr/image/upload/v1769278425/IMG-20260111-WA0001_1_-removebg-preview_zzajxa.png" className="h-16" alt="Voltride" />
          <h1 className="text-xl font-bold">Back Office</h1>
          <p className="text-sm opacity-80">Voltride</p>
        </div>
        <nav className="space-y-1">
          <p className="text-xs uppercase text-white/50 px-4 pt-4">Données</p>
          {[
            { id: 'vehicles', label: 'Véhicules', icon: '🚲' },
            { id: 'categories', label: 'Catégories', icon: '📁' },
            { id: 'agencies', label: 'Agences', icon: '🏢' },
            { id: 'options', label: 'Options', icon: '🔧' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition text-sm ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
          
          <p className="text-xs uppercase text-white/50 px-4 pt-6">Paramètres Apps</p>
          {[
            { id: 'widget', label: 'Widget', icon: '🎨' },
            { id: 'operator', label: 'Operator', icon: '👤' },
            { id: 'comptabilite', label: 'Comptabilité', icon: '💰' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition text-sm ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}>
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
      <div className="flex-1 p-8 overflow-auto">
        
        {/* VÉHICULES */}
        {tab === 'vehicles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Véhicules Voltride</h2>
              <div className="flex gap-2">
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{vehicles.length} véhicules</span>
                <button onClick={() => { setEditItem(null); setShowModal('vehicle') }} className="bg-cyan-600 text-white px-4 py-1 rounded-lg hover:bg-cyan-700 transition text-sm">+ Ajouter</button>
              </div>
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
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button onClick={() => { setEditItem(v); setShowModal('vehicle') }} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition">✏️ Modifier</button>
                    <button onClick={() => handleDelete('vehicles', v.id)} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded transition">🗑️ Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATÉGORIES */}
        {tab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Catégories Voltride</h2>
              <div className="flex gap-2">
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{categories.length} catégories</span>
                <button onClick={() => { setEditItem(null); setShowModal('category') }} className="bg-cyan-600 text-white px-4 py-1 rounded-lg hover:bg-cyan-700 transition text-sm">+ Ajouter</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-bold text-gray-800">{getName(c.name)}</h3>
                  <p className="text-sm text-gray-500">{c.code}</p>
                  <p className="text-sm text-cyan-600">Frais: {c.bookingFee}€</p>
                  <p className="text-sm text-gray-500">{c._count?.vehicles || 0} véhicules</p>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button onClick={() => { setEditItem(c); setShowModal('category') }} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition">✏️ Modifier</button>
                    <button onClick={() => handleDelete('categories', c.id)} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded transition">🗑️ Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENCES */}
        {tab === 'agencies' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Agences Voltride</h2>
              <div className="flex gap-2">
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{agencies.length} agences</span>
                <button onClick={() => { setEditItem(null); setShowModal('agency') }} className="bg-cyan-600 text-white px-4 py-1 rounded-lg hover:bg-cyan-700 transition text-sm">+ Ajouter</button>
              </div>
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
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button onClick={() => { setEditItem(a); setShowModal('agency') }} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition">✏️ Modifier</button>
                    <button onClick={() => handleDelete('agencies', a.id)} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded transition">🗑️ Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPTIONS */}
        {tab === 'options' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Options</h2>
              <div className="flex gap-2">
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">{options.length} options</span>
                <button onClick={() => { setEditItem(null); setShowModal('option') }} className="bg-cyan-600 text-white px-4 py-1 rounded-lg hover:bg-cyan-700 transition text-sm">+ Ajouter</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {options.map(o => (
                <div key={o.id} className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-bold text-gray-800">{getName(o.name)}</h3>
                  <p className="text-sm text-gray-500">{o.code}</p>
                  <p className="text-sm text-gray-600">Max: {o.maxQuantity}</p>
                  <p className="text-sm text-cyan-600">J1: {o.day1}€ | J2: {o.day2}€ | J3: {o.day3}€</p>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button onClick={() => { setEditItem(o); setShowModal('option') }} className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition">✏️ Modifier</button>
                    <button onClick={() => handleDelete('options', o.id)} className="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded transition">🗑️ Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDGET SETTINGS */}
        {tab === 'widget' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres Widget</h2>
            <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Configuration du Widget de Réservation</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL du Widget</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value="https://widget-voltride.up.railway.app" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur principale</label>
                  <div className="flex gap-2">
                    <input type="color" defaultValue="#abdee6" className="w-12 h-10 rounded cursor-pointer" />
                    <input type="text" className="flex-1 border rounded-lg px-3 py-2" defaultValue="#abdee6" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée minimum (jours)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée maximum (jours)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="30" />
                </div>
                <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* OPERATOR SETTINGS */}
        {tab === 'operator' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres Operator</h2>
            <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Configuration de l'App Operator</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Operator</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value="https://operator-production-188c.up.railway.app" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notifications email</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option>Activées</option>
                    <option>Désactivées</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de notification</label>
                  <input type="email" className="w-full border rounded-lg px-3 py-2" placeholder="notifications@voltride.com" />
                </div>
                <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* COMPTABILITÉ SETTINGS */}
        {tab === 'comptabilite' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Paramètres Comptabilité</h2>
            <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Configuration Comptable</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taux de TVA (%)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="21" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option>EUR (€)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Préfixe factures</label>
                  <input type="text" className="w-full border rounded-lg px-3 py-2" defaultValue="VR-" />
                </div>
                <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showModal === 'vehicle' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">{editItem ? 'Modifier' : 'Ajouter'} un véhicule</h3>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); handleSave('vehicles', { name: { fr: fd.get('name_fr'), es: fd.get('name_es'), en: fd.get('name_en') }, sku: fd.get('sku'), deposit: Number(fd.get('deposit')), categoryId: fd.get('categoryId'), imageUrl: fd.get('imageUrl'), hasPlate: fd.get('hasPlate') === 'on' }) }}>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Nom (FR)</label><input name="name_fr" defaultValue={editItem?.name?.fr || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Nom (ES)</label><input name="name_es" defaultValue={editItem?.name?.es || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Nom (EN)</label><input name="name_en" defaultValue={editItem?.name?.en || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">SKU</label><input name="sku" defaultValue={editItem?.sku || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Caution (€)</label><input name="deposit" type="number" defaultValue={editItem?.deposit || 0} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Catégorie</label><select name="categoryId" defaultValue={editItem?.categoryId || ''} className="w-full border rounded px-3 py-2" required>{categories.map(c => <option key={c.id} value={c.id}>{getName(c.name)}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Image URL</label><input name="imageUrl" defaultValue={editItem?.imageUrl || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="flex items-center gap-2"><input name="hasPlate" type="checkbox" defaultChecked={editItem?.hasPlate} /> Immatriculation requise</label></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => { setShowModal(null); setEditItem(null) }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'category' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{editItem ? 'Modifier' : 'Ajouter'} une catégorie</h3>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); handleSave('categories', { name: { fr: fd.get('name_fr'), es: fd.get('name_es'), en: fd.get('name_en') }, code: fd.get('code'), bookingFee: Number(fd.get('bookingFee')) }) }}>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Nom (FR)</label><input name="name_fr" defaultValue={editItem?.name?.fr || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Nom (ES)</label><input name="name_es" defaultValue={editItem?.name?.es || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Nom (EN)</label><input name="name_en" defaultValue={editItem?.name?.en || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Code</label><input name="code" defaultValue={editItem?.code || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Frais de réservation (€)</label><input name="bookingFee" type="number" defaultValue={editItem?.bookingFee || 0} className="w-full border rounded px-3 py-2" required /></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => { setShowModal(null); setEditItem(null) }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'agency' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">{editItem ? 'Modifier' : 'Ajouter'} une agence</h3>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); handleSave('agencies', { name: { fr: fd.get('name_fr'), es: fd.get('name_es'), en: fd.get('name_en') }, code: fd.get('code'), address: fd.get('address'), city: fd.get('city'), postalCode: fd.get('postalCode'), country: fd.get('country'), phone: fd.get('phone'), email: fd.get('email'), isActive: fd.get('isActive') === 'on', agencyType: fd.get('agencyType') }) }}>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Nom (FR)</label><input name="name_fr" defaultValue={editItem?.name?.fr || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Nom (ES)</label><input name="name_es" defaultValue={editItem?.name?.es || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Code</label><input name="code" defaultValue={editItem?.code || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Adresse</label><input name="address" defaultValue={editItem?.address || ''} className="w-full border rounded px-3 py-2" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-sm font-medium mb-1">Ville</label><input name="city" defaultValue={editItem?.city || ''} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="block text-sm font-medium mb-1">Code Postal</label><input name="postalCode" defaultValue={editItem?.postalCode || ''} className="w-full border rounded px-3 py-2" /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1">Pays</label><input name="country" defaultValue={editItem?.country || 'ES'} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Téléphone</label><input name="phone" defaultValue={editItem?.phone || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input name="email" type="email" defaultValue={editItem?.email || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Type</label><select name="agencyType" defaultValue={editItem?.agencyType || 'OWN'} className="w-full border rounded px-3 py-2"><option value="OWN">Propre</option><option value="PARTNER">Partenaire</option><option value="FRANCHISE">Franchise</option></select></div>
                <div><label className="flex items-center gap-2"><input name="isActive" type="checkbox" defaultChecked={editItem?.isActive !== false} /> Active</label></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => { setShowModal(null); setEditItem(null) }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'option' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">{editItem ? 'Modifier' : 'Ajouter'} une option</h3>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); handleSave('options', { name: { fr: fd.get('name_fr'), es: fd.get('name_es'), en: fd.get('name_en') }, code: fd.get('code'), maxQuantity: Number(fd.get('maxQuantity')), includedByDefault: fd.get('includedByDefault') === 'on', day1: Number(fd.get('day1')), day2: Number(fd.get('day2')), day3: Number(fd.get('day3')), day4: Number(fd.get('day4')), day5: Number(fd.get('day5')), day6: Number(fd.get('day6')), day7: Number(fd.get('day7')) }) }}>
              <div className="space-y-3">
                <div><label className="block text-sm font-medium mb-1">Nom (FR)</label><input name="name_fr" defaultValue={editItem?.name?.fr || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Nom (ES)</label><input name="name_es" defaultValue={editItem?.name?.es || ''} className="w-full border rounded px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Code</label><input name="code" defaultValue={editItem?.code || ''} className="w-full border rounded px-3 py-2" required /></div>
                <div><label className="block text-sm font-medium mb-1">Quantité max</label><input name="maxQuantity" type="number" defaultValue={editItem?.maxQuantity || 1} className="w-full border rounded px-3 py-2" /></div>
                <div className="grid grid-cols-4 gap-2">
                  <div><label className="block text-sm mb-1">J1 (€)</label><input name="day1" type="number" defaultValue={editItem?.day1 || 0} className="w-full border rounded px-2 py-1" /></div>
                  <div><label className="block text-sm mb-1">J2 (€)</label><input name="day2" type="number" defaultValue={editItem?.day2 || 0} className="w-full border rounded px-2 py-1" /></div>
                  <div><label className="block text-sm mb-1">J3 (€)</label><input name="day3" type="number" defaultValue={editItem?.day3 || 0} className="w-full border rounded px-2 py-1" /></div>
                  <div><label className="block text-sm mb-1">J4 (€)</label><input name="day4" type="number" defaultValue={editItem?.day4 || 0} className="w-full border rounded px-2 py-1" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="block text-sm mb-1">J5 (€)</label><input name="day5" type="number" defaultValue={editItem?.day5 || 0} className="w-full border rounded px-2 py-1" /></div>
                  <div><label className="block text-sm mb-1">J6 (€)</label><input name="day6" type="number" defaultValue={editItem?.day6 || 0} className="w-full border rounded px-2 py-1" /></div>
                  <div><label className="block text-sm mb-1">J7 (€)</label><input name="day7" type="number" defaultValue={editItem?.day7 || 0} className="w-full border rounded px-2 py-1" /></div>
                </div>
                <div><label className="flex items-center gap-2"><input name="includedByDefault" type="checkbox" defaultChecked={editItem?.includedByDefault} /> Inclus par défaut</label></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="button" onClick={() => { setShowModal(null); setEditItem(null) }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
