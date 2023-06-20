function runKruskal(cy, animationSpeed) {
    console.log("Kruskal running")


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
   
    console.log(edgeList);

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