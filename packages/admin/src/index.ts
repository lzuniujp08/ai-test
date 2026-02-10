import { SDKContext } from '@sdk/shared';

export interface AdminPanelOptions {
  title: string;
  enableInspector?: boolean;
}

export class AdminToolkit {
  constructor(private readonly context: SDKContext) {}

  createPanel(options: AdminPanelOptions): string {
    const mode = options.enableInspector ? 'inspector-on' : 'inspector-off';
    return `AdminPanel:${options.title}:${mode}:${Boolean(this.context.map)}`;
  }

  refreshPanel(): string {
    return 'Admin panel refreshed';
  }
}
