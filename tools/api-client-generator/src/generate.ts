import { Project, Decorator, ClassDeclaration } from 'ts-morph';
import path from 'path';
import fs from 'fs';

console.log('Generating Angular Services...');

const workspaceRoot = process.cwd();
const configFilePath = path.resolve(workspaceRoot, 'tsconfig.base.json');
const project = new Project({
  tsConfigFilePath: configFilePath,
});

const API_CLIENT_DIR = path.resolve(workspaceRoot, 'packages/api-client/src/api');
const CONTOLLERS_DIR = path.resolve(workspaceRoot, 'apps/web-server/src/**/*.controller.ts');

console.log(`Project loaded from ${configFilePath}`);

// Define the output directory for Angular services
// Export services to packages/api-client/src/api to const index.ts
const outputDir = API_CLIENT_DIR;

// Empty the output directory before generating new services
emptyDirectory(outputDir);
console.log(`Emptied directory: ${outputDir}`);

// Point to your controller files
const controllers = project.getSourceFiles(CONTOLLERS_DIR);

// Import API_PREFIX from @ai-nx-starter/types
const typesFile = project.getSourceFile('packages/types/src/constants/api.ts');
let API_PREFIX = 'ai-nx-starter/rest/api/v2'; // Default fallback

if (typesFile) {
  const apiPrefixExport = typesFile.getVariableDeclaration('API_PREFIX');
  if (apiPrefixExport) {
    const initializer = apiPrefixExport.getInitializer();
    if (initializer) {
      API_PREFIX = initializer.getText().replace(/['"`]/g, '');
    }
  }
}

console.log(`Using API_PREFIX: ${API_PREFIX}`);

// Track generated services for index.ts export
const generatedServices: { serviceName: string; filePath: string }[] = [];

// Process each controller and generate a service
controllers.forEach((sourceFile) => {
  const controllerClass = sourceFile.getClasses().find((cls) => cls.getDecorator('Controller'));

  if (!controllerClass) return;

  const controllerName = controllerClass.getName() || '';
  const controllerPath = getControllerPath(controllerClass);

  console.log(`🔍 Found Controller: ${controllerName} at ${controllerPath}`);

  // Extract types imports from the controller source file
  const typesImports = extractTypesImports(sourceFile);

  // Extract API methods from the controller
  const apiMethods = extractApiMethods(controllerClass, controllerPath, typesImports);

  if (apiMethods.length === 0) {
    console.log(`  No API methods found in ${controllerName}, skipping service generation`);
    return;
  }

  // Get the controller's parent folder structure
  const controllerFilePath = sourceFile.getFilePath();
  const controllerFolder = getControllerParentFolder(controllerFilePath);

  // Generate service code with Api prefix
  const serviceCode = generateServiceCode(controllerName, apiMethods, API_PREFIX, controllerFolder);

  // Write service file with folder structure
  const serviceName = 'Api' + controllerName.replace('Controller', 'Service');
  const fileName = `${kebabCase(serviceName).replace('-service', '.service')}.ts`;

  // Create folder structure based on controller's parent folder
  const serviceDir = controllerFolder ? path.join(outputDir, controllerFolder) : outputDir;
  const filePath = path.join(serviceDir, fileName);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, serviceCode);

  // Track this service for index.ts export
  const relativePath = controllerFolder
    ? `./api/${controllerFolder}/${fileName.replace('.ts', '')}`
    : `./api/${fileName.replace('.ts', '')}`;

  generatedServices.push({
    serviceName,
    filePath: relativePath,
  });

  console.log(`✅ Generated service: ${controllerFolder ? controllerFolder + '/' : ''}${fileName}`);
});

// Generate index.ts with all exports
generateIndexFile(generatedServices);

// Clean up resources to prevent memory leaks
try {
  // Explicitly clear references
  project.getSourceFiles().forEach((sourceFile) => {
    try {
      sourceFile.forget();
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  // Force garbage collection if possible
  if (global.gc) {
    global.gc();
  }

  console.log('\nAngular service generation complete!');

  // Force script termination to release all memory
  setTimeout(() => {
    process.exit(0);
  }, 100);
} catch (error) {
  console.error('Error during cleanup:', error);
  process.exit(1);
}

/**
 * Empties a directory without deleting the directory itself
 */
function emptyDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return;
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      emptyDirectory(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
}

// Helper function to convert camelCase to kebab-case
function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Helper function to get controller's parent folder for organizing services
function getControllerParentFolder(controllerFilePath: string): string | null {
  // Extract the folder path relative to the controllers directory
  const controllersBasePath = path.resolve(workspaceRoot, 'apps/web-server/src');
  const relativePath = path.relative(controllersBasePath, controllerFilePath);
  const folderPath = path.dirname(relativePath);

  // Skip the "app" folder and return the actual parent folder
  const pathParts = folderPath.split(path.sep).filter((part) => part !== '.' && part !== 'app');

  // If controller is directly in app folder, don't create subfolder
  if (pathParts.length === 0) {
    return null;
  }

  return pathParts.join(path.sep);
}

function getControllerPath(cls: ClassDeclaration): string {
  const decorator = cls.getDecorator('Controller');
  return getDecoratorArgument(decorator);
}

function getDecoratorArgument(decorator: Decorator | undefined): string {
  if (!decorator) return '/';
  const arg = decorator.getArguments()[0];
  if (!arg) return '/';
  let path = arg.getText().replace(/['"`]/g, '');

  // Resolve template literals with actual values
  path = path.replace(/\$\{API_PREFIX\}/g, API_PREFIX);

  // Also handle direct API_PREFIX constant usage
  if (path === 'API_PREFIX') {
    path = API_PREFIX;
  }

  return path;
}

/**
 * Converts NestJS type to Angular type
 * @param nestType - NestJS type
 * @param availableTypes - Set of available type names from imports
 * @returns Angular type and import info if needed
 */
function convertToAngularType(nestType: string, availableTypes: Set<string> = new Set()): { type: string; importName?: string } {
  if (!nestType) return { type: 'any' };

  // Clean up the type string
  let cleanType = nestType.trim();

  // Handle Promise<T> -> T (Angular service will wrap in Observable)
  if (cleanType.startsWith('Promise<') && cleanType.endsWith('>')) {
    cleanType = cleanType.substring(8, cleanType.length - 1).trim();
  }

  // Extract model name from full import path for @ai-nx-starter/types
  if (cleanType.includes('import("') && (cleanType.includes('packages/types/') || cleanType.includes('@ai-nx-starter/types'))) {
    // Handle complex types with multiple imports (e.g., { flow: X; workflow: Y; } or QueryResultDto<SyncServiceFlowDto>)
    const importMatches = Array.from(cleanType.matchAll(/import\("([^"]+)"\)\.([A-Za-z0-9_]+)/g));

    if (importMatches.length > 1 || cleanType.includes('{') || cleanType.includes('<')) {
      // Multiple imports or generic/object types - handle them all
      const typeNames = new Set<string>();

      let simplifiedType = cleanType;
      for (const match of importMatches) {
        if (match[2]) {
          const typeName = match[2];
          typeNames.add(typeName);
          // Replace the import path with just the type name
          const importPattern = new RegExp(`import\\([^)]+\\)\\.${typeName}`, 'g');
          simplifiedType = simplifiedType.replace(importPattern, typeName);
        }
      }

      // Return the simplified type with all import names
      const importNamesArray = Array.from(typeNames).filter((name) => availableTypes.has(name));

      return {
        type: simplifiedType,
        importName: importNamesArray.length > 0 ? importNamesArray.join(', ') : undefined,
      };
    }

    // Single simple type - extract the model name from the import path
    const modelNameMatch = cleanType.match(/\.([A-Za-z0-9_]+)(?:>|\[\]|$)/);
    if (modelNameMatch && modelNameMatch[1]) {
      const modelName = modelNameMatch[1];

      // Check if it's an array type
      const isArray = cleanType.endsWith('[]') || cleanType.includes('[]>');

      // Only use the import if it's available in the types imports
      const shouldImport = availableTypes.has(modelName);

      return {
        type: isArray ? `${modelName}[]` : modelName,
        importName: shouldImport ? modelName : undefined,
      };
    }
  }

  // Handle complex types with imports (e.g., Omit<import("...").ExampleDto, "id"> or QueryResultDto<SyncServiceFlowDto>)
  if (cleanType.includes('import("') && cleanType.includes('packages/types/')) {
    // Extract all type names from import paths
    const importMatches = Array.from(cleanType.matchAll(/import\("([^"]+)"\)\.([A-Za-z0-9_]+)/g));
    const typeNames = new Set<string>();

    let simplifiedType = cleanType;
    for (const match of importMatches) {
      if (match[2]) {
        const typeName = match[2];
        typeNames.add(typeName);
        // Replace the import path with just the type name
        const importPattern = new RegExp(`import\\([^)]+\\)\\.${typeName}`, 'g');
        simplifiedType = simplifiedType.replace(importPattern, typeName);
      }
    }

    // If we found any types, return the simplified version
    if (typeNames.size > 0) {
      const importNamesArray = Array.from(typeNames).filter((name) => availableTypes.has(name));
      return {
        type: simplifiedType,
        importName: importNamesArray.length > 0 ? importNamesArray.join(', ') : undefined,
      };
    }
  }

  // Extract model name from full import path for @ai-nx-starter/backend-common (legacy support)
  if (cleanType.includes('import("') && cleanType.includes('packages/backend-common/')) {
    // Extract the model name from the import path
    const modelNameMatch = cleanType.match(/\.([A-Za-z0-9_]+)(?:>|\[\]|$)/);
    if (modelNameMatch && modelNameMatch[1]) {
      const modelName = modelNameMatch[1];

      // Check if it's an array type
      const isArray = cleanType.endsWith('[]') || cleanType.includes('[]>');

      return {
        type: isArray ? `${modelName}[]` : modelName,
        importName: modelName,
      };
    }
  }

  // Handle direct DTO types (e.g., ExampleDto, CreateExampleDto)
  if (cleanType.endsWith('Dto') || cleanType.endsWith('Dto[]')) {
    const isArray = cleanType.endsWith('[]');
    const dtoName = isArray ? cleanType.slice(0, -2) : cleanType;

    // Only import if it's available in the types imports
    const shouldImport = availableTypes.has(dtoName);

    return {
      type: isArray ? `${dtoName}[]` : dtoName,
      importName: shouldImport ? dtoName : undefined,
    };
  }

  // Handle Omit<T, K> types
  if (cleanType.startsWith('Omit<') && cleanType.endsWith('>')) {
    const omitContent = cleanType.substring(5, cleanType.length - 1);
    const [baseType] = omitContent.split(',').map((s) => s.trim());

    if (baseType.endsWith('Dto')) {
      const shouldImport = availableTypes.has(baseType);
      return {
        type: cleanType,
        importName: shouldImport ? baseType : undefined,
      };
    }
  }

  // Handle Partial<T> types
  if (cleanType.startsWith('Partial<') && cleanType.endsWith('>')) {
    const partialContent = cleanType.substring(8, cleanType.length - 1).trim();

    if (partialContent.endsWith('Dto')) {
      const shouldImport = availableTypes.has(partialContent);
      return {
        type: cleanType,
        importName: shouldImport ? partialContent : undefined,
      };
    }
  }

  // Handle other import paths (non-common/types package)
  if (cleanType.includes('import("')) {
    // For other imports, use 'any' as a fallback
    return { type: 'any' };
  }

  // Handle arrays
  if (cleanType.includes('[]')) {
    return { type: cleanType };
  }

  // Handle Array<T>
  if (cleanType.startsWith('Array<') && cleanType.endsWith('>')) {
    const innerType = cleanType.substring(6, cleanType.length - 1).trim();
    return { type: `${innerType}[]` };
  }

  // Handle specific types that need conversion
  if (cleanType === 'any' || cleanType === 'unknown') {
    return { type: 'any' };
  }

  // Handle void
  if (cleanType === 'void') {
    return { type: 'void' };
  }

  return { type: cleanType };
}

/**
 * Extract imports from a source file that match @ai-nx-starter/types
 * @param sourceFile - The source file to analyze
 * @returns Set of imported type names from @ai-nx-starter/types
 */
function extractTypesImports(sourceFile: any): Set<string> {
  const typesImports = new Set<string>();

  const imports = sourceFile.getImportDeclarations();
  imports.forEach((importDecl: any) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (moduleSpecifier === '@ai-nx-starter/types') {
      const namedImports = importDecl.getNamedImports();
      namedImports.forEach((namedImport: any) => {
        typesImports.add(namedImport.getName());
      });
    }
  });

  return typesImports;
}

/**
 * Extract API methods from a controller class
 * @param controllerClass - The controller class to extract methods from
 * @param controllerPath - The base path of the controller
 * @param availableTypes - Set of available type names from imports
 * @returns Array of API methods
 */
function extractApiMethods(
  controllerClass: ClassDeclaration,
  controllerPath: string,
  availableTypes: Set<string> = new Set(),
): Array<{
  methodName: string;
  httpMethod: string;
  path: string;
  params: Array<{
    name: string;
    type: string;
    importName?: string;
    decorator?: string;
    decoratorArgs?: string;
    isOptional?: boolean;
  }>;
  returnType: string;
  importNames: Set<string>;
}> {
  const methods: Array<{
    methodName: string;
    httpMethod: string;
    path: string;
    params: Array<{
      name: string;
      type: string;
      importName?: string;
      decorator?: string;
      decoratorArgs?: string;
      isOptional?: boolean;
    }>;
    returnType: string;
    importNames: Set<string>;
  }> = [];

  controllerClass.getMethods().forEach((method) => {
    const httpDecorator = method.getDecorators().find((dec) => ['Get', 'Post', 'Put', 'Delete', 'Patch'].includes(dec.getName()));

    if (!httpDecorator) return;

    const route = getDecoratorArgument(httpDecorator);
    const httpMethod = httpDecorator.getName().toLowerCase();
    const methodName = method.getName();
    const returnTypeText = method.getReturnType().getText();
    const returnTypeInfo = convertToAngularType(returnTypeText, availableTypes);

    // Track all import names needed for this method
    const importNames = new Set<string>();
    if (returnTypeInfo.importName) {
      // Handle comma-separated import names
      const importNameList = returnTypeInfo.importName.split(',').map((s) => s.trim());
      importNameList.forEach((name) => importNames.add(name));
    }

    // Extract parameters with their decorators (excluding @Session, @Req and orgCode path params)
    const params = method
      .getParameters()
      .filter((p) => {
        const decorator = p.getDecorators()[0];
        if (!decorator || decorator.getName() === 'Session' || decorator.getName() === 'Req') {
          return false; // Exclude @Session and @Req parameters
        }

        // Exclude orgCode path parameters
        if (decorator.getName() === 'Param') {
          const args = decorator.getArguments()[0];
          const paramName = args ? args.getText().replace(/['"` ]/g, '') : p.getName();
          const actualParamName = p.getName();
          // Check for orgCode parameter name
          if (paramName === 'orgCode' || actualParamName === 'orgCode') {
            return false; // Exclude orgCode path parameters
          }
        }

        return true;
      })
      .map((p) => {
        const decorator = p.getDecorators()[0];
        let decoratorName;
        let decoratorArgs;

        if (decorator) {
          decoratorName = decorator.getName();
          const args = decorator.getArguments()[0];
          if (args) {
            decoratorArgs = args.getText().replace(/['"` ]/g, '');
          }
        }

        const paramTypeText = p.getType().getText();
        const paramTypeInfo = convertToAngularType(paramTypeText, availableTypes);

        // Check if parameter is optional (type includes undefined or has ? modifier)
        const isOptional = paramTypeText.includes(' | undefined') || p.getQuestionTokenNode() !== undefined || paramTypeText.endsWith('?');

        if (paramTypeInfo.importName) {
          // Handle comma-separated import names
          const paramImportList = paramTypeInfo.importName.split(',').map((s) => s.trim());
          paramImportList.forEach((name) => importNames.add(name));
        }

        return {
          name: p.getName(),
          type: paramTypeInfo.type,
          importName: paramTypeInfo.importName,
          decorator: decoratorName,
          decoratorArgs,
          isOptional,
        };
      });

    // Construct the full path
    const fullPath = route ? `${controllerPath}/${route}` : controllerPath;

    methods.push({
      methodName,
      httpMethod,
      path: fullPath,
      params,
      returnType: returnTypeInfo.type,
      importNames,
    });
  });

  return methods;
}

/**
 * Generate Angular service code for a controller
 * @param controllerName - Name of the controller
 * @param apiMethods - Array of API methods
 * @param apiPrefix - API prefix from AppConfig
 * @param apiVersion - API version from AppConfig
 * @returns Generated service code
 */
function generateServiceCode(
  controllerName: string,
  apiMethods: Array<{
    methodName: string;
    httpMethod: string;
    path: string;
    params: Array<{
      name: string;
      type: string;
      importName?: string;
      decorator?: string;
      decoratorArgs?: string;
      isOptional?: boolean;
    }>;
    returnType: string;
    importNames: Set<string>;
  }>,
  apiPrefix: string,
  controllerFolder?: string | null,
): string {
  // Convert controller name to service name with Api prefix (e.g., UsersController -> ApiUsersService)
  const serviceName = 'Api' + controllerName.replace('Controller', 'Service');

  let code = `import { Injectable } from '@angular/core';
`;
  code += `import { HttpClient, HttpParams } from '@angular/common/http';
`;
  code += `import { Observable } from 'rxjs';
`;

  // Collect all unique import names needed across all methods
  const allImportNames = new Set<string>();
  apiMethods.forEach((method) => {
    method.importNames.forEach((name) => allImportNames.add(name));
  });

  // Add imports from @ai-nx-starter/types
  code += `import { ${Array.from(allImportNames).join(', ')} } from '@ai-nx-starter/types';
`;

  // Add BaseApiService and AppConfigService imports - adjust path based on folder depth
  const folderDepth = controllerFolder ? (controllerFolder.match(/\//g) || []).length + 1 : 0;
  const baseApiServicePath = '../'.repeat(folderDepth + 1) + 'services/base-api.service';
  const appConfigServicePath = '../'.repeat(folderDepth + 1) + 'services/app-config.service';
  code += `import { BaseApiService } from '${baseApiServicePath}';
`;
  code += `import { AppConfigService } from '${appConfigServicePath}';
`;

  code += `
`;

  code += `/**
`;
  code += ` * ${serviceName} - Angular service for ${controllerName}
`;
  code += ` * Auto-generated by tools/api-client-generator
`;
  code += ` */
`;
  code += `@Injectable({
`;
  code += `  providedIn: 'root'
`;
  code += `})
`;
  code += `export class ${serviceName} extends BaseApiService {
`;
  code += `
`;

  code += `  constructor(http: HttpClient, config: AppConfigService) {
`;
  code += `    super(http, config);
`;
  code += `  }
`;
  code += `
`;

  // Generate methods
  apiMethods.forEach((method) => {
    code += generateMethodCode(method, apiPrefix);
    code += `
`;
  });

  code += `}
`;

  return code;
}

/**
 * Generate method code for an API method
 * @param method - API method
 * @returns Generated method code
 */
function generateMethodCode(
  method: {
    methodName: string;
    httpMethod: string;
    path: string;
    params: Array<{
      name: string;
      type: string;
      importName?: string;
      decorator?: string;
      decoratorArgs?: string;
      isOptional?: boolean;
    }>;
    returnType: string;
    importNames: Set<string>;
  },
  apiPrefix: string,
): string {
  const { methodName, httpMethod, path, params, returnType } = method;

  // Separate parameters by decorator type
  const pathParams = params.filter((p) => p.decorator === 'Param');
  const queryParams = params.filter((p) => p.decorator === 'Query');
  const bodyParam = params.find((p) => p.decorator === 'Body');
  const otherParams = params.filter((p) => !p.decorator || !['Param', 'Query', 'Body'].includes(p.decorator));

  // Check if the original path contains orgCode parameter (even though we filtered it out)
  const hasOrgCodeParam = path.includes(':orgCode');
  // Generate method parameters with optional markers
  const methodParams = params
    .map((p) => {
      const optionalMarker = p.isOptional ? '?' : '';
      return `${p.name}${optionalMarker}: ${p.type}`;
    })
    .join(', ');

  // Generate JSDoc
  let code = `  /**
`;
  // Clean the path for documentation
  const cleanedDocPath = path
    .replace(/\$\{AppConfig\.API_PREFIX\}/g, '')
    .replace(/\$\{AppConfig\.ORG_CODE\}/g, '')
    .replace(/\$\{AppConfig\.APP_ID\}/g, 'appId')
    .replace(/\$\{AppConfig\.OBJECTIVE_ID\}/g, 'objectiveId');
  code += `   * ${methodName} - ${httpMethod.toUpperCase()} ${cleanedDocPath}
`;
  code += `   *
`;

  // Add parameter documentation
  params.forEach((p) => {
    code += `   * @param ${p.name} - ${p.decorator ? p.decorator + ' parameter' : 'Parameter'}
`;
  });

  code += `   * @returns Observable<${returnType}>
`;
  code += `   */
`;

  // Generate method signature
  code += `  ${methodName}(${methodParams}): Observable<${returnType}> {
`;

  // Handle path parameters
  let endpointPath = path;

  // Clean the path by removing API_PREFIX and AppConfig references, including orgCode
  let cleanedPath = endpointPath
    .replace(/\$\{AppConfig\.API_PREFIX\}/g, '')
    .replace(/\$\{AppConfig\.ORG_CODE\}/g, '')
    .replace(/:orgCode/g, '')
    .replace(/\$\{AppConfig\.APP_ID\}/g, 'appId')
    .replace(/\$\{AppConfig\.OBJECTIVE_ID\}/g, 'objectiveId')
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .replace(/\/+/g, '/'); // Replace multiple consecutive slashes with a single one

  // Strip API_PREFIX from the beginning of the path since it's now in BASE_URL
  if (cleanedPath.startsWith(apiPrefix)) {
    cleanedPath = cleanedPath.substring(apiPrefix.length);
  }
  cleanedPath = cleanedPath.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

  if (pathParams.length > 0 || hasOrgCodeParam) {
    code += `    let url = \`\${this.BASE_URL}/${cleanedPath}\`;
`;

    // Handle other path parameters (orgCode is already handled in cleanedPath)
    pathParams.forEach((p) => {
      const paramName = p.decoratorArgs || p.name;
      code += `    url = url.replace(':${paramName}', ${p.name}.toString());
`;
      endpointPath = endpointPath.replace(`:${paramName}`, `\${${p.name}}`);
    });
  }

  // Handle query parameters
  if (queryParams.length > 0) {
    code += `    let params = new HttpParams();
`;

    queryParams.forEach((p) => {
      const paramName = p.decoratorArgs || p.name;
      code += `    if (${p.name} !== undefined) {
`;
      code += `      params = params.set('${paramName}', ${p.name}.toString());
`;
      code += `    }
`;
    });
  }

  // Generate HTTP request
  code += `    return this.http.${httpMethod}<${returnType}>(
`;

  // URL
  if (pathParams.length > 0 || hasOrgCodeParam) {
    code += `      url,
`;
  } else {
    // Clean the path by removing API_PREFIX and AppConfig references, including orgCode
    let cleanedPath = endpointPath
      .replace(/\$\{AppConfig\.API_PREFIX\}/g, '')
      .replace(/\$\{AppConfig\.ORG_CODE\}/g, '')
      .replace(/:orgCode/g, '')
      .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
      .replace(/\/+/g, '/'); // Replace multiple consecutive slashes with a single one

    // Strip API_PREFIX from the beginning of the path since it's now in BASE_URL
    if (cleanedPath.startsWith(apiPrefix)) {
      cleanedPath = cleanedPath.substring(apiPrefix.length);
    }
    cleanedPath = cleanedPath.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

    code += `      \`\${this.BASE_URL}/${cleanedPath}\`,
`;
  }

  // Body and options
  if (bodyParam) {
    if (queryParams.length > 0) {
      code += `      ${bodyParam.name},
`;
      code += `      { params }
`;
    } else {
      code += `      ${bodyParam.name}
`;
    }
  } else if (queryParams.length > 0) {
    if (['post', 'put', 'patch'].includes(httpMethod)) {
      code += `      {},
`;
      code += `      { params }
`;
    } else {
      code += `      { params }
`;
    }
  } else if (['post', 'put', 'patch'].includes(httpMethod)) {
    code += `      {}
`;
  }

  code += `    );
`;
  code += `  }
`;

  return code;
}

/**
 * Generate index.ts file with exports for all generated services
 * @param services - Array of generated services
 */
function generateIndexFile(services: { serviceName: string; filePath: string }[]): void {
  const indexPath = path.join(API_CLIENT_DIR, '../index.ts');

  let indexContent = `// Export services
export { BaseApiService } from './services/base-api.service';
export { AppConfigService, ApiConfig } from './services/app-config.service';

// Export auto-generated services
`;

  // Sort services alphabetically for consistent output
  const sortedServices = services.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

  sortedServices.forEach((service) => {
    indexContent += `export { ${service.serviceName} } from '${service.filePath}';\n`;
  });

  fs.writeFileSync(indexPath, indexContent);
  console.log(`✅ Generated index.ts with ${services.length} service exports`);
}
