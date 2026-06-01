export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}

/**
 * Use case puro: sem HTTP, sem infra. `uptime` é injetado para testabilidade
 * (CLAUDE.md §4 regra: application não conhece Express).
 */
export class CheckHealthUseCase {
  private constructor(private readonly uptime: () => number) {}

  public static create(
    uptime: () => number = () => process.uptime(),
  ): CheckHealthUseCase {
    return new CheckHealthUseCase(uptime);
  }

  public execute(): HealthStatus {
    return { status: 'ok', uptimeSeconds: Math.floor(this.uptime()) };
  }
}
