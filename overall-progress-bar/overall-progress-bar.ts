  private calculateTaskProgressAndUpdateJob(): void {
    // Calculate the overall task progress and update job local cache
    const allTasksMinusClosed = this.jobTasks.filter(x => x.status != TaskStatus.Closed);
    const completedTasksCount = allTasksMinusClosed.filter(x => x.status === TaskStatus.Completed).length;
    let taskProgress = 0;
    if (allTasksMinusClosed.length !== 0) {
      taskProgress = Math.round((completedTasksCount / allTasksMinusClosed.length) * 100)
    }
    this.jobsService.updateLocalJobCacheWithTaskProgress(this.job.id, taskProgress);
  }
}
