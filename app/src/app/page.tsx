"use client"
import React, { useState } from "react";

const SIZE: number = 9;
type SudokuGrid = number[][];

// creates empty list with SIZE slots and fills all spots with 0
// for each slot in the list, make a new list of SIZE number of 0
const initialGrid: SudokuGrid = new Array(SIZE).fill(0).map(() => //initially .fill(0) just to give .map() something to loop over
  new Array(SIZE).fill(0)
);



export default function Home() {
  const [grid, setGrid] = useState<SudokuGrid>(initialGrid);
  const [message, setMessage] = useState<String>("Fill in sudoku puzzle, then click 'SOLVE'!");

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
              value={cell === 0 ? "0" : cell}
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
      <button className="bg-rose-400 h-12 w-1/4 mt-5 rounded-full cursor-pointer">SOLVE</button>
    </div>
  );
}
