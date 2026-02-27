// MCP Bridge — routes all spreadsheet mutations through photon tools
// The HTML UI becomes a view-only renderer; all data changes go through the server.

let _spreadsheet = null;
let _loading = false;

function initMCPBridge(spreadsheet) {
    if (!window.photon) {
        console.warn('window.photon not available, running in standalone mode');
        return;
    }

    _spreadsheet = spreadsheet;

    // --- Override cell edit (commitEdit) ---
    const originalCommitEdit = spreadsheet.commitEdit.bind(spreadsheet);
    spreadsheet.commitEdit = async function () {
        if (!this.isEditing) return;

        const { row, col } = this.selectedCell;
        const formulaInput = document.getElementById('formulaInput');
        const value = formulaInput.value;
        const cellRef = this.headers[col] + (row + 1);

        this.isEditing = false;
        this.editStartValue = '';

        try {
            await window.photon.callTool('set', { cell: cellRef, value });
            // Server response will trigger data refresh via onResult
        } catch (error) {
            console.error('Failed to set cell:', error);
            // Revert — reload from server
            await loadDataFromPhoton();
        }
    };

    // --- Override clearCell ---
    const originalClearCell = spreadsheet.clearCell.bind(spreadsheet);
    spreadsheet.clearCell = async function (row, col) {
        const cellRef = this.headers[col] + (row + 1);
        try {
            await window.photon.callTool('set', { cell: cellRef, value: '' });
        } catch (error) {
            console.error('Failed to clear cell:', error);
        }
    };

    // --- Override toggleCheckbox ---
    spreadsheet.toggleCheckbox = async function (row, col) {
        const cellRef = this.headers[col] + (row + 1);
        const newVal = this.data[row][col] ? '' : 'true';
        try {
            await window.photon.callTool('set', { cell: cellRef, value: newVal });
        } catch (error) {
            console.error('Failed to toggle checkbox:', error);
        }
    };

    // --- Override importCSV ---
    spreadsheet.importCSV = async function () {
        const csv = document.getElementById('csvInput').value.trim();
        if (!csv) return;
        try {
            await window.photon.callTool('ingest', { csv });
            spreadsheet.closeImportModal();
        } catch (error) {
            console.error('Failed to import CSV:', error);
            alert(`Import failed: ${error.message}`);
        }
    };

    // --- Override applySort ---
    spreadsheet.applySort = async function () {
        const colIdx = document.getElementById('sortColumn').value;
        const direction = document.getElementById('sortDirection').value;
        if (colIdx === '') return;
        const colName = this.headers[parseInt(colIdx)];
        try {
            await window.photon.callTool('sort', { column: colName, order: direction });
        } catch (error) {
            console.error('Failed to sort:', error);
        }
    };

    // --- Override newFile ---
    spreadsheet.newFile = async function () {
        if (confirm('Create new spreadsheet? All data will be cleared.')) {
            try {
                await window.photon.callTool('clear', {});
            } catch (error) {
                console.error('Failed to clear:', error);
            }
        }
    };

    // --- Override addRow ---
    spreadsheet.addRow = async function () {
        // Add locally for instant feedback, server will reconcile
        this.rowCount++;
        this.data.push(new Array(this.colCount).fill(''));
        this.formulas.push(new Array(this.colCount).fill(''));
        this.render();
        this.selectCell(this.rowCount - 1, 0);
    };

    // --- Override deleteRow ---
    spreadsheet.deleteRow = async function () {
        if (this.rowCount <= 1) return;
        const row = this.selectedCell.row + 1; // 1-indexed
        try {
            await window.photon.callTool('remove', { row });
        } catch (error) {
            console.error('Failed to delete row:', error);
        }
    };

    // --- Override addColumn ---
    spreadsheet.addColumn = async function () {
        const newCols = this.colCount + 1;
        try {
            await window.photon.callTool('resize', { cols: newCols });
        } catch (error) {
            console.error('Failed to add column:', error);
        }
    };

    // --- Override deleteColumn ---
    spreadsheet.deleteColumn = async function () {
        if (this.colCount <= 1) return;
        const col = this.selectedCell.col;
        // Clear the column, then resize
        const colName = this.headers[col];
        try {
            await window.photon.callTool('clear', { range: `${colName}:${colName}` });
            await loadDataFromPhoton();
        } catch (error) {
            console.error('Failed to delete column:', error);
        }
    };

    // --- Override exportCSV ---
    spreadsheet.exportCSV = async function () {
        try {
            const result = await window.photon.callTool('dump', {});
            if (result && result.csv) {
                const blob = new Blob([result.csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'spreadsheet.csv';
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to export:', error);
        }
    };

    // --- Listen for data events from the server ---
    if (window.photon.onEmit) {
        window.photon.onEmit((event) => {
            if (event.emit === 'data' && event.data) {
                applyServerData(event);
            }
        });
    }

    // --- Listen for tool results ---
    if (window.photon.onResult) {
        window.photon.onResult((result) => {
            if (result && result.data) {
                applyServerData(result);
            }
        });
    }

    // Load initial data
    loadDataFromPhoton();
}

async function loadDataFromPhoton() {
    if (_loading || !_spreadsheet || !window.photon) return;
    _loading = true;

    try {
        const result = await window.photon.callTool('view', {});
        if (result) {
            applyServerData(result);
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    } finally {
        _loading = false;
    }
}

function applyServerData(result) {
    if (!_spreadsheet) return;
    const s = _spreadsheet;

    const headers = result.headers;
    const data = result.data;
    const formulas = result.formulas || {};
    const rows = result.rows || 20;
    const cols = result.cols || 10;

    if (!headers || !data) return;

    // Update grid dimensions
    s.colCount = cols;
    s.rowCount = Math.max(rows, data.length + 5); // Pad with some empty rows
    s.headers = [...headers];

    // Reinitialize data arrays
    s.data = [];
    s.formulas = [];
    for (let i = 0; i < s.rowCount; i++) {
        s.data[i] = new Array(s.colCount).fill('');
        s.formulas[i] = new Array(s.colCount).fill('');
    }

    // Populate with server data
    for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length && c < s.colCount; c++) {
            s.data[r][c] = data[r][c] || '';
        }
    }

    // Populate formulas
    for (const [cellRef, formula] of Object.entries(formulas)) {
        const match = cellRef.match(/^([A-Za-z]+)(\d+)$/);
        if (match) {
            const col = s.columnNameToNumber ? s.columnNameToNumber(match[1]) : 0;
            const row = parseInt(match[2]) - 1;
            if (row >= 0 && row < s.rowCount && col >= 0 && col < s.colCount) {
                s.formulas[row][col] = formula;
            }
        }
    }

    // Regenerate field types and UI
    s.columnWidths = new Array(s.colCount).fill(100);
    s.initializeFieldTypes();
    s.updateFilterOptions();
    s.render();

    // Reselect current cell
    const { row, col } = s.selectedCell || { row: 0, col: 0 };
    s.selectCell(
        Math.min(row, s.rowCount - 1),
        Math.min(col, s.colCount - 1)
    );
}
