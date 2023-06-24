function runGreedyTSpanner(cy, cyResult, distortionFactor, layout, animationDelay, performanceMode) {
    newAction("Greedy t-spanner Algorithm started!","", "alg-started")

    //clear result graph
    cyResult.elements().remove()

    // Retrieve the list of edges from the graph
    var edges = cy.edges();

    // Iterate over the edges and extract the required information
    var edgeList = [];
    
    edges.forEach(function(edge) {
        var edgeData = {
            id: edge.id(),
            source: edge.source().id(),
            target: edge.target().id(),
            weight: edge.data('weight') // Retrieve the "weight" attribute
        };
        edgeList.push(edgeData);
    });

    if(!performanceMode) {
        newAction("","Sorting edges in non-decreasing order by weight", "alg-calculation")
    }

    // Sorting the array in non-decreasing order by the 'weight' property
    edgeList.sort(function(a, b) {
        return a.weight - b.weight;
    });

    async function load () {
        var previousSource = null;
        var previousTarget = null;

        while(currentIndexPlayPause < edgeList.length) {
            // Check if the loop should continue running
            if (!isPlaying) {
                // Wait for 100 milliseconds before checking again
                await timer(100);
                continue;
            }

            const edge = edgeList[currentIndexPlayPause];
            var source = edge.source;
            var target = edge.target;
            var weight = edge.weight;

            var sourceWasInSpanner = true;
            var targetWasInSpanner = true;

            // Create nodes if they don't exist
            if (!cyResult.$id(source).length) {
                cyResult.add({ data: { id: source } });
                sourceWasInSpanner = false
            }
            if (!cyResult.$id(target).length) {
                cyResult.add({ data: { id: target } });
                targetWasInSpanner = false
            }

            if(!performanceMode) {
                addNodeAction(source, target, sourceWasInSpanner, targetWasInSpanner) 
                newAction("", "Calculating shortest weight path between nodes " + source + " and " + target + " with dijkstra", "alg-calculation")
            }

            //calculate shortest weight path in cyResult
            var dijkstra = cyResult.elements().dijkstra("#" + source, function(edge){
                return edge.data('weight');
            });
            var shortestPathWeight = dijkstra.distanceTo(cyResult.$("#" + target));

            if(!performanceMode) {
                newAction("", "Checking if shortestPath > variableK * weight: " + "(" +
                shortestPathWeight +" > " + distortionFactor + " * " + weight + ")", "alg-calculation")
            }

            //if greedy tspanner criteria met, add edge to cyResult
            if ((shortestPathWeight > distortionFactor * weight) || (shortestPathWeight === Infinity)) {
                // Create the edge
                cyResult.add({ 
                    data: { 
                        id: `${source}-${target}`, 
                        source: source, 
                        target: target,
                        weight: weight
                    } 
                });

                if(!performanceMode) {
                    newAction("", "Adding edge from node " + source + " to node " + target + " (" + source + "-" + target + ")", "added-node-edge")

                    if(animationDelay > 0) {
                        resetNodeEdgeStyle(cyResult, previousSource, previousTarget)
    
                        addNewNodesEdgeStyle(cyResult, source, target)
    
                        applyAutomaticLayout(cyResult, layout, animationDelay)
                        await timer(animationDelay);
    
                        previousSource = source;
                        previousTarget = target;
                    }
                }
            }

            currentIndexPlayPause++;
        }

        if(animationDelay === 0 || performanceMode) {
            applyAutomaticLayout(cyResult, layout, animationDelay)
        }

        newAction("Greedy t-spanner Algorithm finished!", "", "alg-ended")
    }

    currentIndexPlayPause = 0;
    load();
}