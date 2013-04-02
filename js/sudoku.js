/*
	Sudoku:
	
	All rows have 1-9, no repeats
	All cols have 1-9, no repeats
	All cells (3x3 areas: total 9), no repeats
*/
var EMPTY_VALUE = null;
function generateSudoku()
{
	var grid = [];
	var result;
	var attempts = 0;
	do{
		fill2DArray(grid,9,9,EMPTY_VALUE);
		result = generateGrid(grid, 0, 0);
		attempts++;
	}while(!result && attempts < 50);
	
	constructPuzzle(grid);
	
	displayGrid(grid,"sudokuTable");
}

function generateGrid(grid, row, col)
{
	var possibleNums = [1,2,3,4,5,6,7,8,9];
	for(var x = 0; x<row; x++)
	{
		var numIndex = possibleNums.indexOf(grid[x][col]);
		if(numIndex > -1)
			possibleNums.splice(numIndex,1);
	}
	for(var y=0; y<col && possibleNums.length; y++)
	{
		var numIndex = possibleNums.indexOf(grid[row][y]);
		if(numIndex > -1)
			possibleNums.splice(numIndex,1);
	}
	if(possibleNums.length == 0)
		return false;
	var cellStartX = row - (row % 3), cellStartY = col - (col % 3);
	for(var x = cellStartX; x < (cellStartX + 3) && possibleNums.length; x++)
	{
		for(var y=cellStartY; y < (cellStartY + 3) && possibleNums.length; y++)
		{
			if(grid[x][y] != EMPTY_VALUE)
			{
				var numIndex = possibleNums.indexOf(grid[x][y]);
				if(numIndex > -1)
					possibleNums.splice(numIndex,1);
			}
		}
	}
	if(possibleNums.length == 0)
		return false;
	if(row == 8 && col == 8)
	{
		grid[row][col] = possibleNums[0];
		return true;
	}
	if(col == 8)
	{
		grid[row][col] = possibleNums[0];
		return generateGrid(grid,row+1,0);
	}
	if(possibleNums.length == 1)
	{
		grid[row][col] = possibleNums[0];
		return generateGrid(grid,row,col+1);
	}
	randomizeArray(possibleNums);
	var solutionFound = false;
	for(var i=0; i<possibleNums.length && !solutionFound; i++)
	{
		grid[row][col] = possibleNums[i];
		solutionFound = generateGrid(grid,row,col+1);
	}
	if(!solutionFound)
		grid[row][col] = EMPTY_VALUE;
	return solutionFound;
}

function randomizeArray(myArray)
{
	var i = myArray.length, j, tempi, tempj;
  	if ( i == 0 ) return false;
  	while ( --i ) {
     	j = Math.floor( Math.random() * ( i + 1 ) );
     	tempi = myArray[i];
     	tempj = myArray[j];
     	myArray[i] = tempj;
     	myArray[j] = tempi;
   	}
}

function fill2DArray(myArray,len,width,val)
{
	for(var x=0; x<len; x++)
	{
		myArray[x] = [];
		for(var y=0; y<width; y++)
		{
			myArray[x][y] = val;
		}
	}
}

function displayGrid(grid,id)
{
	var table = document.getElementById(id);
	var rows = table.getElementsByTagName("tr");
	for(var x = 0; x < grid.length; x++)
	{
		console.log(grid[x]);
		var cols = rows[x].getElementsByTagName("td");
		for(var y = 0; y<grid[0].length; y++)
		{
			cols[y].innerHTML = grid[x][y];
			if(grid[x][y] == EMPTY_VALUE)
			{
				cols[y].contentEditable = true;
				cols[y].className="entry";
			}
		}
	}
}

function constructPuzzle(grid)
{
	var hints = 81;
	var attempts = 0;
	while(hints > 20 + Math.ceil((Math.random() * 10)) && attempts < 1000)
	{
		hints -= removeHintIfAble(grid,Math.ceil(Math.random() * 9) - 1, Math.ceil(Math.random() * 9) - 1);
		attempts++;
	}
}

function removeHintIfAble(grid,x,y)
{
	if(grid[x][y] == EMPTY_VALUE)
		return 0;
		
	if(checkForSolvability(grid,x,y) && checkForSolvability(grid,grid.length - x - 1, grid[0].length - y - 1))
	{
		grid[x][y] = EMPTY_VALUE;
		grid[grid.length - x - 1][grid[0].length - y - 1] = EMPTY_VALUE;
		return 2;
	}
	return 0;
}

function checkForSolvability(grid,x,y)
{
	/*
		TODO:
		Put difficulty logic here. Increased difficulty increases the chance that the program will try to open a block that is harder to solve
		
		For example, if a block can only be solved by one of the more difficult methods, use it only if the difficulty is above a threshold
		
		Possible Difficulty Table
		
		Difficulty	| Elimination | Cell Elimination | Hard Method | Probability
		________________________________________________________________________
		
		Hard		  x				x				   x			 Low
		""			   				x				   x			 Medium
		""			   				 				   x			 High
		
		Medium		  x				x				   x			 Medium
		""			   				x				   x			 High
		""			   				 				   x			 Low
		
		Low 		  x				x				   x			 High
		""			   				x				   x			 Medium
		""			   				 				   x			 None
	*/
	if(solvableByElimination(grid,x,y))
		return true;
		
	if(solvableByCellElimination(grid,x,y))
		return true;
		
	return false;
}
function solvableByElimination(grid,x,y)
{
	var possibleNums = [1,2,3,4,5,6,7,8,9];
	for(var rowIndex = 0; rowIndex < grid.length; rowIndex++)
	{
		if(rowIndex != x)
		{
			var numIndex = possibleNums.indexOf(grid[rowIndex][y]);
			if(numIndex != -1)
				possibleNums.splice(numIndex,1);
		}
	}
	if(possibleNums.length == 1)
		return true;	
	for(var colIndex = 0; colIndex < grid[0].length; colIndex++)
	{
		if(colIndex != y)
		{
			var numIndex = possibleNums.indexOf(grid[x][colIndex]);
			if(numIndex != -1)
				possibleNums.splice(numIndex,1);
		}
	}
	if(possibleNums.length == 1)
	{
		return true;
	}
	var cellStartX = x - (x%3), cellStartY = y - (y%3);
	for(var rowIndex = cellStartX; rowIndex < cellStartX + 3; rowIndex++)
	{
		for(var colIndex = cellStartY; colIndex < cellStartY + 3; colIndex++)
		{
			if(!(rowIndex == x && colIndex == y))
			{
				var numIndex = possibleNums.indexOf(grid[rowIndex][colIndex]);
				if(numIndex != -1)
					possibleNums.splice(numIndex,1);				
			}
		}
	}
	if(possibleNums.length == 1)
		return true;
	
	return false;
}
function solvableByCellElimination(grid,x,y)
{
	var openCells = findOpenCellSquares(grid,x,y);
	//If we have open squares in the 3x3 cell, try to find (x,y) by process of elimination of other possible options
	/*
		Example:
		
		123		In this example, the number has to be a size, since a 6 cannot occupy
		456		any other square in the cell
		789
		
		234		987
		5?_		123
		8_1		564
	*/
	if(openCells.length > 0)
	{
		var testNum = 1;
		var possibleNums = [];
		while(testNum < 10 && possibleNums.length < 2)
		{
			var testIndex;
			var otherPossibility = false;
			while(testIndex < openCells.length && !otherPossibility)
			{
				if(isValid(grid,openCells[testIndex].x,openCells[testIndex].y,testNum))
					otherPossibility = true;
			}
			if(!otherPossibility)
				possibleNums.push(testNum);
				
			testNum++;
		}
		if(possibleNums.length == 1)
			return true;
	}
	
	return false;
}
function findOpenCellSquares(grid,x,y)
{
	var cellBoundX = x - (x%3), cellBoundY = y - (y%3);
	var squareArr = [];
	for(var rowIndex = cellBoundX; rowIndex < cellBoundX + 3; rowIndex++)
	{
		for(var colIndex = cellBoundY; colIndex < cellBoundY + 3; colIndex++)
		{
			if(!(rowIndex == x && colIndex == y) && grid[rowIndex][colIndex] == EMPTY_VALUE)
			{
				squareArr.push({x:rowIndex,y:colIndex});
			}
		}
	}
	return squareArr;
}
function isValid(grid,x,y,val)
{
	//This function checks (x,y) to see if val can occupy it
	var rowIndex = 0;
	var provenInvalid = false;
	while(rowIndex < grid.length && !provenInvalid)
	{
		if(rowIndex != x && grid[rowIndex][y] == val)
			provenInvalid = true;
			
		rowIndex++;
	}
	if(provenInvalid)
		return false;
	
	var colIndex = 0;
	while(colIndex < grid[0].length && !provenInvalid)
	{
		if(colIndex != y && grid[x][colIndex] == val)
				provenInvalid = true;
				
		colIndex++;
	}
	if(provenInvalid)
		return false;
		
	rowIndex = x - (x%3);
	colIndex = y - (y%3);
	cellWallX = rowIndex + 3;
	cellWallY = colIndex + 3;
	while(rowIndex < cellWallX && !provenInvalid)
	{
		while(colIndex < cellWallY && !provenInvalid)
		{
			if(!(rowIndex == x && colIndex == y) && grid[rowIndex][colIndex] == val)
				provenInvalid = true;
			colIndex++;
		}
		rowIndex++;
	}
	
	return provenInvalid;
}