from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone

app = FastAPI(
    title="Simple Issue Tracker API",
    description="A simple API to track issues.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

db: Dict[str, Dict] = {}

class IssueBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: str = "open"
    priority: str = "medium"
    assignee: Optional[str] = None

class IssueCreate(IssueBase):
    pass

class IssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None

class Issue(IssueBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

def add_sample_data():
    sample_issues = [
        IssueCreate(title="Fix login button styling", description="The button is misaligned on Firefox.", status="open", priority="high", assignee="Alice"),
        IssueCreate(title="Implement user profile page", description="Users should be able to see their details.", status="in-progress", priority="medium", assignee="Bob"),
        IssueCreate(title="Database migration fails", description="The v2 migration script has a bug.", status="open", priority="critical", assignee="Charlie"),
        IssueCreate(title="Update documentation for API v3", description="Update API documentation to reflect new changes", status="closed", priority="low"),
    ]
    for issue_data in sample_issues:
        issue_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        issue = Issue(
            id=issue_id,
            createdAt=now,
            updatedAt=now,
            **issue_data.dict()
        ).dict()
        db[issue_id] = issue

add_sample_data()


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/issues", response_model=Issue, status_code=201, tags=["Issues"])
def create_issue(issue_in: IssueCreate):
    """Create a new issue."""
    issue_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    new_issue = Issue(
        id=issue_id,
        createdAt=now,
        updatedAt=now,
        **issue_in.dict()
    )
    db[issue_id] = new_issue.dict()
    return new_issue

@app.get("/issues", response_model=List[Issue], tags=["Issues"])
def get_issues(
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee: Optional[str] = None,
    sort_by: Optional[str] = Query("updatedAt", alias="sortBy"),
    sort_order: Optional[str] = Query("desc", alias="sortOrder"),
    page: int = 1,
    page_size: int = Query(10, alias="pageSize")
):
    """Get a list of issues with filtering, sorting, and pagination."""
    issues = list(db.values())

    if search:
        issues = [issue for issue in issues if search.lower() in issue['title'].lower()]

    if status:
        issues = [issue for issue in issues if issue['status'] == status]
    if priority:
        issues = [issue for issue in issues if issue['priority'] == priority]
    if assignee:
        issues = [issue for issue in issues if issue.get('assignee') == assignee]

    if sort_by and hasattr(Issue, sort_by):
        issues.sort(key=lambda x: x[sort_by], reverse=(sort_order == "desc"))
        
    start = (page - 1) * page_size
    end = start + page_size
    
    return issues[start:end]

@app.get("/issues/{issue_id}", response_model=Issue, tags=["Issues"])
def get_issue(issue_id: str):
    """Get a single issue by its ID."""
    issue = db.get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@app.put("/issues/{issue_id}", response_model=Issue, tags=["Issues"])
def update_issue(issue_id: str, issue_in: IssueUpdate):
    """Update an existing issue."""
    if issue_id not in db:
        raise HTTPException(status_code=404, detail="Issue not found")

    stored_issue_data = db[issue_id]
    update_data = issue_in.dict(exclude_unset=True)
    
    updated_issue = stored_issue_data.copy()
    updated_issue.update(update_data)
    updated_issue["updatedAt"] = datetime.now(timezone.utc)
    
    db[issue_id] = updated_issue
    return updated_issue