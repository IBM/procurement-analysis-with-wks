'use strict';

/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('dotenv').load({ silent: true });
const JanusGraphClient = require('./JanusGraphClient');
let graphId = "procurementsystem"



console.log("Calling setup script");
var config ;
// Set config
if (process.env.APP_SERVICES) {
  var vcapServices = JSON.parse(process.env.APP_SERVICES);
  var graphService = 'compose-for-janusgraph';
  if (vcapServices[graphService] && vcapServices[graphService].length > 0) {
    config = vcapServices[graphService][0];
  }
  else {
    console.log('process.env.VCAP_SERVICES:'+process.env.APP_SERVICES)
  }
}
if (process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  var graphServiceName = 'compose-for-janusgraph';
  if (vcapServices[graphServiceName] && vcapServices[graphServiceName].length > 0) {
    config = vcapServices[graphServiceName][0];
  }
}

// Add the graph
let graphClient = new JanusGraphClient(
    config.credentials.apiURL,
    config.credentials.username,
    config.credentials.password
);

var gremlin =  require('./data/gremlin.json');

graphClient.runGremlinQuery(graphId, gremlin.gremlin.join('\n'))
.then((res) => {
    console.log("Response:"+res);
}).catch(function(rej) {
    console.log("Error executing the gramlin query.."+rej);
});
