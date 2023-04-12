import { once } from 'node:events'
import { createServer } from 'node:http'
import JWT from 'jsonwebtoken'

const DEFAULT_USER = {
  user: 'vinny-bass',
  password: '123'
}

const JWT_KEY = 'abc123'

async function loginRoute(request, response) {
  const { user, password } = JSON.parse(await once(request, 'data'))
  if (user !== DEFAULT_USER.user || password != DEFAULT_USER.password) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: 'Invalid login data' }))
    return
  }

  const token = JWT.sign({ user, message: 'signed' }, JWT_KEY)

  response.writeHead(200)
  response.end(JSON.stringify({ token }))
}

function isHeadersValid(headers) {
  try {
    const auth = headers.authorization.replace(/bearer\s/ig, '')
    JWT.verify(auth, JWT_KEY)

    return true
  } catch {
    return false
  }
}

async function handler(request, response) {
  if (request.url === '/login' && request.method === 'POST') {
    return loginRoute(request, response)
  }

  if (!isHeadersValid(request.headers)) {
    response.writeHead(400)
    return response.end(JSON.stringify({ error: 'Invalid token' }))
  }

  response.end(JSON.stringify({ result: 'Logged in' }))
}

const app = createServer(handler).listen(3000, () => console.log('Listening on localhost:3000'))

export { app }