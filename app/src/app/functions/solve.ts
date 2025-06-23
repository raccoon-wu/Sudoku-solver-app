export const SIZE = 9;
export const BLOCK = 3;
export type SudokuGrid = number[][];

//custom type to pass grid + new UI message to main
type SolveResult = {
    grid: SudokuGrid;
    systemMessage?: string;
}
// function with validator to check for puzzle validity (no duplicate values in row, col and grid)
// if valid, runs solving logic in sequential order
// optional setMessage? (avoids error in case not passed in)

export function masterSolve(grid: SudokuGrid, setMessage?: (systemMessage: string) => void): SolveResult {
    let updatedGrid = grid.map(r => [...r]);

    let isValid = validator(updatedGrid);
    if (!isValid) {
        console.log("Puzzle is invalid!");

        return {
            grid: updatedGrid,
            systemMessage: "Puzzle is invalid! Duplicate value found!"
        };

    } else {
        // running naked singles logic
        updatedGrid = solveSingles(updatedGrid);

        if (checkResult(updatedGrid)) {
            console.log("Solved through naked singles!");
            return {
                grid: updatedGrid,
                systemMessage: "Solved through naked singles only!"
            };
        } else {
            console.log("All singles found, moving on to next method...hidden singles")
            console.table(updatedGrid);
        }

        // running hidden singles logic
        updatedGrid = solveHiddenSingles(updatedGrid);

        if (checkResult(updatedGrid)) {
            console.log("Solved through naked singles and hidden singles!")
            return {
                grid: updatedGrid,
                systemMessage: "Solved through naked singles and hidden singles!"
            };
        } else {
            console.log("All hidden and naked singles found, moving on to next method...backtracking")
            console.table(updatedGrid);
        }

        // running backtracking logic
        const result = backTrack(updatedGrid);
        if (result) {
            updatedGrid = result;
        } else {
            console.log("No viable solutions found.")
        }

        if (checkResult(updatedGrid)) {
            console.log("Solved through naked singles, hidden singles and backtracking!")
            return {
                grid: updatedGrid,
                systemMessage: "Solved through naked singles, hidden singles and backtracking!"
            };
        } else {
            console.log("Invalid Puzzle")
            console.table(updatedGrid);
        }
        return {
            grid: updatedGrid,
            systemMessage: "Invalid puzzle provided, no solutions found."
        };
    }
}

// locates next empty cell, returns [r, c] or void (console.log message)
export function findEmpty(grid: SudokuGrid): [number, number] | void {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return [r, c];
        }
    }
    return (console.log('No empty spaces avaliable!'));
}

// deducts from rows, columns and grids to produce avaliable numbers for the cell 
export function getCandidates(grid: SudokuGrid, r: number, c: number): number[] {
    // holds values already used, Set automatically ignores duplicates
    const used = new Set<number>();

    // loops through indices and adds all values in r and c
    for (let i = 0; i < SIZE; i++) {
        used.add(grid[r][i]);
        used.add(grid[i][c]);
    }

    const startingRow = Math.floor(r / BLOCK) * BLOCK;
    const startingColumn = Math.floor(c / BLOCK) * BLOCK;

    for (let i = 0; i < BLOCK; i++) {
        for (let j = 0; j < BLOCK; j++) {
            used.add(grid[startingRow + i][startingColumn + j]);
        }
    }
    //.map((current, i)=> i + 1) turns the array from [0, 0, 0, 0, 0, 0, 0, 0, 0] to [1, 2, 3, 4, 5, 6, 7, 8, 9]
    //.filter(n=> !used.has(n)) keeps only numbers that have not appeared in 'used' set
    return new Array(SIZE).fill(0).map((current, i) => i + 1).filter(n => !used.has(n));
}


// loops through logic (only one number left in array) until no more possible singles can be deducted.
export function solveSingles(grid: SudokuGrid): SudokuGrid {
    const updatedGrid = grid.map(r => [...r]);
    let changed = true;

    // keep loop going as long as something was filled in the previous pass
    while (changed) {
        changed = false;

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (updatedGrid[r][c] !== 0) continue; //skip filled cells

                // return first index if there's only one number left in the array
                const candidates = getCandidates(updatedGrid, r, c);
                if (candidates.length === 1) {
                    updatedGrid[r][c] = candidates[0];
                    changed = true;
                }
            }
        }
    }
    console.log("No more possible singles at this point!");
    return updatedGrid;
}

// logs the location of values in Map<value, [r, c][]>, when a value only corresponds to one set of [r,c], log as correct answer
export function solveHiddenSingles(grid: SudokuGrid): SudokuGrid {
    const updatedGrid = grid.map(r => [...r]);

    // if no empty cells exist, puzzle is already solved.
    const empty = findEmpty(updatedGrid);
    if (!empty) return updatedGrid;

    let changed = true;

    // keep loop going as long as something was filled in the previous pass
    while (changed) {
        changed = false;

        // checks rows for when a value (1-9) only have one cell associated [r,c], updates grid[][] with value
        for (let r = 0; r < SIZE; r++) {

            const candidateMap: Map<number, [number, number][]> = new Map();

            for (let c = 0; c < SIZE; c++) {
                if (updatedGrid[r][c] >= 1 && updatedGrid[r][c] <= 9) continue;
                const candidates = getCandidates(updatedGrid, r, c); // finds all possible values for the cell

                for (const value of candidates) { //iterates over each valid number in candidate
                    // Initialize value (1-9) if it does not exist as a key in the map, with the value of empty array []
                    if (!candidateMap.has(value)) { candidateMap.set(value, []); }
                    candidateMap.get(value)?.push([r, c]);
                    // If value exists, push cell coords to the array
                }
            }

            // checks column for when a value (1-9) only have one cell associated [r,c]
            for (const [value, cells] of candidateMap) { //iterates through each key-value pair of Map<number, [number, number][]>
                if (cells.length === 1) {
                    const [row, col] = cells[0];
                    updatedGrid[row][col] = value;
                    changed = true;
                }
            }
        }

        // checks columns for when a value (1-9) only have one cell associated [r,c], updates grid[][] with value
        for (let c = 0; c < SIZE; c++) {
            const candidateMap: Map<number, [number, number][]> = new Map();

            for (let r = 0; r < SIZE; r++) {
                if (updatedGrid[r][c] >= 1 && updatedGrid[r][c] <= 9) continue;

                const candidates = getCandidates(updatedGrid, r, c);

                for (const value of candidates) {
                    if (!candidateMap.has(value)) { candidateMap.set(value, []); }
                    candidateMap.get(value)?.push([r, c]);
                }
            }
            for (const [value, cells] of candidateMap) {
                if (cells.length === 1) {
                    const [row, col] = cells[0];
                    updatedGrid[row][col] = value;
                    changed = true;
                }
            }
        }

        // checks 3x3 block for when a value (1-9) only have one cell associated [r,c], updates grid[][] with value
        for (let boxRow = 0; boxRow < BLOCK; boxRow++) {
            for (let boxCol = 0; boxCol < BLOCK; boxCol++) {
                const candidateMap: Map<number, [number, number][]> = new Map();

                for (let i = 0; i < BLOCK; i++) {
                    for (let j = 0; j < BLOCK; j++) {
                        const r = boxRow * BLOCK + i;
                        const c = boxCol * BLOCK + j;

                        if (updatedGrid[r][c] !== 0) continue;

                        const candidates = getCandidates(updatedGrid, r, c);

                        for (const value of candidates) {
                            if (!candidateMap.has(value)) candidateMap.set(value, []);
                            candidateMap.get(value)?.push([r, c]);
                        }
                    }
                }

                for (const [value, cells] of candidateMap) {
                    if (cells.length === 1) {
                        const [row, col] = cells[0];
                        updatedGrid[row][col] = value;
                        changed = true;
                    }
                }
            }
        }

    }
    console.log("No more possible hidden singles at this point!");
    return updatedGrid;
}

export function backTrack(grid: SudokuGrid): SudokuGrid | null {
    const updatedGrid = grid.map(row => [...row]); // deep copy to avoid mutating original

    // if there's no empty cell then puzzle is solved
    const empty = findEmpty(updatedGrid); // returns [row, col]
    if (!empty) return updatedGrid;

    const [row, col] = empty;
    const candidates = getCandidates(updatedGrid, row, col);

    for (const value of candidates) {
        updatedGrid[row][col] = value;

        const result = backTrack(updatedGrid);
        if (result) return result; // success, return solved grid

        updatedGrid[row][col] = 0; // backtrack if this path failed
    }

    return null; // no valid solution from this branch
}

// checks whether all cells are filled with a number with value 1-9
function checkResult(grid: SudokuGrid): boolean {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const val = grid[r][c];

            // If any cell is not a number and not a value from 1-9, fail
            if (typeof val !== "number" || val < 1 || val > 9) {
                return false;
            }
        }
    }
    console.log("Puzzle Solved!");
    return true;
}

// checks whether there are duplicates values in rows, cols or blocks
function validator(grid: SudokuGrid): boolean {
    for (let r = 0; r < SIZE; r++) {
        const rowSeen = new Set<number>();
        const colSeen = new Set<number>();
        const boxSeen = new Set<number>();

        for (let c = 0; c < SIZE; c++) {
            // logs every col for every row checked
            const rowVal = grid[r][c];
            if (rowVal !== 0) {             //ignoring 0 as our grid is populated with them
                if (rowSeen.has(rowVal)) {  // duplicates found if val has already appeared
                    console.log(`Row ${r + 1}, Column ${c + 1} has a conflicting value!`)
                    return false;
                }
                console.log("Rows are validated!")
                rowSeen.add(rowVal);
            }

            //reverse to log row for every col checked
            const colVal = grid[c][r];
            if (colVal !== 0) {
                if (colSeen.has(colVal)) {
                    console.log(`Row ${c + 1}, Column ${r + 1} has a conflicting value!`)
                    return false;
                }
                console.log("Columns are validated!")
                colSeen.add(colVal);
            }

            const boxRow = Math.floor(r / BLOCK) * BLOCK + Math.floor(c / BLOCK);
            const boxCol = (r % BLOCK) * BLOCK + (c % BLOCK);
            const boxVal = grid[boxRow][boxCol];

            if (boxVal !== 0) {
                if (boxSeen.has(boxVal)) {
                    console.log(`Row ${r}, Column ${c} has a conflicting value!`)
                    return false;
                }
                console.log("Grids are validated!")
                boxSeen.add(boxVal);
            }
        }
    }
    return true;
}