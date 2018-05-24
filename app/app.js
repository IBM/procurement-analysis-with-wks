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

/*globals $:false */
/*global Bloodhound:true*/
/*global traversal:true*/
/*global vis:true*/

// Find the Bacon number
var ajaxRequest = [];
$(document).ready(function () {

  var persons = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '/listCommodity',
  });

  // passing in `null` for the `options` arguments will result in the default

  persons.initialize();
  // options being used
  $('#person').typeahead(null, {
    name: 'persons',
    source: persons,
  });


  $('input:radio').change( function (e) {
    e.preventDefault();
    var inProgressContainer = $('#the-result').parent().parent();
    if (!inProgressContainer.hasClass('hidden')) {
      inProgressContainer.addClass('hidden');
    }
    var value = $(this).val();
    callService(value, '', '');

  });

  $('#the-result').click( function() {
    var inProgressContainer = $('#the-result').parent().parent();
    if (!inProgressContainer.hasClass('hidden')) {
      inProgressContainer.addClass('hidden');
    }
  });

  $('a[href="#sync"]').click(function() {
    var graphVisContainer = $('#the-graph').parent().parent();
    if (!graphVisContainer.hasClass('hidden')) {
      graphVisContainer.addClass('hidden');
    }
    callSync();
  });

  $('a[href="#reset"]').click(function() {
    var graphVisContainer = $('#the-graph').parent().parent();
    if (!graphVisContainer.hasClass('hidden')) {
      graphVisContainer.addClass('hidden');
    }
    callReset();
  });

});

function callSync()
{
  var inProgressContainer = $('#the-result').parent().parent();
  var loadingSpinner = '<i class="fa fa-spinner fa-spin"></i>';
  $('#the-result').html(loadingSpinner);
  if (inProgressContainer.hasClass('hidden')) {
    inProgressContainer.removeClass('hidden');
  }
  var url = '/knowledgegraph/syncService';
  ajaxRequest.push($.get(url, function (data) {
    $('#the-result').html('<P>'+data+'</P><button id="inprogress" >Click here to close</button>');
  })
    .fail(function() {
      var loadingSpinner = '<i> Backend service failed with error. </i>';
      $('#the-result').html(loadingSpinner);
    })
  );
}

function callReset()
{
  var inProgressContainer = $('#the-result').parent().parent();
  var loadingSpinner = '<i class="fa fa-spinner fa-spin"></i>';
  $('#the-result').html(loadingSpinner);
  if (inProgressContainer.hasClass('hidden')) {
    inProgressContainer.removeClass('hidden');
  }
  var url = '/knowledgegraph/resetService';
  ajaxRequest.push($.get(url, function (data) {
    $('#the-result').html('<P>'+data+'</P><button id="inprogress" type="button">Click here to close</button>');
  })
    .fail(function() {
      var loadingSpinner = '<i> Backend service failed with error. </i>';
      $('#the-result').html(loadingSpinner);
    })
  );
}

function callService(value, nodeLabel, nodeText){
  var graphVisContainer = $('#the-graph').parent().parent();
  // var queryContainer = $('#query').parent().parent().parent().parent();

  // Loading spinner
  var loadingSpinner = '<i class="fa fa-spinner fa-spin"></i>';
  $('#query, #the-graph').html(loadingSpinner);

  var url = '/knowledgegraph/' + value;
  if(nodeLabel && (nodeLabel!=''))
  {
    url = url+ '/' + nodeLabel;
  }

  if(nodeText && (nodeText!=''))
  {
    url = url+ '/' + nodeText;
  }

  traversal.addPerson(value);

  // Reset All Paths
  traversal.resetAllPaths();

  if ($('#showall').is(':checked')) {
    url = url + '/showall';
    traversal.allPaths();
  }

  if (ajaxRequest.length > 0) {
    ajaxRequest[0].abort();
  }

  if (graphVisContainer.hasClass('hidden')) {
    graphVisContainer.removeClass('hidden');
  }

  ajaxRequest.push($.get(url, function (data) {
    console.log(data);

    // $('#query').html(data.query);

    var rawNodes = [];
    var ignoreNodes = [];
    var rawEdges = [];
    var ignoreEdges = [];
    if(data.data)
    {
      for (let i = 0; i < data.data.length; i++) {
        var path = data.data[i].objects;
        for (let j = 0; j < path.length; j++) {
          var obj = path[j];
          if (obj.type == 'vertex') {
            if (ignoreNodes.indexOf(obj.id) < 0) {
              var nodeObject = {
                id: obj.id,
                label: obj.properties.name[0].value.substring(0, 6)+'..',
                title: obj.properties.name[0].value,
                nodeLabel: obj.label,
                shape: 'circle',
                //label : obj.label
              };

              nodeObject.font = {
                color: '#FFFFFF',
                size: 12,
                face: 'arial',

              };
              nodeObject.color = {
                background:'#048BF9',
                border:'#713E7F',
                color: '#FFFFFF',
                highlight:{
                  background:'green',
                  border:'black',
                },
              };
              if(obj.properties.sentiment) {
                if (obj.properties.sentiment[0].value == 'Neutral') {
                  nodeObject.color = {
                    background:'#048BF9',
                    border:'#713E7F',
                    color: '#FFFFFF',
                    highlight:{
                      background:'green',
                      border:'black',
                    },
                  };
                } else if (obj.properties.sentiment[0].value == 'Positive') {
                  nodeObject.color = {
                    background:'#2B991B',
                    border:'#713E7F',
                    color: '#FFFFFF',
                    highlight:{
                      background:'green',
                      border:'black',
                    },
                  };
                } else if (obj.properties.sentiment[0].value == 'Negative') {
                  nodeObject.color = {
                    background:'#F90404',
                    border:'#713E7F',
                    color: '#FFFFFF',
                    highlight:{
                      background:'green',
                      border:'black',
                    },
                  };

                }
              }
              rawNodes.push(nodeObject);
              ignoreNodes.push(obj.id);
            }
          }

          if (obj.type == 'edge') {
            if (ignoreEdges.indexOf(obj.id) < 0) {
              rawEdges.push({
                from: obj.outV,
                to: obj.inV,
                label:obj.label,
                font: {align: 'middle'},
                length:100
              });
              ignoreEdges.push(obj.id);
            }
          }
        }
      }
    }
    console.log(rawNodes);

    // create an array with nodes
    var nodes = new vis.DataSet(rawNodes);

    // create an array with edges
    var edges = new vis.DataSet(rawEdges);

    // create a network
    /*eslint no-unused-vars: ["error", { "varsIgnorePattern": "container" || "options" }]*/
    var container = document.getElementById('the-graph');
    data = {
      nodes: nodes,
      edges: edges,
    };
    var layoutMethod = 'directed';
    var options = {
      layout: {
        hierarchical: {
          sortMethod: layoutMethod,
          levelSeparation: 200
        }
      },
      edges: {
        smooth: true,
        arrows: {to : true }

      },
      interaction:{
        dragNodes:false,
        dragView: false,
        hideEdgesOnDrag: false,
        hideNodesOnDrag: false,
        hover: true,
        hoverConnectedEdges: true,
        keyboard: {
          enabled: false,
          speed: {x: 10, y: 10, zoom: 0.02},
          bindToWindow: true
        },
        multiselect: true,
        navigationButtons: true,
        selectable: true,
        selectConnectedEdges: true,
        tooltipDelay: 300,
        zoomView: true
      }
    };

    var network = new vis.Network(container, data, options);

    // network.on("select", function (params) {
    //   node = nodes.get(params.nodes[0])
    //     callService(value, node.label , node.nodeLabel)
    //
    // });


    $('#query').html(traversal.annotated());
    $('[data-toggle="tooltip"]').tooltip();
    // if (queryContainer.hasClass('hidden')) {
    //   queryContainer.removeClass('hidden');
    // }
  })
    .fail(function() {
      var loadingSpinner = '<i> No data found for this query. </i>';
      $('#query, #the-graph').html(loadingSpinner);
    })
  );

}
