// @ts-ignore
import {
    Epic,
    parseNumberSubtasks,
    parseParent,
    parseBodySubtasks,
    Subtask,
    equalRefs,
    updateBodySubtasks, updateEpics
} from '../issues';

const epic1: Epic = {
    number: 1,
    title: 'Epic 1',
    state: 'open',
    body: `This epic is used for testing purposes.
        
It will contain a list of subtasks maintained by pet-action github action.

## Subtasks
- [ ] Subtask A #2
- [ ] Subtask B #3
`,
    subtasks: [],
};

const subtaskA: Subtask = {
    number: 2,
    title: 'Subtask A',
    state: 'open',
    body: `This is a subtask
    
Epic #1    
`,
    parent: 1,
};

const subtaskB: Subtask = {
    number: 3,
    title: 'Subtask B',
    state: 'open',
    body: `This is a subtask
    
Epic #1
`,
    parent: 1,
};

const subtaskC: Subtask = {
    number: 4,
    title: 'Subtask C',
    state: 'open',
    body: `This is a subtask
    
Epic #6
`,
    parent: 6,
};

const subtaskD: Subtask = {
    number: 5,
    title: 'Subtask D',
    state: 'open',
    body: `This is a subtask
    
Epic #6
`,
    parent: 6,
};

const epic2: Epic = {
    number: 6,
    title: 'Epic 1',
    state: 'open',
    body: `This epic is used for testing purposes.
        
It will contain a list of subtasks maintained by pet-action github action.

## Subtasks
- [ ] Subtask C #4
- [ ] Subtask D #5
`,
    subtasks: [],
};

const epics = [epic1, epic2];
const subtasks = [subtaskA, subtaskB, subtaskC, subtaskD];

describe("Issue functions", () => {
    it("parses Epic body into Ref subtasks", async () => {
        const epic1Subtasks = parseBodySubtasks(epic1.body);
        expect(epic1Subtasks).toStrictEqual([
            {number: 2, title: 'Subtask A', state: 'open'},
            {number: 3, title: 'Subtask B', state: 'open'},
        ]);
    });

    it("parses Subtasks into a list of parent Ids", async () => {
        const epicIds = subtasks.map(s => parseParent(s.body));
        expect(epicIds).toStrictEqual([1, 1, 6, 6]);
    });

    it("parses Subtasks for a given Epic Id", async () => {
        const epicSubtasksIds = epics.map(e => parseNumberSubtasks(e.number, subtasks).map(s => s.number));
        expect(epicSubtasksIds).toStrictEqual([[2, 3], [4, 5]]);
    });

    it("checks Ref equality", async () => {
        const epicSubtasks = epics.map(e => equalRefs(parseBodySubtasks(e.body), parseNumberSubtasks(e.number, subtasks)));
        expect(epicSubtasks).toStrictEqual([true, true]);

        const subtaskE = Object.assign({}, subtaskA);
        subtaskE.number = 7;
        subtaskE.parent = 1;
        const subtasksWithE = subtasks.concat(subtaskE);

        const epicSubtasksWithE = epics.map(e => equalRefs(parseBodySubtasks(e.body), parseNumberSubtasks(e.number, subtasksWithE)));
        expect(epicSubtasksWithE).toStrictEqual([false, true]);
    })

    it("updates Epic body given an updated list of Subtasks", async () => {
        const subtaskE = Object.assign({}, subtaskA);
        subtaskE.title = 'Subtask E';
        subtaskE.number = 7;
        subtaskE.parent = 1;

        const subtasksWithE = parseBodySubtasks(epic1.body).concat({number: subtaskE.number, title: subtaskE.title, state: subtaskE.state})
        const updatedBody = updateBodySubtasks(epic1.body, subtasksWithE);
        expect(updatedBody).toStrictEqual(`This epic is used for testing purposes.
        
It will contain a list of subtasks maintained by pet-action github action.

## Subtasks
- [ ] Subtask A #2
- [ ] Subtask B #3
- [ ] Subtask E #7
`)
    })

    it("detects an Epic with updated subtasks", async () => {
        const subtaskE = Object.assign({}, subtaskA);
        subtaskE.title = 'Subtask E';
        subtaskE.number = 7;
        subtaskE.parent = 1;

        const newsubtasks = subtasks.concat(subtaskE);
        const updatedEpics = updateEpics(epics, newsubtasks).map(e => e.number);
        expect(updatedEpics).toStrictEqual([1]);
    });
});
