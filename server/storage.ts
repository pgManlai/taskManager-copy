import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  teams, type Team, type InsertTeam,
  teamMembers, type TeamMember, type InsertTeamMember,
  comments, type Comment, type InsertComment,
  notifications, type Notification, type InsertNotification,
  activities, type Activity, type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, SQL, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasks(filters?: { status?: string, assignedTo?: number, isDeleted?: boolean }): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  restoreTask(id: number): Promise<Task | undefined>;
  getTaskStats(): Promise<{ total: number, completed: number, inProgress: number, overdue: number }>;

  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getUserTeams(userId: number): Promise<Team[]>;

  // Comment operations
  getTaskComments(taskId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  countTaskComments(taskId: number): Promise<number>;

  // Notification operations
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  countUnreadNotifications(userId: number): Promise<number>;

  // Activity operations
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!task) return undefined;

    const result = await this.enhanceTaskWithRelations([task]);
    return result[0];
  }

  async getTasks(filters?: { status?: string, assignedTo?: number, isDeleted?: boolean }): Promise<Task[]> {
    let conditions: SQL<unknown>[] = [];

    if (filters) {
      if (filters.status !== undefined) {
        conditions.push(eq(tasks.status, filters.status));
      }
      if (filters.assignedTo !== undefined) {
        conditions.push(eq(tasks.assignedTo, filters.assignedTo));
      }
      if (filters.isDeleted !== undefined) {
        conditions.push(eq(tasks.isDeleted, filters.isDeleted));
      }
    }

    const whereClause = conditions.length 
      ? and(...conditions) 
      : undefined;

    let query = db.select().from(tasks);
    if (whereClause) {
      query = query.where(whereClause);
    }
    
    const taskResults = await query.orderBy(desc(tasks.updatedAt));
    return this.enhanceTaskWithRelations(taskResults);
  }

  private async enhanceTaskWithRelations(taskItems: Task[]): Promise<Task[]> {
    if (taskItems.length === 0) return [];

    // Get team info for tasks that have a teamId
    const teamIds = taskItems
      .filter(t => t.teamId !== null && t.teamId !== undefined)
      .map(t => t.teamId!);

    const teamRecords = teamIds.length
      ? await db.select().from(teams).where(sql`${teams.id} IN ${teamIds}`)
      : [];

    // Get assignee info for tasks that have an assignedTo
    const assigneeIds = taskItems
      .filter(t => t.assignedTo !== null && t.assignedTo !== undefined)
      .map(t => t.assignedTo!);

    const assigneeRecords = assigneeIds.length
      ? await db.select().from(users).where(sql`${users.id} IN ${assigneeIds}`)
      : [];

    // Get comment counts for each task
    const taskIds = taskItems.map(t => t.id);
    const commentCounts = await db
      .select({
        taskId: comments.taskId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(comments)
      .where(sql`${comments.taskId} IN ${taskIds}`)
      .groupBy(comments.taskId);

    // Create a map for faster lookups
    const teamMap = new Map(teamRecords.map(team => [team.id, team]));
    const assigneeMap = new Map(assigneeRecords.map(user => [user.id, user]));
    const commentCountMap = new Map(commentCounts.map(c => [c.taskId, c.count]));

    // Combine all data
    return taskItems.map(task => ({
      ...task,
      team: task.teamId ? teamMap.get(task.teamId) : undefined,
      assignee: task.assignedTo ? assigneeMap.get(task.assignedTo) : undefined,
      commentCount: commentCountMap.get(task.id) || 0
    }));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    
    const result = await this.enhanceTaskWithRelations([task]);
    return result[0];
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask) return undefined;

    const result = await this.enhanceTaskWithRelations([updatedTask]);
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        isDeleted: true,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();

    return !!updatedTask;
  }

  async restoreTask(id: number): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        isDeleted: false,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask) return undefined;

    const result = await this.enhanceTaskWithRelations([updatedTask]);
    return result[0];
  }

  async getTaskStats(): Promise<{ total: number, completed: number, inProgress: number, overdue: number }> {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.isDeleted, false));

    const now = new Date();
    
    const completed = allTasks.filter(task => task.status === 'completed').length;
    const inProgress = allTasks.filter(task => task.status === 'in-progress').length;
    const overdue = allTasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      return new Date(task.dueDate) < now;
    }).length;

    return {
      total: allTasks.length,
      completed,
      inProgress,
      overdue
    };
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db
      .insert(teams)
      .values(insertTeam)
      .returning();
    return team;
  }

  async addTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const [teamMember] = await db
      .insert(teamMembers)
      .values(insertTeamMember)
      .returning();
    return teamMember;
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const members = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));

    const userIds = members.map(m => m.userId);
    
    const userRecords = userIds.length 
      ? await db.select().from(users).where(sql`${users.id} IN ${userIds}`)
      : [];

    const userMap = new Map(userRecords.map(user => [user.id, user]));
    
    // Cast to any to add user property which is not in the TeamMember type
    return members.map(member => ({
      ...member,
      user: userMap.get(member.userId)
    } as TeamMember & { user?: User }));
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    const userTeamMemberships = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));

    const teamIds = userTeamMemberships.map(m => m.teamId);
    
    if (teamIds.length === 0) return [];
    
    return await db
      .select()
      .from(teams)
      .where(sql`${teams.id} IN ${teamIds}`);
  }

  async getTaskComments(taskId: number): Promise<Comment[]> {
    const commentResults = await db
      .select()
      .from(comments)
      .where(eq(comments.taskId, taskId))
      .orderBy(asc(comments.createdAt));

    const userIds = commentResults.map(c => c.userId);
    
    const userRecords = userIds.length 
      ? await db.select().from(users).where(sql`${users.id} IN ${userIds}`)
      : [];

    const userMap = new Map(userRecords.map(user => [user.id, user]));
    
    // Cast to any to add user property which is not in the Comment type
    return commentResults.map(comment => ({
      ...comment,
      user: userMap.get(comment.userId)
    } as Comment & { user?: User }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, comment.userId));

    // Cast to any to add user property which is not in the Comment type
    return {
      ...comment,
      user
    } as Comment & { user?: User };
  }

  async countTaskComments(taskId: number): Promise<number> {
    const [result] = await db
      .select({
        count: sql<number>`count(*)`.as('count')
      })
      .from(comments)
      .where(eq(comments.taskId, taskId));

    return result?.count || 0;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification || undefined;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
    return !!result;
  }

  async countUnreadNotifications(userId: number): Promise<number> {
    const [result] = await db
      .select({
        count: sql<number>`count(*)`.as('count')
      })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    return result?.count || 0;
  }

  async getRecentActivities(limit?: number): Promise<Activity[]> {
    const limitValue = limit || 10;
    
    const activityResults = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limitValue);

    const userIds = activityResults.map(a => a.userId);
    
    const userRecords = userIds.length 
      ? await db.select().from(users).where(sql`${users.id} IN ${userIds}`)
      : [];

    const userMap = new Map(userRecords.map(user => [user.id, user]));
    
    // Cast to any to add user property which is not in the Activity type
    return activityResults.map(activity => ({
      ...activity,
      user: userMap.get(activity.userId)
    } as Activity & { user?: User }));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, activity.userId));

    // Cast to any to add user property which is not in the Activity type
    return {
      ...activity,
      user
    } as Activity & { user?: User };
  }
}

export const storage = new DatabaseStorage();