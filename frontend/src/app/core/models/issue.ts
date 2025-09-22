export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}
