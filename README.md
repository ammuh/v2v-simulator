# Swarm Intelligent Vehicles #

In world of autonomous cars, we can see that vehicles are well on their way to become self sufficient and independent on the road. We wanted to see if these vehicles could utilize vehicle to vehicle communication to optimize route and decrease possible collisions. 

We set up an environment in which particles are placed in an environment in which their goal is to get to a destination without any collisions. In this world, every particle has it’s own intelligence, however it has access to information about other particles in a given radius, to simulate near field technology.

Here are some of the elements of the project:

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

## Reinforcement Learning ##
- Deep Q Learning used 
- Particles have "fibers" that can detect cars in a radius
- Particles have access to direction and velocity of other particles in it's vicinity
- Rewards are given for every node on the route that the particle has cleared and negative rewards for deviation and collisions
