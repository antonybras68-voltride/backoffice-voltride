import { useState, useEffect } from 'react'
import { AgencyScheduleModal } from './AgencyScheduleModal'

const API_URL = 'https://api-voltrideandmotorrent-production.up.railway.app'
const BRAND = 'VOLTRIDE'

type Tab = 'vehicles' | 'agencies' | 'categories' | 'options' | 'widget' | 'operator' | 'comptabilite'

interface Agency { id: string; code: string; name: any; address: string; city: string; postalCode: string; country: string; phone: string; email: string; brand: string; isActive: boolean; agencyType: string; commissionRate?: number; commissionEmail?: string; showStockUrgency?: boolean }
interface Category { id: string; code: string; name: any; brand: string; bookingFee: number; bookingFeePercentLow?: number; bookingFeePercentHigh?: number; _count?: { vehicles: number } }
interface Vehicle { id: string; sku: string; name: any; description: any; deposit: number; hasPlate: boolean; licenseType?: any; kmIncluded?: any; kmIncludedPerDay?: number; extraKmPrice?: number; helmetIncluded?: boolean; imageUrl?: string; categoryId: string; category?: Category; pricing: any[] }
interface Option { id: string; code: string; name: any; description?: any; maxQuantity: number; includedByDefault: boolean; imageUrl?: string; day1: number; day2: number; day3: number; day4: number; day5: number; day6: number; day7: number; day8: number; day9: number; day10: number; day11: number; day12: number; day13: number; day14: number; categories?: any[] }

function App() {
  const [tab, setTab] = useState<Tab>('vehicles')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [scheduleAgency, setScheduleAgency] = useState<Agency | null>(null)

  useEffect(() => { loadAllData() }, [])

  const loadAllData = async () => {
    try {
      const [agRes, catRes, vehRes, optRes] = await Promise.all([
        fetch(API_URL + '/api/agencies'), fetch(API_URL + '/api/categories'), fetch(API_URL + '/api/vehicles'), fetch(API_URL + '/api/options')
      ])
      const allAgencies = await agRes.json()
      const allCategories = await catRes.json()
      const allVehicles = await vehRes.json()
      setAgencies(allAgencies.filter((a: Agency) => a.brand === BRAND))
      setCategories(allCategories.filter((c: Category) => c.brand === BRAND))
      const catIds = allCategories.filter((c: Category) => c.brand === BRAND).map((c: Category) => c.id)
      setVehicles(allVehicles.filter((v: Vehicle) => catIds.includes(v.categoryId)))
      setOptions(await optRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleSave = async (type: string, data: any) => {
    const isEdit = !!editItem?.id
    const url = isEdit ? `${API_URL}/api/${type}/${editItem.id}` : `${API_URL}/api/${type}`
    await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    setShowModal(null); setEditItem(null); loadAllData()
  }

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Supprimer ?')) return
    await fetch(`${API_URL}/api/${type}/${id}`, { method: 'DELETE' }); loadAllData()
  }

  const getName = (obj: any, lang = 'fr') => obj?.[lang] || obj?.fr || obj?.es || ''

  if (loading) return <div className="min-h-screen bg-cyan-50 flex items-center justify-center"><p className="text-xl">Chargement...</p></div>

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 p-4 text-white relative" style={{ background: 'linear-gradient(180deg, #0e7490 0%, #abdee6 100%)' }}>
        <div className="flex flex-col items-center gap-2 mb-6 pt-2">
          <img src="https://res.cloudinary.com/dis5pcnfr/image/upload/v1769278425/IMG-20260111-WA0001_1_-removebg-preview_zzajxa.png" className="h-14" alt="Voltride" />
          <h1 className="text-lg font-bold">Back Office</h1>
          <p className="text-xs opacity-80">Voltride</p>
        </div>
        <nav className="space-y-1">
          <p className="text-xs uppercase text-white/50 px-3 pt-2">Données</p>
          {[{ id: 'vehicles', label: 'Véhicules', icon: '🚲' }, { id: 'categories', label: 'Catégories', icon: '📁' }, { id: 'agencies', label: 'Agences', icon: '🏢' }, { id: 'options', label: 'Options', icon: '🔧' }].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}><span>{item.icon}</span>{item.label}</button>
          ))}
          <p className="text-xs uppercase text-white/50 px-3 pt-4">Paramètres</p>
          {[{ id: 'widget', label: 'Widget', icon: '🎨' }, { id: 'operator', label: 'Operator', icon: '👤' }, { id: 'comptabilite', label: 'Comptabilité', icon: '💰' }].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}><span>{item.icon}</span>{item.label}</button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <a href="https://trivium-launcher-production.up.railway.app" className="flex items-center gap-2 text-white/70 hover:text-white transition text-sm">← Retour au Launcher</a>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-auto">
        {/* VÉHICULES */}
        {tab === 'vehicles' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Véhicules Voltride</h2>
              <button onClick={() => { setEditItem(null); setShowModal('vehicle') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {v.imageUrl ? <img src={v.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl">🚲</span>}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{getName(v.name)}</h3>
                      <p className="text-xs text-gray-500">{v.sku}</p>
                      <p className="text-xs text-cyan-600">{getName(v.category?.name)}</p>
                      <p className="text-xs">Caution: {v.deposit}€ {v.hasPlate && <span className="text-amber-600">🔖</span>}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditItem(v); setShowModal('vehicle') }} className="flex-1 bg-gray-100 py-1 rounded text-sm">Modifier</button>
                    <button onClick={() => handleDelete('vehicles', v.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATÉGORIES */}
        {tab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Catégories Voltride</h2>
              <button onClick={() => { setEditItem(null); setShowModal('category') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-bold">{getName(c.name)}</h3>
                  <p className="text-sm text-gray-500">{c.code}</p>
                  <p className="text-sm text-green-600">Acompte: {c.bookingFee}€</p>
                  {c.bookingFeePercentLow && <p className="text-xs text-gray-500">&lt;100€: {c.bookingFeePercentLow}% | &gt;100€: {c.bookingFeePercentHigh}%</p>}
                  <p className="text-xs text-gray-400">{c._count?.vehicles || 0} véhicules</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditItem(c); setShowModal('category') }} className="flex-1 bg-gray-100 py-1 rounded text-sm">Modifier</button>
                    <button onClick={() => handleDelete('categories', c.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENCES */}
        {tab === 'agencies' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Agences Voltride</h2>
              <button onClick={() => { setEditItem(null); setShowModal('agency') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {agencies.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{getName(a.name)}</h3>
                      <p className="text-sm text-gray-500">{a.code} - {a.city}</p>
                      <p className="text-sm text-gray-500">{a.phone}</p>
                      {a.agencyType !== 'OWN' && <p className="text-xs"><span className={'px-2 py-0.5 rounded ' + (a.agencyType === 'PARTNER' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800')}>{a.agencyType}</span> {a.commissionRate && <span className="ml-1">{(a.commissionRate * 100).toFixed(0)}%</span>}</p>}
                      {a.showStockUrgency && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⚠️ Urgence stock</span>}
                    </div>
                    <span className={a.isActive ? 'text-green-500' : 'text-red-500'}>{a.isActive ? '●' : '○'}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setEditItem(a); setShowModal('agency') }} className="flex-1 bg-gray-100 py-1 rounded text-sm">Modifier</button>
                    <button onClick={() => setScheduleAgency(a)} className="flex-1 bg-green-100 text-green-700 py-1 rounded text-sm">Horaires</button>
                    <button onClick={() => handleDelete('agencies', a.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OPTIONS */}
        {tab === 'options' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Options & Accessoires</h2>
              <button onClick={() => { setEditItem(null); setShowModal('option') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {options.map(o => (
                <div key={o.id} className="bg-white p-4 rounded-xl shadow flex gap-3 items-center">
                  {o.imageUrl ? <img src={o.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg" /> : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🎁</div>}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{getName(o.name)}</h3>
                    <p className="text-xs text-gray-500">{o.code} | Max: {o.maxQuantity}</p>
                    <p className="text-xs text-gray-500">J1={o.day1}€, J2={o.day2}€, J3={o.day3}€...</p>
                    <p className="text-xs text-cyan-600">Catégories: {o.categories?.map((c: any) => getName(c.category?.name)).join(', ') || 'Toutes'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditItem(o); setShowModal('option') }} className="bg-gray-100 px-3 py-1 rounded text-sm">Modifier</button>
                    <button onClick={() => handleDelete('options', o.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WIDGET SETTINGS */}
        {tab === 'widget' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Paramètres Widget</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">URL du Widget</label><input type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value="https://widget-voltride.up.railway.app" readOnly /></div>
              <div><label className="block text-sm font-medium mb-1">Couleur principale</label><div className="flex gap-2"><input type="color" defaultValue="#abdee6" className="w-12 h-10 rounded" /><input type="text" className="flex-1 border rounded-lg px-3 py-2" defaultValue="#abdee6" /></div></div>
              <div><label className="block text-sm font-medium mb-1">Durée min (jours)</label><input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="1" /></div>
              <div><label className="block text-sm font-medium mb-1">Durée max (jours)</label><input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="30" /></div>
              <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg">Sauvegarder</button>
            </div>
          </div>
        )}

        {/* OPERATOR SETTINGS */}
        {tab === 'operator' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Paramètres Operator</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">URL Operator</label><input type="text" className="w-full border rounded-lg px-3 py-2 bg-gray-50" value="https://operator-production-188c.up.railway.app" readOnly /></div>
              <div><label className="block text-sm font-medium mb-1">Notifications email</label><select className="w-full border rounded-lg px-3 py-2"><option>Activées</option><option>Désactivées</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Email de notification</label><input type="email" className="w-full border rounded-lg px-3 py-2" placeholder="notifications@voltride.com" /></div>
              <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg">Sauvegarder</button>
            </div>
          </div>
        )}

        {/* COMPTABILITÉ SETTINGS */}
        {tab === 'comptabilite' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Paramètres Comptabilité</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Taux TVA (%)</label><input type="number" className="w-full border rounded-lg px-3 py-2" defaultValue="21" /></div>
              <div><label className="block text-sm font-medium mb-1">Devise</label><select className="w-full border rounded-lg px-3 py-2"><option>EUR (€)</option><option>USD ($)</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Préfixe factures</label><input type="text" className="w-full border rounded-lg px-3 py-2" defaultValue="VR-" /></div>
              <button className="bg-cyan-600 text-white px-6 py-2 rounded-lg">Sauvegarder</button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {showModal === 'vehicle' && <VehicleModal vehicle={editItem} categories={categories} onSave={(data) => handleSave('vehicles', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {showModal === 'category' && <CategoryModal category={editItem} onSave={(data) => handleSave('categories', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {showModal === 'agency' && <AgencyModal agency={editItem} onSave={(data) => handleSave('agencies', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {showModal === 'option' && <OptionModal option={editItem} categories={categories} onSave={(data) => handleSave('options', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {scheduleAgency && <AgencyScheduleModal agency={scheduleAgency} onClose={() => setScheduleAgency(null)} />}
    </div>
  )
}

// ============ VEHICLE MODAL ============
function VehicleModal({ vehicle, categories, onSave, onClose }: any) {
  const [form, setForm] = useState({
    sku: vehicle?.sku || '', nameFr: vehicle?.name?.fr || '', nameEs: vehicle?.name?.es || '', nameEn: vehicle?.name?.en || '',
    descFr: vehicle?.description?.fr || '', descEs: vehicle?.description?.es || '', descEn: vehicle?.description?.en || '',
    deposit: vehicle?.deposit || 0, hasPlate: vehicle?.hasPlate || false,
    licenseTypeFr: vehicle?.licenseType?.fr || '', licenseTypeEs: vehicle?.licenseType?.es || '', licenseTypeEn: vehicle?.licenseType?.en || '',
    kmIncludedFr: vehicle?.kmIncluded?.fr || '', kmIncludedEs: vehicle?.kmIncluded?.es || '', kmIncludedEn: vehicle?.kmIncluded?.en || '',
    kmIncludedPerDay: vehicle?.kmIncludedPerDay || 100, extraKmPrice: vehicle?.extraKmPrice || 0.15, helmetIncluded: vehicle?.helmetIncluded ?? true,
    categoryId: vehicle?.categoryId || '', imageUrl: vehicle?.imageUrl || '', pricing: vehicle?.pricing?.[0] || {}
  })
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', 'voltride')
    const res = await fetch('https://api.cloudinary.com/v1_1/dis5pcnfr/image/upload', { method: 'POST', body: formData })
    const data = await res.json(); setForm({ ...form, imageUrl: data.secure_url }); setUploading(false)
  }

  const handleSubmit = () => onSave({
    sku: form.sku, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, description: { fr: form.descFr, es: form.descEs, en: form.descEn },
    deposit: parseFloat(String(form.deposit)), hasPlate: form.hasPlate, licenseType: { fr: form.licenseTypeFr, es: form.licenseTypeEs, en: form.licenseTypeEn },
    kmIncluded: { fr: form.kmIncludedFr, es: form.kmIncludedEs, en: form.kmIncludedEn }, kmIncludedPerDay: parseInt(String(form.kmIncludedPerDay)),
    extraKmPrice: parseFloat(String(form.extraKmPrice)), helmetIncluded: form.helmetIncluded, categoryId: form.categoryId, imageUrl: form.imageUrl, pricing: form.pricing
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{vehicle ? 'Modifier' : 'Ajouter'} Véhicule</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="p-2 border rounded" />
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="p-2 border rounded">
              <option value="">-- Catégorie --</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name?.fr}</option>)}
            </select>
          </div>
          <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Caution €" value={form.deposit} onChange={e => setForm({ ...form, deposit: parseFloat(e.target.value) || 0 })} className="p-2 border rounded" />
            <label className="flex items-center gap-2 p-2 border rounded"><input type="checkbox" checked={form.hasPlate} onChange={e => setForm({ ...form, hasPlate: e.target.checked })} /> Immatriculé</label>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium mb-2">Photo</p>
            {form.imageUrl && <img src={form.imageUrl} alt="" className="w-20 h-20 object-cover rounded mb-2" />}
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium mb-2">Tarifs journaliers (€)</p>
            <div className="grid grid-cols-7 gap-1">
              {[1,2,3,4,5,6,7].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form.pricing['day'+d] || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, ['day'+d]: parseFloat(e.target.value) || 0 } })} className="p-1 border rounded text-center text-sm" />))}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
              {[8,9,10,11,12,13,14].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form.pricing['day'+d] || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, ['day'+d]: parseFloat(e.target.value) || 0 } })} className="p-1 border rounded text-center text-sm" />))}
            </div>
            <p className="text-sm font-medium mt-3 mb-2">Heures supplémentaires (€)</p>
            <div className="grid grid-cols-4 gap-1">
              {[1,2,3,4].map(h => (<input key={h} type="number" placeholder={'H'+h} value={form.pricing['extraHour'+h] || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, ['extraHour'+h]: parseFloat(e.target.value) || 0 } })} className="p-1 border rounded text-center text-sm" />))}
            </div>
            <p className="text-sm font-medium mt-3 mb-2">Jour supplémentaire (après 14j)</p>
            <input type="number" placeholder="Prix/jour" value={form.pricing.extraDayPrice || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, extraDayPrice: parseFloat(e.target.value) || 0 } })} className="w-full p-2 border rounded" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button>
          <button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

// ============ CATEGORY MODAL ============
function CategoryModal({ category, onSave, onClose }: any) {
  const [form, setForm] = useState({
    code: category?.code || '', nameFr: category?.name?.fr || '', nameEs: category?.name?.es || '', nameEn: category?.name?.en || '',
    bookingFee: category?.bookingFee || 0, bookingFeePercentLow: category?.bookingFeePercentLow || 30, bookingFeePercentHigh: category?.bookingFeePercentHigh || 20
  })
  const handleSubmit = () => onSave({ code: form.code, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, brand: 'VOLTRIDE', bookingFee: parseFloat(String(form.bookingFee)), bookingFeePercentLow: parseFloat(String(form.bookingFeePercentLow)), bookingFeePercentHigh: parseFloat(String(form.bookingFeePercentHigh)) })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">{category ? 'Modifier' : 'Ajouter'} Catégorie</h3>
        <div className="space-y-3">
          <input placeholder="Code (ex: CAT-EBIKE)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
          <div><label className="text-sm font-medium">Acompte fixe (€)</label><input type="number" value={form.bookingFee} onChange={e => setForm({ ...form, bookingFee: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-sm font-medium">% acompte &lt;100€</label><input type="number" value={form.bookingFeePercentLow} onChange={e => setForm({ ...form, bookingFeePercentLow: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded" /></div>
            <div><label className="text-sm font-medium">% acompte &gt;100€</label><input type="number" value={form.bookingFeePercentHigh} onChange={e => setForm({ ...form, bookingFeePercentHigh: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded" /></div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button>
          <button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

// ============ AGENCY MODAL ============
function AgencyModal({ agency, onSave, onClose }: any) {
  const [form, setForm] = useState({
    code: agency?.code || '', nameFr: agency?.name?.fr || '', nameEs: agency?.name?.es || '', nameEn: agency?.name?.en || '',
    address: agency?.address || '', city: agency?.city || '', postalCode: agency?.postalCode || '', country: agency?.country || 'ES',
    phone: agency?.phone || '', email: agency?.email || '', isActive: agency?.isActive ?? true,
    agencyType: agency?.agencyType || 'OWN', commissionRate: agency?.commissionRate ? agency.commissionRate * 100 : '',
    commissionEmail: agency?.commissionEmail || '', showStockUrgency: agency?.showStockUrgency || false
  })

  const handleSubmit = () => onSave({
    code: form.code, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, brand: 'VOLTRIDE',
    address: form.address, city: form.city, postalCode: form.postalCode, country: form.country,
    phone: form.phone, email: form.email, isActive: form.isActive, agencyType: form.agencyType,
    commissionRate: form.agencyType !== 'OWN' && form.commissionRate ? parseFloat(String(form.commissionRate)) / 100 : null,
    commissionEmail: form.agencyType !== 'OWN' ? form.commissionEmail : null, showStockUrgency: form.showStockUrgency
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{agency ? 'Modifier' : 'Ajouter'} Agence</h3>
        <div className="space-y-3">
          <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Adresse" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full p-2 border rounded" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="p-2 border rounded" />
            <input placeholder="Code postal" value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="p-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-2 border rounded" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" />
          </div>
          <select value={form.agencyType} onChange={e => setForm({ ...form, agencyType: e.target.value })} className="w-full p-2 border rounded">
            <option value="OWN">Agence propre</option>
            <option value="PARTNER">Partenaire</option>
            <option value="FRANCHISE">Franchise</option>
          </select>
          {form.agencyType !== 'OWN' && (
            <div className="border rounded p-3 bg-gray-50">
              <input type="number" placeholder="Commission %" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} className="w-full p-2 border rounded mb-2" />
              <input type="email" placeholder="Email rapport" value={form.commissionEmail} onChange={e => setForm({ ...form, commissionEmail: e.target.value })} className="w-full p-2 border rounded" />
            </div>
          )}
          <div className="border rounded p-3 bg-yellow-50">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.showStockUrgency} onChange={e => setForm({ ...form, showStockUrgency: e.target.checked })} /> Activer urgence stock</label>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Agence active</label>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button>
          <button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

// ============ OPTION MODAL ============
function OptionModal({ option, categories, onSave, onClose }: any) {
  const existingCatIds = option?.categories?.map((c: any) => c.categoryId) || []
  const [form, setForm] = useState({
    code: option?.code || '', nameFr: option?.name?.fr || '', nameEs: option?.name?.es || '', nameEn: option?.name?.en || '',
    descFr: option?.description?.fr || '', descEs: option?.description?.es || '', descEn: option?.description?.en || '',
    maxQuantity: option?.maxQuantity || 10, includedByDefault: option?.includedByDefault || false, imageUrl: option?.imageUrl || '',
    day1: option?.day1 || 0, day2: option?.day2 || 0, day3: option?.day3 || 0, day4: option?.day4 || 0, day5: option?.day5 || 0, day6: option?.day6 || 0, day7: option?.day7 || 0,
    day8: option?.day8 || 0, day9: option?.day9 || 0, day10: option?.day10 || 0, day11: option?.day11 || 0, day12: option?.day12 || 0, day13: option?.day13 || 0, day14: option?.day14 || 0,
    categoryIds: existingCatIds as string[]
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const formData = new FormData(); formData.append('file', file); formData.append('upload_preset', 'voltride')
    const res = await fetch('https://api.cloudinary.com/v1_1/dis5pcnfr/image/upload', { method: 'POST', body: formData })
    const data = await res.json(); setForm({ ...form, imageUrl: data.secure_url })
  }

  const toggleCategory = (catId: string) => {
    if (form.categoryIds.includes(catId)) setForm({ ...form, categoryIds: form.categoryIds.filter(id => id !== catId) })
    else setForm({ ...form, categoryIds: [...form.categoryIds, catId] })
  }

  const handleSubmit = () => onSave({
    code: form.code, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, description: { fr: form.descFr, es: form.descEs, en: form.descEn },
    maxQuantity: parseInt(String(form.maxQuantity)), includedByDefault: form.includedByDefault, imageUrl: form.imageUrl,
    day1: parseFloat(String(form.day1)), day2: parseFloat(String(form.day2)), day3: parseFloat(String(form.day3)), day4: parseFloat(String(form.day4)),
    day5: parseFloat(String(form.day5)), day6: parseFloat(String(form.day6)), day7: parseFloat(String(form.day7)), day8: parseFloat(String(form.day8)),
    day9: parseFloat(String(form.day9)), day10: parseFloat(String(form.day10)), day11: parseFloat(String(form.day11)), day12: parseFloat(String(form.day12)),
    day13: parseFloat(String(form.day13)), day14: parseFloat(String(form.day14)), categoryIds: form.categoryIds
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">{option ? 'Modifier' : 'Ajouter'} Option</h3>
        <div className="space-y-3">
          <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
          <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Quantité max" value={form.maxQuantity} onChange={e => setForm({ ...form, maxQuantity: parseInt(e.target.value) || 10 })} className="p-2 border rounded" />
            <label className="flex items-center gap-2 p-2 border rounded"><input type="checkbox" checked={form.includedByDefault} onChange={e => setForm({ ...form, includedByDefault: e.target.checked })} /> Inclus par défaut</label>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium mb-2">Image</p>
            {form.imageUrl && <img src={form.imageUrl} alt="" className="w-20 h-20 object-cover rounded mb-2" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium mb-2">Catégories associées</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c: any) => (
                <label key={c.id} className={'flex items-center gap-2 p-2 border rounded cursor-pointer ' + (form.categoryIds.includes(c.id) ? 'bg-cyan-50 border-cyan-300' : '')}>
                  <input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                  <span className="text-sm">{c.name?.fr}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm font-medium mb-2">Tarifs journaliers (€)</p>
            <div className="grid grid-cols-7 gap-1">
              {[1,2,3,4,5,6,7].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form['day'+d as keyof typeof form] || ''} onChange={e => setForm({ ...form, ['day'+d]: parseFloat(e.target.value) || 0 })} className="p-1 border rounded text-center text-sm" />))}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
              {[8,9,10,11,12,13,14].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form['day'+d as keyof typeof form] || ''} onChange={e => setForm({ ...form, ['day'+d]: parseFloat(e.target.value) || 0 })} className="p-1 border rounded text-center text-sm" />))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button>
          <button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

export default App
