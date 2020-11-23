# kiali-epic-action
Github Action for managing Epic and Subtaks

## Usage

When the action is configured in a repo it adds additional automation on issues labeled with 'epic' and 'subtask'.

A issue labeled with 'subtask' can be linked with an issue labeled with 'epic' using a line in the body.subtask

```
This is my description of the issue
[...]
Epic #1
```

`Epic <Reference of the issue>` will tell this action that the Epic needs to update a list of Subtasks in the body:

```
This epic is used for testing purposes.

It will contain a list of subtasks maintained by pet-action github action.

## Subtasks
- [x] Subtask A #2
- [ ] Subtask B #3
```

This action will update the Epic `Subtaks` section with new subtaks or changes in the state of existing subtasks.

## Inputs

### `TOKEN`

**Mandatory** The token used by the action to access and modify repo's issues.access

Typically

```
        with:
          TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Example of workflow configuration

```
on:
  issues:
    types: [edited, closed, reopened, labeled]
jobs:
  sync-epic-job:
    if: contains(github.event.issue.labels.*.name, 'subtask')
    runs-on: ubuntu-latest
    name: Sync epic issues with subtasks issues
    steps:
      - name: Sync Epic Issues
        id: sync-epic
        uses: kiali/kiali-epic-action@v1.0.1
        with:
          TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
