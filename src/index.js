import path from 'path'
import fs from 'fs'

var DANDELION = require('dandelion-api');

//import DANDELION from 'dandelion-api'

let configFile = null
let botPress = null;

var Dandelion = new DANDELION.Dandelion()

/*
  Save config to File

*   @param {string} file - the file path
*/

const saveConfig = (config) => {
  fs.writeFileSync(configFile, JSON.stringify(config))
}


/**
 * Load config from given file path
 *
 * If the file doesn't exist,
 * then it will write default one into the given file path
 *
 * @param {string} file - the file path
 * @return {Object} config object
 */

const loadConfig = () => {
  if (!fs.existsSync(configFile)) {
    const config = { accessToken : '' }
    saveConfig(config, configFile)
  }

  return Object.assign(JSON.parse(fs.readFileSync(configFile, 'utf-8')))
}



/**/
const incomingMiddleware = (event, next) => {
  if (event.type === 'message') {
    Dandelion.getEntities({'text': event.text})
    .then(function(data){
      event.dandelion = { entities: data.body.annotations }
      next()
    })
  } else {
    next()
  }
}
/**/

module.exports = {
  init: function(bp) {

    botPress = bp;
    configFile = path.join(bp.projectLocation, bp.botfile.modulesConfigDir, 'botpress-dandelion.json')

    const config = loadConfig();

    //Initialize the API
    Dandelion.setToken(config.accessToken);

    bp.middlewares.register({
      name: 'dandelion.incoming',
      module: 'botpress-dandelion',
      type: 'incoming',
      handler: incomingMiddleware,
      order: 10,
      description: 'Understands entities from incoming message and suggests or executes actions.'
    })
  },

  ready: function(bp) {
  	const router = bp.getRouter('botpress-dandelion')

    router.get('/config', (req, res) => {
      res.send(loadConfig())
    })

    router.post('/config', (req, res) => {
      const { accessToken } = req.body
      saveConfig({ accessToken })
      res.sendStatus(200)
    })
  }
}
