import { describe, before, after, it } from 'node:test'
import { deepStrictEqual, ok, strictEqual } from 'node:assert'

const BASE_URL = 'http://localhost:3000'
describe('API Workflow', () => {
  let _server = {}
  let _globalToken = ''

  before(async () => {
    _server = (await import('./api.js')).app
    await new Promise(resolve => _server.once('listening', resolve))
  })

  after(done => _server.close(done))

  it('should receive not authorized given wrong user and password', async () => {
    const data = {
      user: 'vinny-bass',
      password: ''
    }

    const request = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    strictEqual(request.status, 401)
    const response = await request.json()
    deepStrictEqual(response, { error: 'Invalid login data' })
  })

  it('should return 200 and a token when user and password are correct', async () => {
    const data = {
      user: 'vinny-bass',
      password: '123'
    }

    const request = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    strictEqual(request.status, 200)
    const response = await request.json()
    ok(response.token, 'Invalid token')
    _globalToken = response.token
  })

  it('should not be able to access data without a valid token', async () => {
    const request = await fetch(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        authorization: ''
      }
    })
    strictEqual(request.status, 400)
    const response = await request.json()
    deepStrictEqual(response, { error: 'Invalid token' })
  })

  it('should be able to access data with a valid token', async () => {
    const request = await fetch(`${BASE_URL}`, {
      method: 'GET',
      headers: {
        authorization: _globalToken
      }
    })
    strictEqual(request.status, 200)
    const response = await request.json()
    deepStrictEqual(response, { result: 'Logged in' })
  })

})