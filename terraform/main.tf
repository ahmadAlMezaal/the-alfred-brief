terraform {
  required_version = ">= 1.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "vercel" {
  # Configuration will be provided via environment variables:
  # VERCEL_API_TOKEN
}

provider "github" {
  # Configuration will be provided via environment variables:
  # GITHUB_TOKEN
}
