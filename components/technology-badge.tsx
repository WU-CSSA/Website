const techColors: Record<string, { bg: string; text: string }> = {
  // Languages
  javascript: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400" },
  typescript: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  python: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  rust: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  go: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  java: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  c: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  "c++": { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  "c#": { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  ruby: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  php: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  swift: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  kotlin: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },

  // Frameworks
  react: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  nextjs: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  "next.js": { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  vue: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  angular: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  svelte: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  express: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  django: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  flask: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  rails: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },

  // Databases
  postgresql: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  postgres: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  mysql: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  mongodb: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  redis: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  sqlite: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },

  // Tools
  docker: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  kubernetes: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  aws: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  gcp: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  azure: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  git: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400" },
  github: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },

  // Other
  tailwindcss: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  tailwind: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  graphql: { bg: "bg-pink-500/10", text: "text-pink-600 dark:text-pink-400" },
  prisma: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  node: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  nodejs: { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
  "node.js": { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400" },
}

const defaultColor = { bg: "bg-accent/10", text: "text-accent" }

interface TechnologyBadgeProps {
  technology: string
}

export function TechnologyBadge({ technology }: TechnologyBadgeProps) {
  const normalizedTech = technology.toLowerCase().trim()
  const colors = techColors[normalizedTech] || defaultColor

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {technology}
    </span>
  )
}
