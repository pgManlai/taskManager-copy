import { db } from "./db";
import { users, teams, teamMembers, tasks, comments, notifications, activities } from "@shared/schema";
import { storage } from "./storage";

// Run this function to seed the database with initial data
export async function seedDatabase() {
  console.log("Seeding database with initial data...");
  
  try {
    // Check if there's already data in the database
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }
    
    // Create users
    const johnDoe = await storage.createUser({
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      fullName: "John Doe",
      email: "john@example.com",
      avatar: "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
      experiencePoints: 750,
      rank: "Intermediate"
    });
    
    const janeDoe = await storage.createUser({
      username: "janedoe",
      password: "password123",
      fullName: "Jane Doe",
      email: "jane@example.com",
      avatar: "https://ui-avatars.com/api/?name=Jane+Doe&background=0D8ABC&color=fff",
      experiencePoints: 1500,
      rank: "Expert"
    });
    
    const bobSmith = await storage.createUser({
      username: "bobsmith",
      password: "password123",
      fullName: "Bob Smith",
      email: "bob@example.com",
      avatar: "https://ui-avatars.com/api/?name=Bob+Smith&background=0D8ABC&color=fff",
      experiencePoints: 2500,
      rank: "Master"
    });
    
    // Create teams
    const marketingTeam = await storage.createTeam({
      name: "Marketing"
    });
    
    const developmentTeam = await storage.createTeam({
      name: "Development"
    });
    
    // Add team members
    await storage.addTeamMember({
      userId: johnDoe.id,
      teamId: marketingTeam.id
    });
    
    await storage.addTeamMember({
      userId: janeDoe.id,
      teamId: marketingTeam.id
    });
    
    await storage.addTeamMember({
      userId: bobSmith.id,
      teamId: developmentTeam.id
    });
    
    await storage.addTeamMember({
      userId: johnDoe.id,
      teamId: developmentTeam.id
    });
    
    // Create tasks
    const task1 = await storage.createTask({
      title: "Update dashboard analytics",
      description: "Integrate new analytics features into the dashboard",
      status: "todo",
      priority: "high",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assignedTo: johnDoe.id,
      createdBy: bobSmith.id,
      teamId: developmentTeam.id
    });
    
    const task2 = await storage.createTask({
      title: "Design new marketing materials",
      description: "Create new brochures and digital assets for Q3 campaign",
      status: "in-progress",
      priority: "medium",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      assignedTo: janeDoe.id,
      createdBy: johnDoe.id,
      teamId: marketingTeam.id
    });
    
    const task3 = await storage.createTask({
      title: "Fix homepage responsive issues",
      description: "The homepage breaks on mobile devices",
      status: "in-progress",
      priority: "high",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      assignedTo: bobSmith.id,
      createdBy: johnDoe.id,
      teamId: developmentTeam.id
    });
    
    const task4 = await storage.createTask({
      title: "Quarterly report preparation",
      description: "Prepare data for quarterly stakeholder meeting",
      status: "todo",
      priority: "medium",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      assignedTo: johnDoe.id,
      createdBy: janeDoe.id,
      teamId: marketingTeam.id
    });
    
    const task5 = await storage.createTask({
      title: "Code refactoring for backend services",
      description: "Improve code quality and reduce technical debt",
      status: "completed",
      priority: "low",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      assignedTo: bobSmith.id,
      createdBy: bobSmith.id,
      teamId: developmentTeam.id
    });
    
    // Create comments
    await storage.createComment({
      taskId: task1.id,
      userId: bobSmith.id,
      content: "Let's focus on improving the UI first"
    });
    
    await storage.createComment({
      taskId: task1.id,
      userId: johnDoe.id,
      content: "I'll start working on the UI improvements today"
    });
    
    await storage.createComment({
      taskId: task3.id,
      userId: johnDoe.id,
      content: "I've identified the issue with mobile responsiveness"
    });
    
    await storage.createComment({
      taskId: task3.id,
      userId: bobSmith.id,
      content: "Great! Let me know if you need help fixing it"
    });
    
    // Create notifications
    await storage.createNotification({
      userId: johnDoe.id,
      title: "Task assigned",
      content: "You've been assigned a new task: Update dashboard analytics",
      type: "task_assigned",
      relatedId: task1.id
    });
    
    await storage.createNotification({
      userId: janeDoe.id,
      title: "Task assigned",
      content: "You've been assigned a new task: Design new marketing materials",
      type: "task_assigned",
      relatedId: task2.id
    });
    
    const notification = await storage.createNotification({
      userId: bobSmith.id,
      title: "Task completed",
      content: "You marked a task as completed: Code refactoring for backend services",
      type: "task_completed",
      relatedId: task5.id
    });
    
    // Mark notification as read
    await storage.markNotificationAsRead(notification.id);
    
    // Create activities
    await storage.createActivity({
      userId: bobSmith.id,
      action: "created",
      entityType: "task",
      entityId: task1.id
    });
    
    await storage.createActivity({
      userId: johnDoe.id,
      action: "created",
      entityType: "task",
      entityId: task2.id
    });
    
    await storage.createActivity({
      userId: johnDoe.id,
      action: "created",
      entityType: "task",
      entityId: task3.id
    });
    
    await storage.createActivity({
      userId: janeDoe.id,
      action: "created",
      entityType: "task",
      entityId: task4.id
    });
    
    await storage.createActivity({
      userId: bobSmith.id,
      action: "created",
      entityType: "task",
      entityId: task5.id
    });
    
    await storage.createActivity({
      userId: bobSmith.id,
      action: "completed",
      entityType: "task",
      entityId: task5.id
    });
    
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}