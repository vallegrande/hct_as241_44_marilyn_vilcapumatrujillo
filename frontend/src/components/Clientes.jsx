import { useEffect, useState } from 'react'
import {
  UserPlus, Pencil, Trash2, Ban, CheckCircle2, XCircle,
  Save, X, Loader2, Users, Search, User, CreditCard, Mail, Phone, Car
} from 'lucide-react'
import { clienteApi } from '../api.js'
import { toastOk, toastError, confirmar } from '../alerts.js'

const CLIENTE_VACIO = {
  nombres: '', apellidos: '', dni: '', correo: '', celular: '', licencia: ''
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(CLIENTE_VACIO)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    setCargando(true)
    clienteApi.listar()
      .then(data => { setClientes(data); setError(null) })
      .catch(e => setError(e.message))
      .finally(() => setCargando(false))
  }

  useEffect(cargar, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editandoId) {
        await clienteApi.actualizar(editandoId, form)
        toastOk('Cliente actualizado')
      } else {
        await clienteApi.crear(form)
        toastOk('Cliente registrado')
      }
      setForm(CLIENTE_VACIO)
      setEditandoId(null)
      cargar()
    } catch (err) {
      toastError(err.message)
    }
  }

  const editar = (c) => {
    setEditandoId(c.id)
    setForm({
      nombres: c.nombres, apellidos: c.apellidos, dni: c.dni,
      correo: c.correo, celular: c.celular, licencia: c.licencia
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setForm(CLIENTE_VACIO)
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

  const eliminarCliente = async (c) => {
    const ok = await confirmar({
      titulo: '¿Eliminar cliente?',
      texto: `Se eliminará a ${c.nombres} ${c.apellidos} (DNI ${c.dni}). Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      variante: 'peligro'
    })
    if (ok) accion(() => clienteApi.eliminar(c.id), 'Cliente eliminado')
  }

  const desactivarCliente = async (c) => {
    const ok = await confirmar({
      titulo: '¿Desactivar cliente?',
      texto: `${c.nombres} ${c.apellidos} pasará a estado INACTIVO.`,
      confirmText: 'Sí, desactivar'
    })
    if (ok) accion(() => clienteApi.desactivar(c.id), 'Cliente desactivado')
  }

  const filtrados = clientes.filter(c => {
    const q = busqueda.toLowerCase()
    return `${c.nombres} ${c.apellidos} ${c.dni} ${c.correo}`.toLowerCase().includes(q)
  })

  return (
    <section>
      <form onSubmit={onSubmit} className="form-card">
        <header className="form-card-header">
          <h2 className="form-card-titulo">
            {editandoId
              ? <><Pencil size={18} /> Editar cliente #{editandoId}</>
              : <><UserPlus size={18} /> Nuevo cliente</>}
          </h2>
          <p className="form-card-subtitulo">
            {editandoId
              ? 'Modifica los datos del cliente y guarda los cambios.'
              : 'Completa los datos personales y de contacto para registrar al cliente.'}
          </p>
        </header>

        <div className="form-card-grid">
          <div className="campo">
            <label htmlFor="nombres"><User size={14} /> Nombres</label>
            <input id="nombres" name="nombres" placeholder="Ej. María Fernanda" value={form.nombres} onChange={onChange} required />
          </div>
          <div className="campo">
            <label htmlFor="apellidos"><User size={14} /> Apellidos</label>
            <input id="apellidos" name="apellidos" placeholder="Ej. Vilcapuma Trujillo" value={form.apellidos} onChange={onChange} required />
          </div>
          <div className="campo">
            <label htmlFor="dni"><CreditCard size={14} /> DNI</label>
            <input id="dni" name="dni" placeholder="8 dígitos" value={form.dni} onChange={onChange} required maxLength="8" />
          </div>
          <div className="campo">
            <label htmlFor="correo"><Mail size={14} /> Correo electrónico</label>
            <input id="correo" name="correo" type="email" placeholder="Ej. cliente@correo.com" value={form.correo} onChange={onChange} required />
          </div>
          <div className="campo">
            <label htmlFor="celular"><Phone size={14} /> Celular</label>
            <input id="celular" name="celular" placeholder="Ej. 987654321" value={form.celular} onChange={onChange} required />
          </div>
          <div className="campo">
            <label htmlFor="licencia"><Car size={14} /> Licencia de conducir</label>
            <input id="licencia" name="licencia" placeholder="Ej. Q12345678" value={form.licencia} onChange={onChange} required />
          </div>
        </div>

        <footer className="form-card-footer">
          <div className="form-actions">
            {editandoId && (
              <button type="button" onClick={cancelarEdicion}>
                <X size={16} /> Cancelar
              </button>
            )}
            <button type="submit" className="primary">
              <Save size={16} /> {editandoId ? 'Actualizar cliente' : 'Registrar cliente'}
            </button>
          </div>
        </footer>
      </form>

      <div className="toolbar">
        <h2 className="titulo-seccion"><Users size={18} /> Clientes registrados</h2>
        <div className="buscador">
          <Search size={16} />
          <input
            placeholder="Buscar por nombre, DNI o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error"><XCircle size={16} /> {error}</p>}
      {cargando ? (
        <p className="cargando"><Loader2 size={18} className="spin" /> Cargando…</p>
      ) : (
        <div className="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>DNI</th><th>Nombres</th><th>Apellidos</th>
              <th>Celular</th><th>Correo</th><th>Licencia</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan="9" className="vacio">No hay clientes que mostrar</td></tr>
            )}
            {filtrados.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.dni}</td>
                <td>{c.nombres}</td>
                <td>{c.apellidos}</td>
                <td>{c.celular}</td>
                <td>{c.correo}</td>
                <td>{c.licencia}</td>
                <td>
                  <span className={c.estado === 'ACTIVO' ? 'badge ok' : 'badge off'}>
                    {c.estado === 'ACTIVO' ? <CheckCircle2 size={12} /> : <Ban size={12} />}
                    {c.estado}
                  </span>
                </td>
                <td className="acciones">
                  <button title="Editar" className="icon-btn editar" onClick={() => editar(c)}>
                    <Pencil size={16} />
                  </button>
                  {c.estado === 'ACTIVO'
                    ? (
                      <button title="Desactivar" className="icon-btn desactivar" onClick={() => desactivarCliente(c)}>
                        <Ban size={16} />
                      </button>
                    ) : (
                      <button title="Activar" className="icon-btn activar" onClick={() => accion(() => clienteApi.activar(c.id), 'Cliente activado')}>
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  <button title="Eliminar" className="icon-btn eliminar" onClick={() => eliminarCliente(c)}>
                    <Trash2 size={16} />
                  </button>
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
