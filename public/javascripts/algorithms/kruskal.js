function runKruskal(cy, cyResult, animationDelay) {
    console.log("Kruskal running")

    //clear MST graph
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
    var i = 0;
    for (let edge of edgeList) {
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

                applyAutomaticLayout(cyResult)
            }
        }
        i++;
    }

   

    console.log(MST)
    

    //applyAutomaticLayout(cyResult)

    // for (var i=0; i<edgeList.length; i++) {
    //     var edge = cy.getElementById(String(edgeList[i].id));
    //     console.log(i)
    //     edge.animate({
    //         style: {
    //             "line-color": "blue", // New edge color
    //              // New arrow color
    //           },

    //         duration: 5000, // Specify the duration of the animation in milliseconds
    //         easing: 'ease-in-out', // Specify the easing function for the animation
    //     });
    // }
}