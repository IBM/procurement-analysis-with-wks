var traversal = {};

(function () {

  // Standard traversal
  traversal.traversal = [
    'g',
    'V()',
    'has("name","MIRC Electronics Ltd")',
    'repeat(__.outE().inV().dedup().simplePath())',
    'until(__.has("name","British Virgin"))',
    'limit(12)',
    'path()'
  ];

  traversal.traversal1 = [
    'g',
    'V()',
    'hasLabel("Commodity")',
    'has("name", "MMA")',
    'outE()',
    'inV()',
    'outE()',
    'inV()',
    'outE()',
    'inV()',
    'outE()',
    'inV()',
    'outE()',
    'inV()',
    'path()',
    'simplePath()'
	  ];
    traversal.traversal1 = [
      'g',
      'V()',
      'hasLabel("Commodity")',
      'has("name", "MMA")',
      'repeat(__.outE().inV().dedup().simplePath()).until(out().count().is(0)).dedup().path().simplePath()'
  	  ];



traversal.traversal2 = [
  'g',
  'V()',
  'hasLabel("Commodity")',
  'has("name", "MMA")',
  'outE()',
  'inV()',
  'outE()',
  'inV()',
  'outE()',
  'inV()',
  'outE()',
  'inV()',
  'or(__.hasLabel(\'Country\'), __.hasLabel(\'Location\'))',
  'path()',
  'simplePath()'
  ];



traversal.traversal3 = [
  'g',
  'V()',
  'hasLabel("Commodity")',
  'has("name", "MMA")',
  'outE()',
  'inV()',
  'outE()',
  'inV().hasLabel("Supplier").has("name","Asahi Kasei Corp")',
  'repeat(outE().inV()).until(out().count().is(0)).path().simplePath()'
  ];

  traversal.traversal4 = [
      'g',
      'V()',
      'hasLabel("Commodity")',
      'has("name", "MMA")',
      'outE()',
      'inV()',
      'outE()',
      'inV()',
      'outE()',
      'inV()',
      'outE()',
      'inV()',
      'path()',
      'simplePath()'
    ];
    // Standard traversal
    traversal.annotation = [
      'The traversal object for the Graph.',
      'Start looking at all the Vertices.',
      'Find all Vertices that have the name \'MIRC Electronics Ltdn\'',
      'Look at the next Edge and Vertex from the current Vertex, and repeat.',
      'Repeat until the current Vertex has a label of \'person\', and a name property of Bill Paxton',
      'Limit the repeat to 12 rotations',
      'Return the complete path',
    ];

    // Actor
    traversal.addPerson = function (person) {
      traversal.traversal[4]  = "until(__.has('name','" + person + "'))";
      return traversal;
    };

    // All Paths
    traversal.allPaths = function () {
      traversal.traversal[3] = 'repeat(__.outE().inV().simplePath())';
      return traversal;
    };

    // All Paths
    traversal.resetAllPaths = function () {
      traversal.traversal[3] = 'repeat(__.outE().inV().dedup().simplePath())';
      return traversal;
    };

    // As a string
    traversal.toString = function () {
      return traversal.traversal.join('.');
    };

    // Annotated string
    traversal.annotated = function () {
      var annotation = [];

      for (i = 0; i < traversal.traversal.length; i++) {
        //annotation.push('<a href="#" data-toggle="tooltip" data-placement="right"  title="' + traversal.annotation[i] + '">' + traversal.traversal[i] + '</a>');
        annotation.push(traversal.traversal[i] + '  // <span class="blue-color">' + traversal.annotation[i] + '</span>');
      }

      return annotation.join('\n.');
    };

    // export the namespace object
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = traversal;
    }
  })();
