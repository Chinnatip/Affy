import { version } from '../../package.json'
import { Router } from 'express'
import facets from './facets'
import iplocation from 'iplocation'

import MobileDetect from 'mobile-detect'
import moment from 'moment-timezone'

export default ({ config, db }) => {
  let api = Router()

  // mount the facets resource
  api.use('/facets', facets({ config, db }))

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version })
  })

  api.get('/dir/:where', (req, res) => {
    const deviceDetect = new MobileDetect(req.headers['user-agent'])
    const publicIP = req.headers['x-forwarded-for']
    iplocation(publicIP)
      .then(ipResponse => {
        const result = {
          timeStampUTC: moment(),
          timeStampTHAI: moment()
            .tz('Asia/Bangkok')
            .format(),
          iplocation: ipResponse,
          device: deviceDetect
        }
        console.log('** ACTION ** | ' + result)
        console.log(
          '** ACTION ** | ' +
            'Redirect to http://www.' +
            req.params.where +
            '.com'
        )
        res.redirect('http://www.' + req.params.where + '.com')
      })
      .catch(err => {
        res.json(err)
      })
  })
  api.get('/ip', (req, res) => {
    const deviceDetect = new MobileDetect(req.headers['user-agent'])
    const publicIP = req.headers['x-forwarded-for']
    iplocation(publicIP)
      .then(ipResponse => {
        res.json({
          timeStampUTC: moment(),
          timeStampTHAI: moment()
            .tz('Asia/Bangkok')
            .format(),
          iplocation: ipResponse,
          device: deviceDetect
        })
      })
      .catch(err => {
        res.json(err)
      })
  })

  return api
}
