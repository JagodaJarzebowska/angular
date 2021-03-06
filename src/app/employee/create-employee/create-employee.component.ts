import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custon.validators';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import { IEmployee } from 'src/app/model/IEmployee';
import { ISkill } from 'src/app/model/ISkill';
@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  employee: IEmployee;
  employeeForm: FormGroup;
  nameLength = 0;
  pageTitle: string;

  validationMsg = {
    'fullName': {
      'required': 'Full name is required.',
      'minlength': 'Full name must be greater than 2.',
      'maxlength': 'Full name must be less than 10.',
    },
    'email': {
      'required': 'Email is required.',
      'emailDomain': 'Email domain should be gmail.com'
    },
    'confirmEmail': {
      'required': 'Confirm Email is required.',
    },
    'emailGroup': {
      'emailMissMatch': 'Email and Confirm Email do not match.',
    },
    'phone': {
      'required': 'Phone is required.'
    },
  };

  formErros = {
    'fullName': '',
    'email': '',
    'confirmEmail': '',
    'emailGroup': '',
    'phone': '',
    'skillName': '',
    'experienceInYear': '',
    'inlineRadioOptions': ''
  };

  constructor(private formBuilder: FormBuilder, private activeRoute: ActivatedRoute,
    private employeeService: EmployeeService, private router: Router) { }

  ngOnInit(): void {
    this.employeeForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      emailGroup: this.formBuilder.group({
        email: ['', [Validators.required, CustomValidators.emailDomain('gmail.com')]],
        confirmEmail: ['', Validators.required],
      }, { validators: CustomValidators.matchEmail() }),

      phone: [''],
      skills: this.formBuilder.array([
        this.addSkillFormGroup()
      ])
    });


    this.employeeForm.get('contactPreference').valueChanges.subscribe(data => {
      this.onContactPreferenceChange(data);
    });

    this.employeeForm.valueChanges.subscribe(data => {
      this.logValidationErrors(this.employeeForm);
    });

    this.activeRoute.paramMap.subscribe(param => {
      const empId = +param.get('id');
      if (empId) {
        this.pageTitle = 'Edit employee';
        this.getEmployee(empId);
      } else {
        this.pageTitle = 'Create employee';
        this.employee = {
          id: null,
          fullName: '',
          contactPreference: '',
          email: '',
          phone: null,
          skills: []
        }
      }
    });
  }


  getEmployee(id: number) {
    this.employeeService.getEmplyee(id).subscribe((employe: IEmployee) => {
      this.editEmployee(employe),
        this.employee = employe;
    },
      (err: any) => console.log(err));
  }

  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,
      emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });

    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));

  }

  setExistingSkills(skillSets: ISkill[]): FormArray {
    const formArray = new FormArray([]);
    skillSets.forEach(s => {
      formArray.push(this.formBuilder.group({
        skillName: s.skillName,
        experienceInYear: s.experienceInYear,
        inlineRadioOptions: s.inlineRadioOptions
      }));
    });
    return formArray;
  }

  addSkillFormGroup(): FormGroup {
    return this.formBuilder.group({
      skillName: ['', Validators.required],
      experienceInYear: ['', Validators.required],
      inlineRadioOptions: ['', Validators.required]
    })
  }

  onContactPreferenceChange(value: string) {
    const phoneControl = this.employeeForm.get('phone');
    if (value === 'phone') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }


  logKeyAndValue(group: FormGroup) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        this.logKeyAndValue(control);
      } else {
        console.log('Key = ' + key + ', Value = ' + control.value);
      }
    });
  }

  disable(group: FormGroup) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        this.disable(control);
      } else {
        control.disable();
      }
    });
  }

  logValidationErrors(group: FormGroup = this.employeeForm) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.get(key);

      this.formErros[key] = '';
      if (control && !control.valid && (control.touched || control.dirty || control.value !== '')) {
        const message = this.validationMsg[key];
        console.log(message);
        for (const errorKey in control.errors) {
          if (errorKey) {
            this.formErros[key] += message[errorKey] + ' ';
          }
        }
      }

      if (control instanceof FormGroup) {
        this.logValidationErrors(control);
      }

    });
  }


  removeSkillButtonClick(index: number): void {
    const skillsFormArray = (<FormArray>this.employeeForm.get('skills'));
    skillsFormArray.removeAt(index);
    skillsFormArray.markAsDirty();
    skillsFormArray.markAsTouched();
  }

  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }

  logAction() {
    this.logKeyAndValue(this.employeeForm);
  }

  disableAction() {
    this.disable(this.employeeForm);
  }

  logErrors() {
    this.logValidationErrors(this.employeeForm);
    console.log(this.formErros);
  }

  valueChanges() {
    this.employeeForm.get('fullName').valueChanges.subscribe(
      (result: string) => {
        this.nameLength = result.length;
      });

    this.employeeForm.valueChanges.subscribe((result: any) => {
      console.log(JSON.stringify(result));
    });

    this.employeeForm.get('skills').valueChanges.subscribe((result: any) => {
      console.log(JSON.stringify(result));
    });
  }

  onSubmit(): void {
    this.mapFormValuesToEmployeeModel();
    if (this.employee.id) {
      this.employeeService.updateEmployee(this.employee).subscribe(
        () => this.router.navigate(['employees']),
        (err: any) => console.log(err)
      );
    } else {
      this.employeeService.addEmployee(this.employee).subscribe(
        () => this.router.navigate(['employees']),
        (err: any) => console.log(err)
      );
    }
  }

  mapFormValuesToEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;
  }

  onLoadData(): void {
    // SOME VALUE
    this.employeeForm.patchValue({
      fullName: 'test',
      email: 'email@cc.com'
    });

    // ALL VALUE
    // this.employeeForm.setValue({
    //   fullName: 'test',
    //   email: 'email@cc.com',
    //   skills: {
    //     skillName: 'Angular',
    //     experienceInYear: 0,
    //     proficiency: 'begginer'
    //   }
    // });
  }

  formArray() {
    const formArray = new FormArray([
      new FormControl('John', Validators.required),
      new FormGroup({
        country: new FormControl('', Validators.required)
      }),
      new FormArray([])
    ]);
    //serialize as array
    const formArray1 = this.formBuilder.array([
      new FormControl('Jagoda', Validators.required),
      new FormControl('IT', Validators.required),
      new FormControl('', Validators.required),
    ]);
    formArray1.push(new FormControl('three', Validators.required));
    console.log('Array-> ');
    console.log(formArray1);
    //serialize as object
    const formGroup = this.formBuilder.group([
      new FormControl('Jagoda', Validators.required),
      new FormControl('IT', Validators.required),
      new FormControl('', Validators.required),
    ]);

    console.log('Group-> ');
    console.log(formGroup);

    // console.log(formArray1.at(3));
    // console.log(formArray1.value);
  }

}

// function matchEmail(group: AbstractControl): { [key: string]: any } | any {
//   const emailControl = group.get('email');
//   const confirmEmailControl = group.get('confirmEmail');
//   if (emailControl.value === confirmEmailControl.value || confirmEmailControl.pristine) {
//     return null;
//   } else {
//     return { 'emailMissMatch': true };
//   }
// }
