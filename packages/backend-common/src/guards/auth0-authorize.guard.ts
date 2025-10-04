import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SessionService } from "../services/session.service";
import { PinoLogger } from "nestjs-pino";
import { ManagementClient } from "auth0";
import { Role } from "@medorion/types";
import { SessionInfo } from "../interfaces/session-info.interface";


// TODO: Implement Auth0AuthorizeGuard
@Injectable()
export class Auth0AuthorizeGuard implements CanActivate {


    private userRoleWeights: Map<Role, number> = new Map<Role, number>();
    private auth0: ManagementClient;

    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly logger: PinoLogger
    ) 
    { 
        this.logger.setContext(Auth0AuthorizeGuard.name);
        this.userRoleWeights.set(Role.Root, 120);
        this.userRoleWeights.set(Role.ApiAdmin, 100);
        this.userRoleWeights.set(Role.Admin, 90);
        this.userRoleWeights.set(Role.Manager, 80);
        this.userRoleWeights.set(Role.Contributor, 40);
        this.userRoleWeights.set(Role.Employee, 20);
        // this.auth0 = new ManagementClient({
        //   domain: process.env.AUTH0_MANAGEMENT_DOMAIN,
        //   clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
        //   clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
        // });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            new ForbiddenException(`Access Forbidden.Missing or invalid Authorization header`)
            return false;
          }
          const fingerprint = request.headers['md-fp'];
          const ip = request.headers['x-forwarded-for'];
          const token = authHeader?.split(' ')[1];

        
        let sessionInfo: SessionInfo | null = await this.sessionService.getSession(token);
        // Attach decoded token info to request/session
        request.session = sessionInfo; // Store mapped session info
        return true;
    }
}