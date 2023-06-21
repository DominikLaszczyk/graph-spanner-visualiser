function runGreedyTSpanner(cy, cyResult, distortionFactor, layout, animationDelay) {
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

    // Sorting the array in non-decreasing order by the 'weight' property
    edgeList.sort(function(a, b) {
        return a.weight - b.weight;
    });

    for (let i = 0; i < edgeList.length; i++) {
        const edge = edgeList[i];
        var source = edge.source;
        var target = edge.target;
        var weight = edge.weight

        // Create nodes if they don't exist
        if (!cyResult.$id(source).length) {
            cyResult.add({ data: { id: source } });
        }
        if (!cyResult.$id(target).length) {
            cyResult.add({ data: { id: target } });
        }

        //calculate shortest weight path in cyResult
        var dijkstra = cyResult.elements().dijkstra("#" + source, function(edge){
            return edge.data('weight');
        });
        var shortestPathWeight = dijkstra.distanceTo(cyResult.$("#" + target));

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

        }
    };

    applyAutomaticLayout(cyResult, layout, animationDelay)

    
}