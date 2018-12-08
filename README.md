
[![Build Status](https://api.travis-ci.com/sanderd17/solanum.png?branch=master)](https://travis-ci.com/sanderd17/solanum)

# Solanum

Solanum is a project that aims to bring big Scada applications to the browser via regular DOM handling


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
     * Solanum-editor


Every module consists of a server and client part. Resp. placed in the `src` and `public` directories. The main directory has an `index.js` file which exposes a factory function.

The factory is used to register public directories to the server, and can add hooks to the server in general, and specifically to the express app.

This allows for small, chainable libraries that don't need to be compiled before they can be used.

### Client

Client visualisation happens via plain SVG.

These SVG DOM elements can have tag bindings, which means a function can be bound to a tag change. This function can in turn change an SVG attribute (style, content or position).
The SVG elements can also have event handlers (click, right-click, drag, ...) by the means of custom functions.
These functions can change the visualisation (for local effects) or message the server back f.e. to write tag values.

The client tries to ensure there's one websocket connection open towards the server, over which the bidirectional messages will be send.

### Server

The server is mainly responsible keeping track of tag changes, and distributing it to the clients. For that purpose, it keeps a list of open websockets to the active clients, and subscribed tags.

When tags change, it sends the changes to the subscribed clients via web sockets.

## Design goals

### Realtime visualisation
When something changes, we want to display it as fast as possible.
This means everything should be event based, and update precisely the objects that are affected.

### Performance
JS and the DOM are often considered slow.
There are certain ways we can mitigate that:
* Native JS: by working with native JS, we avoid performance bottlenecks that are introduced by frameworks or other libraries.
* Update only the changes: As we work with update events instead of polling, we can update only the changed elements. The smaller the part of the DOM you update, the faster it goes.
* Reference by id: all SVG tags get a unique id in the entire document. Which means very fast lookups can be performed.

We should be able to achieve page loads with tens of thousands of SVG tags in less than a second, and update thousands of attributes per second on a decent client computer.

### Easy to debug and profile:
Since this is meant to be build on, it should be easy to debug for everyone.
This is achieved by a few means:

* No build tools: what you write, is what gets executed in the browser or on the server.
* Minimal library usage: libraries are often nice, but they can make debuggin hard.

### Easy to deploy:
The server should be based on standard npm packages, and run directly in node.js.
The client should only need a recent web browser and a network connection to the server.


### Easy to develop:
The editor should be self-explanatory, so PLC-programmers can easily link visualisations to data coming from the PLC.
Next to that, the code should be very transparent, so web-developers can create their own, advanced custom extension modules.

## Modular:
The core should only consist of a local tag provider and a way to act on tag changes on the server side. Combined with a way to visualise tags by binding tag values to SVG attributes on the client.

Everything else should be implemented as an optional module. This means implementations of other tag providers (communicating with real PLC's) and additional features like logging of tag history, alarming, audit logging, ... should all be implemented in modules that can be disabled.

## Non-goals

### Low network usage:
It is meant to run on a local network, where the server has a direct, wired connection to most clients.
The software will assume fast ping times, and should be able to send high volumes of data over the network.

### Security:
Security should be handled by other layers, from firewall blocking access to VPN security.

### Old software support:
The client and/or integrator should be in full control of the environment, and be able to update all client and server software to the latest versions, allowing the usage of advance new features.

## Dictionary

* DOM: The Document Object Model defines interfaces to work with standard XML-based documents. In this case mainly SGV nodes and attributes.
* SVG: Scalable Vector Graphics is a standard XML-based document format focused on 2D graphical representations. It's suitable for designing static images (often used for logo design), but SVG DOM makes it also very suited to use SVG for dynamic and interactive data visualisation.
* Tag: A tag is a single datapoint that will be updated and send independently from other tags. A tag can be a primitive datatype (numer or string) or a complex datatype (array, js object, ...).
