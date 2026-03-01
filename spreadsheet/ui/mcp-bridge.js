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
        // Add locally for instant feedback
        this.rowCount++;
        this.data.push(new Array(this.colCount).fill(''));
        this.formulas.push(new Array(this.colCount).fill(''));
        this.render();
        this.selectCell(this.rowCount - 1, 0);

        // Persist via photon add() tool
        try {
            await window.photon.callTool('add', { values: {} });
        } catch (error) {
            console.error('Failed to persist new row:', error);
        }
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

    // --- Override addFilter → photon query() ---
    const originalApplyFilters = spreadsheet.applyFilters.bind(spreadsheet);
    spreadsheet.addFilter = async function () {
        const colIdx = document.getElementById('filterColumn').value;
        const operator = document.getElementById('filterOperator').value;
        const filterValue = document.getElementById('filterValue').value;

        if (colIdx === '') return;

        const colName = this.headers[parseInt(colIdx)];

        // Build where clause for query()
        const opMap = { equals: '=', greater: '>', less: '<', contains: 'contains' };
        const serverOp = opMap[operator];

        if (serverOp && serverOp !== 'contains') {
            try {
                const where = `${colName} ${serverOp} ${filterValue}`;
                const result = await window.photon.callTool('query', { where });
                if (result && result.data) {
                    // Build a set of matching row indices from server response
                    const matchingData = result.data;
                    this.hiddenRows.clear();
                    for (let row = 0; row < this.rowCount; row++) {
                        const rowData = this.data[row];
                        const matches = matchingData.some(mRow =>
                            mRow.every((val, c) => String(val || '') === String(rowData[c] || ''))
                        );
                        if (!matches) this.hiddenRows.add(row);
                    }
                    this.render();
                    return;
                }
            } catch (error) {
                console.warn('Server query failed, falling back to client filter:', error.message);
            }
        }

        // Fallback to client-side filtering
        this.filters.push({ col: parseInt(colIdx), operator, value: filterValue });
        originalApplyFilters();
    };

    // --- Listen for data events from the server ---
    if (window.photon.onEmit) {
        window.photon.onEmit((event) => {
            if (event.emit === 'data' && event.data) {
                applyServerData(event);
            } else if (event.emit === 'alert') {
                showAlertToast(event.watch, event.count);
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

    // Setup context menu once
    setupContextMenu();

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
        // Sync column types from server schema
        try {
            const schema = await window.photon.callTool('schema', {});
            if (schema && schema.columns && _spreadsheet) {
                for (const col of schema.columns) {
                    const idx = _spreadsheet.headers.indexOf(col.name);
                    if (idx >= 0 && col.type) {
                        _spreadsheet.fieldTypes[idx] = col.type;
                    }
                }
            }
        } catch (schemaErr) {
            // Schema sync is best-effort
            console.warn('Schema sync skipped:', schemaErr.message);
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

    // Track previous state for change detection
    const prevRowCount = s.data ? s.data.filter(r => r && r.some(v => v !== '')).length : 0;
    const prevData = s.data ? s.data.map(r => [...(r || [])]) : [];

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

    // Apply column metadata from server (format row)
    const columnMeta = result.columnMeta || [];
    if (columnMeta.length > 0) {
        s.columnMeta = columnMeta;
        for (let i = 0; i < columnMeta.length && i < s.colCount; i++) {
            if (columnMeta[i].width) s.columnWidths[i] = columnMeta[i].width;
            else if (!s.columnWidths[i]) s.columnWidths[i] = 100;
            // Map format-row types to field types
            const typeMap = { number: 'number', currency: 'number', percent: 'number', date: 'date', bool: 'checkbox', select: 'select', formula: 'formula', markdown: 'markdown', longtext: 'longtext' };
            if (typeMap[columnMeta[i].type]) {
                s.fieldTypes[i] = typeMap[columnMeta[i].type];
            }
        }
    } else {
        s.columnMeta = [];
        s.columnWidths = new Array(s.colCount).fill(100);
    }

    // Regenerate field types and UI
    if (columnMeta.length === 0) s.columnWidths = new Array(s.colCount).fill(100);
    s.initializeFieldTypes();
    s.updateFilterOptions();

    // Detect changed cells and new rows for animation
    s._changedCells = new Set();
    s._changedRows = new Set();
    s._newRows = new Set();

    const newDataRowCount = data.length;
    for (let r = 0; r < newDataRowCount; r++) {
        if (r >= prevRowCount) {
            // New row
            s._newRows.add(r);
        } else {
            // Check for changed cells
            for (let c = 0; c < s.colCount; c++) {
                const oldVal = prevData[r]?.[c] || '';
                const newVal = s.data[r]?.[c] || '';
                if (oldVal !== newVal) {
                    s._changedCells.add(`${r},${c}`);
                    s._changedRows.add(r);
                }
            }
        }
    }

    s.render();

    // Clear change tracking after animations start (let CSS handle the rest)
    setTimeout(() => {
        s._changedCells = null;
        s._changedRows = null;
        s._newRows = null;
    }, 100);

    // Reselect current cell
    const { row, col } = s.selectedCell || { row: 0, col: 0 };
    s.selectCell(
        Math.min(row, s.rowCount - 1),
        Math.min(col, s.colCount - 1)
    );

    // Auto-scroll to bottom when new rows appear (streaming data)
    const dataGrew = data.length > prevRowCount && prevRowCount > 0;
    if (dataGrew || result.autoScroll) {
        const gridWrapper = document.getElementById('gridWrapper');
        if (gridWrapper) {
            requestAnimationFrame(() => {
                gridWrapper.scrollTop = gridWrapper.scrollHeight;
            });
        }
    }

    // Re-attach header rename handlers after re-render
    attachHeaderRenameHandlers();

    // Process chart overlays from visual formulas
    if (result.charts && result.charts.length > 0) {
        // Defer to after render so cell DOM exists
        requestAnimationFrame(() => {
            s.renderCharts(result.charts);
            // Re-render to show chart anchor icons
            s.render();
            s.selectCell(
                Math.min(row, s.rowCount - 1),
                Math.min(col, s.colCount - 1)
            );
        });
    } else {
        // No charts — clean up any existing overlays
        s.renderCharts(null);
    }
}

// --- Header rename via double-click (module-level for access from applyServerData) ---
function attachHeaderRenameHandlers() {
    if (!_spreadsheet) return;
    document.querySelectorAll('th.col-header').forEach(th => {
        th.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const colIdx = parseInt(th.dataset.col);
            const oldName = _spreadsheet.headers[colIdx];
            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldName;
            input.style.cssText = 'width:100%;border:1px solid var(--accent);border-radius:3px;padding:2px 4px;font-size:12px;font-weight:600;background:var(--bg-primary);color:var(--text-primary);';
            th.textContent = '';
            th.appendChild(input);
            input.focus();
            input.select();

            const finish = async (save) => {
                const newName = input.value.trim();
                if (save && newName && newName !== oldName) {
                    try {
                        await window.photon.callTool('rename', { column: oldName, name: newName });
                    } catch (err) {
                        console.error('Failed to rename column:', err);
                        th.textContent = oldName;
                        return;
                    }
                } else {
                    th.textContent = oldName;
                }
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); finish(true); }
                if (e.key === 'Escape') { e.preventDefault(); finish(false); }
            });
            input.addEventListener('blur', () => finish(true));
        });
    });
}

// --- Context menu wiring ---
function setupContextMenu() {
    if (!_spreadsheet) return;
    const menu = document.getElementById('contextMenu');
    if (!menu) return;

    document.querySelector('.grid-wrapper')?.addEventListener('contextmenu', (e) => {
        const td = e.target.closest('td[data-row][data-col]');
        if (!td) return;
        e.preventDefault();

        const row = parseInt(td.dataset.row);
        const col = parseInt(td.dataset.col);
        _spreadsheet.selectCell(row, col);

        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.classList.add('visible');
        menu._contextRow = row;
        menu._contextCol = col;
    });

    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.addEventListener('click', async () => {
            menu.classList.remove('visible');
            const action = item.dataset.action;
            const row = menu._contextRow;
            const col = menu._contextCol;

            if (action === 'clear') {
                const cellRef = _spreadsheet.headers[col] + (row + 1);
                try {
                    await window.photon.callTool('set', { cell: cellRef, value: '' });
                } catch (err) {
                    console.error('Failed to clear cell:', err);
                }
            } else if (action === 'fill') {
                const pattern = prompt('Fill pattern (e.g. "1,2,3..." or "Mon,Tue,Wed..."):');
                if (!pattern) return;
                const colName = _spreadsheet.headers[col];
                const range = `${colName}${row + 1}:${colName}${_spreadsheet.rowCount}`;
                try {
                    await window.photon.callTool('fill', { range, pattern });
                } catch (err) {
                    console.error('Failed to fill range:', err);
                }
            } else if (action === 'rename') {
                const th = document.querySelector(`th.col-header[data-col="${col}"]`);
                if (th) th.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            }
        });
    });

    // Dismiss on click-outside or Escape
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) menu.classList.remove('visible');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') menu.classList.remove('visible');
    });
}

// --- Alert toast for SQL watches ---
function showAlertToast(watchName, matchCount) {
    const toast = document.createElement('div');
    toast.textContent = `Watch "${watchName}" triggered: ${matchCount} row(s) matched`;
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        padding: 12px 20px; border-radius: 8px;
        background: var(--accent, #4f46e5); color: #fff;
        font-size: 13px; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: toast-in 0.3s ease-out;
        cursor: pointer;
    `;
    toast.addEventListener('click', () => toast.remove());
    document.body.appendChild(toast);

    // Auto-remove after 5s
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}
