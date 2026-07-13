import Swal from 'sweetalert2'

// Toast pequeño en la esquina superior derecha, con estilo propio
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2600,
  timerProgressBar: true,
  showClass: { popup: 'toast-entrar' },
  hideClass: { popup: 'toast-salir' },
  customClass: {
    popup: 'app-toast',
    title: 'app-toast-titulo',
    timerProgressBar: 'app-toast-barra'
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

export const toastOk = (titulo) =>
  Toast.fire({ icon: 'success', title: titulo, customClass: { popup: 'app-toast toast-ok' } })

export const toastError = (titulo) =>
  Toast.fire({ icon: 'error', title: titulo, customClass: { popup: 'app-toast toast-error' } })

// Diálogo de confirmación con estilo de la app; resuelve true si el usuario acepta.
// variante: 'normal' (azul) | 'peligro' (rojo, para eliminaciones)
export const confirmar = async ({ titulo, texto, confirmText = 'Sí, continuar', icon = 'warning', variante = 'normal' }) => {
  const esPeligro = variante === 'peligro'
  const res = await Swal.fire({
    title: titulo,
    text: texto,
    icon,
    iconColor: esPeligro ? '#dc2626' : '#f59e0b',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    backdrop: 'rgba(15, 23, 42, .55)',
    showClass: { popup: 'dialogo-entrar' },
    hideClass: { popup: 'dialogo-salir' },
    customClass: {
      popup: esPeligro ? 'app-dialogo app-dialogo-peligro' : 'app-dialogo',
      title: 'app-dialogo-titulo',
      htmlContainer: 'app-dialogo-texto',
      actions: 'app-dialogo-acciones',
      confirmButton: esPeligro ? 'app-btn app-btn-peligro' : 'app-btn app-btn-confirmar',
      cancelButton: 'app-btn app-btn-cancelar'
    }
  })
  return res.isConfirmed
}
