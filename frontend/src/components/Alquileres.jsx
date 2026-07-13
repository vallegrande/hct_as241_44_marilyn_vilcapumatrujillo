import { useEffect, useState } from 'react'
import {
  CalendarPlus, Ban, CheckCircle2, XCircle, Loader2,
  ClipboardList, Save
} from 'lucide-react'
import { alquilerApi, clienteApi } from '../api.js'
import { toastOk, toastError, confirmar } from '../alerts.js'

const ALQUILER_VACIO = {
  clienteId: '', dias: '', fechaInicio: '', precioPorDia: ''
}

export default function Alquileres() {
  const [alquileres, setAlquileres] = useState([])
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(ALQUILER_VACIO)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    setCargando(true)
    Promise.all([alquilerApi.listar(), clienteApi.listar()])
      .then(([a, c]) => { setAlquileres(a); setClientes(c); setError(null) })
      .catch(e => setError(e.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const total = (Number(form.dias) || 0) * (Number(form.precioPorDia) || 0)

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await alquilerApi.crear({
        clienteId: Number(form.clienteId),
        dias: Number(form.dias),
        fechaInicio: form.fechaInicio,
        precioPorDia: Number(form.precioPorDia)
      })
      toastOk('Alquiler registrado')
      setForm(ALQUILER_VACIO)
      cargar()
    } catch (err) {
      toastError(err.message)
    }
  }

  const accion = async (fn, mensajeOk) => {
    try {
      await fn()
      toastOk(mensajeOk)
      cargar()
    } catch (err) {
      toastError(err.message)
    }
  }

  const anularAlquiler = async (a) => {
    const ok = await confirmar({
      titulo: '¿Anular alquiler?',
      texto: `Se anulará el alquiler #${a.id} de ${nombreCliente(a.clienteId)} por S/. ${Number(a.total).toFixed(2)}.`,
      confirmText: 'Sí, anular'
    })
    if (ok) accion(() => alquilerApi.anular(a.id), 'Alquiler anulado')
  }

  const nombreCliente = (id) => {
    const c = clientes.find(c => c.id === id)
    return c ? `${c.nombres} ${c.apellidos}` : `#${id}`
  }

  return (
    <section>
      <h2 className="titulo-seccion"><CalendarPlus size={18} /> Nuevo alquiler</h2>
      <form onSubmit={onSubmit} className="grid-form">
        <select name="clienteId" value={form.clienteId} onChange={onChange} required>
          <option value="">— Cliente —</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} (DNI {c.dni})</option>
          ))}
        </select>
        <input name="dias" type="number" min="1" placeholder="Días" value={form.dias} onChange={onChange} required />
        <input name="fechaInicio" type="date" value={form.fechaInicio} onChange={onChange} required />
        <input name="precioPorDia" type="number" min="0" step="0.01" placeholder="Precio por día (S/.)" value={form.precioPorDia} onChange={onChange} required />
        <div className="form-actions">
          <button type="submit" className="primary">
            <Save size={16} /> Registrar alquiler
          </button>
          {total > 0 && (
            <span className="total-preview">Total estimado: <strong>S/. {total.toFixed(2)}</strong></span>
          )}
        </div>
      </form>

      <h2 className="titulo-seccion"><ClipboardList size={18} /> Alquileres registrados</h2>

      {error && <p className="error"><XCircle size={16} /> {error}</p>}
      {cargando ? (
        <p className="cargando"><Loader2 size={18} className="spin" /> Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Días</th>
              <th>Inicio</th><th>Fin</th><th>Total (S/.)</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alquileres.length === 0 && (
              <tr><td colSpan="8" className="vacio">No hay alquileres registrados</td></tr>
            )}
            {alquileres.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{nombreCliente(a.clienteId)}</td>
                <td>{a.dias}</td>
                <td>{a.fechaInicio}</td>
                <td>{a.fechaFin}</td>
                <td>{Number(a.total).toFixed(2)}</td>
                <td>
                  <span className={a.estado === 'ACTIVO' ? 'badge ok' : 'badge off'}>
                    {a.estado === 'ACTIVO' ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                    {a.estado}
                  </span>
                </td>
                <td className="acciones">
                  {a.estado === 'ACTIVO'
                    ? (
                      <button title="Anular" className="icon-btn desactivar" onClick={() => anularAlquiler(a)}>
                        <Ban size={16} />
                      </button>
                    ) : (
                      <button title="Activar" className="icon-btn activar" onClick={() => accion(() => alquilerApi.activar(a.id), 'Alquiler activado')}>
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
