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
    callService(value, "", "");

  });

  $("#the-result").click( function()
       {
         var inProgressContainer = $('#the-result').parent().parent();
         if (!inProgressContainer.hasClass('hidden')) {
           inProgressContainer.addClass('hidden');
         }

       }
    );

    $('a[href="#sync"]').click(function(){
      var graphDataContainer = $('#graph-data').parent().parent().parent();
      var graphVisContainer = $('#the-graph').parent().parent();
      if (!graphDataContainer.hasClass('hidden')) {
          graphDataContainer.addClass('hidden');
          graphVisContainer.addClass('hidden');
        }
      callSync();
    });

    $('a[href="#reset"]').click(function(){
      var graphDataContainer = $('#graph-data').parent().parent().parent();
      var graphVisContainer = $('#the-graph').parent().parent();
      if (!graphDataContainer.hasClass('hidden')) {
          graphDataContainer.addClass('hidden');
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
    }));

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
    }));
}
function callService(value, nodeLabel, nodeText){
  var graphDataContainer = $('#graph-data').parent().parent().parent();
  var graphVisContainer = $('#the-graph').parent().parent();
  var queryContainer = $('#query').parent().parent().parent().parent();

  // Loading spinner
  var loadingSpinner = '<i class="fa fa-spinner fa-spin"></i>';
  $('#graph-data, #query, #the-graph').html(loadingSpinner);


  var url = '/knowledgegraph/' + value;
  if(nodeLabel && (nodeLabel!=""))
  {
    url = url+ '/' + nodeLabel;
  }


  if(nodeText && (nodeText!=""))
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

  if (graphDataContainer.hasClass('hidden')) {
      graphDataContainer.removeClass('hidden');
      graphVisContainer.removeClass('hidden');
    }

  ajaxRequest.push($.get(url, function (data) {
    console.log(data);

    // $('#query').html(data.query);

    $('#graph-data').html(JSON.stringify(data.data, null, 4));

    var rawNodes = [];
    var ignoreNodes = [];
    var rawEdges = [];
    var ignoreEdges = [];


    for (i = 0; i < data.data.length; i++) {
      var path = data.data[i].objects;
      for (j = 0; j < path.length; j++) {
        var obj = path[j];
        if (obj.type == 'vertex') {
          if (ignoreNodes.indexOf(obj.id) < 0) {
            var nodeLabelTxt = obj.properties.name[0].value;
            if(obj.properties.text)
            {
              nodeLabelTxt =  obj.properties.text[0].value
            }
            else {
              nodeLabelTxt =   obj.properties.name[0].value
            }
            var nodeObject = {
              id: obj.id,
              label: nodeLabelTxt.substring(0, 6)+'..',
              title: nodeLabelTxt,
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
            if(obj.properties.sentiment)
            {
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
              }else if (obj.properties.sentiment[0].value == 'Positive') {
                nodeObject.color = {
                  background:'#2B991B',
                  border:'#713E7F',
                  color: '#FFFFFF',
                  highlight:{
                    background:'green',
                    border:'black',
                  },
                };
              }else if (obj.properties.sentiment[0].value == 'Negative') {
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
              label:'          '+obj.label,
              font: {align: 'middle'},
              length:100
            });
            ignoreEdges.push(obj.id);
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
    var container = document.getElementById('the-graph');
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var layoutMethod = "directed";
    var options = {
        layout: {
          hierarchical: {
            sortMethod: layoutMethod,
            levelSeparation: 200
          }
        },
        edges: {
          smooth: true,
          arrows: {to : true },
          forceDirection: "none"
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
  }));

}
