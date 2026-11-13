// Subir/bajar un elemento de una lista y guardar el nuevo orden en la API.
import api, { errorMessage } from '../api/client'
import { notify } from '../stores/toast'

export function useReorder(itemsRef, endpoint) {
  return async function move(index, dir) {
    const list = [...itemsRef.value]
    const j = index + dir
    if (j < 0 || j >= list.length) return
    const previous = itemsRef.value
    ;[list[index], list[j]] = [list[j], list[index]]
    itemsRef.value = list // optimista
    try {
      await api.patch(`${endpoint}/order`, { ids: list.map((x) => x.id) })
    } catch (err) {
      itemsRef.value = previous
      notify(errorMessage(err, 'No se pudo guardar el orden.'), 'error')
    }
  }
}
