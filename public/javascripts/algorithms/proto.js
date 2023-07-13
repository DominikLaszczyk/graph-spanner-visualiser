function runProtoClusteringAndPathBuying(cy, cyResult, distortionFactor, layout, animationDelay, performanceMode) {
    newAction("Proto-Clustering and Path Buying Algorithm started!","", "alg-started")

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

    //-------------------------------- HERE ALG STARTS --------------------------------//

    //-------------------------------- PROTO-CLUSTERING --------------------------------//
    newAction("","Starting the Proto-Clustering stage","alg-stage")

    // Choose initial clusters C1, ..., Ck randomly
    let clusters = [];
    
    async function load () {

        newAction("","Randomising initial clusters","alg-calculation")

        let nodesInInitialClusters = await chooseInitialClusters();
        let clustersColors = generateClusterColors(clusters);
        let unclusteredNodes = [];

        newAction("","Adding initial clusters with centers at: " + getNodeIdsFromAllClusters(clusters),"alg-added-node-edge")

        //add initial clusters to cyResult
        for(let i=0; i<clusters.length; i++) {
            let clusterCenter = clusters[i][0];
            
            cyResult.add(clusterCenter)
            let nodeInCyResult = cyResult.getElementById(clusterCenter.id())
            clusterCenter.style('background-color', clustersColors[i]);
            nodeInCyResult.style('background-color', clustersColors[i]);

            applyAutomaticLayout(cyResult, layout, animationDelay)
            await timer(animationDelay);
        }

        // Loop through each vertex in the graph
        let cyNodes = cy.nodes();

        for(let i=0; i<cyNodes.length; i++) {
            let node = cyNodes[i]

            if(!nodesInInitialClusters.includes(node)) {

                newAction("","Checking if node: " + node.id() + " is nearby a cluster","alg-calculation")

                let nearbyCluster =  findNearbyClusterAndAdd(node, clusters, clustersColors);

                //if not nearby cluster, add node and all incident edges and nodes
                if(nearbyCluster === null) {
                    unclusteredNodes.push(node)
                    cyResult.add(node)

                    newAction("","Node " + node.id() + " is not nearby a cluster, adding as unclustered","alg-added-node-edge")
                }
                else {
                    newAction("","Node " + node.id() + " is nearby a cluster, adding to cluster with center node: " + nearbyCluster[0].id(),"alg-added-node-edge")
                }

                applyAutomaticLayout(cyResult, layout, animationDelay)
                await timer(animationDelay)
            }
        }


        //add edges of unclustered nodes to cyResult
        addUnclusteredEdges(unclusteredNodes);

        applyAutomaticLayout(cyResult, layout, animationDelay)
        await timer(animationDelay);
        
        //-------------------------------- PATH BUYING --------------------------------//
        newAction("","Starting the Path Buying stage","alg-stage")
        newAction("","Generating all possible paths in original graph","alg-calculation")

        const nodes = cy.nodes();
        const paths = findAllPaths(cy.elements(), nodes);

        newAction("","Looping over all paths and calculating their costs and values","alg-calcuation")
        
        for(let i=0; i<paths.length; i++) {
            let path = paths[i];

            let pathValue = 0;
            let pathCost = 0;
            let pathNodesIds = getPathNodes(path);

            for(let i=0; i<clusters.length; i++) {
                for(let j=i+1; j<clusters.length; j++) {

                    let condition1 = false;
                    let condition2 = false;
                    //value of a path is determined by how much it lowers the shortest weight path between clusters
                    let addedValue = 0;
                    
                    let c1 = clusters[i];
                    let c2 = clusters[j];

                    let c1Ids = getClusterNodesIds(c1);
                    let c2Ids = getClusterNodesIds(c2);

                    //check if nodes in path overlap with both c1 and c2
                    function hasOverlap(arr1, arr2) {
                        return arr1.some(item => arr2.includes(item));
                    }

                    //check condition 1
                    if(hasOverlap(pathNodesIds, c1Ids) && hasOverlap(pathNodesIds, c2Ids)) {
                        condition1 = true;
                    }

                    //check condition 2
                    if(condition1) {

                        //calculate shortest weight path between c1 and c2 in cyResult
                        let shortestPathWeight = calculateShortestPathWeightClustersIds(c1Ids, c2Ids, cyResult);
                        
                        //check if after adding path to cyResult, the shortest weight path gets shorter
                        let cyResultJSON = cyResult.json();
                        let cyResultCopy = cytoscape({ elements: cyResultJSON.elements });

                        for(let k=0; k<pathNodesIds.length-1; k++) {
                            let sourceNodeId = pathNodesIds[k];
                            let targetNodeId = pathNodesIds[k+1];

                            // Check if there is an edge between the source and target nodes
                            let edgeInCyResultCopy = getEdge(sourceNodeId, targetNodeId, cyResultCopy)
                            
                            if (edgeInCyResultCopy === null) {
                                //edge not in cyResultCopy, need to get it from cy and add it to cyResultCopy
                                let edgeInCy = getEdge(sourceNodeId, targetNodeId, cy)

                                cyResultCopy.add(edgeInCy);
                            }
                        }

                        let shortestPathWeightAfterAddingPath = calculateShortestPathWeightClustersIds(c1Ids, c2Ids, cyResultCopy);

                        if(shortestPathWeightAfterAddingPath < shortestPathWeight) {
                            condition2 = true;
                            addedValue += shortestPathWeight - shortestPathWeightAfterAddingPath
                        }

                    }

                    if(condition1 && condition2) {
                        pathValue += addedValue;
                    }
                }
            }

            

            //calculate the cost of the path as sum of weights of edges not in cyResult
            for(let k=0; k<pathNodesIds.length-1; k++) {
                let sourceNodeId = pathNodesIds[k];
                let targetNodeId = pathNodesIds[k+1];

                // Check if there is an edge between the source and target nodes
                let edgeInCyResult = getEdge(sourceNodeId, targetNodeId, cyResult)
                
                if (edgeInCyResult === null) {
                    //edge not in cyResult, need to get it from cy and add it to cyResult
                    let edgeInCy = getEdge(sourceNodeId, targetNodeId, cy)

                    pathCost += edgeInCy.data("weight");
                }
            }

            
            if(!(pathCost === 0 && pathValue === 0)) {
                if(pathCost*distortionFactor <= pathValue) {
                    newAction("","Path: " + pathNodesIds + " with cost: " + pathCost + " and value: " + pathValue +
                    " fits criteria","alg-calculation")
                    newAction("","Adding path: " + pathNodesIds + " to the spaner","alg-added-node-edge")

                    addPathToGraph(pathNodesIds, cy, cyResult)

                    applyAutomaticLayout(cyResult, layout, animationDelay)
                    await timer(animationDelay);
                }
            }
        }

        newAction("Proto-Clustering and Path Buying Algorithm ended!","", "alg-ended")
    }

    load();

    //-------------------------------- HELPER METHODS --------------------------------//
    
    async function chooseInitialClusters() {
        let nodesInClusters = []
        const allNodes = cy.nodes();
        const numClusters = Math.round(Math.pow(allNodes.length, 2.0/3.0)); // Number of initial clusters to choose
        const shuffledNodes = shuffleArray(allNodes); // Shuffle the nodes randomly
        
        for(let i=0; i<numClusters; i++) {
            //create clusters
            let newCluster = [];
            let clusterCenter = shuffledNodes[i];
            newCluster.push(clusterCenter);
            nodesInClusters.push(clusterCenter);

            clusters.push(newCluster);
        }

        return nodesInClusters;
    }

    function generateClusterColors(clusters) {
        let clustersColors = [];
        for(let i=0; i<clusters.length; i++) {
            let randomColor = getRandomColor();

            clustersColors.push(randomColor)
        }

        return clustersColors;
    }

    // Function to find the nearby cluster for a given vertex
    function findNearbyClusterAndAdd(node, clusters, clustersColors) {
        let neighborhood = node.neighborhood();
        let adjacentClustersIndexes = [];

        //get indexes of all adjacent clusters
        for(let i=0; i<clusters.length; i++) {
            for(let j=0; j<clusters[i].length; j++) {
                if(neighborhood.contains(clusters[i][j])) {
                    adjacentClustersIndexes.push(i)
                }
            }
        }

        if(adjacentClustersIndexes.length === 0) {
            return null;
        }
        else {
            //shuffle adjacent clusters
            let shuffledAdjacentClustersIndexes = shuffleArray(adjacentClustersIndexes);
            let adjacentCluster = clusters[shuffledAdjacentClustersIndexes[0]]
            let adjacentClusterColor = clustersColors[shuffledAdjacentClustersIndexes[0]];

            //get the edge by which the node is connected to this cluster
            let edge = null;

            for(let i=0; i<adjacentCluster.length; i++) {
                let connectingEdge = node.edgesWith(adjacentCluster[i])

                if (connectingEdge.length > 0) {
                    edge = connectingEdge[0];
                    break;
                }
            }


            //add node to that cluster
            adjacentCluster.push(node)

            //add node to the graph
            cyResult.add(node)
            let nodeInCyResult = cyResult.getElementById(node.id())
            nodeInCyResult.style('background-color', adjacentClusterColor);

            //add edge connecting the node to the cluster to cyResult
            cyResult.add(edge);
        
            return adjacentCluster;
        }
    }

    
    function addUnclusteredEdges(unclusteredNodes) {
        for(let i=0; i<unclusteredNodes.length; i++) {
            let unclusteredNode = unclusteredNodes[i];

            console.log("Adding unclustered node: " + unclusteredNode.id())
        
            //Retrieve the connected edges in the original graph (cy)
            var connectedEdges = unclusteredNode.connectedEdges();
        
            //Add these edges to the target graph (cyResult)
            for(let j=0; j<connectedEdges.length; j++) {
                let edge = connectedEdges[j];
                cyResult.add(edge)
            }
        }
    }

}

function addPathToGraph(pathNodesIds, cy, cyResult) {
    for(let k=0; k<pathNodesIds.length-1; k++) {
        let sourceNodeId = pathNodesIds[k];
        let targetNodeId = pathNodesIds[k+1];

        // Check if there is an edge between the source and target nodes
        let edgeInCyResult = getEdge(sourceNodeId, targetNodeId, cyResult)
        
        if (edgeInCyResult === null) {
            //edge not in cyResult, need to get it from cy and add it to cyResult
            let edgeInCy = getEdge(sourceNodeId, targetNodeId, cy)

            cyResult.add(edgeInCy);
        }
    }
}

function getEdge(sourceNodeId, targetNodeId, cyResultCopy) {
    const edges = cyResultCopy.edges().filter(edge => {
        const sourceId = edge.source().id();
        const targetId = edge.target().id();
        return (sourceId === sourceNodeId && targetId === targetNodeId) ||
                (sourceId === targetNodeId && targetId === sourceNodeId);
    })

    if(edges.length > 0) {
        return edges[0]
    }
    else {
        return null;
    }
}

function calculateShortestPathWeightClustersIds(c1Ids, c2Ids, cyResult) {
    let shortestPathWeight = Number.MAX_VALUE

    for(let k=0; k<c1Ids.length; k++) {
        let source = c1Ids[k];
        for(let z=0; z<c2Ids.length; z++) {
            let target = c2Ids[z];

            let dijkstra = cyResult.elements().dijkstra("#" + source, function(edge){
                return edge.data('weight');
            });
            let currentShortestPathWeight = dijkstra.distanceTo(cyResult.$("#" + target));

            if(currentShortestPathWeight < shortestPathWeight) {
                shortestPathWeight = currentShortestPathWeight;
            }
        }
    }

    return shortestPathWeight;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getClusterNodesIds(cluster) {
    let elements = [];
    for(let i=0; i<cluster.length; i++) {
        elements.push(cluster[i].id());
    }

    return elements;
}

function getNodeIdsFromAllClusters(clusters) {
    let nodeIds = [];
    for(let i=0; i<clusters.length; i++) {
        nodeIds.push(clusters[i][0].id())
    }
    return nodeIds;
}

function getPathNodes(path) {
    let nodesIds = [];
    path.forEach(function(element) {
        nodesIds.push(element.id())
    })

    return nodesIds;
}

function findAllPaths(graph, nodes) {
    const paths = [];
  
    // Helper function to perform DFS
    function dfs(currentNode, targetNode, currentPath, visited) {
      // Append the current node to the current path
      currentPath.push(currentNode);
      visited.add(currentNode.id());
  
      // If the current node is the target node, add the current path to the list of paths
      if (currentNode.id() === targetNode.id()) {
        paths.push(currentPath.slice()); // Make a copy of the current path
      } else {
        // Explore the neighbors of the current node
        const neighbors = currentNode.neighborhood()
        neighbors.forEach((neighbor) => {
          // Check if the neighbor node is not already visited
          if (!visited.has(neighbor.id())) {
            dfs(neighbor, targetNode, currentPath, visited);
          }
        });
      }
  
      // Remove the current node from the current path and visited set to backtrack
      currentPath.pop();
      visited.delete(currentNode.id());
    }
  
    // Iterate over all pairs of nodes and find paths between them
    for (let i = 0; i < nodes.length; i++) {
      const sourceNode = nodes[i];
      for (let j = 0; j < nodes.length; j++) {
        const targetNode = nodes[j];
        if (sourceNode.id() !== targetNode.id()) {
          dfs(sourceNode, targetNode, [], new Set());
        }
      }
    }
  
    return paths;
}

// Function to generate a random color
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}








