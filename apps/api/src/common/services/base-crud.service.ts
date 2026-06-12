import { NotFoundException } from '@nestjs/common';
import { BaseQueryDto } from '../dto/base-query.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { BaseRepository } from '../repositories/base.repository';

/**
 * SPEC DRY #5 — generic CRUD service. Feature services extend this and override
 * only the methods that need custom business logic (e.g. price calculation,
 * conflict checks). `entityName` powers human-readable 404 messages.
 */
export abstract class BaseCrudService<
  T,
  CreateDto,
  UpdateDto,
  QueryDto extends BaseQueryDto = BaseQueryDto,
> {
  protected abstract readonly entityName: string;

  constructor(protected readonly repository: BaseRepository<T>) {}

  /** Override to eager-load relations on list/detail reads (Drizzle `with`). */
  protected get defaultWith(): Record<string, unknown> | undefined {
    return undefined;
  }

  /** Override to include/exclude columns on list/detail reads (Drizzle `columns`). */
  protected get defaultColumns(): Record<string, boolean> | undefined {
    return undefined;
  }

  findAll(query: QueryDto): Promise<PaginatedResult<T>> {
    return this.repository.paginate(query, {
      with: this.defaultWith,
      columns: this.defaultColumns,
    });
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.repository.findById(id, {
      with: this.defaultWith,
      columns: this.defaultColumns,
    });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id "${id}" not found`);
    }
    return entity;
  }

  create(dto: CreateDto): Promise<T> {
    return this.repository.create(dto as Record<string, unknown>);
  }

  async update(id: string, dto: UpdateDto): Promise<T> {
    await this.findOne(id); // 404 if missing
    return this.repository.update(id, dto as Record<string, unknown>);
  }

  async remove(id: string): Promise<T> {
    await this.findOne(id); // 404 if missing
    return this.repository.delete(id);
  }
}
