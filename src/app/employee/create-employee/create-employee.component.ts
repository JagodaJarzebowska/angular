import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  nameLength = 0;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.employeeForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      email: [''],
      skills: this.formBuilder.group({
        skillName: [''],
        experienceInYear: [''],
        inlineRadioOptions: ['beginner']
      })
    });

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
    console.log(this.employeeForm.value);
    // take a value
    console.log(this.employeeForm.controls.fullName.value);
    console.log(this.employeeForm.controls.email.value);
    console.log(this.employeeForm.get('fullName').value);
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


}
