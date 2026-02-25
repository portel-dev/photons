/**
 * Modern Kanban Boards Photon
 *
 * Task management for humans and AI. Use named instances (`_use('project-name')`)
 * for per-project boards. Perfect for project planning, AI working memory across
 * sessions, and human-AI collaboration on shared tasks.
 *
 * @version 2.0.0
 * @author Portel
 * @license MIT
 * @tags kanban, tasks, collaboration, project-management, memory
 * @icon 📋
 * @stateful
 */

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface Comment {
    id: string;
    author: 'human' | 'ai';
    content: string;
    createdAt: string;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    column: string;
    priority: 'low' | 'medium' | 'high';
    assignee?: string;
    labels?: string[];
    context?: string;
    links?: string[];
    comments?: Comment[];
    blockedBy?: string[];
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    autoPullThreshold?: number;
    autoReleaseMinutes?: number;
    lastReleaseAttempt?: string;
}

interface Board {
    name: string;
    projectRoot?: string;
    columns: string[];
    tasks: Task[];
    createdAt: string;
    updatedAt: string;
}

interface BoardConfig {
    projectsRoot?: string;
    wipLimit?: number;
    autoPullEnabled?: boolean;
    autoPullSource?: string;
    morningPullCount?: number;
    staleTaskDays?: number;
}

const DEFAULT_COLUMNS = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
const DEFAULT_WIP_LIMIT = 10;

// ════════════════════════════════════════════════════════════════════════════════
// BOARDS PHOTON
// ════════════════════════════════════════════════════════════════════════════════

export default class Boards {
    declare instanceName: string;

    tasks: Task[];
    columns: string[];
    config: BoardConfig;

    constructor(
        tasks: Task[] = [],
        columns: string[] = [...DEFAULT_COLUMNS],
        config: BoardConfig = { wipLimit: DEFAULT_WIP_LIMIT },
    ) {
        this.tasks = tasks;
        this.columns = columns;
        this.config = config;
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }

    private get channel(): string {
        return `boards:${this.instanceName || 'default'}`;
    }

    private emitBoardUpdate(event?: string, data?: any): void {
        if (typeof (this as any).emit !== 'function') return;
        (this as any).emit({ emit: 'board-update', board: this.instanceName || 'default' });
        if (event && data) {
            (this as any).emit({ channel: this.channel, event, data });
        }
    }

    private toBoard(): Board {
        return {
            name: this.instanceName || 'default',
            columns: [...this.columns],
            tasks: [...this.tasks],
            createdAt: this.tasks[0]?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    private insertAtColumnTop(task: Task): void {
        const firstInColumn = this.tasks.findIndex(t => t.column === task.column);
        if (firstInColumn === -1) {
            this.tasks.push(task);
        } else {
            this.tasks.splice(firstInColumn, 0, task);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // MAIN VIEW
    // ══════════════════════════════════════════════════════════════════════════════

    /**
     * Open the Kanban board
     *
     * Visual drag-and-drop board for managing tasks. Both humans and AI can
     * interact with this board - humans through the UI, AI through MCP methods.
     *
     * ## AI Workflow (IMPORTANT)
     *
     * When working on tasks as an AI assistant:
     *
     * 1. **Check assigned tasks**: Use `mine` to find tasks assigned to you
     * 2. **Work in "In Progress"**: Tasks you're actively working on should be here
     * 3. **Move to "Review" when done**: Do NOT move directly to "Done"!
     *    - "Review" means: AI finished, waiting for human verification
     *    - Only humans should move tasks from "Review" to "Done"
     * 4. **Add comments**: Document what you did for the reviewer
     *
     * This keeps humans in the loop and ensures quality control.
     *
     * @ui board
     */
    async *main(): AsyncGenerator<any, Board, any> {
        return this.toBoard();
    }

    /**
     * Get the current board state
     */
    board(): Board {
        return this.toBoard();
    }

    /**
     * Get board statistics
     */
    stats(): {
        total: number;
        byColumn: Record<string, number>;
        byPriority: Record<string, number>;
        wipLimit: number;
        wipCurrent: number;
        wip: { limit: number; enabled: boolean };
    } {
        const byColumn: Record<string, number> = {};
        for (const col of this.columns) {
            byColumn[col] = this.tasks.filter(t => t.column === col).length;
        }

        const byPriority: Record<string, number> = { low: 0, medium: 0, high: 0 };
        for (const task of this.tasks) {
            byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
        }

        const wipLimit = this.config.wipLimit ?? DEFAULT_WIP_LIMIT;

        return {
            total: this.tasks.length,
            byColumn,
            byPriority,
            wipLimit,
            wipCurrent: byColumn['In Progress'] || 0,
            wip: { limit: wipLimit, enabled: wipLimit > 0 },
        };
    }

    /**
     * Board settings
     */
    settings(params?: {
        projectsRoot?: string;
        wipLimit?: number;
        autoPullEnabled?: boolean;
        morningPullCount?: number;
        staleTaskDays?: number;
    }): { configured: boolean; config: BoardConfig } {
        if (params) {
            if (params.projectsRoot !== undefined) this.config.projectsRoot = params.projectsRoot;
            if (params.wipLimit !== undefined) this.config.wipLimit = params.wipLimit;
            if (params.autoPullEnabled !== undefined) this.config.autoPullEnabled = params.autoPullEnabled;
            if (params.morningPullCount !== undefined) this.config.morningPullCount = params.morningPullCount;
            if (params.staleTaskDays !== undefined) this.config.staleTaskDays = params.staleTaskDays;
        }
        return { configured: true, config: this.config };
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // TASK METHODS
    // ══════════════════════════════════════════════════════════════════════════════

    /**
     * Get all tasks, optionally filtered
     * @format list
     */
    list(params?: {
        column?: string;
        assignee?: string;
        priority?: 'low' | 'medium' | 'high';
        label?: string;
    }): Task[] {
        let tasks = [...this.tasks];
        if (params?.column) tasks = tasks.filter(t => t.column.toLowerCase() === params.column!.toLowerCase());
        if (params?.assignee) tasks = tasks.filter(t => t.assignee?.toLowerCase() === params.assignee!.toLowerCase());
        if (params?.priority) tasks = tasks.filter(t => t.priority === params.priority);
        if (params?.label) tasks = tasks.filter(t => t.labels?.includes(params.label!));
        return tasks;
    }

    /**
     * Get tasks assigned to AI
     * @format list
     */
    mine(): Task[] {
        return this.tasks.filter(t => t.assignee?.toLowerCase() === 'ai' && t.column !== 'Done');
    }

    /**
     * Create a new task
     * @locked board:write
     */
    add(params: {
        title: string;
        description?: string;
        column?: string;
        priority?: 'low' | 'medium' | 'high';
        assignee?: string;
        labels?: string[];
        context?: string;
        links?: string[];
        blockedBy?: string[];
        autoPullThreshold?: number;
        autoReleaseMinutes?: number;
    }): Task {
        if (params.blockedBy) {
            for (const blockerId of params.blockedBy) {
                if (!this.tasks.find(t => t.id === blockerId)) {
                    throw new Error(`Invalid blockedBy reference: task "${blockerId}" not found`);
                }
            }
        }

        const task: Task = {
            id: this.generateId(),
            title: params.title,
            description: params.description,
            column: params.column || 'Backlog',
            priority: params.priority || 'medium',
            assignee: params.assignee,
            labels: params.labels,
            context: params.context,
            links: params.links,
            blockedBy: params.blockedBy,
            autoPullThreshold: params.autoPullThreshold,
            autoReleaseMinutes: params.autoReleaseMinutes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'ai',
        };

        if (!this.columns.includes(task.column)) {
            task.column = 'Backlog';
        }

        this.insertAtColumnTop(task);
        this.emitBoardUpdate('task-created', { task });

        if (task.assignee === 'ai' && typeof (this as any).emit === 'function') {
            (this as any).emit({ emit: 'status', type: 'info', message: `New task assigned: ${task.title}` });
        }

        return task;
    }

    /**
     * Move a task to a different column
     * @locked board:write
     */
    move(params: { id: string; column: string }): Task {
        const taskIndex = this.tasks.findIndex(t => t.id === params.id);
        if (taskIndex === -1) throw new Error(`Task not found: ${params.id}`);

        if (!this.columns.includes(params.column)) {
            throw new Error(`Invalid column: ${params.column}. Available: ${this.columns.join(', ')}`);
        }

        const [task] = this.tasks.splice(taskIndex, 1);
        task.column = params.column;
        task.updatedAt = new Date().toISOString();
        this.insertAtColumnTop(task);
        this.emitBoardUpdate('task-moved', { task });

        return task;
    }

    /**
     * Reorder a task
     * @locked board:write
     */
    reorder(params: { id: string; column: string; beforeId?: string }): Task {
        const taskIndex = this.tasks.findIndex(t => t.id === params.id);
        if (taskIndex === -1) throw new Error(`Task not found: ${params.id}`);

        if (!this.columns.includes(params.column)) {
            throw new Error(`Invalid column: ${params.column}. Available: ${this.columns.join(', ')}`);
        }

        const [task] = this.tasks.splice(taskIndex, 1);
        task.column = params.column;
        task.updatedAt = new Date().toISOString();

        if (params.beforeId) {
            const beforeIndex = this.tasks.findIndex(t => t.id === params.beforeId);
            if (beforeIndex !== -1) {
                this.tasks.splice(beforeIndex, 0, task);
            } else {
                this.insertAtColumnTop(task);
            }
        } else {
            this.insertAtColumnTop(task);
        }

        this.emitBoardUpdate('task-reordered', { task });
        return task;
    }

    /**
     * Delete a task
     * @locked board:write
     */
    drop(params: { id: string }): { success: boolean; message: string } {
        const index = this.tasks.findIndex(t => t.id === params.id);
        if (index === -1) throw new Error(`Task not found: ${params.id}`);

        const [removed] = this.tasks.splice(index, 1);

        // Clean up blockedBy references
        for (const task of this.tasks) {
            if (task.blockedBy?.includes(removed.id)) {
                task.blockedBy = task.blockedBy.filter(id => id !== removed.id);
                task.updatedAt = new Date().toISOString();
            }
        }

        this.emitBoardUpdate('task-deleted', { taskId: removed.id, task: removed });
        return { success: true, message: `Deleted task: ${removed.title}` };
    }

    /**
     * Update a task's details
     * @locked board:write
     */
    edit(params: {
        id: string;
        title?: string;
        description?: string;
        priority?: 'low' | 'medium' | 'high';
        assignee?: string;
        labels?: string[];
        context?: string;
        links?: string[];
        blockedBy?: string[];
        autoPullThreshold?: number;
        autoReleaseMinutes?: number;
    }): Task {
        const task = this.tasks.find(t => t.id === params.id);
        if (!task) throw new Error(`Task not found: ${params.id}`);

        if (params.title !== undefined) task.title = params.title;
        if (params.description !== undefined) task.description = params.description;
        if (params.priority !== undefined) task.priority = params.priority;
        if (params.assignee !== undefined) task.assignee = params.assignee;
        if (params.labels !== undefined) task.labels = params.labels;
        if (params.context !== undefined) task.context = params.context;
        if (params.links !== undefined) task.links = params.links;
        if (params.blockedBy !== undefined) task.blockedBy = params.blockedBy;
        if (params.autoPullThreshold !== undefined) task.autoPullThreshold = params.autoPullThreshold;
        if (params.autoReleaseMinutes !== undefined) task.autoReleaseMinutes = params.autoReleaseMinutes;
        task.updatedAt = new Date().toISOString();

        this.emitBoardUpdate('task-updated', { task });
        return task;
    }

    /**
     * Search tasks by keyword
     */
    search(params: { query: string }): Task[] {
        const q = params.query.toLowerCase();
        return this.tasks.filter(
            t => t.title.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.context?.toLowerCase().includes(q)
        );
    }

    /**
     * Add a comment to a task
     * @locked board:write
     */
    comment(params: {
        id: string;
        content: string;
        author?: 'human' | 'ai';
    }): Comment {
        const task = this.tasks.find(t => t.id === params.id);
        if (!task) throw new Error(`Task not found: ${params.id}`);

        if (!task.comments) task.comments = [];

        const comment: Comment = {
            id: this.generateId(),
            author: params.author || 'ai',
            content: params.content,
            createdAt: new Date().toISOString(),
        };

        task.comments.push(comment);
        task.updatedAt = new Date().toISOString();

        this.emitBoardUpdate('task-updated', { task });
        return comment;
    }

    /**
     * Get a task with full details including comments
     */
    show(params: { id: string }): Task {
        const task = this.tasks.find(t => t.id === params.id);
        if (!task) throw new Error(`Task not found: ${params.id}`);
        return task;
    }

    /**
     * Add or remove a column
     * @locked board:write
     */
    column(params: {
        name: string;
        position?: number;
        remove?: boolean;
    }): { columns: string[] } {
        if (params.remove) {
            if (params.name === 'Backlog' || params.name === 'Done') {
                throw new Error(`Cannot remove ${params.name} column`);
            }
            const moved = this.tasks.filter(t => t.column === params.name);
            moved.forEach(t => { t.column = 'Backlog'; t.updatedAt = new Date().toISOString(); });
            const colIdx = this.columns.indexOf(params.name);
            if (colIdx !== -1) this.columns.splice(colIdx, 1);
        } else {
            if (!this.columns.includes(params.name)) {
                const pos = params.position ?? this.columns.length - 1;
                this.columns.splice(pos, 0, params.name);
            }
        }

        this.emitBoardUpdate();
        return { columns: [...this.columns] };
    }

    /**
     * Clear completed tasks (archive them)
     * @locked board:write
     */
    clear(): { archived: number } {
        const doneCount = this.tasks.filter(t => t.column === 'Done').length;
        // Remove done tasks by splicing backwards to avoid index shifting
        for (let i = this.tasks.length - 1; i >= 0; i--) {
            if (this.tasks[i].column === 'Done') {
                this.tasks.splice(i, 1);
            }
        }
        this.emitBoardUpdate();
        return { archived: doneCount };
    }

    /**
     * Batch move tasks
     * @locked board:write
     */
    sweep(params: { taskIds: string[]; column: string }): { moved: number } {
        if (!this.columns.includes(params.column)) {
            throw new Error(`Invalid column: ${params.column}. Available: ${this.columns.join(', ')}`);
        }

        let moved = 0;
        for (const id of params.taskIds) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.column = params.column;
                task.updatedAt = new Date().toISOString();
                moved++;
            }
        }

        this.emitBoardUpdate();
        return { moved };
    }

    /**
     * Set task dependencies
     * @locked board:write
     */
    block(params: { id: string; blockedBy: string; remove?: boolean }): Task {
        const task = this.tasks.find(t => t.id === params.id);
        if (!task) throw new Error(`Task not found: ${params.id}`);

        if (!this.tasks.find(t => t.id === params.blockedBy)) {
            throw new Error(`Blocker task not found: ${params.blockedBy}`);
        }

        if (params.remove) {
            task.blockedBy = (task.blockedBy || []).filter(id => id !== params.blockedBy);
        } else {
            if (!task.blockedBy) task.blockedBy = [];
            if (!task.blockedBy.includes(params.blockedBy)) {
                task.blockedBy.push(params.blockedBy);
            }
        }
        task.updatedAt = new Date().toISOString();

        this.emitBoardUpdate('task-updated', { task });
        return task;
    }

    /**
     * Get comments for a task
     */
    comments(params: { id: string }): Comment[] {
        const task = this.tasks.find(t => t.id === params.id);
        if (!task) throw new Error(`Task not found: ${params.id}`);
        return task.comments || [];
    }
}
