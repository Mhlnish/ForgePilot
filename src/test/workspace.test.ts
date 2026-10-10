import { describe, expect, it } from "vitest";
import { positionAt, nextPosition, type Task } from "../lib/workspace";

describe("Task Persistence Logic", () => {
  it("nextPosition returns 1024 for an empty column", () => {
    const tasks: Task[] = [];
    expect(nextPosition(tasks, "todo")).toBe(1024);
  });

  it("nextPosition returns max position + 1024 for a populated column", () => {
    const tasks = [
      { id: "1", status: "todo", position: 1024 },
      { id: "2", status: "todo", position: 2048 },
    ] as Task[];
    expect(nextPosition(tasks, "todo")).toBe(3072);
  });

  it("positionAt calculates midpoint correctly between two tasks", () => {
    const column = [
      { id: "1", position: 1024 },
      { id: "2", position: 2048 },
      { id: "3", position: 3072 },
    ] as Task[];

    // Insert at index 1 (between 1 and 2) -> (1024 + 2048) / 2 = 1536
    expect(positionAt(column, 1)).toBe(1536);

    // Insert at index 2 (between 2 and 3) -> (2048 + 3072) / 2 = 2560
    expect(positionAt(column, 2)).toBe(2560);
  });

  it("positionAt places at beginning (index 0) correctly", () => {
    const column = [
      { id: "1", position: 1024 },
      { id: "2", position: 2048 },
    ] as Task[];

    // Insert at index 0 -> before position 1024 -> 1024 - 1024 = 0
    expect(positionAt(column, 0)).toBe(0);
  });

  it("positionAt places at end correctly", () => {
    const column = [
      { id: "1", position: 1024 },
      { id: "2", position: 2048 },
    ] as Task[];

    // Insert at index 2 -> after position 2048 -> 2048 + 1024 = 3072
    expect(positionAt(column, 2)).toBe(3072);
  });

  it("positionAt handles empty column", () => {
    const column: Task[] = [];
    // If no before or after, returns 1024
    expect(positionAt(column, 0)).toBe(1024);
  });
});
