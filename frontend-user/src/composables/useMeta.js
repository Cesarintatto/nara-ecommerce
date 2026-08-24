import { watchEffect } from 'vue'

export const SITE_NAME = 'NARA'
export const DEFAULT_DESCRIPTION =
  'NARA — Tu cuerpo, tu ritmo, tu estilo. Moda diseñada para acompañar tu día a día.'

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sincroniza title/description/OG/canonical con el DOM en cada cambio reactivo.
 * getMeta debe leer refs reactivas (product.value, etc.) para que watchEffect
 * vuelva a ejecutarse cuando cambien.
 */
export function useMeta(getMeta) {
  watchEffect(() => {
    const { title, description = DEFAULT_DESCRIPTION, image, path = '' } = getMeta()
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME

    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    if (image) upsertMeta('property', 'og:image', image)

    const canonicalUrl = `${window.location.origin}${path}`
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertLink('canonical', canonicalUrl)
  })
}
