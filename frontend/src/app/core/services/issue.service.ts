import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue } from '../models/issue';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  private apiUrl = `${environment.apiUrl}/issues`;

  constructor(private http: HttpClient) {}

  getIssues(params: any): Observable<Issue[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key]) {
        httpParams = httpParams.append(key, params[key]);
      }
    });
    return this.http.get<Issue[]>(this.apiUrl, { params: httpParams });
  }

  getIssueById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/${id}`);
  }

  createIssue(issue: Partial<Issue>): Observable<Issue> {
    return this.http.post<Issue>(this.apiUrl, issue);
  }

  updateIssue(id: string, issue: Partial<Issue>): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${id}`, issue);
  }
}
