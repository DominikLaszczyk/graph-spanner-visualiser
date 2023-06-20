var currentModeEventListener = null;
var nodeEventListener = null

document.addEventListener("DOMContentLoaded", function() {

    //adjust the size and positioning of cytoscape graph based on navbar size
    const navbar = document.querySelector('.navbar');
    const navbarHeight = window.getComputedStyle(navbar).getPropertyValue('height');
    document.documentElement.style.setProperty('--navbar-height', (parseFloat(navbarHeight) * 2).toString() + "px");

    cy = cytoscape({
        container: document.getElementById("cy"),
  
        elements: [ // list of graph elements to start with
        { // node a
          data: { id: 'a' }
        },
        { // node b
          data: { id: 'b' }
        },
        { // edge ab
          data: { id: 'ab', source: 'a', target: 'b' }
        }
      ],
    
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },
    
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
    
      layout: {
        name: 'grid',
        rows: 1
      }
      })


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


    
   
    
})

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
            break;
        case "btnradio4":
            console.log("mode changed to 'remove edges'")
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
            data: { id: 'node-' + Date.now() },
            position: position
        });
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

//Calculate adjusted position
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