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
require('dotenv').load({ silent: true });

// Necessary Libs
var cfenv     = require('cfenv');
var Hapi      = require('hapi');
var Path      = require('path');
var GDS       = require('ibm-graph-client');
var traversal = require('./assets/traversal');
var syncservice = require('./discoveryServiceHelper');

// Handle Configs
var appEnv = cfenv.getAppEnv();

// Set config
if (process.env.APP_SERVICES) {
  var vcapServices = JSON.parse(process.env.APP_SERVICES);
  var graphService = 'IBM Graph';
  if (vcapServices[graphService] && vcapServices[graphService].length > 0) {
    var config = vcapServices[graphService][0];
  }
  else {
    console.log('process.env.VCAP_SERVICES:'+process.env.APP_SERVICES)
  }
}
if (process.env.VCAP_SERVICES) {
  var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
  var graphServiceName = 'IBM Graph';
  if (vcapServices[graphServiceName] && vcapServices[graphServiceName].length > 0) {
    var config = vcapServices[graphServiceName][0];
  }
}

console.log('Config:'+config);
// Set up the DB
var graphservice = new GDS({
  url: config.credentials.apiURL,
  username: config.credentials.username,
  password: config.credentials.password,
});

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
  console.log(request.params);
  var querytype = (request.params.querytype) ? request.params.querytype : 'scheduled_maintenance';
  traversal.addPerson(querytype);

  // Reset All Paths
  traversal.resetAllPaths();

  // Show All Paths
  if (request.params.showall === 'showall') {
    traversal.allPaths();
  }

  console.log(traversal.traversal4);
  console.log(traversal.traversal4.toString());
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
console.log("QueryType:"+queryPath);
console.log("Gremlin Query:"+queryPath.join('.'));
 // graphservice.gremlin('def g = graph.traversal();' + traversal.traversal.join('.'), function (e, b) {
  graphservice.gremlin('def g = graph.traversal();' + queryPath.join('.'), function (e, b) {
    if (e) {
      console.log('--Error--');
      console.log(e);
      console.log('--Response--');
      console.log(r);
    }

    // var b = JSON.parse(b);
    var returnData = {};
    returnData.query = queryPath.toString();
    returnData.data = b.result.data;

    console.log(b);
    reply(returnData);
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

    graphservice.gremlin('graph.traversal().V().has("type", "transient").drop().iterate();', function (e, b) {
      if (e) {
        console.log('--Error--');
        console.log(e);
        console.log('--Response--');
        console.log(r);
      }
      console.log(b);
      reply(response);
    });
  },
});

server.route({
  method: 'GET',
  path: '/listCommodity',
  handler: function (request, reply) {
	  graphservice.vertices().get({ label:'Commodity',name:'MMA' }, function (e, b) {
      if (e) {
        console.log('Error while looking Commodity',e);
      }

      var personsList = [];
      var b = JSON.parse(b);

      if (!e || b.status.code == 200 || b.status_code == '200') {
        for (var i = 0; i < b.result.data.length; i++) {
          var person = b.result.data[i];
          personsList.push(person.properties.name[0].value);
        }
      }

      reply(personsList);
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
