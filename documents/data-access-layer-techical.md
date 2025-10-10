#### Package @monorepo-kit/data-access-layer

/packages
/data-access-mongo
/src
/entities # entity definitions (typed schemas)
/services # unit of work implementation
/index.ts

- Will use typeorm for database access
- All entities will be typed schemas under /entities folder
- All services will be data access implementation under /services folder
- Naming convention for services will be <Entity>DbService (e.g. UserDbService)
- Only DbServices are exposed to other packages
- Typeorm repositories can only be used inside DbServices
