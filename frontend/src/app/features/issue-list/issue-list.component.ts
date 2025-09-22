import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, pipes, etc.

// Import necessary Angular Material modules
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

// App-specific imports
import { Issue } from '../../core/models/issue';
import { IssueService } from '../../core/services/issue.service';
import { IssueFormComponent } from '../../shared/components/issue-form/issue-form.component';
import {
  merge,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
} from 'rxjs';

@Component({
  selector: 'app-issue-list',
  standalone: true, // Mark as standalone
  imports: [
    // <--- ADD THIS IMPORTS ARRAY
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSidenavModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss'],
})
export class IssueListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'title',
    'status',
    'priority',
    'assignee',
    'updatedAt',
    'actions',
  ];
  issues: Issue[] = [];

  searchControl = new FormControl('');
  statusControl = new FormControl('');
  priorityControl = new FormControl('');

  selectedIssue: Issue | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(private issueService: IssueService, public dialog: MatDialog) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Reset paginator on sort change
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    // Combine all streams that should trigger a data reload
    merge(
      this.sort.sortChange,
      this.paginator.page,
      this.searchControl.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ),
      this.statusControl.valueChanges,
      this.priorityControl.valueChanges
    )
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.fetchIssues();
        })
      )
      .subscribe((data) => {
        this.issues = data as Issue[];
      });

    // Initial load
    this.fetchIssues().subscribe((data) => (this.issues = data as Issue[]));
  }

  fetchIssues() {
    const params = {
      sortBy: this.sort.active || 'updatedAt',
      sortOrder: this.sort.direction || 'desc',
      page: this.paginator.pageIndex + 1,
      pageSize: this.paginator.pageSize || 10,
      search: this.searchControl.value,
      status: this.statusControl.value,
      priority: this.priorityControl.value,
    };
    return this.issueService.getIssues(params);
  }

  loadIssues() {
    this.fetchIssues().subscribe((data) => (this.issues = data as Issue[]));
  }

  openIssueForm(issue?: Issue): void {
    const dialogRef = this.dialog.open(IssueFormComponent, {
      width: '500px',
      data: { issue },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadIssues(); // Refresh the list if an issue was created/updated
      }
    });
  }

  showIssueDetails(issue: Issue): void {
    this.issueService.getIssueById(issue.id).subscribe((fullIssue) => {
      this.selectedIssue = fullIssue;
      this.drawer.open();
    });
  }
}
