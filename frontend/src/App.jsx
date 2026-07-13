import { useState } from 'react'
import { Car, Users, ClipboardList } from 'lucide-react'
import Clientes from './components/Clientes.jsx'
import Alquileres from './components/Alquileres.jsx'

export default function App() {
  const [tab, setTab] = useState('clientes')

  return (
    <div className="app">
      <header>
        <h1><Car size={28} /> Alquiler de Vehículos</h1>
        <p className="subtitle">Hackathon AS241S5 — Vilcapuma Marilyn</p>
        <nav>
          <button
            className={tab === 'clientes' ? 'active' : ''}
            onClick={() => setTab('clientes')}
          >
            <Users size={16} /> Clientes (CRUD)
          </button>
          <button
            className={tab === 'alquileres' ? 'active' : ''}
            onClick={() => setTab('alquileres')}
          >
            <ClipboardList size={16} /> Alquileres (Transacción)
          </button>
        </nav>
      </header>
      <main>
        {tab === 'clientes' ? <Clientes /> : <Alquileres />}
      </main>
    </div>
  )
}
