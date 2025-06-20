export const SIZE = 9;
export const BLOCK = 3;
export type SudokuGrid = number[][];

// locates next empty cell, returns [r, c] or void (console.log message)
export function findEmpty(grid: SudokuGrid): [number, number] | void {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] === 0) return [r, c];
        }
    }
    return (console.log('No empty spaces avaliable!'));
}


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


export function solveHiddenSingles(grid: SudokuGrid): SudokuGrid {
    const updatedGrid = grid.map(r => [...r]);
    let changed = true;

    // keep loop going as long as something was filled in the previous pass
    while (changed) {
        changed = false;

        // checks rows for when a value (1-9) only have one cell associated [r,c], updates grid[][] with value
        for (let r = 0; r < SIZE; r++) {

            //stores Map<number candidate(1-9), [row, col]>
            const candidateMap: Map<number, [number, number][]> = new Map();

            for (let c = 0; c < SIZE; c++) {
                if (updatedGrid[r][c] !== 0) continue;
                const candidates = getCandidates(updatedGrid, r, c); // finds all possible values for the cell

                for (const value of candidates) { //iterates over each valid number in candidate
                    // Initialize value (1-9) if it does not exist as a key in the map, with the value of empty array []
                    if (!candidateMap.has(value)) { candidateMap.set(value, []); }

                    // If value exists, push cell coords to the array
                    else { candidateMap.get(value)?.push([r, c]); }
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
                if (updatedGrid[r][c] !== 0) continue;

                const candidates = getCandidates(updatedGrid, r, c);

                for (const value of candidates) {
                    if (!candidateMap.has(value)) { candidateMap.set(value, []); }
                    else { candidateMap.get(value)?.push([r, c]); }
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
                            if (!candidateMap.has(value)) {
                                candidateMap.set(value, []);
                            } else {
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
    }
    console.log("No more possible hidden singles at this point!");
    return updatedGrid;
}

// export function solveDoubles(grid: SudokuGrid): SudokuGrid {
//     const updatedGrid = grid.map(r => [...r]);
// }