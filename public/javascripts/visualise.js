function initialiseVisualisation(cy, cyResult) {
    document.getElementById("visualiseBtn").addEventListener("click", function() {
        var chosenAlgorithm = getAlgorithm()
        var chosenLayout = getLayout()
        var chosenSpeed = getSpeed()
        var performanceMode = getPerformanceMode()
        var distortionFactor = document.getElementById("distortionFactor").value

        const chatBox = document.getElementById('chatBoxBody');
        const isCollapsed = chatBox.classList.contains('show');

        if (!isCollapsed) {
            $("#chatBoxBody").collapse("toggle");
        }

        chatBox.innerHTML = ""

        let cyNodes = cy.nodes();
        cyNodes.style('background-color', '#878787');

        switch(chosenSpeed) {
            case "fast":
                animationSpeed = 500
                break;
            case "medium":
                animationSpeed = 1000
                break;
            case "slow":
                animationSpeed = 2000
                break;
            case "instant":
                animationSpeed = 0
                break;
        }

        switch(chosenAlgorithm) {
            case "kruskal":
                runKruskal(cy, cyResult, chosenLayout, animationSpeed, performanceMode)
                break;
            case "greedy":
                runGreedyTSpanner(cy, cyResult, distortionFactor, chosenLayout, animationSpeed, performanceMode)
                break;
            case "proto":
                runProtoClusteringAndPathBuying(cy, cyResult, distortionFactor, chosenLayout, animationSpeed, performanceMode)
                break;
        }
    })
}

function addNewNodesEdgeStyle(cy, source, target) {
    const newNode1 = cy.$id(source);
    const newNode2 = cy.$id(target);
    const newEdge = cy.$id(source + "-" + target);
    newNode1.style({
        'background-color': '#9336d6',
        'border-color': '#4a0080',
    });

    newNode2.style({
        'background-color': '#9336d6',
        'border-color': '#4a0080',
    });

    newEdge.style({
        'line-color': '#9336d6',
        'target-arrow-color': '#4a0080',
    });
}

function resetNodeEdgeStyle(cy, source, target) {
    const newNode1 = cy.$id(source);
    const newNode2 = cy.$id(target);
    const newEdge = cy.$id(source + "-" + target);

    newNode1.style({
        'background-color': '#878787',
      
        'border-color': 'black',
    });

    newNode2.style({
        'background-color': '#878787',
        
        'border-color': 'black',
    });

    newEdge.style({
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
    });
}

function getPerformanceMode() {
    var performanceModeCheckbox = document.getElementById('performanceModeCheckbox');
    return performanceModeCheckbox.checked
}

function getAlgorithm() {
    //retrieve the algorithm chosen by the user
    var algorithmDropdownItems = document.getElementsByClassName("algorithmDropdownItem");
    for (var i = 0; i < algorithmDropdownItems.length; i++) {
        if (algorithmDropdownItems[i].classList.contains("active")) {
            return algorithmDropdownItems[i].getAttribute("data-value")
        }
    }
}

function getLayout() {
    //retrieve the layout chosen by the user
    var layoutDropdownItems = document.getElementsByClassName("layoutDropdownItem");
    for (var i = 0; i < layoutDropdownItems.length; i++) {
        if (layoutDropdownItems[i].classList.contains("active")) {
            return layoutDropdownItems[i].getAttribute("data-value")
        }
    }
}

function getSpeed() {
    //retrieve the speed chosen by the user
    var speedDropdownItems = document.getElementsByClassName("speedDropdownItem");
    for (var i = 0; i < speedDropdownItems.length; i++) {
        if (speedDropdownItems[i].classList.contains("active")) {
            return speedDropdownItems[i].getAttribute("data-value")
        }
    }
}
    
