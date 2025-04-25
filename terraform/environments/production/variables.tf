variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "emergency-healthcare"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "container_image" {
  description = "Docker image to deploy (e.g., username/app_name:latest)"
  type        = string
} 