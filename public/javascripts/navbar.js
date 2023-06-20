function initialiseNavbarOptions(cy) {
    algorithmDropdownSetup()
    speedDropdownSetup()
    numberedNodesToggle(cy)
    zoomSlider(cy)
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