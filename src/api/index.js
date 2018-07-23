import { version } from '../../package.json'
import { Router } from 'express'
import facets from './facets'
import iplocation from 'iplocation'
// import publicIp from 'public-ip'
import http from 'http'
import MobileDetect from 'mobile-detect'

export default ({ config, db }) => {
  let api = Router()

  // mount the facets resource
  api.use('/facets', facets({ config, db }))

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version })
  })

  api.get('/myip', (req, res) => {
    const deviceDetect = new MobileDetect(req.headers['user-agent'])
    // const publicIP = req.headers['x-forwarded-for']
    http.get('http://bot.whatismyipaddress.com', function(request) {
      request.setEncoding('utf8')
      request.on('data', function(ipAddress) {
        iplocation(ipAddress)
          .then(ipResponse => {
            res.json({
              iplocation: ipResponse,
              device: deviceDetect
            })
          })
          .catch(err => {
            res.json(err)
          })
      })
    })
  })

  api.get('/ip', (req, res) => {
    const deviceDetect = new MobileDetect(req.headers['user-agent'])
    const publicIP = req.headers['x-forwarded-for']
    res.json({
      iplocation: publicIP
    })
    // http.get('http://bot.whatismyipaddress.com', function(request) {
    //   request.setEncoding('utf8')
    //   request.on('data', function(ipAddress) {
    //     iplocation(ipAddress)
    //       .then(ipResponse => {
    //         res.json({
    //           iplocation: ipResponse,
    //           device: deviceDetect
    //         })
    //       })
    //       .catch(err => {
    //         res.json(err)
    //       })
    //   })
    // })
  })

  return api
}
