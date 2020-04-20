import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { IEmployee } from 'src/app/model/IEmployee';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-employee',
  templateUrl: './list-employee.component.html',
  styleUrls: ['./list-employee.component.css']
})
export class ListEmployeeComponent implements OnInit {

  employees: Array<IEmployee> = [];

  constructor(private employeeService: EmployeeService, private router: Router) { }

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe(result => {
      this.employees = result,
      (err) => console.log(err);
    });
  }

  public editButtonClick(employeeId: number){
    this.router.navigate(['/edit', employeeId]);
  }

}
