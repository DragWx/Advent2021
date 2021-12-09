namespace day04 {
    var appIn : HTMLTextAreaElement;
    var appOut : HTMLTextAreaElement;
    export const config: object = {
        phases: 2,
        extras: []
    };
    export function init (phase: number, inElement: HTMLTextAreaElement, outElement: HTMLTextAreaElement, extras: object) {
        // Get our elements of interest
        appIn = inElement;
        appOut = outElement;
        return run;
    }
    const maskHelper = [0x01, 0x02, 0x04, 0x08, 0x10];
    const maskAll = 0x1F;
    function run (mode: number) {
        // Input starts with one or more CSVs, then a blank line, then one or
        // more 5x5 matrices separated by whitespace. There's a blank line
        // between each matrix.

        var readMode = 0;
        var draws = Array<number>();
        var boards = Array<Board>();
        var currRowNum = 0;
        appIn.value.split("\n").forEach((currLine, i) => {
            switch (readMode) {
                case 0: // CSV mode
                    // Add each number to the array.
                    if (currLine.trim() == '') {
                        readMode = 1;
                    } else {
                        currLine.trim().split(',').forEach(x => {
                            if (!isNaN(parseInt(x))) {
                                draws.push(parseInt(x));
                            }
                        });
                    }
                    break;
                case 1: // Matrix mode
                    // Create the first board if necessary.
                    if (boards.length == 0) {
                        boards.push(new Board());
                    }
                    if (currLine.trim() == '') {
                        // Create new board on empty line, but only if current
                        // board is filled out.
                        if (!boards[boards.length - 1].isEmpty()) {
                            boards.push(new Board());
                            currRowNum = 0;
                        }
                    } else {
                        var currNums = currLine.trim().split(/\s+/).map(x => parseInt(x));
                        currNums.forEach((x, i) => {
                            boards[boards.length - 1].addSpace(x, currRowNum, i);
                        });
                        currRowNum++;
                    }
                    break;
            }
        });
        boards = boards.filter(x => !x.isEmpty());
        // NOTE: There's no guarantee that all matrices are valid!

        // Draw the numbers, mark the boards.
        draws.forEach(currDraw => {
            boards.forEach((currBoard) => {
                currBoard.markSpace(currDraw);
            });
        });

        // Find the board which finished first.
        var sortedBoards = boards.sort((a, b) => a.drawCount - b.drawCount);

        appOut.value = `== Phase ${mode} ==\n`;
        switch(mode) {
            case 1: // Find first win.
                appOut.value += `Output: ${sortedBoards[0].score}`
                break;
            case 2: // Find last win.
                appOut.value += `Output: ${sortedBoards[sortedBoards.length - 1].score}`
                break;
        }
    }
    class Board {
        // The array is [row, column].
        private spaces: Map<number, Array<number>>;
        public score: number;
        // For each row, the columns with a mark.
        public rowMarks: Array<number>;
        // For each column, the rows with a mark.
        public colMarks: Array<number>;
        public drawCount: number;
        public hasBingo: boolean;

        constructor() {
            this.spaces = new Map<number, Array<number>>();
            this.score = undefined;
            this.rowMarks = new Array<number>(5);
            this.colMarks = new Array<number>(5);
            this.drawCount = 0;
            this.hasBingo = false;
        }

        public addSpace(spaceNum: number, rowNum: number, colNum: number) {
            this.spaces.set(spaceNum, [rowNum, colNum]);
        }

        public markSpace(spaceNum: number) {
            if (this.hasBingo) {
                return;
            }
            this.drawCount++;
            var space = this.spaces.get(spaceNum);
            if (space !== undefined) {
                this.rowMarks[space[0]] |= maskHelper[space[1]];
                this.colMarks[space[1]] |= maskHelper[space[0]];
                this.spaces.delete(spaceNum);
                if (this.checkForBingo()) {
                    // Calculate score.
                    this.score = Array.from(this.spaces.keys()).reduce((accumulator, x) => accumulator += x, 0);
                    this.score *= spaceNum;
                }
            }
        }

        public isEmpty() {
            return this.spaces.size == 0;
        }

        private checkForBingo(): boolean {
            if ((this.rowMarks.indexOf(maskAll) != -1)
                || (this.colMarks.indexOf(maskAll) != -1)) {
                this.hasBingo = true;
            } else {
                this.hasBingo = false;
            }
            return this.hasBingo;
        }
    }
};
