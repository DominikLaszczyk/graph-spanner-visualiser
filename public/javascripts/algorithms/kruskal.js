function runKruskal(cy, cyResult, layout, animationDelay) {
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

    // Returns a Promise that resolves after "ms" Milliseconds
    const timer = ms => new Promise(res => setTimeout(res, ms))

    var MST = [];
    async function load () {
        for (let i = 0; i < edgeList.length; i++) {
            const edge = edgeList[i];
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

                    const newNode1 = cyResult.$id(source);
                    const newNode2 = cyResult.$id(target);
                    const newEdge = cyResult.$id(source + "-" + target);
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


                    
                    if(animationDelay > 0) {
                        applyAutomaticLayout(cyResult, layout, animationDelay)
                        await timer(animationDelay);
                    }
                    

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
            }
        }

        if(animationDelay === 0) {
            applyAutomaticLayout(cyResult, layout, animationDelay)
        }
    }

   load()

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