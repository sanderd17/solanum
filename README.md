
[![Build Status](https://api.travis-ci.com/sanderd17/solanum.png?branch=master)](https://travis-ci.com/sanderd17/solanum)

# Solanum

Solanum is a project that aims to bring Scada applications to the browser via regular DOM handling


## Structure

The structure must be modular. Modules can come from NPM, or can be installed locally to facilitate version management and allow testing parts of libraries.

An example module structure can look like this, this project both uses the core libraries, and is used to develop libraries for other purposes

 * HMI Showcase Project
   * Solanum-Gauges
   * Solanum-PowerTable
   * Solanum-MyCustomPlcDriver
   * ...
   * node_modules
     * Solanum-core
     * Solanum-opc
     * Solanum-studio


Every module consists of a server and client part. Resp. placed in the `src` and `public` directories. The main directory has an `index.js` file which exposes an init function.

The init function is used to register public directories to the server, and can add hooks to the server in general, and specifically to the express app.

This allows for small, chainable libraries that don't need to be compiled before they can be used.

### Client

Client visualisation happens via HTML elements, this allows for subpixel perfect rendering.

The structure is build out of components. Every component has children that define the design.
A parent can set the props of its children as a way to pass on data. This usually reflects into some visual change.
Props can also be bound to tags, so external systems (like PLCs) can alter visual elements in the system.

A child can send DOM events to its parents and grand-parents in order to message someting has changed. The parents can react on these events.

### Server

The server is mainly responsible keeping track of tag changes, and distributing it to the clients. The server communicates with the clients over websockets. This allows for very fast communication without the better known AJAX polling.

## Design goals

### Realtime visualisation
When something changes, we want to display it as fast as possible.
This means everything should be event based, and update precisely the objects that are affected.

### Performance
JS and the HTML are often considered slow.
There are certain ways we can mitigate that:
* Native JS: by working with native JS, we avoid performance bottlenecks that are introduced by frameworks, transpilers or other libraries.
* Update only the changes: As we work with update events instead of polling, we can update only the changed elements. The smaller the part of the DOM you update, the faster it goes.

We should be able to achieve page loads with thousands of tags displayed in less than a second a decent client computer.

### Easy to debug and profile:
Since this is meant to be build on, it should be easy to debug for everyone.
This is achieved by a few means:

* No build tools: what you write, is what gets executed in the browser or on the server.
* Minimal library usage: the core module must depend on a minimum of libraries, to make it easier to understand the code

### Easy to deploy:
The server should be based on standard npm packages, and run directly in node.js.
The client should only need a recent web browser and a network connection to the server.

### Easy to develop:
The editor should be self-explanatory, so programmers can easily link visualisations to data coming from the PLC.
Next to that, the code should be very transparent, so web-developers can create their own, advanced custom extension modules.

## Modular:
The core should be very minimal: only offer the minimal functionalities to bootstrap the server, and let the clients communicate, combined with some basic UI components.

Everything else should be implemented as an optional module. This means implementations of tag providers (communicating with real PLC's) and additional features like logging of tag history, alarming, audit logging, ... should all be implemented in modules that can be installed separately.

## Non-goals

### Low network usage:
It is meant to run on a local network, where the server has a direct, wired connection to most clients.
The software will assume fast ping times, and should be able to send high volumes of data over the network.

### Old software support:
The client and/or integrator should be in full control of the environment, and be able to update all client and server software to the latest versions, allowing the usage of advance new features.
