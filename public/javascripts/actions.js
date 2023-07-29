function initialiseActions() {
    initialiseActionsCheckbox()

}

function test() {
    newAction("Action: ", "node 2 attached to node 3", "alg-started");
    newAction("Vipera: ", "Ivanesca", "alg-ended");
    newAction("Albus: ", "Percival Wulfric Brian Dumbledore", "added-node-edge");
    newAction("", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet ultrices orci. Donec vel eros tincidunt, commodo erat eu, varius libero. Nam id lorem metus. Integer pellentesque augue laoreet nibh fringilla pellentesque. Fusce sit amet scelerisque orci, quis varius tellus. Pellentesque sem arcu, faucibus ultrices aliquet eget, vehicula vel ipsum. Suspendisse euismod metus ac dui scelerisque finibus. Fusce accumsan leo et nibh rutrum, et fermentum urna congue. ", "alg-calculation");  
}

function addNodeAndEdgeAction(source, target, sourceWasInSpanner, targetWasInSpanner) {
    if(!sourceWasInSpanner && targetWasInSpanner) {
        newAction("", "Adding node " + source + " with an edge to " + target + " (" + source + "-" + target + ")", "added-node-edge")
    }
    if(sourceWasInSpanner && !targetWasInSpanner) {
        newAction("", "Adding node " + target + " with an edge to " + source + " (" + target + "-" + source + ")", "added-node-edge")
    }
    if(!sourceWasInSpanner && !targetWasInSpanner) {
        newAction("", "Adding nodes " + source + " and " + target + " with edge " + " (" + source + "-" + target + ")", "added-node-edge")
    }
}

function addNodeAction(source, target, sourceWasInSpanner, targetWasInSpanner) {
    if(!sourceWasInSpanner && targetWasInSpanner) {
        newAction("", "Adding node " + source, "added-node-edge")
    }
    if(sourceWasInSpanner && !targetWasInSpanner) {
        newAction("", "Adding node " + target, "added-node-edge")
    }
    if(!sourceWasInSpanner && !targetWasInSpanner) {
        newAction("", "Adding nodes " + source + " and " + target, "added-node-edge")
    }
}

function newAction(strongText, body, type) {
    var colorClasses = ""

    switch(type) {
        case "alg-started":
            colorClasses += " alg-started"
            break;
        case "alg-ended":
            colorClasses += " alg-ended"
            break;
        case "added-node-edge":
            colorClasses += " added-node-edge"
            break;
        case "alg-calculation":
            colorClasses += " alg-calculation"
            break;
        case "alg-stage":
            colorClasses += " alg-stage"
            break;
        case "alg-performance":
            colorClasses += " alg-performance"
            break;
    }

    var actionsDiv = document.getElementById("chatBoxBody");
    var newAction = newAction = '<div class="chat-box-message' + colorClasses + '">';

    if (strongText.length === 0) {
        newAction += body
    }
    else {
        newAction += '<strong>' + strongText + '</strong>' + body;
    }

    newAction += '</div>';
    
    actionsDiv.innerHTML += newAction

    const messages = chatBoxBody.getElementsByClassName("chat-box-message");

    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        
        lastMessage.style.fontWeight = "bold";
        lastMessage.innerHTML = "<b>Current: </b>" + lastMessage.innerHTML;
    }
    if (messages.length > 1) {
        const lastMessage = messages[messages.length - 2];
        const messageContent = lastMessage.textContent.trim();
        const prefix = "Current: ";

        if (messageContent.startsWith(prefix)) {
            const newContent = messageContent.substring(prefix.length);
            lastMessage.textContent = newContent;
        }
        lastMessage.style.fontWeight = "normal";
    }

    actionsDiv.scrollTop = actionsDiv.scrollHeight
}

function initialiseActionsCheckbox() {
    $(function() {
        var initialBottomOffset = 20;
        var chatBox = $(".chat-box");
    
        // Initialize draggable
        chatBox.draggable({
            axis: "x",
            containment: "window",
            start: function(event, ui) {
                initialBottomOffset = chatBox.offset().bottom;
            },
            stop: function(event, ui) {
                if (initialBottomOffset < ui.offset.bottom) {
                    chatBox.css({ top: 20, bottom: "auto" });
                } else {
                    chatBox.css({ top: "auto", bottom: 20 });
                }
            }
        });
    
        // Toggle collapse when clicking the chat box header
        $(".chat-box-header").click(function() {
            $("#chatBoxBody").collapse("toggle");
        });
    });
}

function performanceAction(cy, cyResult, executionTime) {

    let numEdgesCy = cy.edges().length
    let numEdgesCyResult = cyResult.edges().length
    let numEdgesCutDown = numEdgesCy - numEdgesCyResult
    let averageSpanningRatioCy = computeAverageSpanningRatio(cy)
    let averageSpanningRatioCyResult = computeAverageSpanningRatio(cyResult)
    let spanningRatioDiff = averageSpanningRatioCyResult - averageSpanningRatioCy

    newAction(
        "Performance",
        "<br>Execution time: " + executionTime + "ms" +
        "<br>Num. of edges (original): " + numEdgesCy +
        "<br>Num. of edges (result): " + numEdgesCyResult +
        "<br>Percentage of edges cut down: " + ((numEdgesCutDown/numEdgesCy) * 100.0).toFixed(2) + "%" +
        "<br>Average spanning ratio (original): " + averageSpanningRatioCy.toFixed(2) +
        "<br>Average spanning ratio (result): " + averageSpanningRatioCyResult.toFixed(2) +
        "<br>Spanning ratio increase: " + ((spanningRatioDiff/averageSpanningRatioCy) * 100.0).toFixed(2) + "%",
        "alg-performance"
    )
}

function computeAverageSpanningRatio(cy) {
    //compute the average shortest path distance in cy
    let shortestPathList = [];
    let averageSpanningRatio = 0;

    //get all nodes
    let nodes = cy.nodes();
    
    for(let i=0; i<nodes.length-1; i++) {
        for(let j=i+1; j<nodes.length; j++) {
            let source = nodes[i].id();
            let target = nodes[j].id();

            //calculate shortest weight path in cy
            var dijkstra = cy.elements().dijkstra("#" + source, function(edge){
                return edge.data('weight');
            });
            var shortestPathWeight = dijkstra.distanceTo(cy.$("#" + target));

            shortestPathList.push(shortestPathWeight);
        }
    }

    if(shortestPathList.length !== 0) {
        const sum = shortestPathList.reduce((acc, curr) => acc + curr, 0);
        averageSpanningRatio = sum / shortestPathList.length;
    }

    return averageSpanningRatio;
}