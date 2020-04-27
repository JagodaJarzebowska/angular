import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IEmployee } from '../model/IEmployee';
/*
json-server --watch db.json
*/
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl = 'http://localhost:3000/employees';

  constructor(private http: HttpClient) { }

  public getEmployees(): Observable<IEmployee[]> {
    return this.http.get<IEmployee[]>(this.baseUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(errorResponse: HttpErrorResponse) {
    if (errorResponse.error instanceof ErrorEvent) {
      console.error('Client side error', errorResponse.error);
    } else {
      console.error('Server side error', errorResponse);
    }

    return throwError('Problem with the service');
  }


  public getEmplyee(id: number): Observable<IEmployee> {
    return this.http.get<IEmployee>(this.baseUrl + '/' + id)
      .pipe(catchError(this.handleError));
  }

  public addEmployee(employee: IEmployee): Observable<IEmployee> {
    return this.http.post<IEmployee>(this.baseUrl, employee, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  public updateEmployee(employee: IEmployee): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${employee.id}`, employee, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(catchError(this.handleError));
  }

  // public deleteEmployee(id: number): Observable<IEmployee>{
  //   return this.http.delete<void>(this.baseUrl, id)
  //   .pipe(catchError(this.handleError));
  // }

}
