// Public barrel for @starterkit/schemas — the single source of truth for
// validation, consumed by apps/api (CJS, via nestjs-zod createZodDto) and
// apps/web (Vite/ESM, via @vee-validate/zod toTypedSchema). Use EXPLICIT named
// re-exports (not `export *`) so the compiled CJS output is statically
// analyzable by cjs-module-lexer / Rollup.

export { baseQuerySchema, computeSkip } from './common/query.schema';
export type { BaseQueryInput } from './common/query.schema';

export { loginSchema } from './auth/login.schema';
export type { LoginInput } from './auth/login.schema';
export { registerSchema } from './auth/register.schema';
export type { RegisterInput } from './auth/register.schema';
export { forgotPasswordSchema } from './auth/forgot-password.schema';
export type { ForgotPasswordInput } from './auth/forgot-password.schema';
export { resetPasswordSchema } from './auth/reset-password.schema';
export type { ResetPasswordInput } from './auth/reset-password.schema';

export { createUserSchema, roleNameSchema } from './users/create-user.schema';
export type { CreateUserInput } from './users/create-user.schema';
export { updateUserSchema } from './users/update-user.schema';
export type { UpdateUserInput } from './users/update-user.schema';
export { queryUserSchema } from './users/query-user.schema';
export type { QueryUserInput } from './users/query-user.schema';
export { changePasswordSchema } from './users/change-password.schema';
export type { ChangePasswordInput } from './users/change-password.schema';
export { updateProfileSchema } from './users/update-profile.schema';
export type { UpdateProfileInput } from './users/update-profile.schema';
