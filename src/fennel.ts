export interface StudentInformation {
  id: number;
  contacts: number[];
}

export interface Pair {
  first: number;
  second: number;
}

/**
 * adjacency_list[0] = [1,2] means that vertex 0 is adjacent to vertex 1 and 2
 * edge_weights[v][j] denotes weight of the edge corresponding to G[v][j]
 */
export interface Graph {
  adjacency_list: number[][];
  edge_weights: number[][];
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
//~ export const exampleClass = [
  //~ { id: 1, contacts: [15, 16] },
  //~ { id: 2, contacts: [] },
  //~ { id: 3, contacts: [5, 18] },
  //~ { id: 4, contacts: [14, 19] },
  //~ { id: 5, contacts: [3, 9] },
  //~ { id: 6, contacts: [7, 17] },
  //~ { id: 7, contacts: [4, 8, 14] },
  //~ { id: 8, contacts: [14] },
  //~ { id: 9, contacts: [5, 12, 20] },
  //~ { id: 10, contacts: [9, 17] },
  //~ { id: 11, contacts: [9, 12, 13, 20] },
  //~ { id: 12, contacts: [9, 11, 13, 20] },
  //~ { id: 13, contacts: [3, 11, 12, 18, 20] },
  //~ { id: 14, contacts: [4, 19] },
  //~ { id: 15, contacts: [16] },
  //~ { id: 16, contacts: [1, 15] },
  //~ { id: 17, contacts: [6, 9, 10, 14, 15] },
  //~ { id: 18, contacts: [3, 5, 6, 13] },
  //~ { id: 19, contacts: [4, 7, 12, 14] },
  //~ { id: 20, contacts: [11, 13] },
//~ ];

// Example group, "Network 3"
export const exampleClass = [
  { id: 1, contacts: [4, 18 ,21] },
  { id: 2, contacts: [14] },
  { id: 3, contacts: [9, 13, 22] },
  { id: 4, contacts: [18] },
  { id: 5, contacts: [] },
  { id: 6, contacts: [11] },
  { id: 7, contacts: [4] },
  { id: 8, contacts: [19, 20 , 25] },
  { id: 9, contacts: [3, 13, 22] },
  { id: 10, contacts: [17] },
  { id: 11, contacts: [6, 16, 17, 27] },
  { id: 12, contacts: [15, 25] },
  { id: 13, contacts: [3, 9, 22] },
  { id: 14, contacts: [4, 19] },
  { id: 15, contacts: [16] },
  { id: 16, contacts: [17] },
  { id: 17, contacts: [6, 10, 11, 16, 27] },
  { id: 18, contacts: [1, 4, 21] },
  { id: 19, contacts: [7, 8, 15, 20, 25] },
  { id: 20, contacts: [28] },
  { id: 21, contacts: [1, 4, 18] },
  { id: 22, contacts: [3, 9, 13] },
  { id: 23, contacts: [6, 10, 11, 14, 19] },
  { id: 24, contacts: [] },
  { id: 25, contacts: [8, 19, 20, 22] },
  { id: 26, contacts: [4, 7, 8, 18, 20] },
  { id: 27, contacts: [1, 11, 17] },
  { id: 28, contacts: [20] }
];

/**
 * Partitions the vertex set of a graph (class of students) into
 * clusters (groups) such that each cluster has roughly the same
 * number of vertices and the number of crossing edges (contacts)
 * is small. (Results are typically good, but no guarantees.)
 * 
 * @param array of students StudentInformation
 * @param FennelOptions
 * @returns FennelResult: partition is in cluster/element representation  
 */
export function partitionClass(
  students: StudentInformation[],
  { k = 2, nu = 1.0 }: FennelOptions = {}
): FennelResult {
  // convert StudentInformation to an (unweighted) directed (multi) graph (with loops)
  const D = convertClassToDirectedGraph(students); // O(n+m) operations

  // turn D into a (unweighted) simple graph G
  const F = convertDirectedGraphToGraph(D); // O(n^2) operations
  
  // turn F into a weighted graph
  F.edge_weights = F.adjacency_list;
  let G = F;  
  
  // to take into account hard pairs / anti pairs uncomment following lines
  //~ const pairs = [{first: 0, second: 1}, {first: 0, second: 2}]; // forced to be in the same group
  //~ const anti_pairs = [{first: 3, second: 4}]; // forced to be in different groups
  //~ G = addWeightToEdges(F, pairs, 1000000);
  //~ G = addWeightToEdges(G, anti_pairs, -1000000);
  
  // partition G
  const S = partitionGraph(G, {k,nu}); // O(m) operations, most expensive step due to many iterations 
  // compute cluster/element representation of partition (with change
  // of index +1)
  const C = formatPartition(S, k); // O(n) operations

  return {
    partions: C,
    minCutSize: computeEdgeCutSize(F,S),
  };
}

/**
 * @param students double array of Persons GRP: adjacency lists of directed graph
 * @returns D unweighted directed graph
 */
function convertClassToDirectedGraph(students: StudentInformation[]): Graph {
  // Running time: O(n+m)
  // Note input student ids are 1,...,n whereas output indices are
  // 0,...,n-1. Also, Students need not be sorted by id.
  const n = students.length;
  
  const L = new Array(n);
  for (let i = 0; i < n; i++) {
    const student = students[i]; // student
    const v = student.id - 1;
    L[v] = [];
    let d = student.contacts.length; // number of friends
    for (let j = 0; j < d; j++) L[v].push(student.contacts[j] - 1);
  }
  
  return {
    adjacency_list: L, 
    edge_weights: [],
    };
}

/**
 * @param D double array of integers D: adjacency lists of directed graph
 * @returns double array of integers G_simple: adjacency lists of the corresponding simple graph
 */
function convertDirectedGraphToGraph(D: Graph): Graph {
  // Running time: O(n^2)
  
  const L = D.adjacency_list;
  const n = L.length;

  // Create adjacency matrix M. (This is the only way I see to keep
  // the running time below O(n^2).)
  const M = new Array(n);
  for (let v = 0; v < n; v++) {
    M[v] = new Array(n);
    for (let w = 0; w < n; w++) M[v][w] = 0;
  }
  for (let v = 0; v < n; ++v) {
    const d = L[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      const w = L[v][j]; // neighbour of vertex v
      if (v == w) continue;
      M[v][w] = 1;
      M[w][v] = 1;
    }
  }

  // Recover adjacencies K of simple graph from the adjacency matrix M
  const K = new Array(n);
  for (let v = 0; v < n; v++) {
    K[v] = [];
    for (let w = 0; w < n; w++) {
      if (M[v][w] == 1) K[v].push(w);
    }
  }

  return {
    adjacency_list: K, 
    edge_weights: [],
    };
}

/**
 * @param G: Graph
 * @param P: edges to update
 * @param weight: weight to be added on edges P
 * @returns F: updated graph
 */
function addWeightToEdges(G: Graph, P: Pair[], weight: number): Graph {
  // Running time: O(n^2)
  
  const L = G.adjacency_list;
  const E = G.edge_weights;
  const n = L.length;

  // set up matrix for adjacencies M and edge weights N
  const M = new Array(n);
  const N = new Array(n);
  for (let v = 0; v < n; v++) {
    M[v] = new Array(n);
    N[v] = new Array(n);
    for (let w = 0; w < n; w++) {
      M[v][w] = 0;
      N[v][w] = 0;
      }
  }
  for (let v = 0; v < n; ++v) {
    const d = L[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      const u = L[v][j]; // neighbour of vertex v
      const w = E[v][j]; // edge weight of uv
      M[v][u] = 1;
      N[v][u] = w;
    }
  }
  
  // update graph and edge weights
  const q = P.length
  for (let i = 0; i < q; i++) {
    const f = P[i].first;
    const s = P[i].second;
    M[f][s] = 1;
    M[s][f] = 1;
    N[f][s] += weight;
    N[s][f] += weight;
  }

  // recover updated graph and edge weights
  const K = new Array(n);
  const F = new Array(n);
  for (let v = 0; v < n; v++) {
    K[v] = [];
    F[v] = [];
    for (let u = 0; u < n; u++) {
      if (M[v][u] !== 0) {
        K[v].push(u);
        F[v].push(N[v][u]);
        }
    }
  }

  return {
    adjacency_list: K,
    edge_weights: F,
  };
}

/**
 * Partitions the vertex set of a graph into
 * clusters such that each cluster has roughly the same
 * number of vertices and the number of crossing edges
 * is small. (Results are typically good, but no guarantees.)
 * 
 * @param G: simple weighted graph
 * @param FennelOptions
 * @returns FennelResult: The partition has length n and entries 0,...,k-1
 */
export function partitionGraph(
  G: graph,
  {k, nu}: FennelOptions = {}
): number[] {
  // number of times we run Fennel
  const num_it = 10000;

  const L = G.adjacency_list;
  const E = G.edge_weights;
  
  const n = L.length; // number of vertices
  let m = 0; // total weight of edges
  for (let v = 0; v < n; v++) {
      const d = L[v].length;
      // sum weights of edges to neighbours of v
      for (let j = 0; j < d; j++) m += E[v][j];
    }
  m /= 2; // need to account for doublecounting
  // P is an array whose entries are 0,...,n-1 in some permutation. We
  // will use P as a random ordering for Fennel
  const P = new Array(n);
  for (let v = 0; v < n; v++) P[v] = v;

  // The following variables track the partition, cut size, cluster
  // sizes and (maximum) difference between cluster sizes during
  // the repeated applications of Fennel

  // Note that the partition S will be an array of length n, where
  // S[v]=i indicates that vertex v is in cluster S_i
  let min_S: number[] = [];
  let min_cut_size = n * n;
  let min_cluster_sizes = [];
  let min_diff = n;
  // We run Fennel num_it times with random orderings of the vertices
  for (let i = 0; i < num_it; i++) {
    // compute partition using Fennel
    const S = fennel(G, m, k, nu, shuffleArray(P)); // O(n+m) operations

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

  return min_S;
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
    const tmp = array[curId];
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
* @param G: simple weighted graph
 * @param m total weight of edges of G
 * @param k number of clusters
 * @param nu balancing parameter
 * @param P permutation of 0,...,n-1
 * @returns S partition, where S[v]=i means that vertex v has been assigned to cluster S_i.
 */
function fennel(
  G: Graph,
  m: number,
  k: number,
  nu: number,
  P: number[]
): number[] {

  const L = G.adjacency_list;
  const E = G.edge_weights;

  // gamma is an optimization paramter, whose value is was suggested by
  // Tsourakakis et al.
  const gamma = 1.5;
  
  const n = L.length; // number of vertices
  
  const max_cluster_size = (nu * n) / k; // maximal cluster size
  const alpha = (m * Math.pow(k, gamma - 1)) / Math.pow(n, gamma); // needed to compute f(v,i)

  // S is an array of integers of length n. Indices represent vertices
  // and values represent assigned clusters. For instance S[3]=1 means
  // vertex 3 is in cluster 1.
  // Initially every vertex is assigned to a (buffer) cluster k
  const S: number[] = new Array(n);
  for (let v = 0; v < n; v++) S[v] = k;

  // C is an array of integers of length k. Indices represent clusters
  // and values represent assigned cluster sizes.
  const C = new Array(k);
  for (let i = 0; i < k; i++) C[i] = 0;
  // This is the main loop. In each iteration, we add a vertex v to a cluster
  // based on local considerations. That is, we allocate v to the
  // cluster S_i, where i is such that a function f(v,i) is maximised.

  for (let l = 0; l < n; l++) {
    // permutation P decides the order in which we allocate vertices
    const v = P[l];
    const d = L[v].length; // degree of vertex v

    // NcapS is an array of ints of length k+1. Index i represents
    // cluster i and NcapS[i] is the edge-weighted size of the intersection
    // N(v) cap S_i. Note that NcapS[k] will count the unallocated vertices
    // (as a byproduct)

    const NcapS = new Array(k + 1);
    for (let i = 0; i < k; i++) NcapS[i] = 0;

    // The following is the most expensive loop! For each neighbour w = L[v][j]
    // of v and cluster index i=S[w] of w, we increase NcapS[i] by the weight E[v][j].

    for (let j = 0; j < d; j++) NcapS[S[L[v][j]]] += E[v][j];

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
    ++C[i_max]; // account for this addition in the cluster sizes C
  }
  return S;
}

/**
 * Computes the (weighted) cut size of S, i.e. the number of crossing edges
 * @param G weighted simple graph
 * @param S vertex partition where S[v] is the cluster index of vertex v
 * @returns (weighted) cut size of S
 */
function computeCutSize(G: Graph, S: number[]): number {
  // Running time: O(n+m)
  
  const L = G.adjacency_list;
  const E = G.edge_weights;
  
  const n = S.length;
  let cut_size = 0;
  for (let v = 0; v < n; ++v) {
    const d = L[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      const w = L[v][j]; // neighbour of vertex v
      if (S[v] !== S[L[v][j]]) cut_size += E[v][j];
    }
  }

  return cut_size / 2;
}

/**
 * Computes the edge cut size of S, i.e. the number of crossing edges
 * @param G weighted simple graph
 * @param S vertex partition where S[v] is the cluster index of vertex v
 * @returns edge cut size of S
 */
function computeEdgeCutSize(G: Graph, S: number[]): number {
  // Running time: O(n+m)
  
  const L = G.adjacency_list;
  
  const n = S.length;
  let cut_size = 0;
  for (let v = 0; v < n; ++v) {
    const d = L[v].length; // degree of vertex v

    for (let j = 0; j < d; ++j) {
      const w = L[v][j]; // neighbour of vertex v
      if (S[v] !== S[L[v][j]]) cut_size++;
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
