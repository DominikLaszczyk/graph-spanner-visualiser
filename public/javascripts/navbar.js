function initialiseNavbarOptions(cy) {
    algorithmDropdownSetup()
    layoutDropdownSetup()
    speedDropdownSetup()
    numberedNodesToggle(cy)
    randomGraph(cy)
    zoomSlider(cy)
}

function randomGraph(cy) {
    var numNodes = 50;
    var numEdges = 60;

    document.getElementById("randomGraphBtn").addEventListener("click", function() {
        cy.elements().remove()
        nodeCounter = 1;
        edgeCounter = 1;

        var remainingEdges = numEdges

        // Create node and connect it to an existing node with an edge
        for (var i = 0; i < numNodes; i++) {
            // Create a node at the adjusted position
            cy.add({
                group: 'nodes',
                data: { 
                    id: nodeCounter
                }
            });

            if (i>0) {
                var existingNodeId = Math.floor(Math.random() * i) + 1;
                cy.add({ 
                    data: { 
                        id: `${existingNodeId}-${nodeCounter}`, 
                        source: existingNodeId, 
                        target: nodeCounter,
                        weight: 1
                    } 
                });
                remainingEdges--;
            }

            nodeCounter++;
        }

        while (remainingEdges > 0) {
            const nodeA = Math.floor(Math.random() * numNodes) + 1;
            const nodeB = Math.floor(Math.random() * numNodes) + 1;

            if(nodeA !== nodeB && 
                cy.getElementById(nodeA + "-" + nodeB).length <= 0 && 
                cy.getElementById(nodeB + "-" + nodeA).length <= 0) {

                cy.add({ 
                    data: { 
                        id: `${nodeA}-${nodeB}`, 
                        source: nodeA, 
                        target: nodeB,
                        weight: 1
                    } 
                });
                remainingEdges--;
            }
        }

        // Layout the graph
        cy.layout({
            name: 'cose', // Layout algorithm (e.g., 'cose', 'dagre', 'grid', etc.)
            animate: true, // Animate the layout
            animationDuration: 500, // Animation duration in milliseconds
            randomize: false, // Disable randomization of node positions
            
            idealEdgeLength: 100,
            nodeRepulsion: 3000,
            padding: 20,  
            gravity: 0.5,
        }).run();
    })
}

function algorithmDropdownSetup() {
    var dropdown = document.getElementById("algorithmDropdown");
    var dropdownItems = document.getElementsByClassName("algorithmDropdownItem");

    // Add a click event listener to each dropdown item
    for (var i = 0; i < dropdownItems.length; i++) {
    
        dropdownItems[i].addEventListener("click", function() {
            // Get the selected text
            var selectedText = this.textContent;
          
            // Update the dropdown button text
            dropdown.textContent = selectedText;

            for (let j = 0; j < dropdownItems.length; j++) {
                dropdownItems[j].classList.remove("active");
            };
            this.classList.add("active");
            
        });

    }
}

function layoutDropdownSetup() {
    
    var dropdown = document.getElementById("layoutDropdown");
    var dropdownItems = document.getElementsByClassName("layoutDropdownItem");

    // Add a click event listener to each dropdown item
    for (var i = 0; i < dropdownItems.length; i++) {
    
        dropdownItems[i].addEventListener("click", function() {
            // Get the selected text
            var selectedText = this.textContent;
          
            // Update the dropdown button text
            dropdown.textContent = "Layout: " + selectedText;

            for (let j = 0; j < dropdownItems.length; j++) {
                dropdownItems[j].classList.remove("active");
            };
            this.classList.add("active");
        });
    }
}

function speedDropdownSetup() {
    
    var dropdown = document.getElementById("speedDropdown");
    var dropdownItems = document.getElementsByClassName("speedDropdownItem");

    // Add a click event listener to each dropdown item
    for (var i = 0; i < dropdownItems.length; i++) {
    
        dropdownItems[i].addEventListener("click", function() {
            // Get the selected text
            var selectedText = this.textContent;
          
            // Update the dropdown button text
            dropdown.textContent = "Speed: " + selectedText;

            for (let j = 0; j < dropdownItems.length; j++) {
                dropdownItems[j].classList.remove("active");
            };
            this.classList.add("active");
        });
    }
}

function numberedNodesToggle(cy) {
    document.getElementById('numberedNodesCheckbox').checked = true;

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