import { Component } from '@angular/core';
import { IssueListComponent } from './features/issue-list/issue-list.component';

@Component({
  selector: 'app-root',
  standalone: true, // <-- Add this
  imports: [
    IssueListComponent, // <-- Import the component used in the template
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  title = 'frontend';
}
