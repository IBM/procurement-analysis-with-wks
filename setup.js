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

<<<<<<< HEAD

=======
var GDS = require('ibm-graph-client');
>>>>>>> origin/master

console.log("Calling setup script");
console.log('process.env.VCAP_SERVICES:'+process.env.APP_SERVICES)


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

var gremlin = require('./data/gremlin.json');

<<<<<<< HEAD
graphClient.runGremlinQuery(graphId, gremlin.gremlin.join('\n'))
.then((res) => {
    console.log("Response:"+res);
}).catch(function(rej) {
    console.log("Error executing the gramlin query.."+rej);
=======
// Set Schema
graph.session(function (err, token) {
  if (err) {
    console.log('Error: ' + err);
  } else {
    graph.config.session = token;

    const util = require('util');
    console.log('graph: ');
    console.log(util.inspect(graph, false, null));
      
    console.log("Print the existing Schema");

    graph.schema().get(function (error, body) {
      console.log(JSON.stringify(body));
    });
    console.log("Set updated schema");
    var schema = require('./data/schema.json');
    graph.schema().set(schema, function (error, body) {
      if (error) {
        console.log('Error:', error);
        console.log(body);
      } else {
        console.log(body.result.data);
      }
      console.log("Creating the Bootgraph Data");
      graph.gremlin(gremlin.gremlin.join('\n'), function (e, b) {
        if (e) {
          console.log("Error:",e);
        }
        console.log("Response:",b);
      });
    });
  }

>>>>>>> origin/master
});
