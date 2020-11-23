export type Issue = {
    number: number;
    title: string;
    body: string;
    state: string;
};

export type Ref = {
    number: number;
    title: string;
    state: string;
}

export type Epic = Issue & {
    subtasks: Ref[];
}

export type Subtask = Issue & {
    parent?: number;
}

const SUBTASKS = '## Subtasks';
const TASK_REGEX = /^-\ \[([\ |x])\](.*)#([0-9]+)$/;
const EPIC_REGEX = /^Epic\ +#([0-9]+)$/;

export function parseBodySubtasks(body: string): Ref[] {
    const i = body.indexOf(SUBTASKS);
    if (i > -1) {
        const rawLines = body.substring(i).split('\n');
        const lines = rawLines.filter(rl => rl.startsWith('- '));
        const refs: Ref[] = lines.map(l => l.trim().match(TASK_REGEX)).filter(m => m !== null).map(r => ({
            number: new Number(r![3]).valueOf(),
            title: r![2].trim(),
            state: r![1] === 'x' ? 'closed' : 'open',
        }));
        return refs;
    }
    return [];
}

export function parseNumberSubtasks(number: number, subtasks: Subtask[]): Ref[] {
    return subtasks.filter(s => s.parent === number).map(t => ({
        number: t.number,
        title: t.title,
        state: t.state,
    }));
}

export function parseParent(body: string): number | undefined {
    const rawLines = body.split('\n');
    for (let i = 0; i < rawLines.length; i++) {
        const r = rawLines[i].trim().match(EPIC_REGEX);
        if (r) {
            return new Number(r[1]).valueOf();
        }
    }
    return undefined;
}

export function equalRefs(r1: Ref[], r2: Ref[]): boolean {
    if (r1.length !== r2.length) {
        return false;
    }
    for (let i = 0; i < r1.length; i++) {
        const ri1 = r1[i];
        const ri2 = r2[i];
        if (ri1.number !== ri2.number || ri1.state !== ri2.state || ri1.title !== ri2.title) {
            return false;
        }
    }
    return true;
}

export function updateBodySubtasks(body: string, refs: Ref[]): string {
    const i = body.indexOf(SUBTASKS);
    let presubtasks = body;
    let postsubtasks = '';
    if (i > -1) {
        let j = SUBTASKS.length + 1;
        const rawLines = body.substring(i).split('\n');
        for (let k = 0; k < rawLines.length; k++) {
            if (rawLines[k].startsWith('- ')) {
                j = j + rawLines[k].length + 1;
            }
        }
        presubtasks = body.substring(0, i);
        postsubtasks = body.substring(i + j);
    }
    let subtasks = '';
    if (refs.length > 0) {
        subtasks = SUBTASKS + '\n';
        for (let h = 0; h < refs.length; h++) {
            const ref = '- [' + (refs[h].state === 'closed' ? 'x' : ' ') + '] ' + refs[h].title + ' #' + refs[h].number + '\n';
            subtasks = subtasks + ref;
        }
    }
    return presubtasks + subtasks + postsubtasks;
}

export function updateEpics(epics: Epic[], subtasks: Subtask[]): Epic[] {
    const updated: Epic[] = [];
    for (let i = 0; i < epics.length; i++) {
        const epic = epics[i];
        const oldRefs = parseBodySubtasks(epic.body);
        const newRefs = parseNumberSubtasks(epic.number, subtasks);
        if (!equalRefs(oldRefs, newRefs)) {
            const updatedEpic = Object.assign({}, epic);
            updatedEpic.body = updateBodySubtasks(updatedEpic.body, newRefs);
            updated.push(updatedEpic);
        }
    }
    return updated;
}