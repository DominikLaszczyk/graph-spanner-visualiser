// Disjoint-Set (Union-Find) Data Structure
class DisjointSet {
    constructor(size) {
      this.parent = new Array(size);
      this.rank = new Array(size);
  
      // Initialize each element as a separate set
      for (let i = 0; i < size; i++) {
        this.parent[i] = i;
        this.rank[i] = 0;
      }
    }
  
    // Find the representative (root) of the set containing the element
    find(element) {
      if (this.parent[element] !== element) {
        // Path compression: Set the parent to the root
        this.parent[element] = this.find(this.parent[element]);
      }
      return this.parent[element];
    }
  
    // Union (merge) two sets by rank
    union(elementA, elementB) {
      const rootA = this.find(elementA);
      const rootB = this.find(elementB);
  
      if (rootA === rootB) {
        return; // Elements are already in the same set
      }
  
      // Union by rank: Attach the shorter tree to the root of the taller tree
      if (this.rank[rootA] < this.rank[rootB]) {
        this.parent[rootA] = rootB;
      } else if (this.rank[rootA] > this.rank[rootB]) {
        this.parent[rootB] = rootA;
      } else {
        this.parent[rootB] = rootA;
        this.rank[rootA]++;
      }
    }
  }