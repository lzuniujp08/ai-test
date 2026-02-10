export class AdminToolkit {
  constructor(context) {
    this.context = context;
  }

  createPanel(options) {
    const mode = options.enableInspector ? 'inspector-on' : 'inspector-off';
    return `AdminPanel:${options.title}:${mode}:${Boolean(this.context.map)}`;
  }

  refreshPanel() {
    return 'Admin panel refreshed';
  }
}
