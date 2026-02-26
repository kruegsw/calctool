// Dependency graph: topological sort (Kahn's algorithm) and cycle detection

/**
 * Build adjacency info from registry and active method selections.
 * @param {Object} registry - Map of propertyId -> PropertyDef
 * @param {Object} activeMethodMap - Map of propertyId -> selected method key (or null for user-input)
 * @returns {{ adjacency: Map<string,string[]>, inDegree: Map<string,number> }}
 */
export function buildGraph(registry, activeMethodMap) {
  const adjacency = new Map();   // dependency -> [dependents]
  const inDegree = new Map();    // node -> count of incoming edges

  // Initialize all nodes
  for (const id of Object.keys(registry)) {
    adjacency.set(id, []);
    inDegree.set(id, 0);
  }

  // Add edges based on active methods
  for (const [id, def] of Object.entries(registry)) {
    const methodKey = activeMethodMap[id];
    if (!methodKey || !def.methods[methodKey]) continue;

    const deps = def.methods[methodKey].inputs || [];
    for (const dep of deps) {
      if (!adjacency.has(dep)) continue; // skip unknown deps
      adjacency.get(dep).push(id);
      inDegree.set(id, (inDegree.get(id) || 0) + 1);
    }
  }

  return { adjacency, inDegree };
}

/**
 * Topological sort using Kahn's algorithm.
 * @returns {{ sorted: string[], hasCycle: boolean, cycleNodes: string[] }}
 */
export function topologicalSort(registry, activeMethodMap) {
  const { adjacency, inDegree } = buildGraph(registry, activeMethodMap);

  const queue = [];
  const sorted = [];

  // Seed queue with zero-indegree nodes
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);

    for (const dependent of adjacency.get(node) || []) {
      const newDeg = inDegree.get(dependent) - 1;
      inDegree.set(dependent, newDeg);
      if (newDeg === 0) queue.push(dependent);
    }
  }

  const allNodes = [...inDegree.keys()];
  const hasCycle = sorted.length < allNodes.length;
  const cycleNodes = hasCycle
    ? allNodes.filter(id => !sorted.includes(id))
    : [];

  return { sorted, hasCycle, cycleNodes };
}

/**
 * Get direct dependencies for a property given its active method.
 */
export function getDependencies(registry, propertyId, activeMethodMap) {
  const def = registry[propertyId];
  if (!def) return [];
  const methodKey = activeMethodMap[propertyId];
  if (!methodKey || !def.methods[methodKey]) return [];
  return def.methods[methodKey].inputs || [];
}

/**
 * Check if setting a property to a given method would create a cycle.
 * Used by UI to disable problematic method selections.
 */
export function wouldMethodCauseCycle(registry, activeMethodMap, propertyId, newMethodKey) {
  const testMap = { ...activeMethodMap, [propertyId]: newMethodKey };
  const { hasCycle } = topologicalSort(registry, testMap);
  return hasCycle;
}

/**
 * Get all transitive dependencies for a property (for hover highlighting).
 */
export function getTransitiveDependencies(registry, propertyId, activeMethodMap) {
  const visited = new Set();
  const stack = [propertyId];

  while (stack.length > 0) {
    const id = stack.pop();
    if (visited.has(id)) continue;
    visited.add(id);

    const deps = getDependencies(registry, id, activeMethodMap);
    for (const dep of deps) {
      if (!visited.has(dep)) stack.push(dep);
    }
  }

  visited.delete(propertyId); // don't include self
  return [...visited];
}

/**
 * Get all properties that transitively depend on a given property.
 */
export function getTransitiveDependents(registry, propertyId, activeMethodMap) {
  const { adjacency } = buildGraph(registry, activeMethodMap);
  const visited = new Set();
  const stack = [propertyId];

  while (stack.length > 0) {
    const id = stack.pop();
    if (visited.has(id)) continue;
    visited.add(id);

    for (const dep of adjacency.get(id) || []) {
      if (!visited.has(dep)) stack.push(dep);
    }
  }

  visited.delete(propertyId);
  return [...visited];
}
