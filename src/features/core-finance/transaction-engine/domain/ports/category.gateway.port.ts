export interface ResolvedCategory {
  descriptionEnum: string;
  group: string;
}

export interface CategoryGateway {
  resolve(descriptionEnum: string): Promise<ResolvedCategory | null>;
}
