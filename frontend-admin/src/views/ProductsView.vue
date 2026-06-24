<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../components/layout/AdminLayout.vue'
import ProductFormModal from '../components/products/ProductFormModal.vue'
import api from '../api/client'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const products = ref([])
const categories = ref([])
const isLoading = ref(true)
const pageError = ref('')

const modalOpen = ref(false)
const editingProduct = ref(null)
const formError = ref('')
const saving = ref(false)

const deletingId = ref(null)

const formatPrice = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const handleAuthError = (err) => {
  if (err.response?.status === 401) {
    auth.logout()
    router.push('/login')
    return true
  }
  return false
}

const loadData = async () => {
  isLoading.value = true
  pageError.value = ''
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      api.get('/admin/products'),
      api.get('/admin/categories'),
    ])
    products.value = productsRes.data
    categories.value = categoriesRes.data
  } catch (err) {
    if (!handleAuthError(err)) {
      pageError.value = 'No se pudieron cargar los productos.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)

const openCreate = () => {
  editingProduct.value = null
  formError.value = ''
  modalOpen.value = true
}

const openEdit = (product) => {
  editingProduct.value = product
  formError.value = ''
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editingProduct.value = null
  formError.value = ''
}

const saveProduct = async (form) => {
  saving.value = true
  formError.value = ''
  const payload = {
    ...form,
    basePrice: Number(form.basePrice),
    costPrice: Number(form.costPrice),
    stockPhysical: Number(form.stockPhysical),
    stockAvailable: form.stockAvailable !== '' ? Number(form.stockAvailable) : undefined,
  }

  try {
    if (editingProduct.value) {
      await api.patch(`/admin/products/${editingProduct.value.id}`, payload)
    } else {
      await api.post('/admin/products', payload)
    }
    closeModal()
    await loadData()
  } catch (err) {
    if (!handleAuthError(err)) {
      formError.value = err.response?.data?.error || 'No se pudo guardar el producto.'
    }
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (product) => {
  if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return

  deletingId.value = product.id
  try {
    await api.delete(`/admin/products/${product.id}`)
    await loadData()
  } catch (err) {
    if (!handleAuthError(err)) {
      alert(err.response?.data?.error || 'No se pudo eliminar el producto.')
    }
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <AdminLayout title="Productos" subtitle="Gestiona el catálogo de la tienda.">
    <div class="flex justify-end mb-6">
      <button
        type="button"
        class="px-5 py-2.5 rounded-nara bg-nara-sand text-white text-sm hover:bg-nara-olive transition-colors"
        @click="openCreate"
      >
        + Nuevo producto
      </button>
    </div>

    <p v-if="pageError" class="text-red-600 mb-4">{{ pageError }}</p>
    <p v-if="isLoading" class="text-nara-sand">Cargando productos…</p>

    <div
      v-else-if="products.length === 0"
      class="bg-nara-light rounded-nara border border-nara-olive/15 p-12 text-center text-nara-sand"
    >
      No hay productos. Crea el primero con el botón de arriba.
    </div>

    <div v-else class="bg-nara-light rounded-nara border border-nara-olive/15 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-nara-olive/10 text-left text-xs uppercase tracking-wider text-nara-dark/60">
            <tr>
              <th class="px-4 py-3">Producto</th>
              <th class="px-4 py-3">Categoría</th>
              <th class="px-4 py-3">Precio</th>
              <th class="px-4 py-3">Stock</th>
              <th class="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-nara-olive/10">
            <tr v-for="product in products" :key="product.id" class="hover:bg-nara-olive/5">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.images?.[0]"
                    :src="product.images[0]"
                    :alt="product.name"
                    class="w-10 h-10 rounded object-cover bg-nara-olive/10"
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded bg-nara-olive/10 flex items-center justify-center text-nara-sand text-xs"
                  >
                    —
                  </div>
                  <div>
                    <p class="font-medium text-nara-dark">{{ product.name }}</p>
                    <p class="text-xs text-nara-dark/40 font-mono">{{ product.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-nara-dark/70">{{ product.category?.name }}</td>
              <td class="px-4 py-3 text-nara-dark">{{ formatPrice(product.basePrice) }}</td>
              <td class="px-4 py-3">
                <span class="text-nara-dark">{{ product.stockAvailable }}</span>
                <span class="text-nara-dark/40"> / {{ product.stockPhysical }}</span>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="text-nara-olive hover:underline mr-4"
                  @click="openEdit(product)"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="text-red-600/70 hover:text-red-600 hover:underline disabled:opacity-40"
                  :disabled="deletingId === product.id"
                  @click="deleteProduct(product)"
                >
                  {{ deletingId === product.id ? 'Eliminando…' : 'Eliminar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ProductFormModal
      :open="modalOpen"
      :product="editingProduct"
      :categories="categories"
      :saving="saving"
      :error="formError"
      @close="closeModal"
      @save="saveProduct"
    />
  </AdminLayout>
</template>
