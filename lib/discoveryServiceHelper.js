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

/*eslint no-unused-vars: ["error", {"args": "none"}]*/

(function() {
  const syncservice = {};
  const DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
  const JanusGraphClient = require('./JanusGraphClient');
  let graphId = 'procurementsystem';
  const groupBy = require('group-by');

  syncservice.syncService = function(callback) {



    let graphClient = new JanusGraphClient(
      process.env.GRAPH_DB_API_URL,
      process.env.GRAPH_DB_USERNAME,
      process.env.GRAPH_DB_PASSWORD
    );

    var discovery = new DiscoveryV1({
      username: '0a533cc9-b8a0-45c1-9709-8357082f1cdf',
      password: 'NsuNS7H4ddj0',
      url: 'https://gateway.watsonplatform.net/discovery/api/',
      version: '2017-09-01'
    });

    discovery.query({
      environment_id: process.env.DISCOVERY_ENVIRONMENT_ID,
      configuration_id: process.env.DISCOVERY_CONFIGURATION_ID,
      collection_id: process.env.DISCOVERY_COLLECTION_ID,
      query:
        'enriched_text.relations.arguments.entities.type:Facility_Production_Down,enriched_text.relations.arguments.entities.type:PriceRange,enriched_text.relations.arguments.entities.type:Time_Period&return=enriched_text.relations'
    },

    function(error, data) {


      if (error) {
        console.log('Discovery Error:', error);
      } else {
        // console.log("Data::"+JSON.stringify(data));
        // console.log(JSON.stringify(data, null, 2));
        // graphservice.session(function(e, b) {
        //   console.log('Graph Service session.....');
        //   if (!e) {
        //     graphservice.config.session = b;
        //   }
        const gramlinQueryList = [];
        console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        data.results.forEach(function(item, index) {
          const groupedData = groupBy(item.enriched_text.relations, 'sentence');
          let supplierName = '';
          let supplyStatus = '';
          //  for(var attributename in groupedData)
          //  {
          // groupedData[attributename].forEach(function (item, index)
          item.enriched_text.relations.forEach(function(item, index) {
            let plantName = '';
            let facilityStatus = '';
            let timePeriod = '';
            let capacity = '';
            let isnewNodeFound = false;
            let market = 'Supply';

            // console.log('relationType: ',item.type);
            const entityType1 = item.arguments[0].entities[0].type;
            const entityText1 = item.arguments[0].entities[0].text;
            // const entityType2 = item.arguments[1].entities[0].type;
            const attributename = item.sentence;

            console.log('\n\nGrouped Results:>>>>>>>>:' + attributename);
            groupedData[attributename].forEach(function(markeData, index) {
              console.log('markeData.type                         :' + markeData.type);
              console.log('markeData.arguments[0].entities[0].type:', markeData.arguments[0].entities[0].type);
              console.log('markeData.arguments[0].entities[0].text:', markeData.arguments[0].entities[0].text);
              console.log('markeData.arguments[1].text            :', markeData.arguments[0].text);
              console.log('markeData.arguments[1].entities[0].type:', markeData.arguments[1].entities[0].type);
              console.log('markeData.arguments[1].entities[0].text:', markeData.arguments[1].entities[0].text);
              console.log('markeData.arguments[1].text            :', markeData.arguments[1].text);
            });

            // if (item.type == 'PriceRangeinMarket') {
            //   if (entityType1 == 'PriceRange') {
            //     price = entityText1;
            //   }
            //
            //   if (entityType2 == 'Market') {
            //     market = entityText1.replace('CFR SE', 'SE');
            //   }
            // }

            if (item.type == 'isaSupplierOf') {
              if (entityType1 == 'Supplier') {
                supplierName = entityText1;
              }

              // if (entityType2 == 'Product_of_Interest') {
              //   productName = entityText1;
              // }
            }
            if (item.type == 'PriceforPeriod') {
              let PriceAttributeNegative = '';
              const priceRange = [];
              let quantity = '';
              let i = 0;
              groupedData[attributename].forEach(function(markeData, index) {
                // if(markeData.arguments[0].entities[0].type== 'Product_of_Interest'){
                //   product =  markeData.arguments[0].entities[0].text;
                // }
                if (markeData.arguments[1].entities[0].type == 'Market') {
                  market = markeData.arguments[1].entities[0].text.replace('CFR SE', 'SE');
                }
                if (markeData.arguments[0].entities[0].type == 'Quantity') {
                  quantity = markeData.arguments[0].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'Time_Period') {
                  timePeriod = markeData.arguments[1].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'PriceRange') {
                  priceRange[i++] = markeData.arguments[1].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'Price_Attribute_Negative') {
                  PriceAttributeNegative = markeData.arguments[1].entities[0].text;
                }
              });

              if (PriceAttributeNegative != '' && quantity != '' && market != '' && timePeriod != '') {
                let gremlinQuery = 'def market = graph.traversal().V().has("name","' + market + '");\n';
                gremlinQuery += 'if(market.hasNext()){market = market.next();} \n';

                gremlinQuery += 'def quantity = graph.traversal().V().hasLabel("Quantity").has("name","' + quantity + '");\n';
                gremlinQuery += 'if(quantity.hasNext()){quantity.next();} \n';
                gremlinQuery += 'else{ graph.addVertex(T.label, "Quantity", "name", "' + quantity + '","type", "transient"); } \n';

                gremlinQuery += 'def timePeriod = graph.traversal().V().hasLabel("TimePeriod").has("name","Price ' + timePeriod + '");\n';
                gremlinQuery += 'if(timePeriod.hasNext()){timePeriod.next();} \n';
                gremlinQuery +=
                  'else{ graph.addVertex(T.label, "TimePeriod", "name", "Price ' + timePeriod + '","type", "transient","text","' + timePeriod + '"); } \n';
                priceRange.forEach(function(arrPriceRange, index) {
                  gremlinQuery += 'def priceRange' + index + ' = graph.traversal().V().hasLabel("PriceRange").has("name","' + arrPriceRange + '");\n';
                  gremlinQuery += 'if(priceRange' + index + '.hasNext()){priceRange' + index + '.next();} \n';
                  gremlinQuery += 'else{ graph.addVertex(T.label, "PriceRange", "name", "' + arrPriceRange + '","type", "transient"); } \n ';
                });
                gremlinQuery +=
                  'def PriceAttributeNegative = graph.traversal().V().hasLabel("PriceAttributeNegative").has("name","' + PriceAttributeNegative + '");\n';
                gremlinQuery += 'if(PriceAttributeNegative.hasNext()){PriceAttributeNegative.next();} \n';
                gremlinQuery +=
                  'else{ graph.addVertex(T.label, "PriceAttributeNegative", "name", "' +
                  PriceAttributeNegative +
                  '","type", "transient" , "sentiment", "Negative"); } \n';
                gremlinQuery += 'def refmarket = graph.traversal().V().has("name","' + market + '"); \n';
                gremlinQuery += 'def refQuantity = graph.traversal().V().has("name","' + quantity + '"); \n';
                gremlinQuery += 'def refTimePeriod = graph.traversal().V().hasLabel("TimePeriod").has("name","Price ' + timePeriod + '");\n';

                gremlinQuery += 'refmarket.next().addEdge("quantity", refQuantity.next());\n';
                gremlinQuery += 'def refTimePeriodNew = graph.traversal().V().hasLabel("TimePeriod").has("name","Price ' + timePeriod + '");\n';
                gremlinQuery += 'def refQuantityNew = graph.traversal().V().has("name","' + quantity + '"); \n';
                gremlinQuery += 'refQuantityNew.next().addEdge("time_period", refTimePeriodNew.next());\n';

                priceRange.forEach(function(arrPriceRange, index) {
                  gremlinQuery += 'def refPriceAttributeNegative' + index + ' = graph.traversal().V().has("name","' + PriceAttributeNegative + '"); \n';
                  gremlinQuery += 'def refTimePeriod' + index + ' = graph.traversal().V().has("name","Price ' + timePeriod + '"); \n';
                  gremlinQuery += 'def refpriceRange' + index + ' = graph.traversal().V().has("name","' + arrPriceRange + '"); \n';
                  gremlinQuery += 'refTimePeriod' + index + '.next().addEdge("price", refpriceRange' + index + '.next());\n';
                  gremlinQuery += 'def refpriceRangeNeg' + index + ' = graph.traversal().V().has("name","' + arrPriceRange + '"); \n';
                  gremlinQuery += 'refpriceRangeNeg' + index + '.next().addEdge("price_negative", refPriceAttributeNegative' + index + '.next());\n ';
                });

                gramlinQueryList.push(gremlinQuery);
              }
            }

            if (item.type == 'FacilityhasCapacity') {
              console.log('FacilityhasCapacity..........');
              groupedData[attributename].forEach(function(markeData, index) {
                if (markeData.type == 'isaSupplierOf') {
                  if (markeData.arguments[0].entities[0].type == 'Supplier') {
                    supplierName = markeData.arguments[0].entities[0].text;
                  }

                  // if (markeData.arguments[1].entities[0].type == 'Product_of_Interest') {
                  //   productName = markeData.arguments[1].entities[0].text;
                  // }
                }
                if (markeData.type == 'FacilityhasCapacity') {
                  if (markeData.arguments[0].entities[0].type == 'Facility') {
                    plantName = markeData.arguments[0].entities[0].text;
                  }

                  if (markeData.arguments[1].entities[0].type == 'Capacity') {
                    capacity = markeData.arguments[1].entities[0].text;
                  }
                }
              });
              const graphplantName = supplierName + '-' + plantName;
              let gremlinQuery = 'def supplier = graph.traversal().V().hasLabel("Supplier").has("name","' + supplierName + '");\n';
              gremlinQuery += 'if(supplier.hasNext()){supplier.next()}\n';
              gremlinQuery += 'else{ graph.addVertex(T.label, "Supplier", "name", "' + supplierName + '", "sentiment", "neutral"); } \n';
              gremlinQuery += 'def plant = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '");\n';
              gremlinQuery += 'if(plant.hasNext()){plant.next()} \n';
              gremlinQuery +=
                'else{ graph.addVertex(T.label, "Plant", "name", "' + graphplantName + '", "sentiment", "neutral","text", "' + plantName + '");}\n';
              gremlinQuery += 'def a = graph.traversal().V().hasLabel("Supplier").has("name","' + supplierName + '");\n';
              gremlinQuery += 'def f = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '"); \n';
              gremlinQuery += 'a.next().addEdge("plant", f.next()); \n';
              gremlinQuery += 'def location = graph.traversal().V().hasLabel("Location").has("name","' + plantName + '");\n';
              gremlinQuery += 'if(location.hasNext()){location.next()} \n';
              gremlinQuery += 'else{ graph.addVertex(T.label, "Location", "name", "' + plantName + '", "sentiment", "neutral");}\n';
              gremlinQuery += 'def l = graph.traversal().V().hasLabel("Location").has("name","' + plantName + '");\n';
              gremlinQuery += 'def p = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '"); \n';
              gremlinQuery += 'p.next().addEdge("location", l.next()); \n';
              gremlinQuery += 'def capacity = graph.traversal().V().hasLabel("Capacity").has("name","' + capacity + '");\n';
              gremlinQuery += 'if(capacity.hasNext()){capacity.next()}\n';
              gremlinQuery += 'else{ graph.addVertex(T.label, "Capacity", "name", "' + capacity + '"); } \n';
              gremlinQuery += 'def refPlant = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '");\n';
              gremlinQuery += 'def refCapacity = graph.traversal().V().hasLabel("Capacity").has("name","' + capacity + '");\n';
              gremlinQuery += 'refPlant.next().addEdge("plant_capacity", refCapacity.next()); \n';

              gramlinQueryList.push(gremlinQuery);
            }

            if (item.type == 'SupplyhasNegAttr') {
              console.log('\n\nSentence>>>>> SupplyhasNegAttr:' + attributename);
              groupedData[attributename].forEach(function(markeData, index) {
                if (markeData.arguments[0].entities[0].type == 'Market') {
                  market = markeData.arguments[0].entities[0].text.replace('southeast', 'SE');
                }
                if (markeData.arguments[1].entities[0].type == 'Market') {
                  market = markeData.arguments[1].entities[0].text.replace('southeast', 'SE');
                }
                if (
                  markeData.arguments[0].entities[0].type == 'Supply_Attribute_Negative' ||
                  markeData.arguments[1].entities[0].type == 'Supply_Attribute_Negative'
                ) {
                  supplyStatus = attributename;
                }

                if (markeData.arguments[0].entities[0].type == 'Time_Period') {
                  timePeriod = markeData.arguments[0].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'Time_Period') {
                  timePeriod = markeData.arguments[1].entities[0].text;
                }
              });

              // console.log('?????????????????????'+'Market>>'+market+' SupplyStatus>'+supplyStatus+' SupplySentiment>>'+supplySentiment+' timePeriod>'+timePeriod);
              if (timePeriod != '' && market != '') {
                let gremlinQuery = 'def market = graph.traversal().V().has("name","' + market + '");\n';
                gremlinQuery += 'if(market.hasNext()){market = market.next();} \n';
                // gremlinQuery += 'else{ market = graph.traversal().V().hasLabel(\"Supply\").has(\"name\",\"Supply\").next();\} \n ';
                gremlinQuery +=
                  'def stausTimePeriod = graph.traversal().V().hasLabel("StatusTimePeriod").has("name","' + market + '-' + timePeriod + '");\n';
                gremlinQuery += 'if(stausTimePeriod.hasNext()){stausTimePeriod.next();} \n';
                gremlinQuery +='else{ graph.addVertex(T.label, "StatusTimePeriod", "name", "' + market + '-' + timePeriod + '","type", "transient","text","' + timePeriod + '"); } \n ';
                gremlinQuery += 'def SupplyStatus = graph.traversal().V().hasLabel("SupplyStatus").has("name","' + supplyStatus + '");\n';
                gremlinQuery += 'if(SupplyStatus.hasNext()){SupplyStatus.next();} \n';
                gremlinQuery += 'else{ graph.addVertex(T.label, "SupplyStatus", "name", "' + supplyStatus + '","type", "transient", "sentiment", "Negative"); } \n ';
                gremlinQuery += 'def refstausTimePeriod = graph.traversal().V().hasLabel("StatusTimePeriod").has("name","' + market + '-' + timePeriod + '");\n';

                gremlinQuery += 'def refmarket = graph.traversal().V().has("name","' + market + '"); \n ';
                gremlinQuery += 'if(refmarket.hasNext()){refmarket.next().addEdge("time_period", refstausTimePeriod.next());\n }';
                gremlinQuery += 'else{ refmarket =graph.traversal().V().hasLabel("Supply").has("name","Supply");\n ';
                gremlinQuery += ' refmarket.next().addEdge("time_period", refstausTimePeriod.next());}\n ';

                gremlinQuery += 'def RefSupplyStatus = graph.traversal().V().hasLabel("SupplyStatus").has("name","' + supplyStatus + '");\n';
                gremlinQuery += 'refstausTimePeriod = graph.traversal().V().hasLabel("StatusTimePeriod").has("name","' + market + '-' + timePeriod + '").next();\n';
                gremlinQuery += 'refstausTimePeriod.addEdge("supply_status", RefSupplyStatus.next());   ';
                // console.log('gremlinQuery>>>>'+gremlinQuery);

                gramlinQueryList.push(gremlinQuery);
              } // Time_Period Gremlin query builder

              console.log('\n\n >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            } // Supply has negative attribue if block.

            if (item.type == 'StatusforPeriod' || item.type == 'FacilityhasStatus' || item.type == 'isaSupplierOf' || item.type == 'FacilityhasCapacity') {
              console.log('\n\nSentence>>>>>Plant Status:' + attributename);
              groupedData[attributename].forEach(function(markeData, index) {
                if (markeData.arguments[0].entities[0].type == 'Facility') {
                  plantName = markeData.arguments[0].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'Facility_Production_Down') {
                  facilityStatus = attributename;
                }
                if (markeData.arguments[0].entities[0].type == 'Time_Period') {
                  timePeriod = markeData.arguments[0].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'Time_Period') {
                  timePeriod = markeData.arguments[1].entities[0].text;
                }
                if (markeData.arguments[0].entities[0].type == 'Supplier') {
                  supplierName = markeData.arguments[0].entities[0].text;
                }
                // if (markeData.arguments[1].entities[0].type == 'Product_of_Interest') {
                //   productName = markeData.arguments[1].entities[0].text;
                // }
                if (markeData.arguments[0].entities[0].type == 'Facility') {
                  plantName = markeData.arguments[0].entities[0].text;
                }
                if (markeData.arguments[1].entities[0].type == 'Capacity') {
                  capacity = markeData.arguments[1].entities[0].text;
                }
              }); // StatusPeriod if grouped data

              // gremlinQuery
              let gremlinQuery = '';
              const graphplantName = supplierName + '-' + plantName;
              if (supplierName != '' && plantName != '') {
                isnewNodeFound = true;
                gremlinQuery = 'def supplier = graph.traversal().V().hasLabel("Supplier").has("name","' + supplierName + '");\n';
                gremlinQuery += 'if(supplier.hasNext()){supplier.next()}\n';
                gremlinQuery += 'else{ graph.addVertex(T.label, "Supplier", "name", "' + supplierName + '", "sentiment", "neutral");  \n';
                gremlinQuery += 'def s1 = graph.traversal().V().hasLabel("Supply").has("name","Supply");\n';
                gremlinQuery += 'def s2 = graph.traversal().V().hasLabel("Supplier").has("name","' + supplierName + '"); \n';
                gremlinQuery += 's1.next().addEdge("supplier", s2.next());} \n';

                gremlinQuery += 'def plant = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '");\n';
                gremlinQuery += 'if(plant.hasNext()){plant.next()} \n';
                gremlinQuery += 'else{ graph.addVertex(T.label, "Plant", "name", "' + graphplantName + '", "sentiment", "neutral" ,"text", "' + plantName + '");\n';
                gremlinQuery += 'def a = graph.traversal().V().hasLabel("Supplier").has("name","' + supplierName + '");\n';
                gremlinQuery += 'def f = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '"); \n';
                gremlinQuery += 'a.next().addEdge("plant", f.next()); \n';
                gremlinQuery += 'def location = graph.traversal().V().hasLabel("Location").has("name","' + plantName + '");\n';
                gremlinQuery += 'if(location.hasNext()){location.next()} \n';
                gremlinQuery += 'else{ graph.addVertex(T.label, "Location", "name", "' + plantName + '", "sentiment", "neutral");}\n';
                gremlinQuery += 'def l = graph.traversal().V().hasLabel("Location").has("name","' + plantName + '");\n';
                gremlinQuery += 'def p = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '"); \n';
                gremlinQuery += 'p.next().addEdge("location", l.next());} \n';
              }
              if (timePeriod != '' && plantName != '' && facilityStatus != '') {
                isnewNodeFound = true;
                gremlinQuery += 'def timePeriod = graph.traversal().V().hasLabel("Time_Period").has("name","' + timePeriod + '");\n';
                gremlinQuery += 'if(timePeriod.hasNext()){timePeriod.next()}   ';
                gremlinQuery +=
                  'else{ graph.addVertex(T.label, "Time_Period", "name", "' + timePeriod + '", "sentiment", "neutral", "type", "transient"); \n  ';
                gremlinQuery += 'def a = graph.traversal().V().hasLabel("Plant").has("name","' + graphplantName + '"); \n';
                gremlinQuery += 'def f = graph.traversal().V().hasLabel("Time_Period").has("name","' + timePeriod + '");\n';
                gremlinQuery += 'a.next().addEdge("time_period", f.next());  }\n';

                gremlinQuery +=
                  'def facilityStatus = graph.traversal().V().hasLabel("Production_Down").has("name","Facility Production Down:' +
                  facilityStatus +
                  ' ");\n';
                gremlinQuery += 'if(facilityStatus.hasNext()){facilityStatus.next()} \n';
                gremlinQuery +=
                  'else{ graph.addVertex(T.label, "Production_Down", "name", "Facility Production Down:' +
                  facilityStatus +
                  '", "sentiment", "Negative","type", "transient");  \n ';
                gremlinQuery += 'def a = graph.traversal().V().hasLabel("Time_Period").has("name","' + timePeriod + '");  \n ';
                gremlinQuery +=
                  'def f = graph.traversal().V().hasLabel("Production_Down").has("name","Facility Production Down:' + facilityStatus + '");  \n ';
                gremlinQuery += 'a.next().addEdge("facility_status", f.next());   }';
                // console.log("gremlinQuery"+gremlinQuery);
              }

              if (isnewNodeFound) {
                gramlinQueryList.push(gremlinQuery);
              }

              console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            } // Status Period, facilityStatus if loop
          }); // Typed Relation for each
        }); // data.results.forEach

        const processGramlinQuery = function(queryPos) {
          if (queryPos < gramlinQueryList.length) {
            graphClient.runGremlinQuery(graphId, gramlinQueryList[queryPos])
              .then((res) => {
                console.log('Response:' + res);
                processGramlinQuery(queryPos + 1);
              }).catch(function(rej) {
                console.log('Error executing the gramlin query..' + rej);
              });
          }
          else {
              graphClient.runGremlinQuery(graphId, "graph.traversal().tx().commit();")
          }
        };
        processGramlinQuery(0);
        callback('Discovery Service data sync is completed.');
      }
    }); // Discover.query

    console.log('Called discovery.....');
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = syncservice;
  }
})();
