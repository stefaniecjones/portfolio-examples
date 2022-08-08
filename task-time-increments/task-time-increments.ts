  private loadFormConfigs(): void {
    this.fields = this.formlySanitizer.sanitizeSchema([
      {
        key: 'title',
        type: 'input',
        templateOptions: {
          label: 'Task title',
          placeholder: 'Task title',
          disabled: !this.canAddOrEditTask,
          maxLength: 100,
          required: true
        }
      },
      {
        key: 'description',
        type: 'textarea',
        templateOptions: {
          label: 'Task description',
          placeholder: 'Task description',
          description: '',
          rows: 3,
          disabled: !this.canAddOrEditTask
        }
      },
      {
        key: 'timeEstimation',
        type: 'input',
        templateOptions: {
          label: 'Time estimation for task (hours)',
          type: 'number',
          disabled: !this.canAddOrEditTask,
          description:
            'Enter time estimate in increments of 15 minutes (0.25). For example, one and a quarter of an hour should be entered as 1.25',
          min: 0,
          step: 0.25
        }
      },
      {
        key: 'areEquipmentAssociatedToTask',
        type: 'radio',
        templateOptions: {
          label: 'Are there equipment associated to this task?',
          options: getAreEquipmentAssociatedToTaskSelectOptions(),
          disabled: !this.canAddOrEditTask
        }
      },
      {
        key: 'equipments',
        type: 'select',
        templateOptions: {
          label: 'Equipment list',
          placeholder: 'Add equipments:',
          options: [
            {
              label: 'lookup-url',
              value: `lookup/jobequipment/${this.job.id}`
            }
          ],
          dataSourceUrl: `lookup/jobequipment/${this.job.id}`,
          dataSourceType: 'lookup',
          listType: 'unordered',
          bindModel: true,
          labelProp: 'name',
          valueProp: 'id',
          multiple: true,
          disabled: !this.canAddOrEditTask
        },
        hideExpression: model => {
          return (
            isNullOrUndefined(model.areEquipmentAssociatedToTask) || model.areEquipmentAssociatedToTask === AreEquipmentAssociatedToTask.No
          );
        }
      },
      {
        key: 'materials',
        type: 'select',
        templateOptions: {
          label: 'Materials list',
          placeholder: 'Add materials:',
          options: [
            {
              label: 'lookup-url',
              value: `lookup/jobmaterial/${this.job.id}`
            }
          ],
          dataSourceUrl: `lookup/jobmaterial/${this.job.id}`,
          dataSourceType: 'lookup',
          listType: 'unordered',
          bindModel: true,
          labelProp: 'name',
          valueProp: 'id',
          multiple: true,
          disabled: !this.canAddOrEditTask
        },
        hideExpression: model => {
          return (
            isNullOrUndefined(model.areEquipmentAssociatedToTask) || model.areEquipmentAssociatedToTask === AreEquipmentAssociatedToTask.No
          );
        }
      }
    ]);
    // Task time increments
    const timeEstimationField = this.fields.find(field => field.key === 'timeEstimation');
    timeEstimationField.validators = {
      fifteenMinuteIncrements: {
        expression: (control: AbstractControl) => control.value % 0.25 === 0,
        message: (error, field: FormlyFieldConfig) =>
          `"${field.formControl.value}" is not an increment of 0.25. Please enter task estimates in increments of 15 minutes only (e.g. .00, .25, .50, .75).`
      }
    };
  }
