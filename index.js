const { parse } = require("node-html-parser");

const parseCoordinate = (coordinate) => Number.parseInt(coordinate, 10);

const parseGridRow = (tr) => {
  const cells = tr.querySelectorAll("td");
  if (cells.length !== 3) return;

  const x = parseCoordinate(cells[0].innerText);
  const y = parseCoordinate(cells[2].innerText);
  const unicode = cells[1].innerText?.trim();

  if (Number.isNaN(x) || Number.isNaN(y) || !unicode) return;

  return { x, y, unicode };
};

const normalizeGrid = (grid, maxCols) => {
  for (let x = 0; x < grid.length; x++) {
    if (!grid[x]) grid[x] = [];
    for (let y = 0; y < maxCols + 1; y++) {
      if (!grid[x][y]) grid[x][y] = " ";
    }
  }
};

const adjustYStartPosition = (grid) => {
  const rowCount = grid.length;
  const colCount = grid[0].length;
  const adjusted = [];

  for (let y = colCount - 1; y >= 0; y--) {
    const row = [];
    for (let x = 0; x < rowCount; x++) {
      row.push(grid[x][y] ?? " ");
    }
    adjusted.push(row);
  }

  return adjusted;
};

const drawSecret = (grid) => {
  grid.forEach((row) => console.log(row.join("")));
};

const fetchData = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch HTML: ${response.status}`);
  }

  return await response.text();
};

const decodeSecret = async (url) => {
  const html = await fetchData(url);

  const root = parse(html);

  const table = root.querySelector("table");
  if (!table) throw new Error("No <table> element found.");

  const rows = table.querySelectorAll("tr");
  if (!rows.length) throw new Error("The table is empty.");

  const grid = [];
  let maxY = 0;

  for (const tr of rows) {
    const entry = parseGridRow(tr);
    if (!entry) continue;
    const { x, y, unicode } = entry;
    if (y > maxY) maxY = y;
    if (!grid[x]) grid[x] = [];
    grid[x][y] = unicode;
  }

  normalizeGrid(grid, maxY);

  const result = adjustYStartPosition(grid);

  drawSecret(result);
};

const main = async () => {
  try {
    const url =
      "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";
    await decodeSecret(url);
  } catch (err) {
    console.error("Error:", err.message);
  }
};

main();
