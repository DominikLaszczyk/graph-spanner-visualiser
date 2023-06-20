var currentModeEventListener = null;
var nodeEventListener = null
var edgeEventListener = null
var eh = null
var nodeCounter = null

document.addEventListener("DOMContentLoaded", function() {

    nodeCounter = 1;

    //adjust the size and positioning of cytoscape graph based on navbar size
    const navbar = document.querySelector('.navbar');
    const navbarHeight = window.getComputedStyle(navbar).getPropertyValue('height');
    document.documentElement.style.setProperty('--navbar-height', (parseFloat(navbarHeight) * 2).toString() + "px");

    cy = cytoscape({
        container: document.getElementById("cy"),

    //     elements: [ // list of graph elements to start with
    //     { // node a
    //       data: { id: 'a' }
    //     },
    //     { // node b
    //       data: { id: 'b' }
    //     },
    //     { // edge ab
    //       data: { id: 'ab', source: 'a', target: 'b' }
    //     }
    //   ],
    
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)',
            'text-valign': 'center', // Vertically center the label
            'text-halign': 'center', // Horizontally center the label
            'color': 'white',
            'width': '60px', // Increase the width of the node
            'height': '60px', // Increase the height of the node
            'font-size': '22px', // Increase the font size of the label
            'font-weight': 'bold' // Increase the font weight of the label
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
              'border-width': 2,
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

    // Event listener to set default weight for newly added edges
    cy.on('add', 'edge', function(event) {
        var edge = event.target;
        edge.data('weight', 1);
        edge.style('label', 1);
    });


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
    })

    document.getElementById("clearEdgesBtn").addEventListener("click", function() {
        var edges = cy.edges();
        edges.remove();
    })

    eh = cy.edgehandles({
        snapThreshold: 20,
    });

    document.getElementById('numberedNodesCheckbox').checked = true;
  
    numberedNodesToggle(cy)
    zoomSlider(cy)
})

function numberedNodesToggle(cy) {
    var toggleLabelsCheckbox = document.getElementById('numberedNodesCheckbox');

    toggleLabelsCheckbox.addEventListener('change', function() {
        var showLabels = toggleLabelsCheckbox.checked;

        cy.nodes().forEach(function(node) {
            if (showLabels) {
                node.removeClass('hide-label')
            } else {
                node.addClass('hide-label')
            }
          });
    });
}

function zoomSlider(cy) {
    // Get the zoom slider element
    var zoomSlider = document.getElementById('zoomSlider');

    // Set initial zoom level
    var initialZoom = cy.zoom();
    zoomSlider.value = initialZoom;

    // Calculate the zoom center point
    var container = cy.container();
    var containerRect = container.getBoundingClientRect();
    var containerCenterX = containerRect.width / 2;
    var containerCenterY = containerRect.height / 2;

    // Add an event listener for the zoom slider
    zoomSlider.addEventListener('input', function() {
        var zoomValue = parseFloat(zoomSlider.value);
        var currentZoom = cy.zoom();

        // Calculate the difference in zoom level
        var zoomDiff = zoomValue - currentZoom;

        // Calculate the scaled difference based on the zoom center
        var zoomCenterDiffX = zoomDiff * containerCenterX;
        var zoomCenterDiffY = zoomDiff * containerCenterY;

        // Calculate the final zoom center position
        var zoomCenterX = containerCenterX + zoomCenterDiffX;
        var zoomCenterY = containerCenterY + zoomCenterDiffY;

        // Set the zoom level and center point
        cy.zoom({
        level: zoomValue,
        renderedPosition: { x: zoomCenterX, y: zoomCenterY }
        });
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
                id: nodeCounter,
                test: "testingvar"
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