import { Document, Task, Event, DashboardData } from '@/types';

class LocalStorageService {
  private getItem<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setItem<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return this.getItem<Document>('documents');
  }

  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const documents = this.getItem<Document>('documents');
    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.setItem('documents', [...documents, newDocument]);
    return newDocument;
  }

  async updateDocument(id: string, document: Partial<Document>): Promise<Document> {
    const documents = this.getItem<Document>('documents');
    const index = documents.findIndex(doc => doc.id === id);
    if (index === -1) throw new Error('Document not found');
    
    const updatedDocument = {
      ...documents[index],
      ...document,
      updated_at: new Date().toISOString()
    };
    documents[index] = updatedDocument;
    this.setItem('documents', documents);
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<void> {
    const documents = this.getItem<Document>('documents');
    const filteredDocuments = documents.filter(doc => doc.id !== id);
    this.setItem('documents', filteredDocuments);
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return this.getItem<Task>('tasks');
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const tasks = this.getItem<Task>('tasks');
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.setItem('tasks', [...tasks, newTask]);
    return newTask;
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const tasks = this.getItem<Task>('tasks');
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    
    const updatedTask = {
      ...tasks[index],
      ...task,
      updated_at: new Date().toISOString()
    };
    tasks[index] = updatedTask;
    this.setItem('tasks', tasks);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = this.getItem<Task>('tasks');
    const filteredTasks = tasks.filter(task => task.id !== id);
    this.setItem('tasks', filteredTasks);
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return this.getItem<Event>('events');
  }

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const events = this.getItem<Event>('events');
    const newEvent: Event = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.setItem('events', [...events, newEvent]);
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const events = this.getItem<Event>('events');
    const index = events.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    const updatedEvent = {
      ...events[index],
      ...event,
      updated_at: new Date().toISOString()
    };
    events[index] = updatedEvent;
    this.setItem('events', events);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const events = this.getItem<Event>('events');
    const filteredEvents = events.filter(event => event.id !== id);
    this.setItem('events', filteredEvents);
  }

  // Dashboard methods
  async getDashboardData(): Promise<DashboardData> {
    const documents = await this.getDocuments();
    const tasks = await this.getTasks();
    const events = await this.getEvents();

    return {
      totalDocuments: documents.length,
      totalTasks: tasks.length,
      totalEvents: events.length,
      recentDocuments: documents.slice(-5),
      recentTasks: tasks.slice(-5),
      upcomingEvents: events.slice(-5),
      taskStatus: {
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
      }
    };
  }
}

export const localStorageService = new LocalStorageService(); 