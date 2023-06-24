function initialiseNavbarOptions(cy, cyResult) {
    algorithmDropdownSetup()
    layoutDropdownSetup()
    speedDropdownSetup()
    numberedNodesToggle(cy, cyResult)
    randomGraph(cy)
    zoomSlider(cy)
    pauseButton()
}

function pauseButton() {
    const pauseButton = document.getElementById('playPauseButton');
    let isPaused = true;

    isPlaying = true

    pauseButton.addEventListener('click', function() {
      if (isPaused) {
        pauseButton.innerHTML = '<i class="fas fa-play"></i>';
        isPlaying = false
      } else {
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        isPlaying = true
      }
      isPaused = !isPaused;
    });
}

function randomGraph(cy) {
    document.getElementById("drawRandomGraphBtn").addEventListener("click", function() {
        cy.elements().remove()
        nodeCounter = 1;
        edgeCounter = 1;

        //get all the user-supplied values
        var numNodes = document.getElementById("numOfNodesRandom").value;
        var numEdges = document.getElementById("numOfEdgesRandom").value;
        var minWeight = document.getElementById("minWeightRandom").value;
        var maxWeight = document.getElementById("maxWeightRandom").value;

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
                var weight = Math.floor(Math.random() * (maxWeight - minWeight + 1) + minWeight) + 1

                cy.add({ 
                    data: { 
                        id: `${existingNodeId}-${nodeCounter}`, 
                        source: existingNodeId, 
                        target: nodeCounter,
                        weight: weight
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

                var weight = Math.floor(Math.random() * (maxWeight - minWeight + 1) + minWeight) + 1
                
                cy.add({ 
                    data: { 
                        id: `${nodeA}-${nodeB}`, 
                        source: nodeA, 
                        target: nodeB,
                        weight: weight
                    } 
                });
                
                remainingEdges--;
            }
        }

        // Layout the graph
        cy.layout({
            name: 'cose-bilkent', // Layout algorithm (e.g., 'cose', 'dagre', 'grid', etc.)
            nodeDimensionsIncludeLabels: true, // Adjust node dimensions to include labels
            randomize: true, // Enable incremental layout
            animate: false, // Disable animation for better performance
            fit: true, // Fit the graph to the viewport
            padding: 30, // Add padding around the graph
            idealEdgeLength: 100, // Adjust this value to control the spacing between nodes
            edgeElasticity: 0.05, // Adjust this value to control the edge lengths
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

function numberedNodesToggle(cy, cyResult) {
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

        cyResult.nodes().forEach(function(node) {
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