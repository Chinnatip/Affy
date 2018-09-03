// IMPORT MODULE
// import { version } from '../../package.json'
import { Router } from 'express'
import { linkRouter } from '../assets/linkRouter'
import iplocation from 'iplocation'
import MobileDetect from 'mobile-detect'
import moment from 'moment-timezone'
import serviceAccount from '../assets/serviceAccountFirebase.json'
import admin from 'firebase-admin'

// FIREBASE SETUP
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://affy-53797.firebaseio.com'
})
const affyDB = admin.firestore()

// API BOILERPLATE
export default ({ config, db }) => {
  let api = Router()

  const parseURL = request => {
    let result = 'http://notfound.org/'
    linkRouter.forEach(({ id, url }) => {
      if (id == request) {
        result = url
      }
    })
    return result
  }

  const logger = (result, path) => {
    console.log('Gogogogogogogog >>>>')
    console.log(result)
    console.log('** ACTION ** | ' + 'Redirect to ' + path)
  }

  const resultParser = (ip, device) => {
    return {
      timeStampUTC: moment(),
      timeStampTHAI: moment()
        .tz('Asia/Bangkok')
        .format(),
      iplocation: ip,
      device: device
    }
  }

  //// API ////
  // api.use('/facets', facets({ config, db }))
  api.get('/', (req, res) => {
    let result = []
    affyDB
      .collection('sampleAffiliate')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          result.push(doc.data())
        })
        res.json(result)
      })
      .catch(err => {
        console.log('Error getting documents', err)
      })
  })
  //
  api.get('/dir/:where', (req, res) => {
    const device = new MobileDetect(req.headers['user-agent'])
    const tokens = req.params.where
    const openIP = req.headers['x-forwarded-for']
    iplocation(openIP)
      .then(response => {
        const result = resultParser(response, device)
        const path = parseURL(tokens)
        const timeNow = Date.now()
        const sessionReq = affyDB
          .collection('sampleAffiliate')
          .doc('session-' + timeNow.toString())
        sessionReq.set({
          affIP: result.iplocation,
          affTimestamp: timeNow.toString(),
          affDevice: result.device.ua,
          affPath: {
            track: tokens,
            path: path
          }
        })
        logger(result, path)
        res.redirect(path)
      })
      .catch(err => {
        res.json(err)
      })
  })
  return api
}
