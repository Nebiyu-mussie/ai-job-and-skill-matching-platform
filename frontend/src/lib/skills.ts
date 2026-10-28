/**
 * Comprehensive list of standard tech skills for autocomplete
 * Organized by category for better maintenance
 */

export const TECH_SKILLS = [
  // Programming Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'Swift',
  'Kotlin',
  'Dart',
  'R',
  'Scala',
  'Perl',
  'Shell',
  'Bash',
  'PowerShell',
  
  // Frontend Frameworks & Libraries
  'React',
  'Vue.js',
  'Angular',
  'Svelte',
  'Next.js',
  'Nuxt.js',
  'Gatsby',
  'Remix',
  'Astro',
  'jQuery',
  'Alpine.js',
  'Ember.js',
  'Backbone.js',
  
  // Frontend Technologies
  'HTML',
  'HTML5',
  'CSS',
  'CSS3',
  'Sass',
  'SCSS',
  'Less',
  'Tailwind CSS',
  'Bootstrap',
  'Material-UI',
  'Chakra UI',
  'Ant Design',
  'Styled Components',
  'Emotion',
  'Shadcn/ui',
  
  // Backend Frameworks
  'Node.js',
  'Express',
  'Express.js',
  'NestJS',
  'Fastify',
  'Koa',
  'Django',
  'Flask',
  'FastAPI',
  'Spring Boot',
  'Laravel',
  'Ruby on Rails',
  'ASP.NET',
  '.NET Core',
  'Gin',
  'Echo',
  
  // Databases
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'Redis',
  'Cassandra',
  'DynamoDB',
  'CouchDB',
  'Oracle',
  'SQL Server',
  'MariaDB',
  'Neo4j',
  'Elasticsearch',
  'Firebase',
  'Supabase',
  
  // Cloud Platforms
  'AWS',
  'Azure',
  'Google Cloud',
  'GCP',
  'Heroku',
  'DigitalOcean',
  'Vercel',
  'Netlify',
  'Railway',
  'Render',
  'Fly.io',
  'Cloudflare',
  
  // DevOps & Tools
  'Docker',
  'Kubernetes',
  'Jenkins',
  'GitLab CI',
  'GitHub Actions',
  'CircleCI',
  'Travis CI',
  'Terraform',
  'Ansible',
  'Chef',
  'Puppet',
  'Vagrant',
  'Nginx',
  'Apache',
  
  // Version Control
  'Git',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'SVN',
  'Mercurial',
  
  // Testing
  'Jest',
  'Mocha',
  'Chai',
  'Jasmine',
  'Cypress',
  'Playwright',
  'Selenium',
  'Pytest',
  'JUnit',
  'TestNG',
  'PHPUnit',
  'RSpec',
  'Vitest',
  'Testing Library',
  
  // Mobile Development
  'React Native',
  'Flutter',
  'Ionic',
  'Xamarin',
  'SwiftUI',
  'UIKit',
  'Android SDK',
  'Jetpack Compose',
  
  // Data Science & ML
  'TensorFlow',
  'PyTorch',
  'Keras',
  'Scikit-learn',
  'Pandas',
  'NumPy',
  'Matplotlib',
  'Seaborn',
  'Jupyter',
  'Apache Spark',
  'Hadoop',
  'Tableau',
  'Power BI',
  
  // API & Integration
  'REST API',
  'GraphQL',
  'gRPC',
  'WebSockets',
  'Socket.io',
  'Axios',
  'Fetch API',
  'Postman',
  'Swagger',
  'OpenAPI',
  
  // State Management
  'Redux',
  'Redux Toolkit',
  'MobX',
  'Zustand',
  'Recoil',
  'Jotai',
  'Context API',
  'Vuex',
  'Pinia',
  
  // Build Tools
  'Webpack',
  'Vite',
  'Rollup',
  'Parcel',
  'esbuild',
  'Turbopack',
  'Babel',
  'SWC',
  'Gulp',
  'Grunt',
  
  // Package Managers
  'npm',
  'Yarn',
  'pnpm',
  'pip',
  'Maven',
  'Gradle',
  'Composer',
  'NuGet',
  
  // Methodologies & Practices
  'Agile',
  'Scrum',
  'Kanban',
  'TDD',
  'BDD',
  'CI/CD',
  'DevOps',
  'Microservices',
  'RESTful',
  'Responsive Design',
  'Mobile-First',
  'Accessibility',
  'SEO',
  'Performance Optimization',
  'Security',
  
  // CMS & E-commerce
  'WordPress',
  'Drupal',
  'Joomla',
  'Strapi',
  'Contentful',
  'Sanity',
  'Shopify',
  'WooCommerce',
  'Magento',
  
  // Other Technologies
  'Linux',
  'Unix',
  'macOS',
  'Windows',
  'VS Code',
  'IntelliJ IDEA',
  'Eclipse',
  'Vim',
  'Emacs',
  'Figma',
  'Adobe XD',
  'Sketch',
  'Photoshop',
  'Illustrator',
].sort(); // Alphabetically sorted for better UX

/**
 * Filter skills based on search query
 */
export function filterSkills(query: string, maxResults: number = 10): string[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact matches first
  const exactMatches = TECH_SKILLS.filter(
    skill => skill.toLowerCase() === normalizedQuery
  );
  
  // Starts with query
  const startsWithMatches = TECH_SKILLS.filter(
    skill => skill.toLowerCase().startsWith(normalizedQuery) && 
    !exactMatches.includes(skill)
  );
  
  // Contains query
  const containsMatches = TECH_SKILLS.filter(
    skill => skill.toLowerCase().includes(normalizedQuery) && 
    !exactMatches.includes(skill) && 
    !startsWithMatches.includes(skill)
  );
  
  // Combine and limit results
  return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, maxResults);
}

/**
 * Check if a skill exists in the predefined list (case-insensitive)
 */
export function isStandardSkill(skill: string): boolean {
  const normalized = skill.trim().toLowerCase();
  return TECH_SKILLS.some(s => s.toLowerCase() === normalized);
}

/**
 * Get the properly cased version of a skill from the list
 */
export function getStandardSkillName(skill: string): string {
  const normalized = skill.trim().toLowerCase();
  const found = TECH_SKILLS.find(s => s.toLowerCase() === normalized);
  return found || skill.trim();
}
