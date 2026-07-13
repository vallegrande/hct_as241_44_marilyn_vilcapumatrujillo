import { useEffect, useState } from 'react'
import {
  CalendarPlus, Ban, CheckCircle2, XCircle, Loader2,
  ClipboardList, Save, Pencil, X, User, CalendarDays, Clock, Coins
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
  const [editandoId, setEditandoId] = useState(null)
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
    const payload = {
      clienteId: Number(form.clienteId),
      dias: Number(form.dias),
      fechaInicio: form.fechaInicio,
      precioPorDia: Number(form.precioPorDia)
    }
    try {
      if (editandoId) {
        await alquilerApi.actualizar(editandoId, payload)
        toastOk('Alquiler actualizado')
      } else {
        await alquilerApi.crear(payload)
        toastOk('Alquiler registrado')
      }
      setForm(ALQUILER_VACIO)
      setEditandoId(null)
      cargar()
    } catch (err) {
      toastError(err.message)
    }
  }

  const editar = (a) => {
    setEditandoId(a.id)
    setForm({
      clienteId: String(a.clienteId),
      dias: String(a.dias),
      fechaInicio: a.fechaInicio,
      // precioPorDia no viene en la respuesta: se deriva del total guardado
      precioPorDia: a.dias > 0 ? String((Number(a.total) / a.dias).toFixed(2)) : ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setForm(ALQUILER_VACIO)
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
      <form onSubmit={onSubmit} className="form-card">
        <header className="form-card-header">
          <h2 className="form-card-titulo">
            {editandoId
              ? <><Pencil size={18} /> Editar alquiler #{editandoId}</>
              : <><CalendarPlus size={18} /> Nuevo alquiler</>}
          </h2>
          <p className="form-card-subtitulo">
            {editandoId
              ? 'Modifica los datos del alquiler y guarda los cambios.'
              : 'Selecciona un cliente y completa los datos para registrar el alquiler.'}
          </p>
        </header>

        <div className="form-card-grid">
          <div className="campo campo-cliente">
            <label htmlFor="clienteId"><User size={14} /> Cliente</label>
            <select id="clienteId" name="clienteId" value={form.clienteId} onChange={onChange} required>
              <option value="">Seleccione un cliente…</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombres} {c.apellidos} — DNI {c.dni}</option>
              ))}
            </select>
            <small className="campo-ayuda">
              {clientes.length === 0
                ? 'No hay clientes registrados: crea uno en el módulo Clientes.'
                : `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} disponible${clientes.length !== 1 ? 's' : ''}`}
            </small>
          </div>

          <div className="campo">
            <label htmlFor="fechaInicio"><CalendarDays size={14} /> Fecha de inicio</label>
            <input id="fechaInicio" name="fechaInicio" type="date" value={form.fechaInicio} onChange={onChange} required />
          </div>

          <div className="campo">
            <label htmlFor="dias"><Clock size={14} /> Días de alquiler</label>
            <input id="dias" name="dias" type="number" min="1" placeholder="Ej. 5" value={form.dias} onChange={onChange} required />
          </div>

          <div className="campo">
            <label htmlFor="precioPorDia"><Coins size={14} /> Precio por día (S/.)</label>
            <input id="precioPorDia" name="precioPorDia" type="number" min="0" step="0.01" placeholder="Ej. 120.00" value={form.precioPorDia} onChange={onChange} required />
          </div>
        </div>

        <footer className="form-card-footer">
          <div className="total-resumen" aria-live="polite">
            <span className="total-etiqueta">Total estimado</span>
            <strong className="total-monto">S/. {total.toFixed(2)}</strong>
            {total > 0 && form.dias && (
              <span className="total-detalle">{form.dias} día{Number(form.dias) !== 1 ? 's' : ''} × S/. {(Number(form.precioPorDia) || 0).toFixed(2)}</span>
            )}
          </div>
          <div className="form-actions">
            {editandoId && (
              <button type="button" onClick={cancelarEdicion}>
                <X size={16} /> Cancelar
              </button>
            )}
            <button type="submit" className="primary">
              <Save size={16} /> {editandoId ? 'Actualizar alquiler' : 'Registrar alquiler'}
            </button>
          </div>
        </footer>
      </form>

      <h2 className="titulo-seccion"><ClipboardList size={18} /> Alquileres registrados</h2>

      {error && <p className="error"><XCircle size={16} /> {error}</p>}
      {cargando ? (
        <p className="cargando"><Loader2 size={18} className="spin" /> Cargando…</p>
      ) : (
        <div className="tabla-scroll">
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
                  <button
                    title={a.estado === 'ACTIVO' ? 'Editar' : 'Solo se puede editar un alquiler ACTIVO'}
                    className="icon-btn editar"
                    disabled={a.estado !== 'ACTIVO'}
                    onClick={() => editar(a)}
                  >
                    <Pencil size={16} />
                  </button>
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
        </div>
      )}
    </section>
  )
}
