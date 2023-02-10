# Inertia Adapter for Hono

[Inertia.js](https://inertiajs.com) adapter for [Hono](https://honojs.dev). Only for Deno right now, coming soon to other runtimes supported by Hono (CF Workers, Bun, etc.)

## Example (in Deno)

```js
import { serve } from 'https://deno.land/std/http/mod.ts'
import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { inertia } from 'https://deno.land/x/hono_inertia/mod.ts'

const app = new Hono()

// Provide a template string
// Put '@inertia' somewhere in the body, which will be replaced by the Inertia bootstrapping frontend code
const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inertia Hono</title>
</head>
<body>
  @inertia
</body>
</html>`

// Optional function to determine Inertia version
const checkVersion = () => {
  return Deno.env.get('OPTIONAL_INERTIA_VERSION')
}

// Add Inertia middleware with applied options to global Hono middleware stack
app.use('*', inertia(template, checkVersion))

// use the 'render()' method now attached to Hono to render an Inertia page
app.get('/', (c, next) => {
  const componentName = 'HomePage'
  const payloadObject = {
    username: 'johndoe',
    email: 'jdizzle@example.com'
  }

  return c.get('inertia').render(componentName, payloadObject)
})

serve(app.fetch)
```
