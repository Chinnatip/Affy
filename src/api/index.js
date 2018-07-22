import { version } from '../../package.json'
import { Router } from 'express'
import facets from './facets'
import ip from 'ip'
import iplocation from 'iplocation'

export default ({ config, db }) => {
  let api = Router()

  // mount the facets resource
  api.use('/facets', facets({ config, db }))

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version })
  })

  api.get('/mirror', (req, res) => {
    // const ipAddress = ip.address()
    var ipAddress =
      req.headers['X-Forwarded-For'] || req.connection.remoteAddress
    res.json(ipAddress)
    // iplocation('56.70.97.8')
    // iplocation(ipAddress)
    //   .then(ipResponse => {
    //     res.json(ipResponse)
    //   })
    //   .catch(err => {
    //     res.json(err)
    //   })
  })

  return api
}
