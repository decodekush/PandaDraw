# 🐼 PandaDraw

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A real-time collaborative whiteboard built using CRDTs that enables multiple users to draw, edit, and interact on a shared canvas with conflict-free synchronization and eventual consistency.

---

## 🚀 Overview

PandaDraw is a distributed system designed to replicate and extend the capabilities of tools like Excalidraw, focusing on real-time collaboration over a 2D spatial canvas.

Unlike traditional collaborative editors that operate on linear text, PandaDraw synchronizes a **graph of spatial objects (shapes)** across multiple clients concurrently.

The system ensures:
- Real-time collaboration
- Conflict-free merging (CRDT)
- Offline-first capability
- Scalable architecture

---

## 🧠 Motivation

Most collaborative systems (e.g., Google Docs clones) deal with linear text, which simplifies synchronization.

PandaDraw intentionally tackles a harder problem:

> Synchronizing complex spatial data structures in real time across distributed clients.

This demonstrates:
- Advanced distributed systems design
- Handling concurrent updates on non-linear data
- Real-world system complexity (similar to Figma/Miro)

---

## 🐼 Why "PandaDraw"?

The name reflects the philosophy of the system:

> PandaDraw hides the complexity of distributed systems behind a simple, intuitive user experience — just like a panda appears calm despite its strength.

---

## ✨ Features

### Core
- Multi-user real-time collaboration
- Drawing tools (rectangle, arrow, freehand)
- Shape manipulation (move, resize, delete)
- Conflict-free updates using CRDT

### Presence
- Live cursors
- Selected shapes
- Active user tracking

### System
- WebSocket-based real-time sync
- Eventual consistency
- Offline-first support (planned)
- Snapshot & history system (planned)

---

## 🏗️ High-Level Architecture

PandaDraw follows a **CRDT-first distributed architecture**. For an in-depth dive, see the [Architecture Documentation](ARCHITECTURE.md).

### Components

1. **Frontend (Canvas UI)**
   - Handles drawing interactions
   - Renders shapes on canvas
   - Maintains local CRDT state

2. **CRDT Layer (Yjs)**
   - Manages shared document state
   - Ensures conflict-free merging
   - Generates incremental updates

3. **Sync Layer (WebSocket Server)**
   - Relays updates between clients
   - Handles connection lifecycle
   - Broadcasts CRDT updates

4. **Persistence Layer**
   - Stores snapshots of canvas state
   - Logs incremental updates
   - Enables recovery & versioning

5. **Presence Layer**
   - Tracks cursor positions
   - Tracks selections and active users
   - Uses ephemeral state (not persisted)

---

## 🔄 Real-Time Synchronization Flow

1. User performs an action (draw/move/edit shape)
2. Local CRDT state (Yjs) updates instantly
3. Yjs generates an incremental update
4. Update is sent via WebSocket to server
5. Server broadcasts update to other clients
6. All clients merge update automatically

### Key Property

> No central conflict resolution logic is required — CRDT guarantees convergence.

---

## 🗃️ Data Model

### Canvas Representation

The core data structure is managed by Yjs. Shapes are stored as a map of objects.

```ts
Y.Map<shapeId, Shape>
```

A `Shape` object structure:

```ts
interface Shape {
  id: string; // Unique shape identifier
  type: 'rectangle' | 'ellipse' | 'arrow' | 'freedraw' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  backgroundColor: string;
  isDeleted: boolean; // Tombstone for eventual consistency
}
```

---

## 🛠️ Getting Started

To get the project running locally, please follow the detailed instructions in our [Getting Started Guide](GETTING_STARTED.md).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.g