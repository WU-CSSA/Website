// Centralized theme configuration
// All styling is controlled from this file for consistency

export const theme = {
  // Form elements - using CSS variables for theme support
  input: {
    className: "mt-1 block w-full rounded-lg border border-theme-border bg-theme-input px-4 py-2.5 text-theme-primary placeholder-theme-muted shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
  },
  textarea: {
    className: "block w-full rounded-lg border border-theme-border bg-theme-input px-4 py-2.5 text-theme-primary placeholder-theme-muted shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
  },
  select: {
    className: "mt-1 block w-full rounded-lg border border-theme-border bg-theme-input px-4 py-2.5 text-theme-primary shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
  },
  checkbox: {
    className: "h-4 w-4 rounded border-theme-border bg-theme-input text-accent focus:ring-accent focus:ring-offset-theme-bg"
  },

  // Buttons
  button: {
    primary: "inline-flex justify-center items-center py-2.5 px-5 border border-transparent rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-hover shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "inline-flex justify-center items-center py-2.5 px-5 border border-theme-border rounded-lg text-sm font-semibold text-theme-primary bg-theme-card hover:bg-theme-hover shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "inline-flex justify-center items-center py-2.5 px-5 border border-transparent rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "inline-flex justify-center items-center py-2 px-3 rounded-lg text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-hover transition-all duration-200"
  },

  // Labels
  label: {
    className: "block text-sm font-medium text-theme-primary mb-1.5"
  },

  // Cards
  card: {
    className: "bg-theme-card rounded-xl border border-theme-border shadow-sm"
  },

  // Navigation
  nav: {
    link: "text-theme-secondary hover:text-theme-primary px-3 py-2 text-sm font-medium transition-colors",
    linkActive: "text-accent px-3 py-2 text-sm font-medium"
  },

  // Typography
  text: {
    heading: "text-theme-primary font-bold tracking-tight",
    body: "text-theme-secondary",
    muted: "text-theme-muted text-sm"
  },

  // Layout
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  section: "py-12 md:py-16",

}
