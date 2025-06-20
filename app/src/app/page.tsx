"use client"
import React, { useState } from "react";
import { getCandidates, solveHiddenSingles, solveSingles } from "./functions/singles";

const SIZE: number = 9;
const BLOCK = 3;
type SudokuGrid = number[][];

const sudokuGrid: number[][] = [
  [0, 7, 0, 0, 0, 1, 9, 0, 0],
  [5, 0, 0, 8, 0, 0, 0, 0, 3],
  [0, 0, 0, 0, 0, 0, 0, 5, 0],
  [0, 0, 0, 0, 9, 0, 0, 0, 2],
  [0, 9, 6, 2, 0, 0, 0, 0, 5],
  [0, 8, 0, 7, 0, 0, 0, 0, 0],
  [0, 0, 8, 0, 0, 4, 0, 6, 0],
  [7, 0, 3, 0, 0, 0, 0, 2, 0],
  [4, 0, 0, 0, 6, 0, 0, 0, 0],
];

const sudokuGrid2: number[][] = [
  [0, 9, 0, 7, 0, 1, 0, 0, 0],
  [0, 0, 0, 4, 0, 0, 0, 0, 0],
  [7, 0, 0, 0, 0, 6, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 4],
  [0, 0, 0, 0, 9, 5, 0, 0, 7],
  [6, 0, 8, 0, 4, 0, 0, 9, 0],
  [8, 0, 0, 3, 0, 0, 7, 0, 0],
  [0, 0, 4, 0, 5, 0, 0, 0, 2],
  [0, 2, 9, 0, 0, 0, 0, 5, 8],
];
// creates empty list with SIZE slots and fills all spots with 0
// for each slot in the list, make a new list of SIZE number of 0
const initialGrid: SudokuGrid = new Array(SIZE).fill(0).map(() => //initially .fill(0) just to give .map() something to loop over
  new Array(SIZE).fill(0)
);

export default function Home() {
  const [grid, setGrid] = useState<SudokuGrid>(initialGrid);
  const [message, setMessage] = useState<String>("Fill in sudoku puzzle, then click 'SOLVE'!");
  const [needSolution, setNeedsolution] = useState<boolean>(false);

  // tracks initial numbers provided by the Sudoku puzzle
  const [userInput, setUserInput] = useState<boolean[][]>(
    new Array(SIZE).fill(0).map(() =>
      new Array(SIZE).fill(false)
    )
  );

  const handleNumInput = (row: number, col: number, value: string) => {
    //converts string into integer
    const num = parseInt(value);
    if (isNaN(num) || num < 0 || num > 9) return (setMessage("Invalid input!"));

    //makes copy so the original is not mutated
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = num;

    const newUserInput = userInput.map((r) => [...r]);
    newUserInput[row][col] = true;

    setGrid(newGrid);
    setUserInput(newUserInput);

    console.clear();
    console.log("Updated puzzle:");
    console.table(newGrid);
  }

  return (
    <div className=" bg-stone-800 w-screen h-screen flex flex-col justify-center items-center">
      <p className="mb-5 text-4xl text-stone-200">SUDOKU SOLVER</p>
      <p className="h-12 text-stone-300">{message} </p>
      <div className="bg-stone-500" style={{ display: "grid", gridTemplateColumns: "repeat(9, 40px)" }}>
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <input
              key={`${i}-${j}`}
              type="text"
              pattern="[0-9]*" //limits user typing input to 0-9, but doesn't stop pasting or '123'
              value={
                needSolution
                  ? (cell === 0 ? getCandidates(grid, i, j).join("") : cell)
                  : (cell === 0 ? " " : cell)
              }
              onChange={(e) => handleNumInput(i, j, e.target.value)}
              className={`text-center border-1 box-content text-white
                ${userInput[i][j] ? "bg-stone-500 " : "bg-stone-400"
                }`}
              style={{
                width: "38px",
                height: "38px",
              }}>

            </input>
          ))
        )}
      </div>
      <button className="bg-rose-400 h-12 w-1/4 mt-5 rounded-full cursor-pointer"
        onClick={() => {
          let solved = solveSingles(grid);
          solved = solveHiddenSingles(solved);

          setGrid(solved);
          setNeedsolution(true);

          const isSolved = solved.every(row => row.every(cell => cell !== 0));
          if (isSolved) {
            setMessage("Puzzle solved!");
          } else {
            setMessage("No more possible singles at this point!");
          }
        }}>
        SOLVE
      </button>
      <button className="bg-green-400 h-12 w-1/4 mt-5 rounded-full cursor-pointer"
        onClick={() => {
          setGrid(sudokuGrid2)
          setUserInput(
            sudokuGrid2.map(row => row.map(cell => cell !== 0))
          );
        }}>ADD</button>
    </div>
  );
}
