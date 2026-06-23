---
name: kanbanflow-task-board-management
description: "<skill>"
category: "Productivity"
author: community
version: "0.1.0"
icon: check-square
---

<skill>
  <name>kanbanflow</name>
  <description>Manage KanbanFlow board tasks (board, columns, tasks, add, move, color, delete). Use this to organize work and track progress.</description>
  <usage>
    <command>kanbanflow board</command>
    <command>kanbanflow columns</command>
    <command>kanbanflow tasks [columnId]</command>
    <command>kanbanflow add <columnId> <name> [description] [color]</command>
    <command>kanbanflow move <taskId> <columnId></command>
    <command>kanbanflow color <taskId> <color></command>
    <command>kanbanflow delete <taskId></command>
  </usage>
</skill>
