function runKruskal(cy, cyResult, layout, animationDelay) {
    console.log("Kruskal running")

    //clear result graph
    cyResult.elements().remove()

    var performanceMode = false;

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

    // Sorting the array in non-decreasing order by the 'weight' property
    edgeList.sort(function(a, b) {
        return a.weight - b.weight;
    });

    const nodeCount = cy.nodes().length;
    const disjointSet = new DisjointSet(nodeCount); // Create a disjoint-set with 2 sets

    var MST = [];
    async function load () {
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

            if(disjointSet.find(source) !== disjointSet.find(target)) {
                disjointSet.union(source, target)
                MST.push(edge)

                if(!performanceMode) {
                    
                    // Create nodes if they don't exist
                    if (!cyResult.$id(source).length) {
                        cyResult.add({ data: { id: source } });
                    }
                    if (!cyResult.$id(target).length) {
                        cyResult.add({ data: { id: target } });
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

                    if(animationDelay > 0) {
                        addNewNodesEdgeStyle(cyResult, source, target)

                        applyAutomaticLayout(cyResult, layout, animationDelay)
                        await timer(animationDelay);

                        resetNodeEdgeStyle(cyResult, source, target)
                    }
                    
                }
            }

            currentIndexPlayPause++;
        }

        if(animationDelay === 0) {
            applyAutomaticLayout(cyResult, layout, animationDelay)
        }
    }

    currentIndexPlayPause = 0;
    load();
}