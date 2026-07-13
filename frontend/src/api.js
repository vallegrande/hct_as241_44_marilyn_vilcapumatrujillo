const CLIENTE_API = import.meta.env.VITE_CLIENTE_API ?? 'http://localhost:9091'
const ALQUILER_API = import.meta.env.VITE_ALQUILER_API ?? 'http://localhost:9092'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.message ?? detail
    } catch { /* respuesta sin cuerpo */ }
    throw new Error(`Error ${res.status}: ${detail}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ---------- Clientes (Maestro CRUD) ----------
export const clienteApi = {
  listar: () => request(`${CLIENTE_API}/api/v1/clientes`),
  crear: (cliente) => request(`${CLIENTE_API}/api/v1/clientes`, {
    method: 'POST',
    body: JSON.stringify(cliente)
  }),
  actualizar: (id, cliente) => request(`${CLIENTE_API}/api/v1/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cliente)
  }),
  eliminar: (id) => request(`${CLIENTE_API}/api/v1/clientes/${id}`, { method: 'DELETE' }),
  activar: (id) => request(`${CLIENTE_API}/api/v1/clientes/${id}/activar`, { method: 'PATCH' }),
  desactivar: (id) => request(`${CLIENTE_API}/api/v1/clientes/${id}/desactivar`, { method: 'PATCH' })
}

// ---------- Alquileres (Transaccional) ----------
export const alquilerApi = {
  listar: () => request(`${ALQUILER_API}/api/v1/alquileres`),
  crear: (alquiler) => request(`${ALQUILER_API}/api/v1/alquileres`, {
    method: 'POST',
    body: JSON.stringify(alquiler)
  }),
  actualizar: (id, alquiler) => request(`${ALQUILER_API}/api/v1/alquileres/${id}`, {
    method: 'PUT',
    body: JSON.stringify(alquiler)
  }),
  activar: (id) => request(`${ALQUILER_API}/api/v1/alquileres/${id}/activar`, { method: 'PATCH' }),
  anular: (id) => request(`${ALQUILER_API}/api/v1/alquileres/${id}/anular`, { method: 'PATCH' })
}
