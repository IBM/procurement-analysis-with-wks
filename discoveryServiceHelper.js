
// Load env
require('dotenv').load({ silent: true });

var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
var GDS       = require('ibm-graph-client');
var cfenv     = require('cfenv');
var groupBy = require('group-by');


var syncservice = {};

(function () {

  syncservice.syncService = function (callback) {

    // Handle Configs
    var appEnv = cfenv.getAppEnv();
;
    // Set config
    var config;
    if (process.env.APP_SERVICES) {
      var vcapServices = JSON.parse(process.env.APP_SERVICES);
      var discoveryService = 'discovery';
      if (vcapServices[discoveryService] && vcapServices[discoveryService].length > 0) {
        config = vcapServices[discoveryService][0];
      }
    }
    if (process.env.VCAP_SERVICES) {
      var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
      var graphServiceName = 'discovery';
      if (vcapServices[graphServiceName] && vcapServices[graphServiceName].length > 0) {
        config = vcapServices[graphServiceName][0];
      }
    }


    var discovery = new DiscoveryV1({
      username: config.credentials.username,
      password: config.credentials.password,
      version_date: '2016-12-01'
    });
    var configGraph ;
    if (process.env.APP_SERVICES) {
      var vcapServices = JSON.parse(process.env.APP_SERVICES);
      var graphService = 'IBM Graph';
      if (vcapServices[graphService] && vcapServices[graphService].length > 0) {
        configGraph = vcapServices[graphService][0];
      }
      else {
        console.log('process.env.VCAP_SERVICES:'+process.env.APP_SERVICES)
      }
    }
    if (process.env.VCAP_SERVICES) {
      var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
      var graphServiceName = 'IBM Graph';
      if (vcapServices[graphServiceName] && vcapServices[graphServiceName].length > 0) {
        configGraph = vcapServices[graphServiceName][0];
      }
    }
    var graphservice = new GDS({
      url: configGraph.credentials.apiURL,
      username: configGraph.credentials.username,
      password: configGraph.credentials.password,
    });

    discovery.query(({"environment_id":process.env.environment_id, "configuration_id":process.env.configuration_id, "collection_id":process.env.collection_id, "query":"enriched_text.typedRelations.arguments.entities.type:Facility_Production_Down,enriched_text.typedRelations.arguments.entities.type:PriceRange,enriched_text.typedRelations.arguments.entities.type:Time_Period&return=enriched_text.typedRelations"}), function(error, data)
    {
      console.log("discovery service callback .....");

      if (error)
      {
        console.log('Error:',error);
      }
      else {
        //console.log("Data::"+JSON.stringify(data));
        //console.log(JSON.stringify(data, null, 2));
        graphservice.session(function (e, b) {
          console.log("Graph Service session.....");
          if (!e) {
            graphservice.config.session = b;
          }
          console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
          data.results.forEach(function(item, index)
          {
            var rawText = item.text;
            var groupedData = groupBy(item.enriched_text.typedRelations, 'sentence')
            var supplierName="";
            var supplySentiment="";
            var supplyStatus="";
            var price="";
            var market="";



            //  for(var attributename in groupedData)
            //  {
              //groupedData[attributename].forEach(function (item, index)
              item.enriched_text.typedRelations.forEach(function (item, index)
              {
                  var plantName="";
                  var facilityStatus="";
                  var timePeriod="";
                  var productName="";
                  var capacity = "";
                  var facility = "";
                  var isnewNodeFound = false;
                  var market="Supply";
                  var isMarketFound = false;

                  //console.log('relationType: ',item.type);
                  var entityType1 = item.arguments[0].entities[0].type;
                  var entityText1 = item.arguments[0].entities[0].text;
                  var entityPart1 = item.arguments[0].part;

                  var entityType2 = item.arguments[1].entities[0].type;

                  var entityText2 = item.arguments[1].entities[0].text;
                  var entityPart2 = item.arguments[1].part;
                  var attributename=item.sentence;


                  console.log('\n\nGrouped Results:>>>>>>>>:'+attributename);
                  groupedData[attributename].forEach(function (markeData, index)
                  {
                    console.log("markeData.type                         :"+markeData.type);
                    console.log('markeData.arguments[0].entities[0].type:',markeData.arguments[0].entities[0].type);
                    console.log('markeData.arguments[0].entities[0].text:',markeData.arguments[0].entities[0].text);
                    console.log('markeData.arguments[1].text            :',markeData.arguments[0].text);
                    console.log('markeData.arguments[1].entities[0].type:',markeData.arguments[1].entities[0].type);
                    console.log('markeData.arguments[1].entities[0].text:',markeData.arguments[1].entities[0].text);
                    console.log('markeData.arguments[1].text            :',markeData.arguments[1].text);

                  });
                  

                  if(item.type=='PriceRangeinMarket')
                  {
                    if(entityType1=='PriceRange'){
                        price = entityText1;
                    }

                    if(entityType2=='Market')
                    {
                      market =  entityText1.replace("CFR SE","SE");
                    }

                  }

                  if(item.type=='isaSupplierOf')
                  {
                    if(entityType1=='Supplier'){
                        supplierName = entityText1;
                    }

                    if(entityType2=='Product_of_Interest')
                    {
                      productName =  entityText1;
                    }
                  }
                if(item.type=='PriceforPeriod')
                {
                      var PriceAttributeNegative="";
                      var priceRange = [];
                      var quantity = "";
                      var i = 0;
                      groupedData[attributename].forEach(function (markeData, index)
                      {
                        // if(markeData.arguments[0].entities[0].type== 'Product_of_Interest'){
                        //   product =  markeData.arguments[0].entities[0].text;
                        // }
                        if(markeData.arguments[1].entities[0].type== 'Market'){
                          market =  (markeData.arguments[1].entities[0].text).replace("CFR SE","SE");
                        }
                        if(markeData.arguments[0].entities[0].type== 'Quantity'){
                          quantity =  markeData.arguments[0].entities[0].text;
                        }
                        if(markeData.arguments[1].entities[0].type== 'Time_Period'){
                          timePeriod =  markeData.arguments[1].entities[0].text;
                        }
                        if(markeData.arguments[1].entities[0].type== 'PriceRange'){
                          priceRange[i++] =  markeData.arguments[1].entities[0].text;
                        }
                        if(markeData.arguments[1].entities[0].type== 'Price_Attribute_Negative'){
                          PriceAttributeNegative =  markeData.arguments[1].entities[0].text;
                        }
                      });

                      if((PriceAttributeNegative!="") && (quantity!="") && (market!="") &&(timePeriod!="") )
                      {
                        var gremlinQuery = 'def market = graph.traversal().V().has(\"name\",\"' + market + '\");\n';
                        gremlinQuery += 'if(market.hasNext()){market = market.next();} \n';

                        gremlinQuery += 'def quantity = graph.traversal().V().hasLabel(\"Quantity\").has(\"name\",\"' + quantity + '\");\n';
                        gremlinQuery += 'if(quantity.hasNext()){quantity.next();} \n';
                        gremlinQuery += 'else{ graph.addVertex(T.label, \"Quantity\", \"name\", \"' + quantity+ '\",\"type\", \"transient\"); } \n';

                        gremlinQuery += 'def timePeriod = graph.traversal().V().hasLabel(\"TimePeriod\").has(\"name\",\"Price ' + timePeriod + '\");\n';
                        gremlinQuery += 'if(timePeriod.hasNext()){timePeriod.next();} \n';
                        gremlinQuery += 'else{ graph.addVertex(T.label, \"TimePeriod\", \"name\", \"Price ' + timePeriod+ '\",\"type\", \"transient\",\"text\",\"'+timePeriod+'\"); } \n';
                        priceRange.forEach(function (arrPriceRange, index){
                          gremlinQuery += 'def priceRange'+index+' = graph.traversal().V().hasLabel(\"PriceRange\").has(\"name\",\"' + arrPriceRange + '\");\n';
                          gremlinQuery += 'if(priceRange'+index+'.hasNext()){priceRange'+index+'.next();} \n';
                          gremlinQuery += 'else{ graph.addVertex(T.label, \"PriceRange\", \"name\", \"' + arrPriceRange + '\",\"type\", \"transient\"); } \n ';

                        });
                        gremlinQuery += 'def PriceAttributeNegative = graph.traversal().V().hasLabel(\"PriceAttributeNegative\").has(\"name\",\"' + PriceAttributeNegative + '\");\n';
                        gremlinQuery += 'if(PriceAttributeNegative.hasNext()){PriceAttributeNegative.next();} \n';
                        gremlinQuery += 'else{ graph.addVertex(T.label, \"PriceAttributeNegative\", \"name\", \"' + PriceAttributeNegative + '\",\"type\", \"transient\" , \"sentiment\", \"Negative\"); } \n';
                        gremlinQuery += 'def refmarket = graph.traversal().V().has(\"name\",\"' + market + '\"); \n';
                        gremlinQuery += 'def refQuantity = graph.traversal().V().has(\"name\",\"' + quantity + '\"); \n';
                        gremlinQuery += 'def refTimePeriod = graph.traversal().V().hasLabel(\"TimePeriod\").has(\"name\",\"Price ' + timePeriod + '\");\n';

                        gremlinQuery += 'refmarket.next().addEdge(\"quantity\", refQuantity.next());\n';
                        gremlinQuery += 'def refTimePeriodNew = graph.traversal().V().hasLabel(\"TimePeriod\").has(\"name\",\"Price ' + timePeriod + '\");\n';
                        gremlinQuery += 'def refQuantityNew = graph.traversal().V().has(\"name\",\"' + quantity + '\"); \n';
                        gremlinQuery += 'refQuantityNew.next().addEdge(\"time_period\", refTimePeriodNew.next());\n';

                        priceRange.forEach(function (arrPriceRange, index){
                            gremlinQuery += 'def refPriceAttributeNegative'+index+' = graph.traversal().V().has(\"name\",\"' + PriceAttributeNegative + '\"); \n';
                            gremlinQuery += 'def refTimePeriod'+index+' = graph.traversal().V().has(\"name\",\"Price ' + timePeriod + '\"); \n';
                            gremlinQuery += 'def refpriceRange'+index+' = graph.traversal().V().has(\"name\",\"' + arrPriceRange + '\"); \n';
                            gremlinQuery += 'refTimePeriod'+index+'.next().addEdge(\"price\", refpriceRange'+index+'.next());\n';
                            gremlinQuery += 'def refpriceRangeNeg'+index+' = graph.traversal().V().has(\"name\",\"' + arrPriceRange + '\"); \n';
                            gremlinQuery += 'refpriceRangeNeg'+index+'.next().addEdge(\"price_negative\", refPriceAttributeNegative'+index+'.next());\n ';
                        });

                        graphservice.gremlin(gremlinQuery, function (e, b){
                          if (e) {
                            console.log("Error_Price_Negative>>>>>>>>>>>>>>>>", e );

                          }
                          //console.log("Response_Price_Negative Part 1>>>>>>>>>>>>>>>> ", b ," >gremlinQuery : ", gremlinQuery );
                        });


                      }



                  }
                  if(item.type=='FacilityhasCapacity')
                  {
                    console.log("FacilityhasCapacity..........");
                    groupedData[attributename].forEach(function (markeData, index)
                    {
                        if(markeData.type=='isaSupplierOf')
                        {
                          if(markeData.arguments[0].entities[0].type=='Supplier'){
                              supplierName = markeData.arguments[0].entities[0].text;
                          }

                          if(markeData.arguments[1].entities[0].type=='Product_of_Interest')
                          {
                            productName =  markeData.arguments[1].entities[0].text;
                          }
                        }
                        if(markeData.type=='FacilityhasCapacity')
                        {
                          if(markeData.arguments[0].entities[0].type=='Facility'){
                              plantName = markeData.arguments[0].entities[0].text;
                          }

                          if(markeData.arguments[1].entities[0].type=='Capacity')
                          {
                            capacity =  markeData.arguments[1].entities[0].text;
                          }
                        }
                      });
                      var graphplantName = supplierName + '-' + plantName;
                      var gremlinQuery = 'def supplier = graph.traversal().V().hasLabel(\"Supplier\").has(\"name\",\"' + supplierName + '\");\n';
                      gremlinQuery += 'if(supplier.hasNext()){supplier.next()}\n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Supplier\", \"name\", \"' + supplierName + '\", \"sentiment\", \"neutral\"); } \n';
                      gremlinQuery += 'def plant = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\");\n';
                      gremlinQuery += 'if(plant.hasNext()){plant.next()} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Plant\", \"name\", \"' + graphplantName + '\", \"sentiment\", \"neutral\",\"text\", \"'+plantName+'\");}\n';
                      gremlinQuery += 'def a = graph.traversal().V().hasLabel(\"Supplier\").has(\"name\",\"' + supplierName + '\");\n';
                      gremlinQuery += 'def f = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\"); \n';
                      gremlinQuery += 'a.next().addEdge(\"plant\", f.next()); \n';
                      gremlinQuery += 'def location = graph.traversal().V().hasLabel(\"Location\").has(\"name\",\"' + plantName + '\");\n';
                      gremlinQuery += 'if(location.hasNext()){location.next()} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Location\", \"name\", \"' + plantName + '\", \"sentiment\", \"neutral\");}\n';
                      gremlinQuery += 'def l = graph.traversal().V().hasLabel(\"Location\").has(\"name\",\"' + plantName + '\");\n';
                      gremlinQuery += 'def p = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\"); \n';
                      gremlinQuery += 'p.next().addEdge(\"location\", l.next()); \n';
                      gremlinQuery += 'def capacity = graph.traversal().V().hasLabel(\"Capacity\").has(\"name\",\"' + capacity + '\");\n';
                      gremlinQuery += 'if(capacity.hasNext()){capacity.next()}\n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Capacity\", \"name\", \"' + capacity + '\"); } \n';
                      gremlinQuery += 'def refPlant = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\");\n';
                      gremlinQuery += 'def refCapacity = graph.traversal().V().hasLabel(\"Capacity\").has(\"name\",\"' + capacity + '\");\n';
                      gremlinQuery += 'refPlant.next().addEdge(\"plant_capacity\", refCapacity.next()); \n';

                      console.log('gremlinQuery>>>>'+gremlinQuery);
                      graphservice.gremlin(gremlinQuery, function (e, b){
                        if (e) {
                          console.log("Error>>>>>>>>>>>>>>>>", e );
                          console.log("Error>>>>>>>>>>>>>>>>", b );
                        }
                        //console.log("Response>>>>>>>>>>>>>>>",b);
                      });



                  }

                  if(item.type=='SupplyhasNegAttr')
                  {
                    isMarketFound = true;
                    console.log('\n\nSentence>>>>> SupplyhasNegAttr:'+attributename);
                    groupedData[attributename].forEach(function (markeData, index)
                    {

                      if(markeData.arguments[0].entities[0].type== 'Market'){
                        market =  (markeData.arguments[0].entities[0].text).replace("southeast","SE");
                      }
                      if(markeData.arguments[1].entities[0].type== 'Market'){
                        market =  (markeData.arguments[1].entities[0].text).replace("southeast","SE");
                      }
                      if((markeData.arguments[0].entities[0].type=='Supply_Attribute_Negative') || (markeData.arguments[1].entities[0].type=='Supply_Attribute_Negative'))
                      {
                        supplyStatus = attributename;
                        supplySentiment = 'Negative'
                      }

                      if(markeData.arguments[0].entities[0].type=='Time_Period')
                      {
                        timePeriod = markeData.arguments[0].entities[0].text;
                      }
                      if(markeData.arguments[1].entities[0].type=='Time_Period')
                      {
                        timePeriod = markeData.arguments[1].entities[0].text;
                      }

                    });


                    //console.log('?????????????????????'+'Market>>'+market+' SupplyStatus>'+supplyStatus+' SupplySentiment>>'+supplySentiment+' timePeriod>'+timePeriod);
                    if((timePeriod!="") && (market!=""))
                    {
                      var gremlinQuery = 'def market = graph.traversal().V().has(\"name\",\"' + market + '\");\n';
                      gremlinQuery += 'if(market.hasNext()){market = market.next();} \n';
                      //gremlinQuery += 'else{ market = graph.traversal().V().hasLabel(\"Supply\").has(\"name\",\"Supply\").next();\} \n ';
                      gremlinQuery += 'def stausTimePeriod = graph.traversal().V().hasLabel(\"StatusTimePeriod\").has(\"name\",\"' + market+'-'+timePeriod + '\");\n';
                      gremlinQuery += 'if(stausTimePeriod.hasNext()){stausTimePeriod.next();} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"StatusTimePeriod\", \"name\", \"' + market+'-'+timePeriod + '\",\"type\", \"transient\",\"text\",\"'+timePeriod+'\"); } \n ';
                      gremlinQuery += 'def SupplyStatus = graph.traversal().V().hasLabel(\"SupplyStatus\").has(\"name\",\"' + supplyStatus + '\");\n';
                      gremlinQuery += 'if(SupplyStatus.hasNext()){SupplyStatus.next();} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"SupplyStatus\", \"name\", \"' + supplyStatus + '\",\"type\", \"transient\", \"sentiment\", \"Negative\"); } \n ';
                      gremlinQuery += 'def refstausTimePeriod = graph.traversal().V().hasLabel(\"StatusTimePeriod\").has(\"name\",\"' + market+'-'+timePeriod + '\");\n'
                      gremlinQuery += 'def refmarket = graph.traversal().V().has(\"name\",\"' + market + '\"); \n ';
                      gremlinQuery += 'refmarket.next().addEdge(\"time_period\", refstausTimePeriod.next());\n ';
                      gremlinQuery += 'def RefSupplyStatus = graph.traversal().V().hasLabel(\"SupplyStatus\").has(\"name\",\"' + supplyStatus + '\");\n';
                      gremlinQuery += 'refstausTimePeriod = graph.traversal().V().hasLabel(\"StatusTimePeriod\").has(\"name\",\"' + market+'-'+timePeriod + '\").next();\n'
                      gremlinQuery += 'refstausTimePeriod.addEdge(\"supply_status\", RefSupplyStatus.next());   ';
                      //console.log('gremlinQuery>>>>'+gremlinQuery);
                      graphservice.gremlin(gremlinQuery, function (e, b){
                        if (e) {
                          console.log("Error>>>>>>>>>>>>>>>>", e );
                          console.log("Error>>>>>>>>>>>>>>>>", b );
                        }
                      });
                    }//Time_Period Gremlin query builder

                    console.log('\n\n >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                  }//Supply has negative attribue if block.

                  if((item.type =='StatusforPeriod') || (item.type =='FacilityhasStatus') || (item.type =='isaSupplierOf') || (item.type =='FacilityhasCapacity'))
                  {
                    console.log('\n\nSentence>>>>>Plant Status:'+attributename);
                    groupedData[attributename].forEach(function (markeData, index)
                    {

                      if(markeData.arguments[0].entities[0].type == 'Facility'){
                        plantName =  markeData.arguments[0].entities[0].text;
                      }
                      if(markeData.arguments[1].entities[0].type == 'Facility_Production_Down'){
                        facilityStatus =  attributename;
                      }
                      if(markeData.arguments[0].entities[0].type=='Time_Period')
                      {
                        timePeriod = markeData.arguments[0].entities[0].text;
                      }
                      if(markeData.arguments[1].entities[0].type=='Time_Period')
                      {
                        timePeriod = markeData.arguments[1].entities[0].text;
                      }
                      if(markeData.arguments[0].entities[0].type == 'Supplier'){

                        supplierName =  markeData.arguments[0].entities[0].text;
                      }
                      if(markeData.arguments[1].entities[0].type == 'Product_of_Interest'){
                        productName =  markeData.arguments[1].entities[0].text;
                      }
                      if(markeData.arguments[0].entities[0].type == 'Facility'){
                        plantName =  markeData.arguments[0].entities[0].text;
                      }
                      if(markeData.arguments[1].entities[0].type == 'Capacity'){
                        capacity =  markeData.arguments[1].entities[0].text;
                      }

                    });//StatusPeriod if grouped data


                    //gremlinQuery
                    var gremlinQuery="";
                    var graphplantName = supplierName + '-' + plantName;
                    if ( supplierName!="" && plantName!="")
                    {
                      isnewNodeFound = true;
                      gremlinQuery = 'def supplier = graph.traversal().V().hasLabel(\"Supplier\").has(\"name\",\"' + supplierName + '\");\n';
                      gremlinQuery += 'if(supplier.hasNext()){supplier.next()}\n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Supplier\", \"name\", \"' + supplierName + '\", \"sentiment\", \"neutral\");  \n';
                      gremlinQuery += 'def s1 = graph.traversal().V().hasLabel(\"Supply\").has(\"name\",\"Supply");\n';
                      gremlinQuery += 'def s2 = graph.traversal().V().hasLabel(\"Supplier\").has(\"name\",\"' + supplierName + '\"); \n';
                      gremlinQuery += 's1.next().addEdge(\"supplier\", s2.next());} \n';

                      gremlinQuery += 'def plant = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\");\n';
                      gremlinQuery += 'if(plant.hasNext()){plant.next()} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Plant\", \"name\", \"' + graphplantName + '\", \"sentiment\", \"neutral\" ,\"text\", \"'+plantName+'\");\n';
                      gremlinQuery += 'def a = graph.traversal().V().hasLabel(\"Supplier\").has(\"name\",\"' + supplierName + '\");\n';
                      gremlinQuery += 'def f = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\"); \n';
                      gremlinQuery += 'a.next().addEdge(\"plant\", f.next()); \n';
                      gremlinQuery += 'def location = graph.traversal().V().hasLabel(\"Location\").has(\"name\",\"' + plantName + '\");\n';
                      gremlinQuery += 'if(location.hasNext()){location.next()} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Location\", \"name\", \"' + plantName + '\", \"sentiment\", \"neutral\");}\n';
                      gremlinQuery += 'def l = graph.traversal().V().hasLabel(\"Location\").has(\"name\",\"' + plantName + '\");\n';
                      gremlinQuery += 'def p = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\"); \n';
                      gremlinQuery += 'p.next().addEdge(\"location\", l.next());} \n';

                    }
                    if ( timePeriod!="" && plantName!="" && facilityStatus!="")
                    {
                      isnewNodeFound = true;
                      gremlinQuery += 'def timePeriod = graph.traversal().V().hasLabel(\"Time_Period\").has(\"name\",\"' + timePeriod + '\");\n';
                      gremlinQuery += 'if(timePeriod.hasNext()){timePeriod.next()}   ';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Time_Period\", \"name\", \"' + timePeriod + '\", \"sentiment\", \"neutral\", \"type\", \"transient\"); \n  ';
                      gremlinQuery += 'def a = graph.traversal().V().hasLabel(\"Plant\").has(\"name\",\"' + graphplantName + '\"); \n';
                      gremlinQuery += 'def f = graph.traversal().V().hasLabel(\"Time_Period\").has(\"name\",\"' + timePeriod + '\");\n';
                      gremlinQuery += 'a.next().addEdge(\"time_period\", f.next());  }\n';

                      gremlinQuery += 'def facilityStatus = graph.traversal().V().hasLabel(\"Production_Down\").has(\"name\",\"Facility Production Down:' + facilityStatus + ' \");\n';
                      gremlinQuery += 'if(facilityStatus.hasNext()){facilityStatus.next()} \n';
                      gremlinQuery += 'else{ graph.addVertex(T.label, \"Production_Down\", \"name\", \"Facility Production Down:' + facilityStatus + '\", \"sentiment\", \"Negative\",\"type\", \"transient\");  \n ';
                      gremlinQuery += 'def a = graph.traversal().V().hasLabel(\"Time_Period\").has(\"name\",\"' + timePeriod + '\");  \n ';
                      gremlinQuery += 'def f = graph.traversal().V().hasLabel(\"Production_Down\").has(\"name\",\"Facility Production Down:' + facilityStatus + '\");  \n ';
                      gremlinQuery += 'a.next().addEdge(\"facility_status\", f.next());   }';
                      //console.log("gremlinQuery"+gremlinQuery);
                    }

                    if(isnewNodeFound )
                    {

                      console.log(">>>>>>>>>>>>"+gremlinQuery);
                       graphservice.gremlin(gremlinQuery, function (e, b){
                         if (e) {
                           console.log(e, b,gremlinQuery);
                         }

                       });

                    }
                    console.log('\n\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

                  }//Status Period, facilityStatus if loop

                });//Typed Relation for each


        });//data.results.forEach

        callback("Discovery Service data sync is completed.");
      });//Session for Graph DB

    }

    });//Discover.query
    console.log("Called discovery.....");
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = syncservice;
  }
})();
