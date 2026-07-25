"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { TechnologyBadge } from "./technology-badge"
import { theme } from "@/lib/theme"

interface Project {
  id: string
  title: string
  description: string
  imageUrl: string | null
  technologies: string[]
}

interface FeaturedProjectsProps {
  projects: Project[]
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }, [projects.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }, [projects.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused || projects.length <= 1) return

    const timer = setInterval(goToNext, 5000)
    return () => clearInterval(timer)
  }, [isPaused, goToNext, projects.length])

  if (projects.length === 0) {
    return null
  }

  const currentProject = projects[currentIndex]

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-theme-border bg-theme-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main content */}
      <div className="relative">
        {/* Slide container */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {projects.map((project) => (
              <div key={project.id} className="w-full flex-shrink-0">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="aspect-video md:aspect-auto md:h-80 overflow-hidden bg-theme-hover">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-theme-muted"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="text-sm font-medium text-accent mb-2">
                      Featured Project
                    </div>
                    <h3 className={`text-2xl md:text-3xl ${theme.text.heading} mb-3`}>
                      {project.title}
                    </h3>
                    <p className="text-theme-secondary line-clamp-3 mb-4">
                      {project.description}
                    </p>

                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <TechnologyBadge key={tech} technology={tech} />
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-hover text-theme-muted">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/projects/${project.id}`}
                      className={`${theme.button.primary} w-fit`}
                    >
                      View Project
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {projects.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-theme-bg/80 backdrop-blur-sm border border-theme-border flex items-center justify-center text-theme-secondary hover:text-theme-primary hover:bg-theme-bg transition-colors"
              aria-label="Previous project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-theme-bg/80 backdrop-blur-sm border border-theme-border flex items-center justify-center text-theme-secondary hover:text-theme-primary hover:bg-theme-bg transition-colors"
              aria-label="Next project"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {projects.length > 1 && (
        <div className="flex justify-center gap-2 py-4 border-t border-theme-border">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-accent"
                  : "bg-theme-border hover:bg-theme-muted"
              }`}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
