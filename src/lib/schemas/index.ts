import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().cuid(), 
  email: z.string().trim().toLowerCase().email("Неверный формат почты"),
  name: z.string().min(2).max(50).optional(),
  role: z.enum(["USER", "ADMIN"]),
  image: z.string().url().optional().nullable(),
  createdAt: z.date(),
  updateAt: z.date(),
});

export const CreatedUserSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа").max(50),
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть не менее 8 символов"),
  confirmPassword: z.string().min(1, "Пожалуйста, подтвердите пароль"),
}).superRefine(({ password, confirmPassword }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Пароли не совпадают',
      path: ['confirmPassword'], 
    });
  }
});


export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Неверный формат почты"),
  password: z.string().min(1, 'Пароль обязателен для заполнения'),
  
  rememberMe: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean()
  ),
});


export const ProjectSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
  isPublic: z.boolean().default(false),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ProjectStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']);
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500), 
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  isPublic: z.boolean(),
  status: ProjectStatusSchema.optional().default('ACTIVE'),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']);
export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const TaskSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1, 'Название обязательно').max(200),
  description: z.string().max(1000).optional().nullable(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  order: z.number().int().default(0),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z.string(),
  assigneeId: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional().nullable(),
  status: TaskStatusSchema.default('TODO'),
  priority: TaskPrioritySchema.default('MEDIUM'),
  projectId: z.string(),
  order: z.number().int().optional().default(0),
  dueDate: z.coerce.date().optional().nullable(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string(),
});

export const MoveTaskSchema = z.object({
  taskId: z.string(),
  newStatus: TaskStatusSchema,
  newOrder: z.number().int(),
  projectId: z.string().optional(),
});

export const CommentSchema = z.object({
  id: z.string().cuid(),
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  isEdited: z.boolean().default(false),
  taskId: z.string(),
  authorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCommentSchema = CommentSchema.pick({
  content: true,
  taskId: true,
});

export const ProjectResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое").max(50, "Имя слишком длинное"),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreatedUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type MoveTaskInput = z.infer<typeof MoveTaskSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
