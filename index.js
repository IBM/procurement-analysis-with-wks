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

// Load env
require('dotenv').load();

// Necessary Libs
var cfenv     = require('cfenv');
var Hapi      = require('hapi');
var Path      = require('path');
var traversal = require('./assets/traversal');
var syncservice = require('./discoveryServiceHelper');
const JanusGraphClient = require('./JanusGraphClient');
let graphId = "procurementsystem"


// Handle Configs
var appEnv = cfenv.getAppEnv();

// Set config
if (process.env.APP_SERVICES) {
  var vcapServices = JSON.parse(process.env.APP_SERVICES);
  var graphService = 'compose-for-janusgraph';
  if (vcapServices[graphService] && vcapServices[graphService].length > 0) {
    var config = vcapServices[graphService][0];
  }

}
if (process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  var graphServiceName = 'compose-for-janusgraph';
  if (vcapServices[graphServiceName] && vcapServices[graphServiceName].length > 0) {
    var config = vcapServices[graphServiceName][0];
  }
}




let graphClient = new JanusGraphClient(

    config.credentials.apiURL || process.env.service_url,
    config.credentials.username || process.env.service_username,
    config.credentials.password || process.env.service_password
);


var server = new Hapi.Server({
  debug: {
    request: ['error', 'good'],
  },
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, ''),
      },
    },
  },
});

// Set Hapi Connections
server.connection({
  host: appEnv.bind || process.env.HOST || 'localhost',
  port: appEnv.port || process.env.PORT || 3000,
});

// Hapi Log
server.log(['error', 'database', 'read']);

server.views({
  engines: { jade: require('pug') },
  path: __dirname + '/templates',
});

// Static
server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true,
    },
  },
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    reply.view('index');
  },
});

var gremlinQuery = function (request, reply) {

  var querytype = (request.params.querytype) ? request.params.querytype : 'scheduled_maintenance';
  var queryPath;
  switch (querytype) {
    case 'scheduled_maintenance':
        queryPath = traversal.traversal1;
        break;
    case 'all_with_full_capacity':
        queryPath = traversal.traversal2;
        break;
    case 'government_regulations':
        queryPath = traversal.traversal3;
        break;
    case 'supply_law':
        queryPath = traversal.traversal4;
        break;
    case 'typhoon':
        queryPath = traversal.traversal;
        break;
    default:
      queryPath = traversal.traversal;

}
console.log("Gremlin Query:"+queryPath.join('.'));
 // graphservice.gremlin('def g = graph.traversal();' + traversal.traversal.join('.'), function (e, b) {
  graphClient.runGremlinQuery(graphId, 'def g = graph.traversal();' + queryPath.join('.'))
  .then((response) => {
      var returnData = {};
      if (response.result && response.result.data && response.result.data.length > 0) {

          returnData.query = queryPath.toString();
          returnData.data = response.result.data;
      }
      console.log("Response:"+response);
      reply(returnData);
  }).catch(function(rej) {

      console.log("Error executing the gramlin query.."+rej);

    });

};

server.route({
  method: 'GET',
  path: '/knowledgegraph/{querytype}/{showall}',
  handler: gremlinQuery,
});

server.route({
  method: 'GET',
  path: '/knowledgegraph/{querytype}',
  handler: gremlinQuery,
});

server.route({
  method: 'GET',
  path: '/knowledgegraph/{querytype}/{nodeTYpe}/{nodeValue}',
  handler: gremlinQuery,
});
server.route({
  method: 'GET',
  path: '/knowledgegraph/',
  handler: gremlinQuery,
});

server.route({
  method: 'GET',
  path: '/knowledgegraph/syncService',
  handler: function (request, reply){
    console.log('Called sync Service');
    syncservice.syncService(function (response) {
      var responseList = [];
      responseList.push(response);
      reply(responseList);
    });
  },
});

server.route({
  method: 'GET',
  path: '/knowledgegraph/resetService',
  handler: function (request, reply){
    console.log('Called reset Service');
    var response = [];
    response[0]="Transient data is cleared..";

    graphClient.runGremlinQuery(graphId, 'graph.traversal().V().has("type", "transient").drop().iterate();')
    .then((res) => {
        console.log("Response:"+res);
        reply(response);
    }).catch(function(rej) {
        console.log("Error executing the gramlin query.."+rej);
    });
  },
});

server.route({
  method: 'GET',
  path: '/listCommodity',
  handler: function (request, reply) {

      let query = `g.V().hasLabel("Commodity").has("name", "MMA")`;
      return graphClient.runGremlinQuery(graphId, `def g = graph.traversal(); ${query}`)
          .then((response) => {
            var productList = [];
            if (response.result && response.result.data && response.result.data.length > 0) {
                console.log("response.result.data:"+ JSON.stringify(response.result.data));
                //var b = JSON.parse(response.result.data);
                for (var i = 0; i < response.result.data.length; i++) {
                  var product = response.result.data[i];
                  productList.push(product.properties.name[0].value);
                }
            }
            reply(productList);
          }).catch(function(rej) {

              console.log("Error executing the gramlin query.."+rej);

            });
     },
});

// Start Hapi
server.start(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Server started at: ' + server.info.uri);
  }
});

//---Deployment Tracker---------------------------------------------------------
require('cf-deployment-tracker-client').track();
