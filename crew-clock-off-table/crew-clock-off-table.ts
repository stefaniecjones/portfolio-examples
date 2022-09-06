export class PostJobSafetyReviewEditComponent extends DestructibleBaseComponent implements OnInit, AfterViewInit {
  job: JobSummary;
  model: PostJobSafetyReviewDetails;
  fields: FormlyFieldConfig[];
  form = new FormGroup({});

  fieldsSignOff: FormlyFieldConfig[];
  bulkEditForm = new FormGroup({});
  showBulkEditModal = false;
  modalOptions: NgbModalOptions = {
    size: 'md',
    keyboard: false,
    backdrop: 'static'
  };

  postJobSafetyReviewId = 0;
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false
    }
  };
  canEditPostJobSafetyReviewChecklist = false;
  canSignOffPostJobSafetyReviewChecklist = false;

  breadcrumbs: Breadcrumb[] = [];

  showHazardControlWarning = false;
  timeTrackedDayOptions: SelectItem[] = [];
  selectedTimeEntries: TimeEntryRow[];
  jobTasks$: Observable<JobTaskSummary[]>;
  crewMemberDropDownList: CrewMemberDetails[];
  timeEntryValues: TimeEntryRow[] = [{ crewMember: null, task: null, time: 0 }];

  get canEditPostJobSafetyReview(): boolean {
    return this.canEditPostJobSafetyReviewChecklist && isNotCompletedOrClosed(this.job);
  }

  constructor(
    private route: ActivatedRoute,
    private jobSafetyService: JobSafetyService,
    private router: Router,
    private formlySanitizer: FormlySanitizerService,
    private authService: AuthOpenIdService,
    private routerHelperService: RouterHelperService,
    private jobTaskService: JobTaskService
  ) {
    super();
  }

  ngOnInit(): void {
    this.canEditPostJobSafetyReviewChecklist = this.authService.hasPermissibleAction(
      PermissibleActions.CanEditPostJobSafetyReviewChecklist
    );
    this.canSignOffPostJobSafetyReviewChecklist = this.authService.hasPermissibleAction(
      PermissibleActions.CanSignOffPostJobSafetyReviewChecklist
    );
    this.routerHelperService.getJobSummaryFromRoute(this.route.snapshot.paramMap).subscribe(jobSummary => {
      this.job = jobSummary;
      this.breadcrumbs = getBreadCrumbsForJobDetails(this.job);
      this.setupFormAndModel();
      this.jobTasks$ = this.jobTaskService.getJobTaskSummariesByJobId(this.job.id).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    });

    this.setupBulkEditFormAndTimeTrackDayOptions();
    this.timeEntryValues = [...this.timeEntryValues, { crewMember: null, task: null, time: 0 }];
  }

  onCancel(): void {
    this.router.navigate([`/details/${this.job.id}`], { queryParams: { tab: Tab.Safety } });
  }

  onBulkEdit(): void {
    this.showBulkEditModal = true;
    this.bulkEditForm.controls.timeTrackDays.reset();
    this.bulkEditForm.controls.taskDropDown.reset();
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

  onCloseModal(): void {
    this.showBulkEditModal = false;
  }

  onSaveModal(): void {
    const bulkTime = this.bulkEditForm.controls.timeTrackDays.value;
    const bulkTask = this.bulkEditForm.controls.taskDropDown.value;
    const selectedEntry = this.selectedTimeEntries;
    for (let value of selectedEntry) {
      value.time = bulkTime;
      value.task = bulkTask;
    }
    this.showBulkEditModal = false;
  }

  private setupFormAndModel(): void {
    if (this.route.snapshot.paramMap.get('postJobSafetyReviewId')) {
      this.postJobSafetyReviewId = parseInt(this.route.snapshot.paramMap.get('postJobSafetyReviewId'));
      this.jobSafetyService.getPostJobSafetyReviewDetailsById(this.postJobSafetyReviewId).subscribe(postJobSafetyReview => {
        this.model = postJobSafetyReview;
        this.crewMemberDropDownList = [...postJobSafetyReview.postJobSafetyReviewCrewMemberDetails];
        this.loadFormConfigs();
      });
    } else {
      this.router.navigate([`/details/${this.job.id}`], { queryParams: { tab: Tab.Safety } });
    }
  }

  private setupBulkEditFormAndTimeTrackDayOptions(): void {
    this.bulkEditForm = new FormGroup({
      timeTrackDays: new FormControl('', [Validators.required]),
      taskDropDown: new FormControl('', [Validators.required])
    });

    let value = 0;
    for (let i = 0; i <= 8; i++) {
      this.timeTrackedDayOptions.push({
        label: value.toString(),
        value: value
      });
      value += 0.25;
    }
    const s = 0;
  }
}
