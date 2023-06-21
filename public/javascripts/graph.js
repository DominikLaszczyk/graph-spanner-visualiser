var currentModeEventListener = null;
var nodeEventListener = null
var edgeEventListener = null
var eh = null
var nodeCounter = null
var edgeCounter = null

document.addEventListener("DOMContentLoaded", function() {
    initlialiseDivider()

    

    nodeCounter = 1;
    edgeCounter = null

    //adjust the size and positioning of cytoscape graph based on navbar size
    const navbar = document.querySelector('.navbar');
    const navbarHeight = window.getComputedStyle(navbar).getPropertyValue('height');
    document.documentElement.style.setProperty('--navbar-height', (parseFloat(navbarHeight) * 2).toString() + "px");

    var cy = initialiseGraph("cy")
    var cyResult = initialiseGraph("cyResult")



    // Get all radio buttons in the group
    const radioButtons = document.querySelectorAll('input[name="btnradio"]');
    var checkedButton = document.querySelector('input[name="btnradio"]:checked');

    changeMode(checkedButton.id, cy)

    // Attach change event listener to each radio button
    radioButtons.forEach(button => {
        button.addEventListener('change', () => {
        changeMode(button.id, cy)
        });
    });

    //enable the clear graph and clear edges buttons functionality
    document.getElementById("clearGraphBtn").addEventListener("click", function() {
        cy.elements().remove()
        nodeCounter = 1;
        edgeCounter = 1;
    })

    document.getElementById("clearEdgesBtn").addEventListener("click", function() {
        var edges = cy.edges();
        edges.remove();
        edgeCounter = 1;
    })

    eh = cy.edgehandles({
        snapThreshold: 20,
    });

    // Event listener to set default weight for newly added edges
    cy.on('add', 'edge', function(event) {
        if(eh !== null && eh.drawMode) {
            console.log(eh.enabled)
            var edge = event.target;
            edge.data('weight', 1);
            edge.style('label', 1);
        }
    });

    
    initialiseNavbarOptions(cy)
    initialiseVisualisation(cy, cyResult)
})

function initlialiseDivider() {
    $(document).ready(function() {
        var $divider = $('#divider');
        var $container = $('#container');
        var $leftDiv = $('#cy');
        var $rightDiv = $('#cyResult');
        var startX;
        var startLeftWidth;
        var startRightWidth;
  
        $divider.mousedown(function(e) {
            startX = e.clientX;
            startLeftWidth = $leftDiv.width();
            startRightWidth = $rightDiv.width();
            $container.addClass('resizing');
    
            $(document).mousemove(onMouseMove);
            $(document).mouseup(onMouseUp);
        });
  
        function onMouseMove(e) {
            var diffX = e.clientX - startX;
            var containerWidth = $container.width();
            var newLeftWidth = startLeftWidth + diffX;
            var newRightWidth = startRightWidth - diffX;
    
            if (newLeftWidth >= 0 && newRightWidth >= 0) {
                $leftDiv.width((newLeftWidth / containerWidth * 100) + '%');
                $rightDiv.width((newRightWidth / containerWidth * 100) + '%');
            }
        }
  
        function onMouseUp() {
            $container.removeClass('resizing');
            $(document).off('mousemove', onMouseMove);
            $(document).off('mouseup', onMouseUp);
        }
      });
}

function changeMode(buttonId, cy) {
    switch(buttonId) {
        case "btnradio0":
            changeModeToMoveAround(cy)
            break;
        case "btnradio1":
            console.log("mode changed to 'add nodes'")
            changeModeToAddNodes(cy)
            break;
        case "btnradio2":
            console.log("mode changed to 'remove nodes'")
            changeModeToRemoveNodes(cy)
            break;
        case "btnradio3":
            console.log("mode changed to 'add edges'")
            changeModeToAddEdges(cy)
            break;
        case "btnradio4":
            console.log("mode changed to 'remove edges'")
            changeModeToRemoveEdges(cy)
            break;
        case "btnradio5":
            console.log("mode changed to 'change edge weights'")
            changeModeToChangeEdgeWeights(cy)
            break;
    } 
}

function changeModeToMoveAround(cy) {
    if(currentModeEventListener !== null) {
        const cytoscapeDiv = document.getElementById('cy');
        cytoscapeDiv.removeEventListener('click', currentModeEventListener);
    }

    if(cy !== null && nodeEventListener !== null) {
        cy.off('click', 'node', nodeEventListener);
    }

    if(cy !== null && edgeEventListener !== null) {
        cy.off('click', 'edge', edgeEventListener);
    }

    if(eh !== null) {
        eh.disableDrawMode();
    }
}

function changeModeToAddNodes(cy) {
    changeModeToMoveAround(cy)
    //Get references to necessary elements
    // const navbar1 = document.getElementById('navbar1');
    // const navbar2 = document.getElementById('navbar2');
    // const navbarOffsetHeight = navbar1.offsetHeight + navbar2.offsetHeight

    function addNodeEventListener(event) {
        const position = getAdjustedCursorPosition(event, cy);
    
        // Create a node at the adjusted position
        cy.add({
            group: 'nodes',
            data: { 
                id: nodeCounter
            },
            position: position
        });

        nodeCounter++;
    }

    currentModeEventListener = function(event) {
        addNodeEventListener(event)
    }

    const cytoscapeDiv = document.getElementById('cy');
    cytoscapeDiv.addEventListener('click', currentModeEventListener);
}

function changeModeToRemoveNodes(cy) {
    changeModeToMoveAround(cy)

    nodeEventListener = function(event) {
        var node = event.target;
        node.remove();
    }

    function removeNodeEventListener() {
        cy.on('click', 'node', nodeEventListener);
    }

    currentModeEventListener = removeNodeEventListener()

    const cytoscapeDiv = document.getElementById('cy');
    cytoscapeDiv.addEventListener('click', currentModeEventListener);
}

function changeModeToAddEdges(cy) {
    changeModeToMoveAround(cy)
    eh.enableDrawMode();
}

function changeModeToRemoveEdges(cy) {
    changeModeToMoveAround(cy)

    edgeEventListener = function(event) {
        var node = event.target;
        node.remove();
    }

    function removeEdgeEventListener() {
        cy.on('click', 'edge', edgeEventListener);
    }

    currentModeEventListener = removeEdgeEventListener()

    const cytoscapeDiv = document.getElementById('cy');
    cytoscapeDiv.addEventListener('click', currentModeEventListener);
}

function changeModeToChangeEdgeWeights(cy) {
    changeModeToMoveAround(cy)

    edgeEventListener = function(event) {
        var edge = event.target;
        var weight = prompt('Enter weight for the edge:', edge.data('weight'));
        
        if (weight !== null) {
            weight = parseFloat(weight);
            if (!isNaN(weight)) {
                edge.data('weight', weight);
                edge.style('label', weight);
            }
        }
    }

    function removeEdgeEventListener() {
        cy.on('click', 'edge', edgeEventListener);
    }

    currentModeEventListener = removeEdgeEventListener()

    const cytoscapeDiv = document.getElementById('cy');
    cytoscapeDiv.addEventListener('click', currentModeEventListener);
}

//Calculate adjusted cursor position
function getAdjustedCursorPosition(event, cy) {
    const cytoscapeDiv = document.getElementById('cy');
    const rect = cytoscapeDiv.getBoundingClientRect();
    var pan = cy.pan();
    var distanceScrolledX = pan.x;
    var distanceScrolledY = pan.y;
    const zoom = cy.zoom()

    const x = (event.clientX - rect.left - distanceScrolledX)/zoom;
    const y = (event.clientY - rect.top - distanceScrolledY)/zoom;

    return { x, y };
}

function applyAutomaticLayout(cy, layout, animatioDuration) {
    // Apply automatic layout
    cy.layout({
        name: layout, // Layout algorithm (e.g., 'cose', 'dagre', 'grid', etc.)
        animate: true, // Animate the layout
        animationDuration: animatioDuration, // Animation duration in milliseconds
        randomize: false, // Disable randomization of node positions
        
        // idealEdgeLength: 100,    // Adjust this value
        // nodeRepulsion: 3000,     // Adjust this value
        // padding: 20,             // Adjust this value
        // gravity: 0.5, 
    }).run();
}

function initialiseGraph(graphDivId) {
    return cytoscape({
        container: document.getElementById(graphDivId),
        automaticRender: false,
    
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#878787',
            'label': 'data(id)',
            'text-valign': 'center', // Vertically center the label
            'text-halign': 'center', // Horizontally center the label
            'color': 'white',
            'width': '60px', // Increase the width of the node
            'height': '60px', // Increase the height of the node
            'font-size': '22px', // Increase the font size of the label
            'font-weight': 'bold', // Increase the font weight of the label
            'border-color': 'black',     // Border color
            'border-width': '3px',      // Border width
          }
        },
    
        {
          selector: 'edge',
          style: {
            'width': 5,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'font-size': '20px',
          }
        },

        {
            selector: '.hide-label',
            style: {
                'label': '' // Hide the label
            }
        },

        {
            selector: '.eh-handle',
            style: {
              'background-color': 'red',
              'width': 12,
              'height': 12,
              'shape': 'ellipse',
              'overlay-opacity': 0,
              'border-width': 12, // makes the handle easier to hit
              'border-opacity': 0
            }
          },
  
          {
            selector: '.eh-hover',
            style: {
              'background-color': '#8800ff'
            }
          },
  
          {
            selector: '.eh-source',
            style: {
              'border-width': 5,
              'border-color': '#8800ff'
            }
          },
  
          {
            selector: '.eh-target',
            style: {
              'border-width': 2,
              'border-color': '#8800ff'
            }
          },
  
          {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
              'background-color': '#8800ff',
              'line-color': '#8800ff',
              'target-arrow-color': '#8800ff',
              'source-arrow-color': '#8800ff'
            }
          },
  
          {
            selector: '.eh-ghost-edge.eh-preview-active',
            style: {
              'opacity': 0
            }
          }
        ],
        
        layout: {
            name: 'grid',
            rows: 1
        },
    })
}