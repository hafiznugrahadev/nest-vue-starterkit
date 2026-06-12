import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Self-service profile update for the *authenticated* user. Deliberately narrow:
 * the display name and avatar are editable here — email is immutable and roles
 * can never be changed by the user themselves (that stays a SUPER_ADMIN action).
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  // Holds the storage KEY returned by POST /files (e.g. "avatars/abc.png"), not a
  // URL — the API resolves it to a fresh presigned URL on read. Legacy full URLs
  // are still accepted and normalised server-side.
  @ApiPropertyOptional({ example: 'avatars/abc.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;
}
