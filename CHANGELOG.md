# Changelog

## 2.0.0

- BREAKING: task labels are now a separate object and can be changed with
  `task.label.value` and `task.label.length` instead of `task.label` and
  `task.label_length`
- Task progress can be set using the `current`, `total` properties or directly
  with the `progress` property
- Save the average task time with `time_store.use_file('filename')`, `task.start_timer()`, `await task.stop_timer()` and let the task display the estimated time remaining automatically

## 1.1.0

Added Task for a single horizontal line with progress bar

## 1.0.0

Initial Version
