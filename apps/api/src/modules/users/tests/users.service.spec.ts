import { UsersService } from '../users.service';
import type { UsersRepository } from '../users.repository';
import type { RedisService } from '@infrastructure/redis/redis.service';
import type { StorageService } from '@infrastructure/storage/storage.service';
import type { QueryUserDto } from '../dto/query-user.dto';

const emptyPage = { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };

function makeService(redisGet: unknown = null) {
  const repository = { paginateWithRoles: jest.fn().mockResolvedValue(emptyPage) };
  const redis = {
    get: jest.fn().mockResolvedValue(redisGet),
    set: jest.fn().mockResolvedValue(undefined),
  };
  // Avatar keys resolve to a signed URL (or null) — echo null so toEntity is inert.
  const storage = { signedUrl: jest.fn().mockResolvedValue(null) };
  const service = new UsersService(
    repository as unknown as UsersRepository,
    redis as unknown as RedisService,
    storage as unknown as StorageService,
  );
  return { service, repository, redis, storage };
}

const query = { page: 1, limit: 10, order: 'desc', sortBy: 'createdAt' } as QueryUserDto;

describe('UsersService.findAll', () => {
  it('delegates the list to the repository (which omits the password)', async () => {
    const { service, repository } = makeService();
    await service.findAll(query);
    expect(repository.paginateWithRoles).toHaveBeenCalledWith(query, query.roles);
  });

  it('serves from cache without hitting the repository', async () => {
    const { service, repository } = makeService(emptyPage);
    const result = await service.findAll(query);
    expect(result).toEqual(emptyPage);
    expect(repository.paginateWithRoles).not.toHaveBeenCalled();
  });
});
