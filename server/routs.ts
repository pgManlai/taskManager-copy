import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTaskSchema, 
  insertCommentSchema, 
  insertNotificationSchema, 
  insertActivitySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined;
      const isDeleted = req.query.isDeleted === 'true';
      
      const tasks = await storage.getTasks({ status, assignedTo, isDeleted });
      
      // Add comment count to each task
      const tasksWithCommentCount = await Promise.all(
        tasks.map(async (task) => {
          const commentCount = await storage.countTaskComments(task.id);
          
          // Get assignee information
          let assignee = undefined;
          if (task.assignedTo) {
            const user = await storage.getUser(task.assignedTo);
            if (user) {
              assignee = {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar
              };
            }
          }
          
          // Get team information
          let team = undefined;
          if (task.teamId) {
            team = await storage.getTeam(task.teamId);
          }
          
          return {
            ...task,
            commentCount,
            assignee,
            team
          };
        })
      );
      
      res.json(tasksWithCommentCount);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get comments
      const comments = await storage.getTaskComments(id);
      
      // Get assignee information
      let assignee = undefined;
      if (task.assignedTo) {
        const user = await storage.getUser(task.assignedTo);
        if (user) {
          assignee = {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            avatar: user.avatar
          };
        }
      }
      
      // Get team information
      let team = undefined;
      if (task.teamId) {
        team = await storage.getTeam(task.teamId);
      }
      
      // Get comment details with user information
      const commentsWithUser = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              username: user.username,
              avatar: user.avatar
            } : undefined
          };
        })
      );
      
      res.json({
        ...task,
        comments: commentsWithUser,
        assignee,
        team
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching task" });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Create activity for task creation
      await storage.createActivity({
        userId: taskData.createdBy,
        action: "created",
        entityType: "task",
        entityId: task.id
      });
      
      // If assigned to someone else, create notification
      if (taskData.assignedTo && taskData.assignedTo !== taskData.createdBy) {
        const creator = await storage.getUser(taskData.createdBy);
        const creatorName = creator ? creator.fullName : "Someone";
        
        await storage.createNotification({
          userId: taskData.assignedTo,
          title: "New task assigned",
          content: `${creatorName} assigned you to "${taskData.title}"`,
          type: "task_assigned",
          relatedId: task.id
        });
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const updatedTask = await storage.updateTask(id, updates);
      
      // Create activity for status change
      if (updates.status && updates.status !== existingTask.status) {
        const userId = updates.assignedTo || existingTask.assignedTo || existingTask.createdBy;
        
        await storage.createActivity({
          userId,
          action: updates.status === "completed" ? "completed" : "updated",
          entityType: "task",
          entityId: id
        });
        
        // Create notification for task completion
        if (updates.status === "completed" && existingTask.createdBy !== userId) {
          const user = await storage.getUser(userId);
          const userName = user ? user.fullName : "Someone";
          
          await storage.createNotification({
            userId: existingTask.createdBy,
            title: "Task completed",
            content: `${userName} marked "${existingTask.title}" as complete`,
            type: "task_completed",
            relatedId: id
          });
        }
      }
      
      // Handle assignment change
      if (updates.assignedTo && updates.assignedTo !== existingTask.assignedTo) {
        const user = await storage.getUser(existingTask.createdBy);
        const userName = user ? user.fullName : "Someone";
        
        await storage.createNotification({
          userId: updates.assignedTo,
          title: "Task assigned",
          content: `${userName} assigned you to "${existingTask.title}"`,
          type: "task_assigned",
          relatedId: id
        });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  app.post("/api/tasks/:id/restore", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.restoreTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error restoring task" });
    }
  });

  // API routes for comments
  app.get("/api/tasks/:taskId/comments", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await storage.getTaskComments(taskId);
      
      // Add user information to comments
      const commentsWithUser = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              username: user.username,
              avatar: user.avatar
            } : undefined
          };
        })
      );
      
      res.json(commentsWithUser);
    } catch (error) {
      res.status(500).json({ message: "Error fetching comments" });
    }
  });

  app.post("/api/tasks/:taskId/comments", async (req: Request, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        taskId
      });
      
      const comment = await storage.createComment(commentData);
      
      // Get user information
      const user = await storage.getUser(commentData.userId);
      
      // Create activity for comment
      await storage.createActivity({
        userId: commentData.userId,
        action: "commented",
        entityType: "task",
        entityId: taskId
      });
      
      // Create notification for task creator if different from commenter
      if (task.createdBy !== commentData.userId) {
        const userName = user ? user.fullName : "Someone";
        
        await storage.createNotification({
          userId: task.createdBy,
          title: "New comment",
          content: `${userName} commented on "${task.title}"`,
          type: "comment",
          relatedId: taskId
        });
      }
      
      // Create notification for task assignee if different from commenter
      if (task.assignedTo && task.assignedTo !== commentData.userId && task.assignedTo !== task.createdBy) {
        const userName = user ? user.fullName : "Someone";
        
        await storage.createNotification({
          userId: task.assignedTo,
          title: "New comment",
          content: `${userName} commented on "${task.title}"`,
          type: "comment",
          relatedId: taskId
        });
      }
      
      res.status(201).json({
        ...comment,
        user: user ? {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar
        } : undefined
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating comment" });
    }
  });

  // API routes for task statistics
  app.get("/api/tasks/stats/summary", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getTaskStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task statistics" });
    }
  });

  // API routes for teams
  app.get("/api/teams", async (req: Request, res: Response) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Error fetching teams" });
    }
  });

  app.get("/api/teams/:id/members", async (req: Request, res: Response) => {
    try {
      const teamId = parseInt(req.params.id);
      const members = await storage.getTeamMembers(teamId);
      
      // Add user information to members
      const membersWithUser = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            ...member,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              username: user.username,
              email: user.email,
              avatar: user.avatar
            } : undefined
          };
        })
      );
      
      res.json(membersWithUser);
    } catch (error) {
      res.status(500).json({ message: "Error fetching team members" });
    }
  });

  // API routes for notifications
  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      // For demo, always return notifications for user 1
      const userId = 1;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req: Request, res: Response) => {
    try {
      // For demo, always use user 1
      const userId = 1;
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Error marking all notifications as read" });
    }
  });

  app.get("/api/notifications/unread-count", async (req: Request, res: Response) => {
    try {
      // For demo, always use user 1
      const userId = 1;
      const count = await storage.countUnreadNotifications(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Error counting unread notifications" });
    }
  });

  // API routes for activities
  app.get("/api/activities/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getRecentActivities(limit);
      
      // Add user and entity information to activities
      const activitiesWithDetails = await Promise.all(
        activities.map(async (activity) => {
          const user = await storage.getUser(activity.userId);
          
          let entity = null;
          if (activity.entityType === "task") {
            entity = await storage.getTask(activity.entityId);
          }
          
          return {
            ...activity,
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              username: user.username,
              avatar: user.avatar
            } : undefined,
            entity
          };
        })
      );
      
      res.json(activitiesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  });

  // API routes for users (for demo purposes)
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      
      // Remove passwords from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userData } = user;
        return userData;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/users/current", async (req: Request, res: Response) => {
    try {
      // For demo, always return user 1
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userData } = user;
      
      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching current user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
