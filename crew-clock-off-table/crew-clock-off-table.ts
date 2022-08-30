 export class PostJobSafetyReviewEditComponent extends DestructibleBaseComponent implements OnInit, AfterViewInit {
  timeTrackedDayOptions: SelectItem[] = [];
  selectedTimeEntries: TimeEntryRow[];
  jobTasks$: Observable<JobTaskSummary[]>;
  crewMemberDropDownList: CrewMemberDetails[];
  timeEntryValues: TimeEntryRow[] = [{ crewMember: null, task: null, time: 0 }];
    
  ngOnInit(): void {
    this.timeEntryValues = [...this.timeEntryValues, { crewMember: null, task: null, time: 0 }];
  }
    
   onAddAnotherEntry(): void {
    const newRow = { crewMember: null, task: null, time: 0 };
    this.timeEntryValues = [...this.timeEntryValues, newRow];
  }

  onDeleteEntry(): void {
    const rowToDelete = this.selectedTimeEntries;
    const timeEntryValues = this.timeEntryValues;
    const remainingTimeEntryValues = _.difference(timeEntryValues, rowToDelete);
    this.timeEntryValues = remainingTimeEntryValues;
    this.selectedTimeEntries = [];
  }  
}
    
