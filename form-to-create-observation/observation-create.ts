interface ObservationFormModel {
  title: string;
  description: string;
  date: Date;
  workCentre: SelectOption<number>;
  requesters: SelectOption<UserInfo>[];
  coordinators: SelectOption<UserInfo>[];
  attachments: FileTransferData[];
}

function observationFields(): FormlyFieldConfigForModel<ObservationFormModel>[] {
  return [
    // Observation title
    {
      key: 'title',
      type: 'input',
      templateOptions: {
        label: 'Observation title',
        required: true,
        placeholder: 'Enter title',
        maxLength: 100
      },
      expressionProperties: {
        'templateOptions.description': '(model) => {return `${100 - (model.title ? model.title.length : 0)} characters remaining`;}'
      }
    },
    // Observation date
    {
      key: 'date',
      type: 'datepicker',
      templateOptions: {
        label: 'Observation date',
        placeholder: 'Select date',
        required: true
      }
    },
    // Observation description
    {
      key: 'description',
      type: 'textarea',
      templateOptions: {
        label: 'Observation description',
        placeholder: 'Enter text...',
        rows: 6
      }
    },
    // Work centre
    {
      key: 'workCentre',
      type: 'typeahead',
      templateOptions: {
        label: 'Work centre*',
        required: true,
        placeholder: 'Search by work centre name',
        options: [
          {
            label: 'lookup-url;search',
            value: 'lookup/workcenters/filter'
          }
        ],
        listType: 'unordered',
        searchParam: 'text',
        bindModel: true,
        labelProp: 'name',
        valueProp: 'id',
        addTag: false
      }
    },
    // Activity co-ordinator
    {
      key: 'coordinators',
      type: 'typeahead',
      templateOptions: {
        label: 'Activity co-ordinator*',
        placeholder: 'Search by name or email address',
        required: true,
        options: [
          {
            label: 'lookup-url;search',
            value: 'lookup/users'
          }
        ],
        listType: 'unordered',
        searchParam: 'searchTerm',
        bindModel: true,
        labelProp: 'name',
        valueProp: 'id',
        addTag: false,
        multiple: true
      }
    },
    // Observation created by
    {
      key: 'requesters',
      type: 'typeahead',
      templateOptions: {
        label: 'Observation created by',
        placeholder: 'Search by name or email address',
        options: [
          {
            label: 'lookup-url;search',
            value: 'lookup/users'
          }
        ],
        listType: 'unordered',
        searchParam: 'searchTerm',
        bindModel: true,
        labelProp: 'name',
        valueProp: 'id',
        addTag: false,
        multiple: true
      }
    },
    { template: '<hr class="hr-dashed mt-5 mb-5"/>' },
    // Attachments / file upload
    {
      key: 'attachments',
      type: 'inline-image-upload',
      templateOptions: {
        label: 'Attachments',
        showDescription: true,
        documentUpload: true
      }
    }
  ];
}

@Component({
  selector: 'app-observations-create',
  templateUrl: './observations-create.component.html'
})
export class ObservationsCreateComponent extends DestructibleBaseComponent implements OnInit {
  readonly breadcrumbs = [{ label: 'Observations', link: '/observations' }, { label: 'New Observation' }] as BreadcrumbConfig[];
  readonly form = new FormGroup({});
  model: ObservationFormModel;
  readonly fields = this.formlySanitisation.sanitizeSchema(observationFields());

  constructor(
    private observationsService: ObservationsService,
    private router: Router,
    private formlySanitisation: FormlySanitizerService,
    private activatedRoute: ActivatedRoute,
    private openIdService: AuthOpenIdService,
    private observationWorkflow: ObservationWorkflowService
  ) {
    super();
  }

  ngOnInit(): void {
    this.model = {
      title: '',
      description: '',
      workCentre: null,
      date: new Date(),
      coordinators: [],
      requesters: [],
      attachments: []
    };

    // add the current user to the model by default
    this.openIdService.$userProfile
      .pipe(
        first(user => user != null),
        takeUntil(this.destroyed$)
      )
      .subscribe(currentUser => {
        if (this.model.requesters.every(requester => requester.id.id !== currentUser.email)) {
          this.model.requesters.push({
            name: currentUser.email,
            id: {
              label: currentUser.email,
              value: currentUser.email,
              id: currentUser.email,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName
            }
          });
        }
      });
