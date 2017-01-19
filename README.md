# Swarm Intelligent Vehicles #

## Objective States ##
- follow path
- boundary avoidance (of particles and walls)
- maintain minimum distance with other particles in lane
- only communicate with neighboring particles

## Communication Cases ##
- merging lanes
- intersections and stop signs
- bidirectional shared lane

## Path Planning ##
- Every intersection is a graph node
- Starting and Ending points are graph nodes
- Use Djikstra's shortest path algorithm to find shortest path on directed graph

## Future Considerations ##
- reinforcement learning
- prioritize different instances (ambulances, etc.)
