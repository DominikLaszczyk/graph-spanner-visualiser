function runKruskal(cy, cyResult, layout, animationDelay, performanceMode) {
    newAction("Kruskal's MST Algorithm started!","", "alg-started")

    const startTime = performance.now();

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

    const nodeCount = cy.nodes().length;
    const disjointSet = new DisjointSet(nodeCount); // Create a disjoint-set with 2 sets

    var MST = [];
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
            var source = edge.source
            var target = edge.target
            var weight = edge.weight

            if(!performanceMode) {
                newAction("", "Checking if nodes: " + source + " and " + target + " are disconnected in spanner", "alg-calculation")
            }

            if(disjointSet.find(source) !== disjointSet.find(target)) {
                disjointSet.union(source, target)
                MST.push(edge)

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
                    addNodeAndEdgeAction(source, target, sourceWasInSpanner, targetWasInSpanner)

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
        
        newAction("Kruskal's MST Algorithm finished!", "", "alg-ended")

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        performanceAction(cy, cyResult, executionTime)
    }

    currentIndexPlayPause = 0;
    load();

    
}