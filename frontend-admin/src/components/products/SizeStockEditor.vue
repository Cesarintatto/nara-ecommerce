<script setup>
// Editor de tallas y stock por talla de un producto.
// v-model: { mode: 'tallas' | 'unica', rows: [{ key, id, size, stockPhysical, reserved }] }
//  - 'unica': una sola talla "Única" (prendas de talla única)
//  - 'tallas': varias tallas, cada una con su stock físico
// "reserved" son prendas apartadas en pagos en curso (solo informativo).
import { computed, nextTick } from 'vue'

const ONE_SIZE = 'Única'
const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const NUMBER_SIZES = ['4', '6', '8', '10', '12', '14', '16', '18']

const model = defineModel({ type: Object, required: true })

// Referencias a los campos (no reactivas: guardarlas en un ref re-renderiza en bucle)
const fieldRefs = new Map()
let keySeq = 0
const newKey = () => `n${Date.now()}-${keySeq++}`

const sizeRows = computed(() => model.value.rows.filter((r) => r.size !== ONE_SIZE))
const oneSizeRow = computed(() => model.value.rows.find((r) => r.size === ONE_SIZE))

const total = computed(() =>
  (model.value.mode === 'unica' ? [oneSizeRow.value] : sizeRows.value)
    .filter(Boolean)
    .reduce((sum, r) => sum + (Number(r.stockPhysical) || 0), 0),
)

const hasSize = (size) => sizeRows.value.some((r) => r.size.trim().toLowerCase() === size.toLowerCase())

const setMode = (mode) => {
  model.value.mode = mode
  if (mode === 'unica' && !oneSizeRow.value) {
    model.value.rows.push({ key: newKey(), id: null, size: ONE_SIZE, stockPhysical: '0', reserved: 0 })
  }
}

const addSize = async (size = '') => {
  if (size && hasSize(size)) return
  model.value.rows.push({ key: newKey(), id: null, size, stockPhysical: '0', reserved: 0 })
  const row = model.value.rows[model.value.rows.length - 1]
  await nextTick()
  // Enfoca el campo recién creado: el nombre si es una talla libre, si no el stock
  fieldRefs.get(`${row.key}:${size ? 'stock' : 'size'}`)?.focus()
}

const removeRow = (row) => {
  model.value.rows = model.value.rows.filter((r) => r.key !== row.key)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <span class="block text-xs uppercase tracking-wider text-nara-dark/70">Tallas y stock</span>
      <span class="text-xs text-nara-dark/50">Total: {{ total }} prenda{{ total !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Tipo de tallaje -->
    <div class="inline-flex rounded-nara border border-nara-olive/30 p-1 mb-3" role="radiogroup" aria-label="Tipo de talla">
      <button
        type="button"
        role="radio"
        :aria-checked="model.mode === 'tallas'"
        :class="['px-3 py-1.5 rounded-lg text-xs transition-colors', model.mode === 'tallas' ? 'bg-nara-dark text-white' : 'text-nara-dark/70 hover:bg-nara-olive/10']"
        @click="setMode('tallas')"
      >
        Varias tallas
      </button>
      <button
        type="button"
        role="radio"
        :aria-checked="model.mode === 'unica'"
        :class="['px-3 py-1.5 rounded-lg text-xs transition-colors', model.mode === 'unica' ? 'bg-nara-dark text-white' : 'text-nara-dark/70 hover:bg-nara-olive/10']"
        @click="setMode('unica')"
      >
        Talla única
      </button>
    </div>

    <!-- Talla única -->
    <div v-if="model.mode === 'unica' && oneSizeRow" class="flex items-center gap-3">
      <label class="flex-1 text-sm text-nara-dark/80" :for="`stock-${oneSizeRow.key}`">Stock (talla única)</label>
      <input
        :id="`stock-${oneSizeRow.key}`"
        v-model="oneSizeRow.stockPhysical"
        type="number"
        min="0"
        step="1"
        required
        class="w-28 px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40"
      />
      <span v-if="oneSizeRow.reserved > 0" class="text-xs text-amber-700">{{ oneSizeRow.reserved }} apartada(s)</span>
    </div>

    <!-- Varias tallas -->
    <div v-else>
      <div class="flex flex-wrap gap-1.5 mb-3">
        <button
          v-for="size in [...LETTER_SIZES, ...NUMBER_SIZES]"
          :key="size"
          type="button"
          :disabled="hasSize(size)"
          class="min-w-[2.25rem] px-2 py-1 rounded-lg border border-nara-olive/30 text-xs text-nara-dark/80 hover:bg-nara-olive/10 disabled:opacity-30 disabled:cursor-not-allowed"
          @click="addSize(size)"
        >
          + {{ size }}
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded-lg border border-dashed border-nara-olive/50 text-xs text-nara-dark/70 hover:bg-nara-olive/10"
          @click="addSize('')"
        >
          + Otra
        </button>
      </div>

      <p v-if="sizeRows.length === 0" class="text-sm text-nara-dark/50">
        Agrega las tallas en las que viene esta prenda con los botones de arriba.
      </p>

      <ul v-else class="space-y-2">
        <li
          v-for="row in sizeRows"
          :key="row.key"
          class="flex items-center gap-2"
        >
          <input
            :ref="(el) => fieldRefs.set(`${row.key}:size`, el)"
            v-model="row.size"
            type="text"
            required
            maxlength="20"
            placeholder="Talla"
            aria-label="Talla"
            class="w-24 px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40 text-sm font-semibold"
          />
          <input
            :ref="(el) => fieldRefs.set(`${row.key}:stock`, el)"
            v-model="row.stockPhysical"
            type="number"
            min="0"
            step="1"
            required
            :aria-label="`Stock talla ${row.size}`"
            class="w-24 px-3 py-2 rounded-nara border border-nara-olive/30 focus:outline-none focus:ring-2 focus:ring-nara-olive/40 text-sm"
          />
          <span class="flex-1 text-xs text-nara-dark/50">
            unidades
            <span v-if="row.reserved > 0" class="text-amber-700">· {{ row.reserved }} apartada(s)</span>
          </span>
          <button
            type="button"
            class="text-xs text-red-600/70 hover:text-red-600 hover:underline"
            :aria-label="`Quitar talla ${row.size}`"
            @click="removeRow(row)"
          >
            Quitar
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
