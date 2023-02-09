import { MiddlewareHandler } from "https://deno.land/x/hono@v2.7.6/types.ts"
import { encode } from "https://cdn.skypack.dev/html-entities@2.3.2"

function processTemplate(template: string, jsonPayload: Record<string, unknown>, ssrString? : string | null) {
  const parsedTemplate = template.replace(
    '@inertia', 
    /*html*/`<div id="app" data-page='${encode(JSON.stringify(jsonPayload))}'>${ ssrString || '' }</div>`
  )

  return parsedTemplate
}

export const inertia = (template: string, checkVersion: () => string): MiddlewareHandler => {
  return async (c, next) => {
    let version: string = await checkVersion.call(undefined) ?? 'default'
    let shared: Record<string, unknown>

    c.set('inertia', {
      setShared(payload: Record<string, unknown>) {
        shared = payload
      },

      render(component: string, payload: Record<string, unknown>, ssrString?: string) {
        const inertiaObject = {
          component,
          props: { ...shared, ...payload },
          url: new URL(c.req.url).pathname,
          version: c.req.headers.get('X-Inertia-Version') || version
        }

        if (
          c.req.headers.has('X-Inertia')
          && c.req.headers.has('X-Inertia-Version')
          && version === c.req.headers.get('X-Inertia-Version')
        ) {
          c.header('Vary', 'Accept')
          c.header('X-Inertia', 'true')
          return c.json(inertiaObject)
        } else {
          if (
            c.req.headers.has('X-Inertia-Version')
            && version !== c.req.headers.get('X-Inertia-Version')
          ) {
            c.header('X-Inertia-Location', inertiaObject.url)
            c.status(409)
            return c.body(null)
          } else {
            return c.html(processTemplate(template, inertiaObject, ssrString || null)) 
          }
        }
      }
    })

    await next()
  }
}