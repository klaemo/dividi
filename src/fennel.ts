// To do:
// - sanity checks on input
//   + check that all neighbours are  within 1,...,n
//   + check that graph has vertex order at most 100 (say)
//   + throw alert when there are loops, parallel edges

export interface StudentInformation {
  id: number;
  contacts: number[];
}

interface FennelOptions {
  /** number of clusters */
  k?: number;
  /** Balancing parameter, we are guaranteed to get `|S_i| <= nu*n/k`  where `n` is the number of vertices */
  nu?: number;
}

export interface FennelResult {
  partions: number[][];
  minCutSize: number;
}

// Example group, "Network 1"
export const exampleClass = [
  { id: 1, contacts: [15, 16] },
  { id: 2, contacts: [] },
  { id: 3, contacts: [5, 18] },
  { id: 4, contacts: [14, 19] },
  { id: 5, contacts: [3, 9] },
  { id: 6, contacts: [7, 17] },
  { id: 7, contacts: [4, 8, 14] },
  { id: 8, contacts: [14] },
  { id: 9, contacts: [5, 12, 20] },
  { id: 10, contacts: [9, 17] },
  { id: 11, contacts: [9, 12, 13, 20] },
  { id: 12, contacts: [9, 11, 13, 20] },
  { id: 13, contacts: [3, 11, 12, 18, 20] },
  { id: 14, contacts: [4, 19] },
  { id: 15, contacts: [16] },
  { id: 16, contacts: [1, 15] },
  { id: 17, contacts: [6, 9, 10, 14, 15] },
  { id: 18, contacts: [3, 5, 6, 13] },
  { id: 19, contacts: [4, 7, 12, 14] },
  { id: 20, contacts: [11, 13] },
];

/**
 * Partitions the vertex set of a graph (class of students) into
 * clusters (groups) such that each cluster has roughly the same
 * number of vertices and the number of crossing edges (contacts)
 * is small. (Results are typically good, but no guarantees.)
 */
export function partitionClass(
  students: StudentInformation[],
  { k = 2, nu = 1.05 }: FennelOptions = {}
): FennelResult {
  // Input:
  // - array of Students Class

  // Output:
  // 1) partition of the students
  // 2) number of crossing edges

  // number of times we run the FENNEL heuristic
  const num_it = 10000;

  console.log("Input class:", students);

  // We will represent graphs as adjacency lists, i.e. double arrays of
  // ints. The vertices are labelled 0,1,2,.... So if G is a graph, then
  // G[v] is the array of neighbours of vertex v.
  // Convert Class of students to a directed (multi) graph (with loops)
  const D = convertClassToDirectedGraph(students); // O(n+m) operations
  console.log("Derived directed multigraph with loops:");
  console.log(D);
  // run some basic checks on the input
  const E: number[][] = checkDirectedGraph(D);
  console.log("Vertices with a self-loop:", E[0]);
  console.log("Vertices with parallel edges:", E[1]);
  // turn D into a simple graph G
  const G = convertDirectedGraphToGraph(D); // O(n^2) operations
  console.log("Derived simple graph:");
  console.log(G);
  // partition G
  var R = partitionGraph(G, {k,nu}); // O(m) operations, most expensive step due to many iterations 
  console.log(R);
  // compute cluster/element representation of partition (with change
  // of index +1)
  const C = formatPartition(R.partions, k); // O(n) operations

  return {
    partions: C,
    minCutSize: R.minCutSize,
  };
}

/**
 * @param students double array of Persons GRP: adjacency lists of directed graph
 * @returns adjacency lists of (directed) graph
 */
function convertClassToDirectedGraph(students: StudentInformation[]): number[][] {
  // Running time: O(n+m)
  // Note input student ids are 1,...,n whereas output indices are
  // 0,...,n-1. Also, Students need not be sorted by id.
  var n = students.length;
  var G = new Array(n);
  for (let i = 0; i < n; i++) {
    const student = students[i]; // student
    const v = student.id - 1;
    G[v] = [];
    let d = student.contacts.length; // number of friends
    for (let j = 0; j < d; j++) G[v].push(student.contacts[j] - 1);
  }
  return G;
}

/**
 * @param D double array of integers D: adjacency lists of directed graph
 * @returns double array of numbers E:
 * E[0]: list of vertices with a self-loop
 * E[1]: list of vertices with parallel edges
*/
function checkDirectedGraph(D: number[][]): number[][] {
  // Running time: O(n^2)

  var n = D.length;

  // Create adjacency matrix M.
  var M = new Array(n);
  for (let v = 0; v < n; v++) {
    M[v] = new Array(n);
    for (let w = 0; w < n; w++) M[v][w] = 0;
  }
  for (let v = 0; v < n; ++v) {
    var d = D[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      var w = D[v][j]; // neighbour of vertex v
      M[v][w]++;
    }
  }
  
  
  const E: number[][] = [[],[]];
  // Search for self-loops
  for (let v = 0; v < n; v++) {
    if (M[v][v] > 0) E[0].push(v);
  }  
  
  // Search for repeated edges
  for (let v = 0; v < n; v++) {
    for (let w = 0; w < n; w++) {
      if (M[v][w] > 1) E[1].push(v); 
    }
  }

  return E;
}

/**
 * @param D double array of integers D: adjacency lists of directed graph
 * @returns double array of integers G_simple: adjacency lists of the corresponding simple graph
 */
function convertDirectedGraphToGraph(D: number[][]): number[][] {
  // Running time: O(n^2)

  var n = D.length;

  // Create adjacency matrix M. (This is the only way I see to keep
  // the running time below O(n^2).)
  var M = new Array(n);
  for (let v = 0; v < n; v++) {
    M[v] = new Array(n);
    for (let w = 0; w < n; w++) M[v][w] = 0;
  }
  for (let v = 0; v < n; ++v) {
    var d = D[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      var w = D[v][j]; // neighbour of vertex v
      if (v == w) continue;
      M[v][w] = 1;
      M[w][v] = 1;
    }
  }

  // Recover the simple graph G from the adjacency matrix M
  var G = new Array(n);
  for (let v = 0; v < n; v++) {
    G[v] = [];
    for (let w = 0; w < n; w++) {
      if (M[v][w] == 1) G[v].push(w);
    }
  }

  return G;
}

/**
 * Partitions the vertex set of a graph into
 * clusters such that each cluster has roughly the same
 * number of vertices and the number of crossing edges
 * is small. (Results are typically good, but no guarantees.)
 * 
 * @param double array of numbers G: adjacency lists of a simple graph
 * @param FennelOptions
 * @returns FennelResult: The partition has length n and entries 0,...,k-1
 */
export function partitionGraph(
  G: number[][],
  {k, nu}: FennelOptions = {}
): FennelResult {
  // number of times we run the FENNEL heuristic
  const num_it = 10000;

  var n = G.length; // number of vertices
  var m = 0; // number of edges
  for (let v = 0; v < n; v++) m += G[v].length;
  m /= 2; // need to account for doublecounting
  // P is an array whose entries are 0,...,n-1 in some permutation. We
  // will use P as a random ordering for Fennel
  var P = new Array(n);
  for (let v = 0; v < n; v++) P[v] = v;

  // The following variables track the partition, cut size, cluster
  // sizes and (maximum) difference between cluster sizes during
  // the repeated applications Fennel

  // Note that the partition S will be an array of length n, where
  // S[v]=i indicates that vertex v is in cluster S_i
  let min_S: number[] = [];
  let min_cut_size = n * n;
  let min_cluster_sizes = [];
  let min_diff = n;
  // We run FENNEL num_it times with random orderings of the vertices
  for (let i = 0; i < num_it; i++) {
    // compute partition using Fennel heuristic
    const S = fennel(G, n, m, k, nu, shuffleArray(P)); // O(n+m) operations

    // compute cut size
    const cut_size = computeCutSize(G, S); // O(n+m) operations
    // compute cluster sizes and maximum difference between them
    const cluster_sizes = computeClusterSizes(S, k);
    const min_cluster_size = Math.min(...cluster_sizes);
    const max_cluster_size = Math.max(...cluster_sizes);
    const diff = max_cluster_size - min_cluster_size;

    // If the cut_size is smaller (b1 = true), we choose S.
    // If the cut_size is the same, but the clusters are more
    // balanced (b2 = true), we also choose S.
    const b1 = cut_size < min_cut_size;
    const b2 = cut_size == min_cut_size && diff < min_diff;
    if (b1 || b2) {
      min_cut_size = cut_size;
      min_S = S;
      min_cluster_sizes = cluster_sizes;
      min_diff = diff;
    }
  }

  return {
    partions: min_S,
    minCutSize: min_cut_size,
  };
}

/**
 * Computes a uniform random shuffhle of array
 * Source https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html
 * Running time: O(n)
 */
function shuffleArray<T>(array: T[]): T[] {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

/**
 * Computes a partition S={S_0, ..., S_{k-1}} of the graph G such that
 * |S_i| < nu*n/k and there are few crossing edges. (No guarantees though.)
 *
 * Reference:
 * Tsourakakis, Charalampos, et al. "Fennel: Streaming graph
 * partitioning for massive scale graphs." Proceedings of the 7th ACM
 * international conference on Web search and data mining. 2014.
 *
 * Running time: O(n+m)
 *
 * @param G adjacency lists of the input graph, G[0] = [1,2] means that vertex 0 is adjacent to vertex 1 and 2
 * @param n vertex order, note that G.length(n)=n
 * @param m number of edges of G
 * @param k number of clusters
 * @param nu balancing parameter
 * @param P permutation of 0,...,n-1
 */
function fennel(
  G: number[][],
  n: number,
  m: number,
  k: number,
  nu: number,
  P: number[]
): number[] {
  // Output:
  // - array of ints S of length n, where S[v]=i means that
  // vertex v has been assigned to cluster S_i.

  // gamma is an optimization paramter, whose value is was suggested by
  // Tsourakakis et al.

  const gamma = 1.5; // optimization parameter
  const max_cluster_size = (nu * n) / k; // maximal cluster size
  const alpha = (m * Math.pow(k, gamma - 1)) / Math.pow(n, gamma); // needed to compute f(v,i)

  // S is an array of integers of length n. Indices represent vertices
  // and values represent assigned clusters. For instance S[3]=1 means
  // vertex 3 is in cluster 1.
  // Initially every vertex is assigned to a (buffer) cluster k
  const S: number[] = new Array(n);
  for (let v = 0; v < n; v++) S[v] = k; // faster than Array(n).fill(k)

  // C is an array of integers of length k. Indices represent clusters
  // and values represent assigned cluster sizes.
  const C = new Array(k);
  for (let i = 0; i < k; i++) C[i] = 0;
  // This is the main loop. In each iteration, we add a vertex v to a cluster
  // based on local considerations. That is, we allocate v to the
  // cluster S_i, where i is such that a function f(v,i) is maximised.

  for (let l = 0; l < n; l++) {
    // permutatation P decides the order in which we allocate vertices
    const v = P[l];
    const d = G[v].length; // degree of vertex v

    // NcapS is an array of ints of length k+1. Index i represents
    // cluster i and NcapS[i] is the size of the intersection
    // N(v) cap S_i. Note that NcapS[k] will count the unallocated vertices
    // (as a byproduct)

    const NcapS = new Array(k + 1);
    for (let i = 0; i < k; i++) NcapS[i] = 0;

    // This is the most expensive loop! For each neighbour w = G[v][j]
    // of v and cluster index i=S[w] of w, we increase NcapS[i] by one.

    for (let j = 0; j < d; j++) NcapS[S[G[v][j]]]++;

    // Compute cluster index i_max = i for which f(v,i) is maximal
    let i_max = k;
    let f_max = -m; // -m is a strict lower bound for f(v,i)

    for (let i = 0; i < k; i++) {
      // skip clusters that are already too large
      if (C[i] >= max_cluster_size) continue;

      // compute f(v,i)
      const f = NcapS[i] - alpha * gamma * Math.pow(C[i], gamma - 1);
      if (f > f_max) {
        i_max = i;
        f_max = f;
      }
    }

    S[v] = i_max; // add v to cluster S_(i_max)
    C[i_max]++; // account for this addition in the cluster sizes C
  }
  return S;
}

/**
 * Computes the cut size of S, i.e. the number of crossing edges
 * @param G double array of ints G: adjacency lists of the input graph, G[0] = [1,2] means that vertex 0 is adjacent to vertex 1 and 2
 * @param S array of ints S: vertex parttion where S[v] is the cluster index of vertex v
 * @returns array of ints C of length k: partition size where C[i] is the size of cluster i
 */
function computeCutSize(G: number[][], S: number[]): number {
  // Running time: O(n+m)
  var n = S.length;
  var cut_size = 0;
  for (let v = 0; v < n; ++v) {
    var d = G[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      var w = G[v][j]; // neighbour of vertex v
      if (S[v] !== S[G[v][j]]) cut_size++;
    }
  }

  return cut_size / 2;
}

/**
 * Computes clusters sizes of a partition S of k clusters
 * @param S array of ints S: vertex parttion where S[v] is the cluster index of vertex v
 * @param k number of clusters
 *
 * @returns array of ints C of length k: partition size where C[i] is the size of cluster i
 */
function computeClusterSizes(S: number[], k: number): number[] {
  const C = new Array(k);
  for (let i = 0; i < k; i++) C[i] = 0;

  const n = S.length;
  for (let v = 0; v < n; ++v) {
    C[S[v]]++;
  }

  return C;
}

/**
 * Formats vertex partition and changes index +1
 * [0,1,2,0,1] -> [[1,4],[2,5],[3]]
 *
 * @param S array of ints S: vertex parttion where S[v] is the cluster index of vertex v
 * @param k int k: number of clusters
 * @returns double array of ints C of length k: C[i] is the array of vertices of cluster i
 */
function formatPartition(S: number[], k: number): number[][] {
  const C = new Array(k);
  for (let i = 0; i < k; i++) C[i] = [];

  for (let v = 0; v < S.length; ++v) {
    C[S[v]].push(v + 1);
  }

  return C;
}
