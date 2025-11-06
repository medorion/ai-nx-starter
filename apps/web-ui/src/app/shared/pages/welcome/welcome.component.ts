import { Component } from '@angular/core';

interface QuickStartCommand {
  title: string;
  command: string;
  description: string;
}

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.less',
})
export class WelcomeComponent {
  quickStartCommands: QuickStartCommand[] = [
    {
      title: 'Start All',
      command: 'npm start',
      description: 'Run both frontend and backend in development mode with live reload',
    },
    {
      title: 'Frontend Only',
      command: 'npm run ui',
      description: 'Start Angular dev server at http://localhost:4200',
    },
    {
      title: 'Backend Only',
      command: 'npm run server',
      description: 'Start NestJS API server at http://localhost:3030',
    },
    {
      title: 'Generate API Client',
      command: 'npm run gen-api-client',
      description: 'Auto-generate TypeScript API client from NestJS controllers',
    },
    {
      title: 'Build All',
      command: 'npm run build',
      description: 'Build all projects in the monorepo',
    },
  ];
}
