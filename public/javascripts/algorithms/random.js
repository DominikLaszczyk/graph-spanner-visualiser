//Randomised edge sampling
function runRandomisedEdgeSampling(cy, cyResult, distortionFactor, layout, animationDelay, performanceMode) {
    newAction("Randomised Edge Sampling Algorithm started!","", "alg-started")

    const startTime = performance.now();

    //clear result graph
    cyResult.elements().remove()

    let nodes = cy.nodes();
    let edges = cy.edges();
    let highestWeight = findHighestWeight(edges)
    let maxWeight = highestWeight / distortionFactor;
    let probabilityUser = 1.0/distortionFactor;

    // Sort the edges based on the 'weight' attribute
    edges = edges.sort((edge1, edge2) => {
        const weight1 = edge1.data('weight');
        const weight2 = edge2.data('weight');
    
        // Compare the weights for sorting
        return weight1 - weight2;
    });
    

    if(!performanceMode) {
        newAction("", "Calculating the maximum edge weight for the spanner (highestWeight/k): " + highestWeight + "/" + distortionFactor + "=" + maxWeight, "alg-calculation")
        newAction("", "Adding all nodes to the spanner", "added-node-edge")
    }

    //copy over all of the nodes from cy to cyResult
    nodes.forEach((node) => {
        const nodeData = node.data(); // Get the data (attributes) of the node
        cyResult.add({ data: nodeData }); // Create a new node in the destination graph with the same data
    });

    async function load () {
        if(!performanceMode) {
            applyAutomaticLayout(cyResult, layout, animationDelay)
            await timer(animationDelay);
        }

        if(!performanceMode) {
            newAction("", "Checking if spanner is connected", "alg-calculation")
        }

        while(!isGraphConnected(cyResult)) {

            currentIndexPlayPause = 0;
            while(currentIndexPlayPause < edges.length) {
                if (!isPlaying) {
                    // Wait for 100 milliseconds before checking again
                    await timer(100);
                    continue;
                }

                let edge = edges[currentIndexPlayPause];

                let probabilityWeight = edge.data('weight')/highestWeight

                if(!performanceMode) {
                    newAction("", "Checking if weight of edge: " + edge.source().id() + "-" + edge.target().id() +
                    " is less than equal to max edge weight (" + edge.data('weight') + "<=" + maxWeight + ")", 
                    "alg-calculation")
                }

                if((Math.random() <= probabilityUser) || (Math.random() > probabilityWeight)) {
                    cyResult.add(edge);

                    if(!performanceMode) {
                        newAction("", "Condition true, adding edge: " + edge.source().id() + "-" + edge.target().id(), "added-node-edge")
                        applyAutomaticLayout(cyResult, layout, animationDelay)
                        await timer(animationDelay);
                    }
                }

                currentIndexPlayPause++;
            }

            if(!performanceMode) {
                newAction("", "Checking if spanner is connected", "alg-calculation")
            }
        }

        if(!performanceMode) {
            newAction("", "Spanner Connected!", "alg-ended")
        }

        if(animationDelay === 0 || performanceMode) {
            applyAutomaticLayout(cyResult, layout, animationDelay)
        }
        
        newAction("Randomised Edge Sampling Algorithm finished!", "", "alg-ended")

        const endTime = performance.now();
        const executionTime = endTime - startTime;

        performanceAction(cy, cyResult, executionTime)
    }

    currentIndexPlayPause = 0;
    load();
}

function isGraphConnected(cy) {
    if (cy.nodes().length === 0) {
      // An empty graph is considered connected
      return true;
    }
  
    // Pick a random node as the starting point for BFS
    const startNode = cy.nodes()[0];
  
    // Set to keep track of visited nodes during BFS
    const visitedNodes = new Set();
  
    // Queue to perform BFS
    const queue = [startNode];
  
    while (queue.length > 0) {
      const currentNode = queue.shift();
  
      if (!visitedNodes.has(currentNode.id())) {
        visitedNodes.add(currentNode.id());
  
        // Get the neighboring nodes of the current node
        const neighbors = currentNode.neighborhood().nodes();
  
        // Add unvisited neighboring nodes to the queue
        neighbors.forEach((neighbor) => {
          if (!visitedNodes.has(neighbor.id())) {
            queue.push(neighbor);
          }
        });
      }
    }
  
    // If the number of visited nodes is equal to the total number of nodes in the graph,
    // then the graph is connected.
    return visitedNodes.size === cy.nodes().length;
  }

function findHighestWeight(edges) {
    let highestWeight = Number.MIN_SAFE_INTEGER;
    //Iterate through each edge to find the highest weight
    edges.forEach((edge) => {
        const weight = edge.data('weight');

        // Compare and update highestWeight if needed
        if (weight > highestWeight) {
            highestWeight = weight;
        }
    });

    return highestWeight;
}