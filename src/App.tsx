import { useState, useEffect } from 'react'
import { AgencyScheduleModal } from './AgencyScheduleModal'

const API_URL = 'https://api-voltrideandmotorrent-production.up.railway.app'
const BRAND = 'VOLTRIDE'

type Tab = 'vehicles' | 'reservations' | 'agencies' | 'categories' | 'options' | 'entreprise' | 'widget' | 'operator' | 'comptabilite' | 'documents' | 'notifications'

interface Agency { id: string; code: string; name: any; address: string; city: string; postalCode: string; country: string; phone: string; email: string; brand: string; isActive: boolean; agencyType: string; commissionRate?: number; commissionEmail?: string; showStockUrgency?: boolean }
interface Category { id: string; code: string; name: any; brand: string; bookingFee: number; bookingFeePercentLow?: number; bookingFeePercentHigh?: number; _count?: { vehicles: number } }
interface Vehicle { id: string; sku: string; name: any; description: any; deposit: number; hasPlate: boolean; licenseType?: any; kmIncluded?: any; kmIncludedPerDay?: number; extraKmPrice?: number; helmetIncluded?: boolean; imageUrl?: string; categoryId: string; category?: Category; pricing: any[] }
interface Option { id: string; code: string; name: any; description?: any; maxQuantity: number; includedByDefault: boolean; imageUrl?: string; day1: number; day2: number; day3: number; day4: number; day5: number; day6: number; day7: number; day8: number; day9: number; day10: number; day11: number; day12: number; day13: number; day14: number; categories?: any[] }

function App() {
  const [tab, setTab] = useState<Tab>('vehicles')
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [scheduleAgency, setScheduleAgency] = useState<Agency | null>(null)
  const [entreprise, setEntreprise] = useState({ raisonSociale: '', nomCommercial: '', adresse: '', codePostal: '', ville: '', pays: 'Espagne', nif: '', tvaIntra: '', email: '', telephone: '', siteWeb: '' })
  const [widgetSettings, setWidgetSettings] = useState({ stripeEnabled: false, stripeMode: 'test', stripePublishableKey: '', stripeSecretKey: '', minDays: 1, maxDays: 30 })
  const [operatorSettings, setOperatorSettings] = useState({ emailNotifications: true, notificationEmail: '', smsNotifications: false, smsPhone: '', autoAssign: true, showCustomerPhone: true })
  const [comptaSettings, setComptaSettings] = useState({ tvaRate: 21, currency: 'EUR', invoicePrefix: 'VR-', invoiceNextNumber: 1, paymentTerms: 30, bankName: '', bankIban: '', bankBic: '' })
  const [legalSettings, setLegalSettings] = useState<any>({ cgvResume: { fr: '', es: '', en: '' }, cgvComplete: { fr: '', es: '', en: '' }, rgpd: { fr: '', es: '', en: '' }, mentionsLegales: { fr: '', es: '', en: '' } })
  const [legalSection, setLegalSection] = useState('cgvResume')
  const [notificationSettings, setNotificationSettings] = useState<any>({})

  useEffect(() => { loadAllData(); loadEntreprise(); loadWidgetSettings(); loadOperatorSettings(); loadComptaSettings(); loadLegalSettings(); loadNotificationSettings() }, [])

  const loadAllData = async () => {
    try {
  const [agRes, catRes, vehRes, optRes, bookRes] = await Promise.all([
        fetch(API_URL + '/api/agencies'), fetch(API_URL + '/api/categories'), fetch(API_URL + '/api/vehicles'), fetch(API_URL + '/api/options'), fetch(API_URL + '/api/bookings')
      ])
      const allAgencies = await agRes.json()
      const allCategories = await catRes.json()
      const allVehicles = await vehRes.json()
      setAgencies(allAgencies.filter((a: Agency) => a.brand === BRAND))
      setCategories(allCategories.filter((c: Category) => c.brand === BRAND))
      const catIds = allCategories.filter((c: Category) => c.brand === BRAND).map((c: Category) => c.id)
      setVehicles(allVehicles.filter((v: Vehicle) => catIds.includes(v.categoryId)))
      setOptions(await optRes.json())
const allBookings = await bookRes.json()
      setBookings(allBookings.filter((b: any) => b.agency?.brand === BRAND))   
 } catch (e) { console.error(e) }
    setLoading(false)
  }

  const loadEntreprise = async () => {
    try {
      const res = await fetch(API_URL + "/api/settings/entreprise-voltride")
      if (res.ok) {
        const data = await res.json()
        if (data) setEntreprise(data)
      }
    } catch (e) { console.error(e) }
  }

  const saveEntreprise = async () => {
    try {
      await fetch(API_URL + "/api/settings/entreprise-voltride", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entreprise)
      })
      alert("Informations entreprise sauvegardées !")
    } catch (e) { alert("Erreur lors de la sauvegarde") }
  }

  const loadWidgetSettings = async () => {
    try {
      const res = await fetch(API_URL + "/api/settings/widget-voltride")
      if (res.ok) {
        const data = await res.json()
        if (data) setWidgetSettings(data)
      }
    } catch (e) { console.error(e) }
  }

  const saveWidgetSettings = async () => {
    try {
      await fetch(API_URL + "/api/settings/widget-voltride", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(widgetSettings)
      })
      alert("Paramètres widget sauvegardés !")
    } catch (e) { alert("Erreur lors de la sauvegarde") }
  
  }

  const loadOperatorSettings = async () => {
    try {
      const res = await fetch(API_URL + "/api/settings/operator-voltride")
      if (res.ok) { const data = await res.json(); if (data) setOperatorSettings(data) }
    } catch (e) { console.error(e) }
  }

  const saveOperatorSettings = async () => {
    try {
      await fetch(API_URL + "/api/settings/operator-voltride", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(operatorSettings) })
      alert("Paramètres operator sauvegardés !")
    } catch (e) { alert("Erreur lors de la sauvegarde") }
  }

  const loadComptaSettings = async () => {
    try {
      const res = await fetch(API_URL + "/api/settings/compta-voltride")
      if (res.ok) { const data = await res.json(); if (data) setComptaSettings(data) }
    } catch (e) { console.error(e) }
  }

  const loadLegalSettings = async () => {
    try {
      const res = await fetch(API_URL + "/api/brand-settings/VOLTRIDE")
      if (res.ok) { const data = await res.json(); if (data) setLegalSettings(data) }
    } catch (e) { console.error(e) }
  }

  const saveLegalSettings = async () => {
    try {
      await fetch(API_URL + "/api/brand-settings/VOLTRIDE", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(legalSettings) })
      alert("Documents légaux sauvegardés !")
    } catch (e) { alert("Erreur lors de la sauvegarde") }
  }

  const loadNotificationSettings = async () => {
    try {
      const res = await fetch(API_URL + "/api/notification-settings")
      if (res.ok) { const data = await res.json(); const settings: any = {}; data.forEach((n: any) => { settings[n.notificationType] = n }); setNotificationSettings(settings) }
    } catch (e) { console.error(e) }
  }

  const saveNotificationSettings = async () => {
    try {
      for (const [type, settings] of Object.entries(notificationSettings)) {
        await fetch(API_URL + "/api/notification-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationType: type, ...(settings as any) }) })
      }
      alert("Paramètres notifications sauvegardés !")
    } catch (e) { alert("Erreur lors de la sauvegarde") }
  }

  const saveComptaSettings = async () => {
    try {
      await fetch(API_URL + "/api/settings/compta-voltride", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(comptaSettings) })
      alert("Paramètres comptabilité sauvegardés !")
    } catch (e) { alert("Erreur lors de la sauvegarde") }
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

  const getName = (obj: any) => obj?.fr || obj?.es || ''

  if (loading) return <div className="min-h-screen bg-cyan-50 flex items-center justify-center"><p className="text-xl">Chargement...</p></div>

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 p-4 text-white relative" style={{ background: 'linear-gradient(180deg, #0e7490 0%, #abdee6 100%)' }}>
        <div className="flex flex-col items-center gap-2 mb-6 pt-2">
          <img src="https://res.cloudinary.com/dis5pcnfr/image/upload/v1769278425/IMG-20260111-WA0001_1_-removebg-preview_zzajxa.png" className="h-14" alt="Voltride" />
          <h1 className="text-lg font-bold">Back Office</h1>
        </div>
        <nav className="space-y-1">
          <p className="text-xs uppercase text-white/50 px-3 pt-2">Données</p>
          {[{ id: 'reservations', label: 'Réservations', icon: '📅' }, { id: 'vehicles', label: 'Véhicules', icon: '🚲' }, { id: 'categories', label: 'Catégories', icon: '📁' }, { id: 'agencies', label: 'Agences', icon: '🏢' }, { id: 'options', label: 'Options', icon: '🔧' }].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}><span>{item.icon}</span>{item.label}</button>
          ))}
          <p className="text-xs uppercase text-white/50 px-3 pt-4">Paramètres</p>
          {[{ id: 'entreprise', label: 'Entreprise', icon: '🏛️' }, { id: 'documents', label: 'Documents légaux', icon: '📄' }, { id: 'notifications', label: 'Notifications', icon: '🔔' }, { id: 'widget', label: 'Widget', icon: '🎨' }, { id: 'operator', label: 'Operator', icon: '👤' }, { id: 'comptabilite', label: 'Comptabilité', icon: '💰' }].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as Tab)} className={'w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm ' + (tab === item.id ? 'bg-white/20 font-bold' : 'hover:bg-white/10')}><span>{item.icon}</span>{item.label}</button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4"><a href="https://trivium-launcher-production.up.railway.app" className="text-white/70 hover:text-white text-sm">← Retour au Launcher</a></div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {tab === 'reservations' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Réservations Voltride</h2>
              <span className="text-sm text-gray-500">{bookings.length} réservation(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Réf</th>
                    <th className="px-3 py-2 text-left">Client</th>
                    <th className="px-3 py-2 text-left">Dates</th>
                    <th className="px-3 py-2 text-left">Agence</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Statut</th>
                    <th className="px-3 py-2 text-left">Caution</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b: any) => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-cyan-600">{b.reference}</td>
                      <td className="px-3 py-2">{b.customer?.firstName} {b.customer?.lastName}</td>
                      <td className="px-3 py-2 text-xs">
                        {new Date(b.startDate).toLocaleDateString('fr-FR')} - {new Date(b.endDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 py-2">{b.agency?.name?.fr || b.agency?.code}</td>
                      <td className="px-3 py-2 font-bold">{b.totalPrice}€</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          b.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'COMPLETED' ? 'bg-gray-100 text-gray-700' :
                          b.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                        }`}>{b.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          b.depositStatus === 'CARD_SAVED' ? 'bg-blue-100 text-blue-700' :
                          b.depositStatus === 'AUTHORIZED' ? 'bg-purple-100 text-purple-700' :
                          b.depositStatus === 'RELEASED' ? 'bg-green-100 text-green-700' :
                          b.depositStatus === 'CAPTURED' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {b.depositStatus === 'CARD_SAVED' ? '💳 Carte OK' :
                           b.depositStatus === 'AUTHORIZED' ? '🔒 Bloquée' :
                           b.depositStatus === 'RELEASED' ? '✅ Libérée' :
                           b.depositStatus === 'CAPTURED' ? `💰 ${b.depositCapturedAmount || ''}€` :
                           '⏳ En attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'vehicles' && (
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Véhicules Voltride</h2><button onClick={() => { setEditItem(null); setShowModal('vehicle') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button></div>
            <div className="grid grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">{v.imageUrl ? <img src={v.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-2xl">🚲</span>}</div>
                    <div className="flex-1"><h3 className="font-bold text-sm">{getName(v.name)}</h3><p className="text-xs text-gray-500">{v.sku}</p><p className="text-xs text-cyan-600">{getName(v.category?.name)}</p><p className="text-xs">Caution: {v.deposit}€ {v.hasPlate && '🔖'}</p></div>
                  </div>
                  <div className="flex gap-2 mt-3"><button onClick={() => { setEditItem(v); setShowModal('vehicle') }} className="flex-1 bg-gray-100 py-1 rounded text-sm">Modifier</button><button onClick={() => handleDelete('vehicles', v.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm">Supprimer</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Catégories Voltride</h2><button onClick={() => { setEditItem(null); setShowModal('category') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button></div>
            <div className="grid grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-bold">{getName(c.name)}</h3><p className="text-sm text-gray-500">{c.code}</p><p className="text-sm text-green-600">Acompte: {c.bookingFee}€</p>
                  <div className="flex gap-2 mt-3"><button onClick={() => { setEditItem(c); setShowModal('category') }} className="flex-1 bg-gray-100 py-1 rounded text-sm">Modifier</button><button onClick={() => handleDelete('categories', c.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm">Supprimer</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'agencies' && (
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Agences Voltride</h2><button onClick={() => { setEditItem(null); setShowModal('agency') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button></div>
            <div className="grid grid-cols-2 gap-4">
              {agencies.map(a => (
                <div key={a.id} className="bg-white p-4 rounded-xl shadow">
                  <div className="flex justify-between"><div><h3 className="font-bold">{getName(a.name)}</h3><p className="text-sm text-gray-500">{a.code} - {a.city}</p><p className="text-sm text-gray-500">{a.phone}</p>{a.showStockUrgency && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">⚠️ Urgence stock</span>}</div><span className={a.isActive ? 'text-green-500' : 'text-red-500'}>{a.isActive ? '●' : '○'}</span></div>
                  <div className="flex gap-2 mt-3"><button onClick={() => { setEditItem(a); setShowModal('agency') }} className="flex-1 bg-gray-100 py-1 rounded text-sm">Modifier</button><button onClick={() => setScheduleAgency(a)} className="flex-1 bg-green-100 text-green-700 py-1 rounded text-sm">Horaires</button><button onClick={() => handleDelete('agencies', a.id)} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-sm">Supprimer</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'options' && (
          <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Options</h2><button onClick={() => { setEditItem(null); setShowModal('option') }} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm">+ Ajouter</button></div>
            <div className="space-y-2">
              {options.map(o => (
                <div key={o.id} className="bg-white p-4 rounded-xl shadow flex gap-3 items-center">
                  {o.imageUrl ? <img src={o.imageUrl} alt="" className="w-14 h-14 object-cover rounded-lg" /> : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-xl">🎁</div>}
                  <div className="flex-1"><h3 className="font-bold text-sm">{getName(o.name)}</h3><p className="text-xs text-gray-500">{o.code} | Max: {o.maxQuantity}</p></div>
                  <div className="flex gap-2"><button onClick={() => { setEditItem(o); setShowModal('option') }} className="bg-gray-100 px-3 py-1 rounded text-sm">Modifier</button><button onClick={() => handleDelete('options', o.id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm">Supprimer</button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'entreprise' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">🏛️ Informations Entreprise</h2>
            <p className="text-sm text-gray-500 mb-4">Ces informations seront utilisées pour les contrats et factures.</p>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Raison Sociale *</label><input type="text" value={entreprise.raisonSociale} onChange={e => setEntreprise({...entreprise, raisonSociale: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="VOLTRIDE S.L." /></div>
                <div><label className="block text-sm font-medium mb-1">Nom Commercial</label><input type="text" value={entreprise.nomCommercial} onChange={e => setEntreprise({...entreprise, nomCommercial: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Voltride" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Adresse</label><input type="text" value={entreprise.adresse} onChange={e => setEntreprise({...entreprise, adresse: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Calle Example, 123" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Code Postal</label><input type="text" value={entreprise.codePostal} onChange={e => setEntreprise({...entreprise, codePostal: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Ville</label><input type="text" value={entreprise.ville} onChange={e => setEntreprise({...entreprise, ville: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Pays</label><input type="text" value={entreprise.pays} onChange={e => setEntreprise({...entreprise, pays: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">NIF / CIF *</label><input type="text" value={entreprise.nif} onChange={e => setEntreprise({...entreprise, nif: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="B12345678" /></div>
                <div><label className="block text-sm font-medium mb-1">N° TVA Intracommunautaire</label><input type="text" value={entreprise.tvaIntra} onChange={e => setEntreprise({...entreprise, tvaIntra: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="ESB12345678" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={entreprise.email} onChange={e => setEntreprise({...entreprise, email: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Téléphone</label><input type="tel" value={entreprise.telephone} onChange={e => setEntreprise({...entreprise, telephone: e.target.value})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Site Web</label><input type="url" value={entreprise.siteWeb} onChange={e => setEntreprise({...entreprise, siteWeb: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="https://www.voltride.com" /></div>
              <button onClick={saveEntreprise} className="bg-cyan-600 text-white px-6 py-2 rounded-lg">Sauvegarder</button>
            </div>
          </div>
        )}

        {tab === "widget" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">🎨 Paramètres Widget</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">URL du Widget</label><div className="flex gap-2"><input type="text" className="flex-1 border rounded-lg px-3 py-2 bg-gray-50" value="https://widget-voltride-production.up.railway.app" readOnly /><a href="https://widget-voltride-production.up.railway.app" target="_blank" rel="noreferrer" className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">Ouvrir ↗</a></div></div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold text-lg mb-3">💳 Configuration Stripe</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={widgetSettings.stripeEnabled} onChange={e => setWidgetSettings({...widgetSettings, stripeEnabled: e.target.checked})} className="w-5 h-5" /><div><p className="font-medium">Activer le paiement Stripe</p><p className="text-xs text-gray-500">Permet aux clients de payer en ligne</p></div></label>
                  {widgetSettings.stripeEnabled && (
                    <>
                      <div><label className="block text-sm font-medium mb-1">Mode</label><select value={widgetSettings.stripeMode} onChange={e => setWidgetSettings({...widgetSettings, stripeMode: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="test">🧪 Test (sandbox)</option><option value="live">🟢 Production (live)</option></select></div>
                      <div><label className="block text-sm font-medium mb-1">Clé publique (Publishable Key)</label><input type="text" value={widgetSettings.stripePublishableKey} onChange={e => setWidgetSettings({...widgetSettings, stripePublishableKey: e.target.value})} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" placeholder="pk_test_..." /></div>
                      <div><label className="block text-sm font-medium mb-1">Clé secrète (Secret Key)</label><input type="password" value={widgetSettings.stripeSecretKey} onChange={e => setWidgetSettings({...widgetSettings, stripeSecretKey: e.target.value})} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" placeholder="sk_test_..." /><p className="text-xs text-gray-500 mt-1">⚠️ Ne jamais partager cette clé</p></div>
                      <div className={"p-3 rounded-lg " + (widgetSettings.stripeMode === "live" ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200")}><p className="text-sm">{widgetSettings.stripeMode === "live" ? "🟢 Mode PRODUCTION - Les paiements seront réels" : "🧪 Mode TEST - Utilisez les cartes de test Stripe"}</p></div>
                    </>
                  )}
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-3">📅 Durée de location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Minimum (jours)</label><input type="number" value={widgetSettings.minDays} onChange={e => setWidgetSettings({...widgetSettings, minDays: parseInt(e.target.value) || 1})} className="w-full border rounded-lg px-3 py-2" min="1" /></div>
                  <div><label className="block text-sm font-medium mb-1">Maximum (jours)</label><input type="number" value={widgetSettings.maxDays} onChange={e => setWidgetSettings({...widgetSettings, maxDays: parseInt(e.target.value) || 30})} className="w-full border rounded-lg px-3 py-2" min="1" /></div>
                </div>
              </div>
              <button onClick={saveWidgetSettings} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition">Sauvegarder</button>
            </div>
          </div>
        )}

        {tab === "operator" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">👤 Paramètres Operator</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">URL Operator</label><div className="flex gap-2"><input type="text" className="flex-1 border rounded-lg px-3 py-2 bg-gray-50" value="https://operator-production-188c.up.railway.app" readOnly /><a href="https://operator-production-188c.up.railway.app" target="_blank" rel="noreferrer" className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap">Ouvrir ↗</a></div></div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-3">📧 Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={operatorSettings.emailNotifications} onChange={e => setOperatorSettings({...operatorSettings, emailNotifications: e.target.checked})} className="w-5 h-5" /><div><p className="font-medium">Notifications par email</p><p className="text-xs text-gray-500">Recevoir les nouvelles réservations par email</p></div></label>
                  {operatorSettings.emailNotifications && <div><label className="block text-sm font-medium mb-1">Email de notification</label><input type="email" value={operatorSettings.notificationEmail} onChange={e => setOperatorSettings({...operatorSettings, notificationEmail: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="notifications@voltride.com" /></div>}
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={operatorSettings.smsNotifications} onChange={e => setOperatorSettings({...operatorSettings, smsNotifications: e.target.checked})} className="w-5 h-5" /><div><p className="font-medium">Notifications SMS</p><p className="text-xs text-gray-500">Recevoir les alertes urgentes par SMS</p></div></label>
                  {operatorSettings.smsNotifications && <div><label className="block text-sm font-medium mb-1">Téléphone SMS</label><input type="tel" value={operatorSettings.smsPhone} onChange={e => setOperatorSettings({...operatorSettings, smsPhone: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="+34 600 000 000" /></div>}
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-3">⚙️ Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={operatorSettings.autoAssign} onChange={e => setOperatorSettings({...operatorSettings, autoAssign: e.target.checked})} className="w-5 h-5" /><div><p className="font-medium">Auto-assignation véhicules</p><p className="text-xs text-gray-500">Assigner automatiquement un véhicule de la flotte</p></div></label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"><input type="checkbox" checked={operatorSettings.showCustomerPhone} onChange={e => setOperatorSettings({...operatorSettings, showCustomerPhone: e.target.checked})} className="w-5 h-5" /><div><p className="font-medium">Afficher téléphone client</p><p className="text-xs text-gray-500">Montrer le numéro de téléphone dans la liste</p></div></label>
                </div>
              </div>
              <button onClick={saveOperatorSettings} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition">Sauvegarder</button>
            </div>
          </div>
        )}
        {tab === "comptabilite" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-4">💰 Paramètres Comptabilité</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Taux TVA (%)</label><input type="number" value={comptaSettings.tvaRate} onChange={e => setComptaSettings({...comptaSettings, tvaRate: parseFloat(e.target.value) || 21})} className="w-full border rounded-lg px-3 py-2" /></div>
                <div><label className="block text-sm font-medium mb-1">Devise</label><select value={comptaSettings.currency} onChange={e => setComptaSettings({...comptaSettings, currency: e.target.value})} className="w-full border rounded-lg px-3 py-2"><option value="EUR">EUR (€)</option><option value="USD">USD ($)</option><option value="GBP">GBP (£)</option></select></div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-3">🧾 Factures</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Préfixe factures</label><input type="text" value={comptaSettings.invoicePrefix} onChange={e => setComptaSettings({...comptaSettings, invoicePrefix: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="VR-" /></div>
                  <div><label className="block text-sm font-medium mb-1">Prochain numéro</label><input type="number" value={comptaSettings.invoiceNextNumber} onChange={e => setComptaSettings({...comptaSettings, invoiceNextNumber: parseInt(e.target.value) || 1})} className="w-full border rounded-lg px-3 py-2" /></div>
                </div>
                <div className="mt-3"><label className="block text-sm font-medium mb-1">Délai de paiement (jours)</label><input type="number" value={comptaSettings.paymentTerms} onChange={e => setComptaSettings({...comptaSettings, paymentTerms: parseInt(e.target.value) || 30})} className="w-full border rounded-lg px-3 py-2" /></div>
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-3">🏦 Coordonnées bancaires</h3>
                <div className="space-y-3">
                  <div><label className="block text-sm font-medium mb-1">Nom de la banque</label><input type="text" value={comptaSettings.bankName} onChange={e => setComptaSettings({...comptaSettings, bankName: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Banco Santander" /></div>
                  <div><label className="block text-sm font-medium mb-1">IBAN</label><input type="text" value={comptaSettings.bankIban} onChange={e => setComptaSettings({...comptaSettings, bankIban: e.target.value})} className="w-full border rounded-lg px-3 py-2 font-mono" placeholder="ES00 0000 0000 0000 0000 0000" /></div>
                  <div><label className="block text-sm font-medium mb-1">BIC/SWIFT</label><input type="text" value={comptaSettings.bankBic} onChange={e => setComptaSettings({...comptaSettings, bankBic: e.target.value})} className="w-full border rounded-lg px-3 py-2 font-mono" placeholder="BSCHESMMXXX" /></div>
                </div>
              </div>
              <button onClick={saveComptaSettings} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition">Sauvegarder</button>
            </div>
          </div>
        )}
      </div>


        {tab === "documents" && (
          <div>
            <h2 className="text-xl font-bold mb-4">📄 Documents Légaux</h2>
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <div className="flex gap-2 flex-wrap mb-4">
                {[
                  { id: 'cgvResume', label: '📄 CGV Résumé' },
                  { id: 'cgvComplete', label: '📋 CGV Complètes' },
                  { id: 'rgpd', label: '🔒 RGPD' },
                  { id: 'mentionsLegales', label: '⚖️ Mentions Légales' }
                ].map(s => (
                  <button key={s.id} onClick={() => setLegalSection(s.id)} className={'px-3 py-2 rounded-lg text-sm ' + (legalSection === s.id ? 'bg-cyan-600 text-white' : 'bg-gray-100 hover:bg-gray-200')}>{s.label}</button>
                ))}
              </div>
              <div className="space-y-4">
                {['fr', 'es', 'en'].map(lang => (
                  <div key={lang}>
                    <label className="block text-sm font-medium mb-1">{lang === 'fr' ? '🇫🇷 Français' : lang === 'es' ? '🇪🇸 Español' : '🇬🇧 English'}</label>
                    <textarea value={legalSettings[legalSection]?.[lang] || ''} onChange={e => setLegalSettings({...legalSettings, [legalSection]: {...legalSettings[legalSection], [lang]: e.target.value}})} className="w-full border rounded-lg p-3 h-40 font-mono text-sm" placeholder={`Entrez le texte en ${lang === 'fr' ? 'français' : lang === 'es' ? 'espagnol' : 'anglais'}...`} />
                  </div>
                ))}
              </div>
              <button onClick={saveLegalSettings} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700">💾 Sauvegarder</button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div>
            <h2 className="text-xl font-bold mb-4">🔔 Configuration des Notifications</h2>
            <div className="bg-white rounded-xl shadow p-6">
              <p className="text-gray-600 text-sm mb-6">Configurez quelles notifications chaque rôle doit recevoir.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4">Notification</th>
                      <th className="text-center py-3 px-4">Admin</th>
                      <th className="text-center py-3 px-4">Manager</th>
                      <th className="text-center py-3 px-4">Opérateur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'new_booking', label: '🚲 Nouvelle réservation' },
                      { id: 'booking_cancelled', label: '❌ Réservation annulée' },
                      { id: 'checkin_imminent', label: '⏰ Check-in imminent' },
                      { id: 'checkout_imminent', label: '⏰ Check-out imminent' },
                      { id: 'late_return', label: '⚠️ Retard de retour' },
                      { id: 'payment_received', label: '💰 Paiement reçu' },
                      { id: 'maintenance_due', label: '🔧 Maintenance à planifier' },
                    ].map(notif => (
                      <tr key={notif.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{notif.label}</td>
                        <td className="text-center py-3 px-4"><input type="checkbox" checked={notificationSettings[notif.id]?.roleAdmin ?? true} onChange={e => setNotificationSettings({...notificationSettings, [notif.id]: {...notificationSettings[notif.id], roleAdmin: e.target.checked}})} className="w-5 h-5 rounded" /></td>
                        <td className="text-center py-3 px-4"><input type="checkbox" checked={notificationSettings[notif.id]?.roleManager ?? true} onChange={e => setNotificationSettings({...notificationSettings, [notif.id]: {...notificationSettings[notif.id], roleManager: e.target.checked}})} className="w-5 h-5 rounded" /></td>
                        <td className="text-center py-3 px-4"><input type="checkbox" checked={notificationSettings[notif.id]?.roleOperator ?? false} onChange={e => setNotificationSettings({...notificationSettings, [notif.id]: {...notificationSettings[notif.id], roleOperator: e.target.checked}})} className="w-5 h-5 rounded" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6"><button onClick={saveNotificationSettings} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700">💾 Sauvegarder</button></div>
            </div>
          </div>
        )}

      {showModal === 'vehicle' && <VehicleModal vehicle={editItem} categories={categories} onSave={(data) => handleSave('vehicles', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {showModal === 'category' && <CategoryModal category={editItem} onSave={(data) => handleSave('categories', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {showModal === 'agency' && <AgencyModal agency={editItem} onSave={(data) => handleSave('agencies', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {showModal === 'option' && <OptionModal option={editItem} categories={categories} onSave={(data) => handleSave('options', data)} onClose={() => { setShowModal(null); setEditItem(null) }} />}
      {scheduleAgency && <AgencyScheduleModal agency={scheduleAgency} onClose={() => setScheduleAgency(null)} />}
    </div>
  )
}

function VehicleModal({ vehicle, categories, onSave, onClose }: any) {
  const [form, setForm] = useState({ sku: vehicle?.sku || '', nameFr: vehicle?.name?.fr || '', nameEs: vehicle?.name?.es || '', nameEn: vehicle?.name?.en || '', deposit: vehicle?.deposit || 0, hasPlate: vehicle?.hasPlate || false, categoryId: vehicle?.categoryId || '', imageUrl: vehicle?.imageUrl || '', pricing: vehicle?.pricing?.[0] || {} })
  const [uploading, setUploading] = useState(false)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', 'voltride'); const res = await fetch('https://api.cloudinary.com/v1_1/dis5pcnfr/image/upload', { method: 'POST', body: fd }); const data = await res.json(); setForm({ ...form, imageUrl: data.secure_url }); setUploading(false) }
  const handleSubmit = () => onSave({ sku: form.sku, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, description: {}, deposit: parseFloat(String(form.deposit)), hasPlate: form.hasPlate, categoryId: form.categoryId, imageUrl: form.imageUrl, pricing: form.pricing })
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">{vehicle ? 'Modifier' : 'Ajouter'} Véhicule</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2"><input placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="p-2 border rounded" /><select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="p-2 border rounded"><option value="">-- Catégorie --</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.name?.fr}</option>)}</select></div>
        <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
        <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Caution €" value={form.deposit} onChange={e => setForm({ ...form, deposit: parseFloat(e.target.value) || 0 })} className="p-2 border rounded" /><label className="flex items-center gap-2 p-2 border rounded"><input type="checkbox" checked={form.hasPlate} onChange={e => setForm({ ...form, hasPlate: e.target.checked })} /> Immatriculé</label></div>
        <div className="border rounded p-3"><p className="text-sm font-medium mb-2">Photo</p>{form.imageUrl && <img src={form.imageUrl} alt="" className="w-20 h-20 object-cover rounded mb-2" />}<input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} /></div>
        <div className="border rounded p-3"><p className="text-sm font-medium mb-2">Tarifs (€)</p><div className="grid grid-cols-7 gap-1">{[1,2,3,4,5,6,7].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form.pricing['day'+d] || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, ['day'+d]: parseFloat(e.target.value) || 0 } })} className="p-1 border rounded text-center text-sm" />))}</div><div className="grid grid-cols-7 gap-1 mt-1">{[8,9,10,11,12,13,14].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form.pricing['day'+d] || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, ['day'+d]: parseFloat(e.target.value) || 0 } })} className="p-1 border rounded text-center text-sm" />))}</div><p className="text-sm font-medium mt-3 mb-2">Heures supp (€)</p><div className="grid grid-cols-4 gap-1">{[1,2,3,4].map(h => (<input key={h} type="number" placeholder={'H'+h} value={form.pricing['extraHour'+h] || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, ['extraHour'+h]: parseFloat(e.target.value) || 0 } })} className="p-1 border rounded text-center text-sm" />))}</div><p className="text-sm font-medium mt-3 mb-2">Jour supp après 14j</p><input type="number" placeholder="Prix/jour" value={form.pricing.extraDayPrice || ''} onChange={e => setForm({ ...form, pricing: { ...form.pricing, extraDayPrice: parseFloat(e.target.value) || 0 } })} className="w-full p-2 border rounded" /></div>
      </div>
      <div className="flex gap-2 mt-4"><button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button><button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button></div>
    </div></div>
  )
}

function CategoryModal({ category, onSave, onClose }: any) {
  const [form, setForm] = useState({ code: category?.code || '', nameFr: category?.name?.fr || '', nameEs: category?.name?.es || '', nameEn: category?.name?.en || '', bookingFee: category?.bookingFee || 0, bookingFeePercentLow: category?.bookingFeePercentLow || 30, bookingFeePercentHigh: category?.bookingFeePercentHigh || 20 })
  const handleSubmit = () => onSave({ code: form.code, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, brand: 'VOLTRIDE', bookingFee: parseFloat(String(form.bookingFee)), bookingFeePercentLow: parseFloat(String(form.bookingFeePercentLow)), bookingFeePercentHigh: parseFloat(String(form.bookingFeePercentHigh)) })
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-full max-w-lg">
      <h3 className="text-xl font-bold mb-4">{category ? 'Modifier' : 'Ajouter'} Catégorie</h3>
      <div className="space-y-3">
        <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
        <div><label className="text-sm font-medium">Acompte fixe (€)</label><input type="number" value={form.bookingFee} onChange={e => setForm({ ...form, bookingFee: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded" /></div>
        <div className="grid grid-cols-2 gap-2"><div><label className="text-sm">% &lt;100€</label><input type="number" value={form.bookingFeePercentLow} onChange={e => setForm({ ...form, bookingFeePercentLow: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded" /></div><div><label className="text-sm">% &gt;100€</label><input type="number" value={form.bookingFeePercentHigh} onChange={e => setForm({ ...form, bookingFeePercentHigh: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded" /></div></div>
      </div>
      <div className="flex gap-2 mt-4"><button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button><button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button></div>
    </div></div>
  )
}

function AgencyModal({ agency, onSave, onClose }: any) {
  const [form, setForm] = useState({ code: agency?.code || '', nameFr: agency?.name?.fr || '', nameEs: agency?.name?.es || '', nameEn: agency?.name?.en || '', address: agency?.address || '', city: agency?.city || '', postalCode: agency?.postalCode || '', country: agency?.country || 'ES', phone: agency?.phone || '', email: agency?.email || '', isActive: agency?.isActive ?? true, agencyType: agency?.agencyType || 'OWN', commissionRate: agency?.commissionRate ? agency.commissionRate * 100 : '', commissionEmail: agency?.commissionEmail || '', showStockUrgency: agency?.showStockUrgency || false })
  const handleSubmit = () => onSave({ code: form.code, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, brand: 'VOLTRIDE', address: form.address, city: form.city, postalCode: form.postalCode, country: form.country, phone: form.phone, email: form.email, isActive: form.isActive, agencyType: form.agencyType, commissionRate: form.agencyType !== 'OWN' && form.commissionRate ? parseFloat(String(form.commissionRate)) / 100 : null, commissionEmail: form.agencyType !== 'OWN' ? form.commissionEmail : null, showStockUrgency: form.showStockUrgency })
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">{agency ? 'Modifier' : 'Ajouter'} Agence</h3>
      <div className="space-y-3">
        <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Adresse" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full p-2 border rounded" />
        <div className="grid grid-cols-2 gap-2"><input placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="p-2 border rounded" /><input placeholder="CP" value={form.postalCode} onChange={e => setForm({ ...form, postalCode: e.target.value })} className="p-2 border rounded" /></div>
        <div className="grid grid-cols-2 gap-2"><input placeholder="Tél" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-2 border rounded" /><input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="p-2 border rounded" /></div>
        <select value={form.agencyType} onChange={e => setForm({ ...form, agencyType: e.target.value })} className="w-full p-2 border rounded"><option value="OWN">Propre</option><option value="PARTNER">Partenaire</option><option value="FRANCHISE">Franchise</option></select>
        {form.agencyType !== 'OWN' && <div className="border rounded p-3 bg-gray-50"><input type="number" placeholder="Commission %" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} className="w-full p-2 border rounded mb-2" /><input type="email" placeholder="Email rapport" value={form.commissionEmail} onChange={e => setForm({ ...form, commissionEmail: e.target.value })} className="w-full p-2 border rounded" /></div>}
        <div className="border rounded p-3 bg-yellow-50"><label className="flex items-center gap-2"><input type="checkbox" checked={form.showStockUrgency} onChange={e => setForm({ ...form, showStockUrgency: e.target.checked })} /> Urgence stock</label></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
      </div>
      <div className="flex gap-2 mt-4"><button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button><button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button></div>
    </div></div>
  )
}

function OptionModal({ option, categories, onSave, onClose }: any) {
  const existingCatIds = option?.categories?.map((c: any) => c.categoryId) || []
  const [form, setForm] = useState({ code: option?.code || '', nameFr: option?.name?.fr || '', nameEs: option?.name?.es || '', nameEn: option?.name?.en || '', maxQuantity: option?.maxQuantity || 10, includedByDefault: option?.includedByDefault || false, imageUrl: option?.imageUrl || '', day1: option?.day1 || 0, day2: option?.day2 || 0, day3: option?.day3 || 0, day4: option?.day4 || 0, day5: option?.day5 || 0, day6: option?.day6 || 0, day7: option?.day7 || 0, day8: option?.day8 || 0, day9: option?.day9 || 0, day10: option?.day10 || 0, day11: option?.day11 || 0, day12: option?.day12 || 0, day13: option?.day13 || 0, day14: option?.day14 || 0, categoryIds: existingCatIds as string[] })
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', 'voltride'); const res = await fetch('https://api.cloudinary.com/v1_1/dis5pcnfr/image/upload', { method: 'POST', body: fd }); const data = await res.json(); setForm({ ...form, imageUrl: data.secure_url }) }
  const toggleCategory = (catId: string) => { if (form.categoryIds.includes(catId)) setForm({ ...form, categoryIds: form.categoryIds.filter(id => id !== catId) }); else setForm({ ...form, categoryIds: [...form.categoryIds, catId] }) }
  const handleSubmit = () => onSave({ code: form.code, name: { fr: form.nameFr, es: form.nameEs, en: form.nameEn }, maxQuantity: parseInt(String(form.maxQuantity)), includedByDefault: form.includedByDefault, imageUrl: form.imageUrl, day1: parseFloat(String(form.day1)), day2: parseFloat(String(form.day2)), day3: parseFloat(String(form.day3)), day4: parseFloat(String(form.day4)), day5: parseFloat(String(form.day5)), day6: parseFloat(String(form.day6)), day7: parseFloat(String(form.day7)), day8: parseFloat(String(form.day8)), day9: parseFloat(String(form.day9)), day10: parseFloat(String(form.day10)), day11: parseFloat(String(form.day11)), day12: parseFloat(String(form.day12)), day13: parseFloat(String(form.day13)), day14: parseFloat(String(form.day14)), categoryIds: form.categoryIds })
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">{option ? 'Modifier' : 'Ajouter'} Option</h3>
      <div className="space-y-3">
        <input placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom FR" value={form.nameFr} onChange={e => setForm({ ...form, nameFr: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom ES" value={form.nameEs} onChange={e => setForm({ ...form, nameEs: e.target.value })} className="w-full p-2 border rounded" />
        <input placeholder="Nom EN" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="w-full p-2 border rounded" />
        <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Qté max" value={form.maxQuantity} onChange={e => setForm({ ...form, maxQuantity: parseInt(e.target.value) || 10 })} className="p-2 border rounded" /><label className="flex items-center gap-2 p-2 border rounded"><input type="checkbox" checked={form.includedByDefault} onChange={e => setForm({ ...form, includedByDefault: e.target.checked })} /> Inclus défaut</label></div>
        <div className="border rounded p-3"><p className="text-sm font-medium mb-2">Image</p>{form.imageUrl && <img src={form.imageUrl} alt="" className="w-20 h-20 object-cover rounded mb-2" />}<input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" /></div>
        <div className="border rounded p-3"><p className="text-sm font-medium mb-2">Catégories</p><div className="grid grid-cols-2 gap-2">{categories.map((c: any) => (<label key={c.id} className={'flex items-center gap-2 p-2 border rounded cursor-pointer ' + (form.categoryIds.includes(c.id) ? 'bg-cyan-50 border-cyan-300' : '')}><input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} /><span className="text-sm">{c.name?.fr}</span></label>))}</div></div>
        <div className="border rounded p-3"><p className="text-sm font-medium mb-2">Tarifs (€)</p><div className="grid grid-cols-7 gap-1">{[1,2,3,4,5,6,7].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form['day'+d as keyof typeof form] || ''} onChange={e => setForm({ ...form, ['day'+d]: parseFloat(e.target.value) || 0 })} className="p-1 border rounded text-center text-sm" />))}</div><div className="grid grid-cols-7 gap-1 mt-1">{[8,9,10,11,12,13,14].map(d => (<input key={d} type="number" placeholder={'J'+d} value={form['day'+d as keyof typeof form] || ''} onChange={e => setForm({ ...form, ['day'+d]: parseFloat(e.target.value) || 0 })} className="p-1 border rounded text-center text-sm" />))}</div></div>
      </div>
      <div className="flex gap-2 mt-4"><button onClick={onClose} className="flex-1 py-2 bg-gray-200 rounded">Annuler</button><button onClick={handleSubmit} className="flex-1 py-2 bg-cyan-600 text-white rounded">Enregistrer</button></div>
    </div></div>
  )
}

export default App
