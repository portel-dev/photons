/**
 * Data Sync Workflow
 * Synchronizes data between different sources with progress tracking
 *
 * This workflow demonstrates:
 * - Database MCP integration
 * - Batch processing with progress
 * - Error handling and retry logic
 *
 * @mcp postgres anthropics/mcp-server-postgres
 * @mcp filesystem anthropics/mcp-server-filesystem
 *
 * @author Portel
 */
export default class DataSync {
  /**
   * Export database query results to a JSON file
   * @param query SQL query to execute
   * @param outputPath Path to save the JSON file
   * @param batchSize Number of rows to process at a time
   */
  async *exportToJson(params: {
    query: string;
    outputPath: string;
    batchSize?: number;
  }): AsyncGenerator<any, any, any> {
    const batchSize = params.batchSize || 1000;

    yield { emit: 'status', message: 'Executing query...' };

    // Execute the query
    const result = await (this as any).postgres.query({
      sql: params.query,
    });

    const rows = result.rows || [];
    yield { emit: 'progress', value: 0.3, message: `Query returned ${rows.length} rows` };

    // Process in batches for large datasets
    const batches = Math.ceil(rows.length / batchSize);
    const processedRows: any[] = [];

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, rows.length);
      const batch = rows.slice(start, end);

      yield { emit: 'status', message: `Processing batch ${i + 1}/${batches}` };
      processedRows.push(...batch);

      yield { emit: 'progress', value: 0.3 + (0.5 * (i + 1) / batches) };
    }

    // Write to file
    yield { emit: 'status', message: 'Writing to file...' };
    await (this as any).filesystem.write_file({
      path: params.outputPath,
      content: JSON.stringify(processedRows, null, 2),
    });

    yield { emit: 'progress', value: 1.0, message: 'Export complete!' };

    return {
      rowCount: processedRows.length,
      outputPath: params.outputPath,
      fileSize: JSON.stringify(processedRows).length,
    };
  }

  /**
   * Import JSON data into a database table
   * @param inputPath Path to the JSON file
   * @param tableName Target table name
   * @param mode Insert mode: 'append', 'replace', or 'upsert'
   */
  async *importFromJson(params: {
    inputPath: string;
    tableName: string;
    mode?: 'append' | 'replace' | 'upsert';
    upsertKey?: string;
  }): AsyncGenerator<any, any, any> {
    const mode = params.mode || 'append';

    yield { emit: 'status', message: 'Reading JSON file...' };

    // Read the JSON file
    const content = await (this as any).filesystem.read_file({
      path: params.inputPath,
    });

    const rows = JSON.parse(content);
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('JSON file must contain a non-empty array');
    }

    yield { emit: 'progress', value: 0.2, message: `Loaded ${rows.length} rows` };

    // Clear table if replace mode
    if (mode === 'replace') {
      yield { emit: 'status', message: 'Clearing existing data...' };
      await (this as any).postgres.query({
        sql: `DELETE FROM ${params.tableName}`,
      });
    }

    // Insert rows in batches
    const batchSize = 100;
    const batches = Math.ceil(rows.length / batchSize);
    let inserted = 0;

    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const batch = rows.slice(start, start + batchSize);

      yield { emit: 'status', message: `Inserting batch ${i + 1}/${batches}` };

      for (const row of batch) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, idx) => `$${idx + 1}`);

        let sql: string;
        if (mode === 'upsert' && params.upsertKey) {
          sql = `INSERT INTO ${params.tableName} (${columns.join(', ')}) ` +
                `VALUES (${placeholders.join(', ')}) ` +
                `ON CONFLICT (${params.upsertKey}) DO UPDATE SET ` +
                columns.filter(c => c !== params.upsertKey)
                  .map(c => `${c} = EXCLUDED.${c}`).join(', ');
        } else {
          sql = `INSERT INTO ${params.tableName} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
        }

        try {
          await (this as any).postgres.query({ sql, params: values });
          inserted++;
        } catch (error: any) {
          yield { emit: 'log', level: 'warn', message: `Row failed: ${error.message}` };
        }
      }

      yield { emit: 'progress', value: 0.2 + (0.8 * (i + 1) / batches) };
    }

    yield { emit: 'progress', value: 1.0, message: 'Import complete!' };

    return {
      tableName: params.tableName,
      mode,
      totalRows: rows.length,
      insertedRows: inserted,
      failedRows: rows.length - inserted,
    };
  }

  /**
   * Compare data between two tables
   * @param sourceTable Source table name
   * @param targetTable Target table name
   * @param keyColumn Column to use as key for comparison
   */
  async *compare(params: {
    sourceTable: string;
    targetTable: string;
    keyColumn: string;
  }): AsyncGenerator<any, any, any> {
    yield { emit: 'status', message: 'Fetching source data...' };

    const sourceResult = await (this as any).postgres.query({
      sql: `SELECT * FROM ${params.sourceTable}`,
    });
    const sourceRows = sourceResult.rows || [];

    yield { emit: 'progress', value: 0.3, message: `Source: ${sourceRows.length} rows` };

    yield { emit: 'status', message: 'Fetching target data...' };

    const targetResult = await (this as any).postgres.query({
      sql: `SELECT * FROM ${params.targetTable}`,
    });
    const targetRows = targetResult.rows || [];

    yield { emit: 'progress', value: 0.6, message: `Target: ${targetRows.length} rows` };

    // Build lookup maps
    const sourceMap = new Map(sourceRows.map((r: any) => [r[params.keyColumn], r]));
    const targetMap = new Map(targetRows.map((r: any) => [r[params.keyColumn], r]));

    // Find differences
    const onlyInSource: any[] = [];
    const onlyInTarget: any[] = [];
    const different: any[] = [];

    for (const [key, sourceRow] of sourceMap) {
      if (!targetMap.has(key)) {
        onlyInSource.push(key);
      } else {
        const targetRow = targetMap.get(key);
        if (JSON.stringify(sourceRow) !== JSON.stringify(targetRow)) {
          different.push({ key, source: sourceRow, target: targetRow });
        }
      }
    }

    for (const [key] of targetMap) {
      if (!sourceMap.has(key)) {
        onlyInTarget.push(key);
      }
    }

    yield { emit: 'progress', value: 1.0, message: 'Comparison complete!' };

    return {
      sourceTable: params.sourceTable,
      targetTable: params.targetTable,
      sourceCount: sourceRows.length,
      targetCount: targetRows.length,
      onlyInSource: onlyInSource.length,
      onlyInTarget: onlyInTarget.length,
      different: different.length,
      inSync: onlyInSource.length === 0 && onlyInTarget.length === 0 && different.length === 0,
    };
  }
}
